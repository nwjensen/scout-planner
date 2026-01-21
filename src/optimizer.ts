import {
  Scout,
  Patrol,
  Activity,
  ActivityRecommendation,
  ScoutBenefit,
  RequirementCoverage,
  RequirementGap,
  PatrolAnalysis,
  Requirement,
  RankName,
  MeetingPlan,
  CampoutPlan,
  PlannedActivity,
} from './types.js';
import { ScoutTracker } from './scout-tracker.js';
import {
  getRequirementById,
  getRequirementsForRank,
  findRequirementsByTags,
  getNextRank,
} from './requirements/index.js';
import {
  activitiesDatabase,
  findActivitiesForRequirement,
  findActivitiesBySetting,
} from './activities/activities-database.js';

export class AdvancementOptimizer {
  private tracker: ScoutTracker;

  constructor(tracker: ScoutTracker) {
    this.tracker = tracker;
  }

  // Find requirements that are needed by the most scouts in a patrol
  findCommonMissingRequirements(patrolName: string): RequirementGap[] {
    const scouts = this.tracker.getScoutsInPatrol(patrolName);
    const requirementNeeds = new Map<string, Scout[]>();

    for (const scout of scouts) {
      // Get missing requirements for current target rank
      const missingTarget = this.tracker.getMissingRequirements(scout);

      // Also consider next rank (for optimization across ranks)
      const nextRank = getNextRank(scout.targetRank);
      const missingNext = nextRank
        ? getRequirementsForRank(nextRank).filter(
            r =>
              !scout.completedRequirements.some(cr => cr.requirementId === r.id)
          )
        : [];

      const allMissing = [...missingTarget, ...missingNext];

      for (const req of allMissing) {
        if (!requirementNeeds.has(req.id)) {
          requirementNeeds.set(req.id, []);
        }
        requirementNeeds.get(req.id)!.push(scout);
      }
    }

    // Convert to RequirementGap array and sort by priority
    const gaps: RequirementGap[] = [];
    for (const [reqId, scoutsMissing] of requirementNeeds) {
      const requirement = getRequirementById(reqId);
      if (requirement) {
        gaps.push({
          requirement,
          scoutsMissing,
          priority: scoutsMissing.length,
        });
      }
    }

    // Sort by priority (most scouts missing first)
    gaps.sort((a, b) => b.priority - a.priority);
    return gaps;
  }

  // Score an activity based on how many scouts it helps
  scoreActivity(
    activity: Activity,
    scouts: Scout[],
    setting: 'meeting' | 'campout'
  ): ActivityRecommendation {
    const benefitingScouts: ScoutBenefit[] = [];
    const requirementsCovered: RequirementCoverage[] = [];

    // Check which requirements this activity fulfills
    for (const reqId of activity.fulfillsRequirements) {
      const req = getRequirementById(reqId);
      if (!req) continue;

      // Check setting compatibility
      if (setting === 'meeting' && req.setting === 'campout') continue;

      const scoutsWhoNeed: string[] = [];

      for (const scout of scouts) {
        // Check if scout needs this requirement
        const needsForTarget =
          req.rank === scout.targetRank &&
          !scout.completedRequirements.some(cr => cr.requirementId === reqId);

        const nextRank = getNextRank(scout.targetRank);
        const needsForNext =
          nextRank &&
          req.rank === nextRank &&
          !scout.completedRequirements.some(cr => cr.requirementId === reqId);

        if (needsForTarget || needsForNext) {
          scoutsWhoNeed.push(scout.id);

          // Update or add scout benefit
          let benefit = benefitingScouts.find(b => b.scoutId === scout.id);
          if (!benefit) {
            benefit = {
              scoutId: scout.id,
              scoutName: scout.name,
              requirementsAdvanced: [],
              ranksProgressed: [],
            };
            benefitingScouts.push(benefit);
          }
          benefit.requirementsAdvanced.push(reqId);
          if (!benefit.ranksProgressed.includes(req.rank)) {
            benefit.ranksProgressed.push(req.rank);
          }
        }
      }

      if (scoutsWhoNeed.length > 0) {
        requirementsCovered.push({
          requirementId: reqId,
          rank: req.rank,
          scoutsWhoNeed,
        });
      }
    }

    // Calculate score:
    // - Base score: number of scouts who benefit
    // - Bonus for covering multiple requirements per scout
    // - Bonus for helping scouts close to rank advancement
    let score = benefitingScouts.length * 10;

    for (const benefit of benefitingScouts) {
      // Bonus for multiple requirements
      score += (benefit.requirementsAdvanced.length - 1) * 5;

      // Bonus for helping with current target rank
      const scout = scouts.find(s => s.id === benefit.scoutId);
      if (scout) {
        const targetReqs = getRequirementsForRank(scout.targetRank);
        const completedCount = scout.completedRequirements.filter(cr =>
          targetReqs.some(r => r.id === cr.requirementId)
        ).length;
        const percentComplete = (completedCount / targetReqs.length) * 100;

        // Higher bonus for scouts closer to completion
        if (percentComplete >= 75) score += 15;
        else if (percentComplete >= 50) score += 10;
        else if (percentComplete >= 25) score += 5;
      }
    }

    // Penalty for activities requiring more scouts than available
    if (activity.minScouts && activity.minScouts > scouts.length) {
      score = 0;
    }

    return {
      activity,
      score,
      benefitingScouts,
      requirementsCovered,
    };
  }

