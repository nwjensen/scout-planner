// Scout Advancement Optimizer
// Main entry point for programmatic usage

export { ScoutTracker } from './scout-tracker.js';
export { AdvancementOptimizer } from './optimizer.js';
export * from './types.js';
export * from './requirements/index.js';
export * from './activities/activities-database.js';
export { createSampleTroop } from './data/sample-troop.js';

// Quick start example
import { ScoutTracker } from './scout-tracker.js';
import { AdvancementOptimizer } from './optimizer.js';
import { createSampleTroop } from './data/sample-troop.js';

export function createExample() {
  // Load sample troop
  const troopData = createSampleTroop();
  const tracker = ScoutTracker.fromData(troopData);
  const optimizer = new AdvancementOptimizer(tracker);

  return { tracker, optimizer };
}

// If run directly, show basic info
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Scout Advancement Optimizer');
  console.log('===========================');
  console.log('');
  console.log('Use the CLI for interactive features:');
  console.log('  npx tsx src/cli.ts help');
  console.log('');
  console.log('Or import programmatically:');
  console.log('  import { ScoutTracker, AdvancementOptimizer } from "./src/index.js"');
}
