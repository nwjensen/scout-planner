# Scout Advancement Optimizer

A tool to help Scoutmasters optimize troop meetings and campouts for maximum advancement impact across a patrol.

## Problem Statement

In a Scout patrol, scouts often progress at different paces. This can lead to:
- Scouts drifting apart in rank
- Laggard scouts dropping out
- Meeting activities that only benefit a few scouts

## Solution

This tool analyzes patrol progress and recommends activities that will benefit the **most scouts simultaneously**, helping keep the patrol together and maximizing the "return on investment" of meeting time.

### Key Features

1. **Image OCR**: Scan handbook photos to automatically extract progress
2. **Progress Tracking**: Track each scout's completed requirements
3. **Gap Analysis**: Identify requirements needed by multiple scouts
4. **Activity Optimization**: Score activities by how many scouts they help
5. **Cross-Rank Planning**: Consider next rank requirements to work ahead
6. **Meeting/Campout Planning**: Generate optimized agendas

## Installation

```bash
npm install
```

## Usage

### CLI Commands

```bash
# Show help
npx tsx src/cli.ts help

# Analyze patrol progress and get recommendations
npx tsx src/cli.ts analyze

# Show detailed progress for all scouts
npx tsx src/cli.ts show-progress

# Show progress for a specific scout
npx tsx src/cli.ts scout "Sample Scout"

# Generate an optimized 90-minute meeting plan
npx tsx src/cli.ts plan-meeting

# Generate an optimized campout plan
npx tsx src/cli.ts plan-campout

# Get activity recommendations
npx tsx src/cli.ts recommend

# SCAN HANDBOOK PHOTOS (OCR)
# Scan a single handbook page photo
npx tsx src/cli.ts scan ./path/to/handbook-page.jpg

# Scan all images in a folder
npx tsx src/cli.ts scan-folder ./scout-photos/
```

### OCR Scanning

The scanner uses Tesseract.js to read handbook photos and extract:
- **Rank detection**: Automatically detects Second Class or First Class pages
- **Requirement numbers**: Finds requirement numbers (1a, 2b, etc.)
- **Completion status**: Detects checkmarks, dates, and signatures
- **Leader initials**: Extracts signer information when visible

**Tips for best OCR results:**
- Take photos in good lighting
- Keep the camera parallel to the page (avoid angles)
- Ensure text is in focus
- Include the full page with headers visible

### Example Output

```
 PATROL ANALYSIS: Eagle Patrol

📊 PATROL SUMMARY
  Total Scouts: 4
  Average Progress: 45.2%
  Scouts Near Rank-Up (75%+): 1

👤 SCOUT PROGRESS
  Sample Scout (from photos) [████████░░░░░░░░░░░░] 56.7%
  Alex Johnson              [██░░░░░░░░░░░░░░░░░░] 16.7%
  Sam Williams              [███░░░░░░░░░░░░░░░░░] 20.0%
  Jordan Smith              [████████████████░░░░] 43.2%

🎯 HIGHEST IMPACT REQUIREMENTS
  (Requirements needed by the most scouts)

  2C-6a    [3 scouts] FIRST AID AND EMERGENCY PREPAREDNESS
           Demonstrate first aid for the following: Object in the eye...
           Needed by: Sample, Alex, Sam
```

## Architecture

### Data Model

- **Troop**: Contains multiple patrols
- **Patrol**: Contains scouts
- **Scout**: Has completed requirements and target rank
- **Requirement**: Individual rank requirement with tags
- **Activity**: An activity that fulfills one or more requirements

### Optimization Algorithm

1. **Collect Missing Requirements**: For each scout, find missing requirements for their target rank AND next rank
2. **Score Activities**: For each activity:
   - Base score: 10 points per scout who benefits
   - Bonus for multiple requirements per scout (+5 each)
   - Bonus for scouts close to rank completion (+5/10/15)
3. **Greedy Selection**: Select highest-scoring activities that fit time budget

### Files

```
src/
├── types.ts                    # TypeScript interfaces
├── requirements/
│   ├── second-class.ts         # Second Class requirements
│   ├── first-class.ts          # First Class requirements
│   └── index.ts                # Requirement utilities
├── activities/
│   └── activities-database.ts  # Activity definitions
├── ocr/
│   ├── image-preprocessor.ts   # Image enhancement for OCR
│   ├── handbook-scanner.ts     # Tesseract OCR scanning
│   └── index.ts                # OCR module exports
├── scout-tracker.ts            # Scout progress tracking
├── optimizer.ts                # Advancement optimization
├── data/
│   └── sample-troop.ts         # Sample data from photos
├── cli.ts                      # Command-line interface
└── index.ts                    # Main entry point
```

## Adding Scout Data

### From Handbook Photos

To add a new scout's data extracted from handbook photos:

```typescript
import { ScoutTracker } from './src/scout-tracker.js';

const tracker = new ScoutTracker('Troop 123');

// Add a scout
const scout = tracker.addScout(
  'John Smith',           // name
  'Eagle Patrol',         // patrol
  'Tenderfoot',          // current rank
  'Second Class'         // target rank
);

// Mark requirements complete
tracker.markRequirementComplete(
  scout.id,
  '2C-1b',               // requirement ID
  '2025-01-25',          // date
  'JG'                   // leader initials
);
```

### Programmatic Usage

```typescript
import { ScoutTracker, AdvancementOptimizer } from './src/index.js';

// Create tracker
const tracker = new ScoutTracker('Troop 123');
tracker.addPatrol('Eagle Patrol');

// Add scouts and requirements...

// Create optimizer
const optimizer = new AdvancementOptimizer(tracker);

// Get recommendations
const recommendations = optimizer.getRecommendedActivities('Eagle Patrol', 'meeting');

// Generate meeting plan
const meetingPlan = optimizer.generateMeetingPlan('Eagle Patrol', 90);
```

## Requirement IDs

### Second Class (prefix: 2C-)
- `2C-1a` through `2C-1c`: Camping and Outdoor Ethics
- `2C-2a` through `2C-2g`: Cooking and Tools
- `2C-3a` through `2C-3d`: Navigation
- `2C-4`: Nature
- `2C-5a` through `2C-5d`: Aquatics
- `2C-6a` through `2C-6e`: First Aid
- `2C-7a` through `2C-7c`: Fitness
- `2C-8a` through `2C-8e`: Citizenship
- `2C-9a` through `2C-9b`: Personal Safety
- `2C-10` through `2C-12`: Scout Spirit

### First Class (prefix: 1C-)
- `1C-1a` through `1C-1b`: Camping and Outdoor Ethics
- `1C-2a` through `1C-2e`: Cooking
- `1C-3a` through `1C-3d`: Tools
- `1C-4a` through `1C-4b`: Navigation
- `1C-5a` through `1C-5d`: Nature
- `1C-6a` through `1C-6e`: Aquatics
- `1C-7a` through `1C-7f`: First Aid
- `1C-8a` through `1C-8b`: Fitness
- `1C-9a` through `1C-9d`: Citizenship
- `1C-10` through `1C-13`: Leadership and Scout Spirit

## Future Enhancements

- [x] Image OCR to automatically extract progress from handbook photos
- [ ] Persistent storage (JSON/SQLite)
- [ ] Web interface
- [ ] Merit badge tracking
- [ ] Tenderfoot rank requirements
- [ ] Star, Life, and Eagle requirements
- [ ] Calendar integration for scheduling
- [ ] Progress visualization charts
- [ ] AI-powered OCR using vision models for better handwriting recognition

## License

MIT