  // Get recommended activities for a patrol
  getRecommendedActivities(
    patrolName: string,
    setting: 'meeting' | 'campout',
    maxResults: number = 10
  ): ActivityRecommendation[] {
    const scouts = this.tracker.getScoutsInPatrol(patrolName);
    if (scouts.length === 0) return [];

    // Filter activities by setting
    const applicableActivities = activitiesDatabase.filter(
      a => a.setting === setting || a.setting === 'either'
    );

    // Score each activity
    const recommendations: ActivityRecommendation[] = [];
    for (const activity of applicableActivities) {
      const recommendation = this.scoreActivity(activity, scouts, setting);
      if (recommendation.score > 0) {
        recommendations.push(recommendation);
      }
    }

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, maxResults);
  }

  // Analyze entire patrol
  analyzePatrol(patrolName: string): PatrolAnalysis {
    const scouts = this.tracker.getScoutsInPatrol(patrolName);
    const scoutAnalyses = scouts.map(s => this.tracker.analyzeScout(s));
    const commonMissingRequirements = this.findCommonMissingRequirements(patrolName);

    // Find bottleneck requirements - those blocking advancement
    const bottleneckRequirements = commonMissingRequirements
      .filter(gap => {
        // Bottleneck if it's required for rank completion and many scouts need it
        return gap.priority >= Math.ceil(scouts.length / 2);
      })
      .map(gap => gap.requirement.id);

    const recommendedActivities = this.getRecommendedActivities(
      patrolName,
      'meeting',
      5
    );

    return {
      patrolName,
      scouts: scoutAnalyses,
      commonMissingRequirements,
      recommendedActivities,
      bottleneckRequirements,
    };
  }

  // Generate a meeting plan
  generateMeetingPlan(
    patrolName: string,
    durationMinutes: number = 90
  ): MeetingPlan {
    const recommendations = this.getRecommendedActivities(
      patrolName,
      'meeting',
      20
    );
    const scouts = this.tracker.getScoutsInPatrol(patrolName);

    const plannedActivities: PlannedActivity[] = [];
    let remainingTime = durationMinutes;
    const usedRequirements = new Set<string>();
    const scoutsBenefiting = new Map<string, string[]>();
    let totalScore = 0;

    // Greedily select activities
    for (const rec of recommendations) {
      if (remainingTime < rec.activity.estimatedMinutes) continue;
      if (rec.activity.estimatedMinutes === 0) continue; // Skip tracked-over-time activities

      // Check if this activity covers new requirements
      const newRequirements = rec.requirementsCovered.filter(
        rc => !usedRequirements.has(rc.requirementId)
      );
      if (newRequirements.length === 0) continue;

      // Add activity
      plannedActivities.push({
        activity: rec.activity,
        scoutsParticipating: rec.benefitingScouts.map(b => b.scoutId),
        requirementsAddressed: newRequirements.map(rc => rc.requirementId),
      });

      remainingTime -= rec.activity.estimatedMinutes;
      totalScore += rec.score;

      // Update tracking
      for (const rc of newRequirements) {
        usedRequirements.add(rc.requirementId);
      }
      for (const benefit of rec.benefitingScouts) {
        if (!scoutsBenefiting.has(benefit.scoutId)) {
          scoutsBenefiting.set(benefit.scoutId, []);
        }
        scoutsBenefiting
          .get(benefit.scoutId)!
          .push(...benefit.requirementsAdvanced);
      }
    }

    return {
      durationMinutes,
      activities: plannedActivities,
      scoutsBenefiting,
      totalAdvancementScore: totalScore,
    };
  }

  // Generate a campout plan
  generateCampoutPlan(
    patrolName: string,
    name: string = 'Advancement Campout'
  ): CampoutPlan {
    const recommendations = this.getRecommendedActivities(
      patrolName,
      'campout',
      30
    );
    const scouts = this.tracker.getScoutsInPatrol(patrolName);

    const plannedActivities: PlannedActivity[] = [];
    const usedRequirements = new Set<string>();
    const scoutsBenefiting = new Map<string, string[]>();
    let totalScore = 0;

    // Add more activities for campout (full weekend)
    for (const rec of recommendations) {
      // Check if this activity covers new requirements
      const newRequirements = rec.requirementsCovered.filter(
        rc => !usedRequirements.has(rc.requirementId)
      );
      if (newRequirements.length === 0) continue;

      // Add activity
      plannedActivities.push({
        activity: rec.activity,
        scoutsParticipating: rec.benefitingScouts.map(b => b.scoutId),
        requirementsAddressed: newRequirements.map(rc => rc.requirementId),
      });

      totalScore += rec.score;

      // Update tracking
      for (const rc of newRequirements) {
        usedRequirements.add(rc.requirementId);
      }
      for (const benefit of rec.benefitingScouts) {
        if (!scoutsBenefiting.has(benefit.scoutId)) {
          scoutsBenefiting.set(benefit.scoutId, []);
        }
        scoutsBenefiting
          .get(benefit.scoutId)!
          .push(...benefit.requirementsAdvanced);
      }
    }

    // Organize activities into time slots
    const timeSlots = [
      'Friday Evening',
      'Saturday Morning',
      'Saturday Afternoon',
      'Saturday Evening',
      'Sunday Morning',
    ];

    let slotIndex = 0;
    for (const activity of plannedActivities) {
      activity.timeSlot = timeSlots[slotIndex % timeSlots.length];
      slotIndex++;
    }

    return {
      name,
      activities: plannedActivities,
      scoutsBenefiting,
      totalAdvancementScore: totalScore,
    };
  }

  // Find the single best activity for maximum impact
  findBestActivity(
    patrolName: string,
    setting: 'meeting' | 'campout'
  ): ActivityRecommendation | null {
    const recommendations = this.getRecommendedActivities(patrolName, setting, 1);
    return recommendations.length > 0 ? recommendations[0] : null;
  }

  // Get summary statistics
  getPatrolSummary(patrolName: string): {
    totalScouts: number;
    averageProgress: number;
    scoutsNearRankUp: number;
    mostNeededCategories: string[];
  } {
    const scouts = this.tracker.getScoutsInPatrol(patrolName);
    const analyses = scouts.map(s => this.tracker.analyzeScout(s));

    const totalScouts = scouts.length;
    const averageProgress =
      analyses.reduce((sum, a) => sum + a.percentComplete, 0) / totalScouts || 0;
    const scoutsNearRankUp = analyses.filter(a => a.percentComplete >= 75).length;

    // Find most needed categories
    const categoryNeeds = new Map<string, number>();
    for (const analysis of analyses) {
      for (const req of analysis.missingRequirements) {
        const count = categoryNeeds.get(req.category) || 0;
        categoryNeeds.set(req.category, count + 1);
      }
    }

    const mostNeededCategories = Array.from(categoryNeeds.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    return {
      totalScouts,
      averageProgress,
      scoutsNearRankUp,
      mostNeededCategories,
    };
  }
}
