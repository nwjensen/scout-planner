import { Troop, Scout, CompletedRequirement } from '../types.js';

// Sample data extracted from the provided handbook photos
// This represents a scout working toward Second Class with progress on First Class

export const sampleScoutCompletedRequirements: CompletedRequirement[] = [
  // Second Class - CAMPING AND OUTDOOR ETHICS
  { requirementId: '2C-1b', dateCompleted: '2025-01-25', signedBy: 'JG' },

  // Second Class - COOKING AND TOOLS
  { requirementId: '2C-2b', dateCompleted: '2025-01-25', signedBy: 'RDS' },
  { requirementId: '2C-2f', dateCompleted: '2024-12-01', signedBy: 'DAT' },
  { requirementId: '2C-2g', dateCompleted: '2024-12-01', signedBy: 'DAT' },

  // Second Class - NAVIGATION
  { requirementId: '2C-3a', dateCompleted: '2024-12-14', signedBy: 'MOV' },
  { requirementId: '2C-3d', dateCompleted: '2024-12-15', signedBy: 'CRICHS' },

  // Second Class - NATURE
  { requirementId: '2C-4', dateCompleted: '2024-07-15', signedBy: 'Summer Camp', notes: 'Summer Camp 2024' },

  // Second Class - AQUATICS
  { requirementId: '2C-5a', dateCompleted: '2024-07-15', signedBy: 'VL' },
  { requirementId: '2C-5b', dateCompleted: '2025-02-22', signedBy: 'VL' },
  { requirementId: '2C-5c', dateCompleted: '2024-07-15', notes: 'Reach Throw Row Go' },
  { requirementId: '2C-5d', dateCompleted: '2024-07-15', signedBy: 'VN' },

  // Second Class - FIRST AID
  { requirementId: '2C-6b', dateCompleted: '2024-12-01', signedBy: 'JG' },
  { requirementId: '2C-6c', dateCompleted: '2025-02-04', signedBy: 'JG' },
  { requirementId: '2C-6d', dateCompleted: '2025-02-09', signedBy: 'SC' },
  { requirementId: '2C-6e', dateCompleted: '2025-02-22', signedBy: 'Max Gaust MTG' },

  // Second Class - CITIZENSHIP
  { requirementId: '2C-8b', dateCompleted: '2025-01-25', signedBy: 'JG' },

  // Second Class - PERSONAL SAFETY
  { requirementId: '2C-9a', dateCompleted: '2025-01-25', signedBy: 'JG' },
  { requirementId: '2C-9b', dateCompleted: '2025-01-25', signedBy: 'JG' },

  // First Class - TOOLS (working ahead)
  { requirementId: '1C-3a', dateCompleted: '2024-11-01', signedBy: 'Drew' },
  { requirementId: '1C-3b', dateCompleted: '2024-11-01', signedBy: 'Drew' },
  { requirementId: '1C-3c', dateCompleted: '2024-11-01', signedBy: 'Drew' },
  { requirementId: '1C-3d', dateCompleted: '2024-11-01', signedBy: 'Drew' },

  // First Class - AQUATICS
  { requirementId: '1C-6e', dateCompleted: '2025-02-25', signedBy: 'Eagle Campout' },

  // First Class - FIRST AID
  { requirementId: '1C-7b', dateCompleted: '2025-01-25', signedBy: 'JG' },
  { requirementId: '1C-7c', dateCompleted: '2024-12-10', signedBy: 'Ean' },

  // First Class - CITIZENSHIP
  { requirementId: '1C-9a', dateCompleted: '2024-04-22', signedBy: 'CA' },
];

