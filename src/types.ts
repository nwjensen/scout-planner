// Core types for Scout Advancement Optimizer

export type RankName = 'Scout' | 'Tenderfoot' | 'Second Class' | 'First Class' | 'Star' | 'Life' | 'Eagle';

export interface Requirement {
  id: string;           // e.g., "2C-1a", "1C-3b"
  rank: RankName;
  category: string;     // e.g., "CAMPING AND OUTDOOR ETHICS"
  number: string;       // e.g., "1a", "2b"
  description: string;
  // Tags for activity matching
  activityTags: ActivityTag[];
  // Some requirements can only be done in specific settings
  setting?: 'meeting' | 'campout' | 'home' | 'any';
  // Estimated time to complete in minutes
  estimatedMinutes?: number;
}

export type ActivityTag =
  | 'camping'
  | 'cooking'
  | 'fire-building'
  | 'knots'
  | 'lashings'
  | 'navigation'
  | 'compass'
  | 'map'
  | 'hiking'
  | 'nature'
  | 'swimming'
  | 'water-rescue'
  | 'first-aid'
  | 'emergency'
  | 'fitness'
  | 'citizenship'
  | 'service'
  | 'safety'
  | 'tools'
  | 'stove'
  | 'flag-ceremony'
  | 'discussion'
  | 'demonstration'
  | 'planning';

export interface CompletedRequirement {
  requirementId: string;
  dateCompleted: string;  // ISO date string
  signedBy?: string;      // Leader initials or name
  notes?: string;
}

export interface Scout {
  id: string;
  name: string;
  patrol: string;
  currentRank: RankName;
  targetRank: RankName;  // The rank they're working toward
  completedRequirements: CompletedRequirement[];
  joinDate?: string;
}

export interface Patrol {
  name: string;
  scouts: Scout[];
}

export interface Troop {
  id: string;
  name: string;
  patrols: Patrol[];
}

// Activity planning types

export interface Activity {
  id: string;
  name: string;
  description: string;
  tags: ActivityTag[];
  setting: 'meeting' | 'campout' | 'either';
  estimatedMinutes: number;
  // Which requirements this activity can help complete
  fulfillsRequirements: string[];  // Requirement IDs
  // Prerequisites (other activities or requirements)
  prerequisites?: string[];
  // Minimum scouts needed for the activity
  minScouts?: number;
  maxScouts?: number;
}

export interface ActivityRecommendation {
  activity: Activity;
  score: number;  // Higher = more scouts benefit
  benefitingScouts: ScoutBenefit[];
  requirementsCovered: RequirementCoverage[];
}

export interface ScoutBenefit {
  scoutId: string;
  scoutName: string;
  requirementsAdvanced: string[];
  ranksProgressed: RankName[];
}

export interface RequirementCoverage {
  requirementId: string;
  rank: RankName;
  scoutsWhoNeed: string[];  // Scout IDs
}

export interface MeetingPlan {
  date?: string;
  durationMinutes: number;
  theme?: string;
  activities: PlannedActivity[];
  scoutsBenefiting: Map<string, string[]>;  // Scout ID -> requirement IDs
  totalAdvancementScore: number;
}

export interface CampoutPlan {
  name: string;
  startDate?: string;
  endDate?: string;
  activities: PlannedActivity[];
  scoutsBenefiting: Map<string, string[]>;
  totalAdvancementScore: number;
}

export interface PlannedActivity {
  activity: Activity;
  timeSlot?: string;
  scoutsParticipating: string[];
  requirementsAddressed: string[];
  notes?: string;
}

// Analysis types

export interface PatrolAnalysis {
  patrolName: string;
  scouts: ScoutAnalysis[];
  commonMissingRequirements: RequirementGap[];
  recommendedActivities: ActivityRecommendation[];
  bottleneckRequirements: string[];  // Requirements blocking the most scouts
}

export interface ScoutAnalysis {
  scout: Scout;
  percentComplete: number;
  missingRequirements: Requirement[];
  nextMilestones: Requirement[];  // High-priority requirements to complete next
  estimatedActivitiesToRank: number;
}

export interface RequirementGap {
  requirement: Requirement;
  scoutsMissing: Scout[];
  priority: number;  // Higher = more scouts need this
}

// For serialization/storage

export interface TroopData {
  troop: Troop;
  lastUpdated: string;
}

export interface ScoutProgressData {
  scoutId: string;
  completedRequirements: CompletedRequirement[];
  lastUpdated: string;
}
