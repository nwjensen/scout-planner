import {
  Scout,
  Patrol,
  Troop,
  CompletedRequirement,
  ScoutAnalysis,
  Requirement,
  RankName,
} from './types.js';
import {
  getRequirementsForRank,
  getRequirementById,
  getNextRank,
  isRankBefore,
} from './requirements/index.js';

export class ScoutTracker {
  private troop: Troop;

  constructor(troopName: string, troopId: string = 'troop-1') {
    this.troop = {
      id: troopId,
      name: troopName,
      patrols: [],
    };
  }

  // Load from saved data
  static fromData(data: Troop): ScoutTracker {
    const tracker = new ScoutTracker(data.name, data.id);
    tracker.troop = data;
    return tracker;
  }

  getTroop(): Troop {
    return this.troop;
  }

  // Patrol management
  addPatrol(name: string): Patrol {
    const existing = this.troop.patrols.find(p => p.name === name);
    if (existing) {
      return existing;
    }
    const patrol: Patrol = { name, scouts: [] };
    this.troop.patrols.push(patrol);
    return patrol;
  }

  getPatrol(name: string): Patrol | undefined {
    return this.troop.patrols.find(p => p.name === name);
  }

  getAllPatrols(): Patrol[] {
    return this.troop.patrols;
  }

  // Scout management
  addScout(
    name: string,
    patrolName: string,
    currentRank: RankName,
    targetRank?: RankName
  ): Scout {
    const patrol = this.addPatrol(patrolName);

    // Generate a simple ID
    const id = `scout-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const scout: Scout = {
      id,
      name,
      patrol: patrolName,
      currentRank,
      targetRank: targetRank || getNextRank(currentRank) || currentRank,
      completedRequirements: [],
    };

    patrol.scouts.push(scout);
    return scout;
  }

  getScout(id: string): Scout | undefined {
    for (const patrol of this.troop.patrols) {
      const scout = patrol.scouts.find(s => s.id === id);
      if (scout) return scout;
    }
    return undefined;
  }

  getScoutByName(name: string): Scout | undefined {
    for (const patrol of this.troop.patrols) {
      const scout = patrol.scouts.find(
        s => s.name.toLowerCase() === name.toLowerCase()
      );
      if (scout) return scout;
    }
    return undefined;
  }

  getAllScouts(): Scout[] {
    return this.troop.patrols.flatMap(p => p.scouts);
  }

  getScoutsInPatrol(patrolName: string): Scout[] {
    const patrol = this.getPatrol(patrolName);
    return patrol?.scouts || [];
  }

  // Requirement completion
  markRequirementComplete(
    scoutId: string,
    requirementId: string,
    dateCompleted: string = new Date().toISOString().split('T')[0],
    signedBy?: string,
    notes?: string
  ): boolean {
    const scout = this.getScout(scoutId);
    if (!scout) return false;

    // Check if already completed
    if (scout.completedRequirements.some(r => r.requirementId === requirementId)) {
      return false;
    }

    const completion: CompletedRequirement = {
      requirementId,
      dateCompleted,
      signedBy,
      notes,
    };

    scout.completedRequirements.push(completion);
    return true;
  }

  // Bulk mark requirements
  markRequirementsComplete(
    scoutId: string,
    requirementIds: string[],
    dateCompleted?: string,
    signedBy?: string
  ): number {
    let count = 0;
    for (const reqId of requirementIds) {
      if (this.markRequirementComplete(scoutId, reqId, dateCompleted, signedBy)) {
        count++;
      }
    }
    return count;
  }

  isRequirementComplete(scoutId: string, requirementId: string): boolean {
    const scout = this.getScout(scoutId);
    if (!scout) return false;
    return scout.completedRequirements.some(r => r.requirementId === requirementId);
  }

  // Analysis
  analyzeScout(scout: Scout): ScoutAnalysis {
    const targetReqs = getRequirementsForRank(scout.targetRank);
    const completedIds = new Set(
      scout.completedRequirements.map(r => r.requirementId)
    );

    const missingRequirements = targetReqs.filter(r => !completedIds.has(r.id));
    const percentComplete =
      targetReqs.length > 0
        ? ((targetReqs.length - missingRequirements.length) / targetReqs.length) * 100
        : 0;

    // Prioritize requirements that can be done in meetings or are quick
    const nextMilestones = missingRequirements
      .filter(r => r.setting !== 'home' && r.setting !== 'campout')
      .slice(0, 5);

    // Rough estimate: one activity per 2-3 requirements
    const estimatedActivitiesToRank = Math.ceil(missingRequirements.length / 2.5);

    return {
      scout,
      percentComplete,
      missingRequirements,
      nextMilestones,
      estimatedActivitiesToRank,
    };
  }

  getMissingRequirements(scout: Scout): Requirement[] {
    const targetReqs = getRequirementsForRank(scout.targetRank);
    const completedIds = new Set(
      scout.completedRequirements.map(r => r.requirementId)
    );
    return targetReqs.filter(r => !completedIds.has(r.id));
  }

  // Get all missing requirements for a scout including next rank
  getMissingRequirementsMultiRank(scout: Scout): Requirement[] {
    const missing: Requirement[] = [];

    // Get target rank requirements
    missing.push(...this.getMissingRequirements(scout));

    // Also include next rank if they're close to completing current target
    const nextRank = getNextRank(scout.targetRank);
    if (nextRank) {
      const nextRankReqs = getRequirementsForRank(nextRank);
      const completedIds = new Set(
        scout.completedRequirements.map(r => r.requirementId)
      );
      missing.push(...nextRankReqs.filter(r => !completedIds.has(r.id)));
    }

    return missing;
  }

  getCompletedRequirements(scout: Scout): CompletedRequirement[] {
    return scout.completedRequirements;
  }

  // Check if scout has completed all requirements for a rank
  hasCompletedRank(scout: Scout, rank: RankName): boolean {
    const reqs = getRequirementsForRank(rank);
    const completedIds = new Set(
      scout.completedRequirements.map(r => r.requirementId)
    );
    return reqs.every(r => completedIds.has(r.id));
  }

  // Export data for saving
  exportData(): Troop {
    return this.troop;
  }
}