// Create sample scouts for a patrol
export function createSampleTroop(): Troop {
  // Scout from the photos
  const scoutFromPhotos: Scout = {
    id: 'scout-handbook-example',
    name: 'Sample Scout (from photos)',
    patrol: 'Eagle Patrol',
    currentRank: 'Tenderfoot',
    targetRank: 'Second Class',
    completedRequirements: sampleScoutCompletedRequirements,
  };

  // Additional sample scouts to demonstrate patrol optimization
  const scout2: Scout = {
    id: 'scout-alex',
    name: 'Alex Johnson',
    patrol: 'Eagle Patrol',
    currentRank: 'Tenderfoot',
    targetRank: 'Second Class',
    completedRequirements: [
      { requirementId: '2C-1b', dateCompleted: '2025-01-20', signedBy: 'JG' },
      { requirementId: '2C-2f', dateCompleted: '2025-01-20', signedBy: 'JG' },
      { requirementId: '2C-2g', dateCompleted: '2025-01-20', signedBy: 'JG' },
      { requirementId: '2C-5a', dateCompleted: '2025-01-20', signedBy: 'JG' },
      { requirementId: '2C-9a', dateCompleted: '2025-01-20', signedBy: 'JG' },
      { requirementId: '2C-9b', dateCompleted: '2025-01-20', signedBy: 'JG' },
    ],
  };

  const scout3: Scout = {
    id: 'scout-sam',
    name: 'Sam Williams',
    patrol: 'Eagle Patrol',
    currentRank: 'Tenderfoot',
    targetRank: 'Second Class',
    completedRequirements: [
      { requirementId: '2C-1b', dateCompleted: '2025-01-15', signedBy: 'JG' },
      { requirementId: '2C-3a', dateCompleted: '2025-01-15', signedBy: 'JG' },
      { requirementId: '2C-5a', dateCompleted: '2025-01-15', signedBy: 'JG' },
      { requirementId: '2C-5d', dateCompleted: '2025-01-15', signedBy: 'JG' },
      { requirementId: '2C-8b', dateCompleted: '2025-01-15', signedBy: 'JG' },
      { requirementId: '2C-9a', dateCompleted: '2025-01-15', signedBy: 'JG' },
      { requirementId: '2C-9b', dateCompleted: '2025-01-15', signedBy: 'JG' },
    ],
  };

  const scout4: Scout = {
    id: 'scout-jordan',
    name: 'Jordan Smith',
    patrol: 'Eagle Patrol',
    currentRank: 'Second Class',
    targetRank: 'First Class',
    completedRequirements: [
      // Completed all Second Class
      { requirementId: '2C-1a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-1b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-1c', dateCompleted: '2024-10-01' },
      { requirementId: '2C-2a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-2b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-2c', dateCompleted: '2024-10-01' },
      { requirementId: '2C-2d', dateCompleted: '2024-10-01' },
      { requirementId: '2C-2e', dateCompleted: '2024-10-01' },
      { requirementId: '2C-2f', dateCompleted: '2024-10-01' },
      { requirementId: '2C-2g', dateCompleted: '2024-10-01' },
      { requirementId: '2C-3a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-3b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-3c', dateCompleted: '2024-10-01' },
      { requirementId: '2C-3d', dateCompleted: '2024-10-01' },
      { requirementId: '2C-4', dateCompleted: '2024-10-01' },
      { requirementId: '2C-5a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-5b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-5c', dateCompleted: '2024-10-01' },
      { requirementId: '2C-5d', dateCompleted: '2024-10-01' },
      { requirementId: '2C-6a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-6b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-6c', dateCompleted: '2024-10-01' },
      { requirementId: '2C-6d', dateCompleted: '2024-10-01' },
      { requirementId: '2C-6e', dateCompleted: '2024-10-01' },
      { requirementId: '2C-7a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-7b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-7c', dateCompleted: '2024-10-01' },
      { requirementId: '2C-8a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-8b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-8c', dateCompleted: '2024-10-01' },
      { requirementId: '2C-8d', dateCompleted: '2024-10-01' },
      { requirementId: '2C-8e', dateCompleted: '2024-10-01' },
      { requirementId: '2C-9a', dateCompleted: '2024-10-01' },
      { requirementId: '2C-9b', dateCompleted: '2024-10-01' },
      { requirementId: '2C-10', dateCompleted: '2024-10-01' },
      { requirementId: '2C-11', dateCompleted: '2024-10-01' },
      { requirementId: '2C-12', dateCompleted: '2024-10-01' },
      // Some First Class started
      { requirementId: '1C-1b', dateCompleted: '2024-11-01' },
      { requirementId: '1C-3a', dateCompleted: '2024-11-01' },
      { requirementId: '1C-3b', dateCompleted: '2024-11-01' },
      { requirementId: '1C-5b', dateCompleted: '2024-11-01' },
      { requirementId: '1C-6b', dateCompleted: '2024-11-01' },
      { requirementId: '1C-6c', dateCompleted: '2024-11-01' },
      { requirementId: '1C-6d', dateCompleted: '2024-11-01' },
      { requirementId: '1C-7c', dateCompleted: '2024-11-01' },
    ],
  };

  return {
    id: 'troop-sample',
    name: 'Sample Troop',
    patrols: [
      {
        name: 'Eagle Patrol',
        scouts: [scoutFromPhotos, scout2, scout3, scout4],
      },
    ],
  };
}

// Goals noted on the handbook:
// 1) Be Clean (Room)
// 2) P44 "character"
// 3) May 2025 2nd class
export const scoutGoals = {
  targetDate: '2025-05-01',
  targetRank: 'Second Class',
  personalGoals: ['Be Clean (Room)', 'P44 "character"'],
};
