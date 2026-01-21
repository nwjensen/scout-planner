import { Requirement, RankName } from '../types.js';
import { secondClassRequirements } from './second-class.js';
import { firstClassRequirements } from './first-class.js';

// All requirements indexed by ID for fast lookup
const requirementsById = new Map<string, Requirement>();

// All requirements indexed by rank
const requirementsByRank = new Map<RankName, Requirement[]>();

// Initialize the maps
function initializeRequirements() {
  const allRequirements = [...secondClassRequirements, ...firstClassRequirements];

  for (const req of allRequirements) {
    requirementsById.set(req.id, req);
  }

  requirementsByRank.set('Second Class', secondClassRequirements);
  requirementsByRank.set('First Class', firstClassRequirements);
}

initializeRequirements();

export function getRequirementById(id: string): Requirement | undefined {
  return requirementsById.get(id);
}

export function getRequirementsForRank(rank: RankName): Requirement[] {
  return requirementsByRank.get(rank) || [];
}

export function getAllRequirements(): Requirement[] {
  return [...secondClassRequirements, ...firstClassRequirements];
}

export function getRequirementsByCategory(rank: RankName, category: string): Requirement[] {
  const rankReqs = getRequirementsForRank(rank);
  return rankReqs.filter(r => r.category === category);
}

export function getCategoriesForRank(rank: RankName): string[] {
  const rankReqs = getRequirementsForRank(rank);
  const categories = new Set(rankReqs.map(r => r.category));
  return Array.from(categories);
}

// Find requirements that can be done with certain activity tags
export function findRequirementsByTags(tags: string[], rank?: RankName): Requirement[] {
  let reqs = rank ? getRequirementsForRank(rank) : getAllRequirements();

  return reqs.filter(req =>
    tags.some(tag => req.activityTags.includes(tag as any))
  );
}

// Find requirements suitable for a specific setting
export function findRequirementsBySetting(setting: 'meeting' | 'campout' | 'home' | 'any', rank?: RankName): Requirement[] {
  let reqs = rank ? getRequirementsForRank(rank) : getAllRequirements();

  return reqs.filter(req =>
    !req.setting || req.setting === 'any' || req.setting === setting ||
    (setting === 'campout' && req.setting === 'any') ||
    (setting === 'meeting' && (req.setting === 'any' || req.setting === 'meeting'))
  );
}

// Get the next rank in progression
export function getNextRank(currentRank: RankName): RankName | null {
  const progression: RankName[] = ['Scout', 'Tenderfoot', 'Second Class', 'First Class', 'Star', 'Life', 'Eagle'];
  const currentIndex = progression.indexOf(currentRank);
  if (currentIndex === -1 || currentIndex === progression.length - 1) {
    return null;
  }
  return progression[currentIndex + 1];
}

// Check if one rank comes before another
export function isRankBefore(rank1: RankName, rank2: RankName): boolean {
  const progression: RankName[] = ['Scout', 'Tenderfoot', 'Second Class', 'First Class', 'Star', 'Life', 'Eagle'];
  return progression.indexOf(rank1) < progression.indexOf(rank2);
}

export { secondClassRequirements, firstClassRequirements };
