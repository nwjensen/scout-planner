import { Activity } from '../types.js';

// Pre-defined activities that can fulfill multiple requirements across ranks
export const activitiesDatabase: Activity[] = [
  // KNOT AND LASHING ACTIVITIES
  {
    id: 'knots-session',
    name: 'Knot Tying Session',
    description: 'Practice and demonstrate essential knots including sheet bend, bowline, timber hitch, and clove hitch',
    tags: ['knots', 'demonstration'],
    setting: 'either',
    estimatedMinutes: 45,
    fulfillsRequirements: ['2C-2f', '2C-2g', '1C-3b'],
    minScouts: 1,
  },
  {
    id: 'lashing-project',
    name: 'Lashing Project',
    description: 'Learn and practice square, shear, and diagonal lashings by building a camp gadget',
    tags: ['lashings', 'demonstration', 'camping'],
    setting: 'either',
    estimatedMinutes: 90,
    fulfillsRequirements: ['1C-3a', '1C-3b', '1C-3c', '1C-3d'],
    minScouts: 2,
  },

  // FIRE AND COOKING ACTIVITIES
  {
    id: 'fire-building-basics',
    name: 'Fire Building Basics',
    description: 'Learn fire safety, prepare materials, and build a cooking fire using proper techniques',
    tags: ['fire-building', 'tools', 'cooking'],
    setting: 'campout',
    estimatedMinutes: 60,
    fulfillsRequirements: ['2C-2a', '2C-2b', '2C-2c'],
  },
  {
    id: 'stove-cooking',
    name: 'Camp Stove Cooking',
    description: 'Learn to set up and use lightweight and propane stoves safely',
    tags: ['stove', 'cooking', 'demonstration'],
    setting: 'either',
    estimatedMinutes: 45,
    fulfillsRequirements: ['2C-2d'],
  },
  {
    id: 'patrol-cooking-2c',
    name: 'Second Class Patrol Cooking',
    description: 'Plan and cook a hot breakfast or lunch on a campout',
    tags: ['cooking', 'planning'],
    setting: 'campout',
    estimatedMinutes: 120,
    fulfillsRequirements: ['2C-2e'],
    minScouts: 2,
  },
  {
    id: 'patrol-cooking-1c',
    name: 'First Class Patrol Cooking',
    description: 'Full meal planning and cooking: plan menu, budget, gather gear, cook all meals, and cleanup',
    tags: ['cooking', 'planning', 'fire-building', 'stove'],
    setting: 'campout',
    estimatedMinutes: 300,
    fulfillsRequirements: ['1C-2a', '1C-2b', '1C-2c', '1C-2d', '1C-2e'],
    prerequisites: ['2C-2e'],
    minScouts: 3,
  },

  // NAVIGATION ACTIVITIES
  {
    id: 'compass-basics',
    name: 'Compass and Map Basics',
    description: 'Learn how a compass works, orient a map, and identify map symbols',
    tags: ['compass', 'map', 'navigation', 'demonstration'],
    setting: 'either',
    estimatedMinutes: 45,
    fulfillsRequirements: ['2C-3a'],
  },
  {
    id: 'navigation-hike',
    name: 'Navigation Hike (5+ miles)',
    description: 'Use compass and map on a 5-mile hike, discuss hazards and prevention',
    tags: ['compass', 'map', 'hiking', 'navigation', 'safety'],
    setting: 'campout',
    estimatedMinutes: 240,
    fulfillsRequirements: ['2C-3b', '2C-3c'],
    prerequisites: ['2C-3a'],
  },
  {
    id: 'celestial-navigation',
    name: 'Finding Directions Without Compass',
    description: 'Learn to find directions using the sun, stars, and natural indicators',
    tags: ['navigation', 'demonstration'],
    setting: 'campout',
    estimatedMinutes: 30,
    fulfillsRequirements: ['2C-3d'],
  },
  {
    id: 'orienteering-course',
    name: 'Orienteering Course',
    description: 'Complete an orienteering course using map and compass with height/width measurements',
    tags: ['compass', 'map', 'navigation', 'hiking'],
    setting: 'campout',
    estimatedMinutes: 120,
    fulfillsRequirements: ['1C-4a'],
    prerequisites: ['2C-3a', '2C-3b'],
  },
  {
    id: 'gps-navigation',
    name: 'GPS Navigation',
    description: 'Learn to use GPS devices and apps for navigation',
    tags: ['navigation', 'demonstration'],
    setting: 'either',
    estimatedMinutes: 45,
    fulfillsRequirements: ['1C-4b'],
  },

  // CAMPING ACTIVITIES
  {
    id: 'leave-no-trace',
    name: 'Leave No Trace Principles',
    description: 'Learn and discuss the Leave No Trace principles and their application',
    tags: ['camping', 'discussion'],
    setting: 'any',
    estimatedMinutes: 30,
    fulfillsRequirements: ['2C-1b', '1C-1b'],
  },
  {
    id: 'campsite-selection',
    name: 'Campsite Selection',
    description: 'Learn factors for selecting patrol sites and tent locations',
    tags: ['camping', 'planning'],
    setting: 'campout',
    estimatedMinutes: 30,
    fulfillsRequirements: ['2C-1c'],
  },

  // NATURE ACTIVITIES
  {
    id: 'wildlife-identification',
    name: 'Wildlife Identification',
    description: 'Identify 10 kinds of wild animals through direct observation or evidence',
    tags: ['nature'],
    setting: 'either',
    estimatedMinutes: 90,
    fulfillsRequirements: ['2C-4'],
  },
  {
    id: 'plant-identification',
    name: 'Plant Identification',
    description: 'Identify 10 kinds of native plants in local area',
    tags: ['nature'],
    setting: 'either',
    estimatedMinutes: 90,
    fulfillsRequirements: ['1C-5a'],
  },
  {
    id: 'weather-discussion',
    name: 'Weather Awareness',
    description: 'Learn weather forecasting, natural indicators, and extreme weather preparation',
    tags: ['nature', 'safety', 'discussion', 'planning'],
    setting: 'any',
    estimatedMinutes: 45,
    fulfillsRequirements: ['1C-5b', '1C-5c', '1C-5d'],
  },

  // AQUATICS ACTIVITIES
  {
    id: 'swim-safety-discussion',
    name: 'Swim Safety Discussion',
    description: 'Discuss safe swim precautions and water safety',
    tags: ['swimming', 'safety', 'discussion'],
    setting: 'any',
    estimatedMinutes: 20,
    fulfillsRequirements: ['2C-5a'],
  },
  {
    id: 'bsa-beginner-swim',
    name: 'BSA Beginner Swim Test',
    description: 'Demonstrate ability to pass BSA beginner swim test',
    tags: ['swimming', 'demonstration'],
    setting: 'campout',
    estimatedMinutes: 45,
    fulfillsRequirements: ['2C-5b'],
  },
  {
    id: 'water-rescue-basics',
    name: 'Water Rescue Methods',
    description: 'Learn reaching, throwing, and line rescue methods',
    tags: ['water-rescue', 'demonstration'],
    setting: 'either',
    estimatedMinutes: 45,
    fulfillsRequirements: ['2C-5c', '2C-5d'],
  },
  {
    id: 'bsa-swimmer-test',
    name: 'BSA Swimmer Test',
    description: 'Complete the full BSA swimmer test',
    tags: ['swimming', 'demonstration'],
    setting: 'campout',
    estimatedMinutes: 60,
    fulfillsRequirements: ['1C-6a'],
  },
  {
    id: 'boating-basics',
    name: 'Boating Basics',
    description: 'Learn boat parts, paddle/oar parts, and proper positioning',
    tags: ['swimming', 'discussion'],
    setting: 'any',
    estimatedMinutes: 30,
    fulfillsRequirements: ['1C-6b', '1C-6c', '1C-6d'],
  },
  {
    id: 'line-rescue-practice',
    name: 'Line Rescue Practice',
    description: 'Practice line rescue as both tender and rescuer',
    tags: ['water-rescue', 'demonstration'],
    setting: 'campout',
    estimatedMinutes: 45,
    fulfillsRequirements: ['1C-6e'],
    prerequisites: ['2C-5c'],
  },

  // FIRST AID ACTIVITIES
  {
    id: 'first-aid-basics-2c',
    name: 'Second Class First Aid',
    description: 'Learn first aid for common injuries: eye, bites, punctures, burns, heat/cold emergencies',
    tags: ['first-aid', 'demonstration'],
    setting: 'any',
    estimatedMinutes: 90,
    fulfillsRequirements: ['2C-6a'],
  },
  {
    id: 'hurry-cases',
    name: 'Hurry Cases',
    description: 'Learn to respond to stopped breathing, stroke, severe bleeding, and poisoning',
    tags: ['first-aid', 'emergency', 'demonstration'],
    setting: 'any',
    estimatedMinutes: 45,
    fulfillsRequirements: ['2C-6b'],
  },
  {
    id: 'injury-prevention',
    name: 'Injury Prevention Discussion',
    description: 'Discuss preventing injuries on campouts and hikes',
    tags: ['first-aid', 'safety', 'discussion'],
    setting: 'any',
    estimatedMinutes: 20,
    fulfillsRequirements: ['2C-6c'],
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response',
    description: 'Learn emergency response procedures for home and backcountry, including vehicular accidents',
    tags: ['emergency', 'discussion'],
    setting: 'any',
    estimatedMinutes: 30,
    fulfillsRequirements: ['2C-6d', '2C-6e'],
  },
  {
    id: 'bandaging-practice',
    name: 'Bandaging Practice',
    description: 'Practice bandaging for sprains and injuries on head, arm, and collarbone',
    tags: ['first-aid', 'demonstration'],
    setting: 'any',
    estimatedMinutes: 45,
    fulfillsRequirements: ['1C-7a'],
  },
  {
    id: 'rescue-transport',
    name: 'Rescue and Transport',
    description: 'Practice transporting victims from smoke and carrying those with sprained ankles',
    tags: ['first-aid', 'emergency', 'demonstration'],
    setting: 'either',
    estimatedMinutes: 45,
    fulfillsRequirements: ['1C-7b'],
    minScouts: 3,
  },
  {
    id: 'cpr-awareness',
    name: 'CPR and Heart Attack Awareness',
    description: 'Learn heart attack signs and CPR procedures',
    tags: ['first-aid', 'emergency', 'discussion'],
    setting: 'any',
    estimatedMinutes: 30,
    fulfillsRequirements: ['1C-7c'],
  },
  {
    id: 'home-emergency-prep',
    name: 'Home Emergency Preparedness',
    description: 'Discuss utility hazards, emergency response, and develop home emergency plan',
    tags: ['emergency', 'safety', 'planning', 'discussion'],
    setting: 'any',
    estimatedMinutes: 45,
    fulfillsRequirements: ['1C-7d', '1C-7e', '1C-7f'],
  },

  // CITIZENSHIP ACTIVITIES
  {
    id: 'flag-ceremony',
    name: 'Flag Ceremony',
    description: 'Participate in a flag ceremony and discuss flag respect',
    tags: ['flag-ceremony', 'citizenship', 'discussion'],
    setting: 'either',
    estimatedMinutes: 30,
    fulfillsRequirements: ['2C-8a', '2C-8b'],
  },
  {
    id: 'service-project-2hr',
    name: 'Service Project (2+ hours)',
    description: 'Participate in an approved service project',
    tags: ['service', 'citizenship'],
    setting: 'either',
    estimatedMinutes: 150,
    fulfillsRequirements: ['2C-8e'],
  },
  {
    id: 'service-project-3hr',
    name: 'Service Project (3+ hours)',
    description: 'Participate in an approved service project for First Class',
    tags: ['service', 'citizenship'],
    setting: 'either',
    estimatedMinutes: 210,
    fulfillsRequirements: ['1C-9d'],
    prerequisites: ['2C-8e'],
  },

  // SAFETY ACTIVITIES
  {
    id: 'personal-safety',
    name: 'Personal Safety Awareness',
    description: 'Discuss three Rs of personal safety and bullying prevention',
    tags: ['safety', 'discussion'],
    setting: 'any',
    estimatedMinutes: 30,
    fulfillsRequirements: ['2C-9a', '2C-9b'],
  },

  // FITNESS DISCUSSIONS
  {
    id: 'fitness-discussion-2c',
    name: 'Second Class Fitness Discussion',
    description: 'Share fitness challenges and set goals for continued activity',
    tags: ['fitness', 'discussion', 'planning'],
    setting: 'any',
    estimatedMinutes: 20,
    fulfillsRequirements: ['2C-7b'],
    prerequisites: ['2C-7a'],
  },
  {
    id: 'fitness-discussion-1c',
    name: 'First Class Fitness Discussion',
    description: 'Share fitness challenges and set goals',
    tags: ['fitness', 'discussion'],
    setting: 'any',
    estimatedMinutes: 20,
    fulfillsRequirements: ['1C-8b'],
    prerequisites: ['1C-8a'],
  },

  // COMPREHENSIVE CAMPOUT ACTIVITIES
  {
    id: 'campout-weekend',
    name: 'Weekend Campout',
    description: 'Full weekend campout with camping activities counting toward 1a requirements',
    tags: ['camping'],
    setting: 'campout',
    estimatedMinutes: 0,
    fulfillsRequirements: ['2C-1a', '1C-1a'],
  },
];

// Helper function to find activities by tag
export function findActivitiesByTag(tag: string): Activity[] {
  return activitiesDatabase.filter(a => a.tags.includes(tag as any));
}

// Helper function to find activities by setting
export function findActivitiesBySetting(setting: 'meeting' | 'campout' | 'either'): Activity[] {
  return activitiesDatabase.filter(a => a.setting === setting || a.setting === 'either');
}

// Helper function to find activities that fulfill a requirement
export function findActivitiesForRequirement(requirementId: string): Activity[] {
  return activitiesDatabase.filter(a => a.fulfillsRequirements.includes(requirementId));
}

// Get activity by ID
export function getActivityById(id: string): Activity | undefined {
  return activitiesDatabase.find(a => a.id === id);
}
