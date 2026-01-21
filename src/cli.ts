#!/usr/bin/env node

import { ScoutTracker } from './scout-tracker.js';
import { AdvancementOptimizer } from './optimizer.js';
import { createSampleTroop } from './data/sample-troop.js';
import { getRequirementById, getRequirementsForRank } from './requirements/index.js';
import { HandbookScanner, ScanResult } from './ocr/handbook-scanner.js';
import * as fs from 'fs';
import * as path from 'path';
import {
  Scout,
  PatrolAnalysis,
  ActivityRecommendation,
  MeetingPlan,
  CampoutPlan,
} from './types.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
};

function header(text: string): string {
  return `\n${colors.bright}${colors.bgBlue} ${text} ${colors.reset}\n`;
}

function subHeader(text: string): string {
  return `${colors.bright}${colors.cyan}${text}${colors.reset}`;
}

function success(text: string): string {
  return `${colors.green}✓${colors.reset} ${text}`;
}

function warning(text: string): string {
  return `${colors.yellow}!${colors.reset} ${text}`;
}

function formatPercent(value: number): string {
  if (value >= 75) return `${colors.green}${value.toFixed(1)}%${colors.reset}`;
  if (value >= 50) return `${colors.yellow}${value.toFixed(1)}%${colors.reset}`;
  return `${colors.red}${value.toFixed(1)}%${colors.reset}`;
}

function progressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}]`;
}

// Main CLI application
class ScoutPlannerCLI {
  private tracker: ScoutTracker;
  private optimizer: AdvancementOptimizer;

  constructor() {
    // Load sample troop data
    const troopData = createSampleTroop();
    this.tracker = ScoutTracker.fromData(troopData);
    this.optimizer = new AdvancementOptimizer(this.tracker);
  }

  showHelp(): void {
    console.log(header('SCOUT ADVANCEMENT OPTIMIZER'));
    console.log(`
${colors.bright}USAGE:${colors.reset}
  npx tsx src/cli.ts <command> [options]

${colors.bright}COMMANDS:${colors.reset}
  ${colors.cyan}analyze${colors.reset}              Analyze patrol progress and find optimization opportunities
  ${colors.cyan}show-progress${colors.reset}        Show detailed progress for all scouts
  ${colors.cyan}plan-meeting${colors.reset}         Generate an optimized meeting agenda
  ${colors.cyan}plan-campout${colors.reset}         Generate an optimized campout plan
  ${colors.cyan}scout <name>${colors.reset}         Show progress for a specific scout
  ${colors.cyan}recommend${colors.reset}            Show top activity recommendations
  ${colors.cyan}scan <image>${colors.reset}         Scan a handbook photo to extract progress (OCR)
  ${colors.cyan}scan-folder <dir>${colors.reset}    Scan all images in a folder
  ${colors.cyan}help${colors.reset}                 Show this help message

${colors.bright}OCR EXAMPLES:${colors.reset}
  npx tsx src/cli.ts scan ./handbook-page1.jpg
  npx tsx src/cli.ts scan-folder ./scout-photos/

${colors.bright}EXAMPLES:${colors.reset}
  npx tsx src/cli.ts analyze
  npx tsx src/cli.ts plan-meeting
  npx tsx src/cli.ts scout "Sample Scout"
`);
  }

  analyzePatrol(patrolName: string = 'Eagle Patrol'): void {
    console.log(header(`PATROL ANALYSIS: ${patrolName}`));

    const analysis = this.optimizer.analyzePatrol(patrolName);
    const summary = this.optimizer.getPatrolSummary(patrolName);

    // Overall Summary
    console.log(subHeader('\n📊 PATROL SUMMARY'));
    console.log(`  Total Scouts: ${summary.totalScouts}`);
    console.log(`  Average Progress: ${formatPercent(summary.averageProgress)}`);
    console.log(`  Scouts Near Rank-Up (75%+): ${colors.green}${summary.scoutsNearRankUp}${colors.reset}`);

    // Individual Scout Progress
    console.log(subHeader('\n👤 SCOUT PROGRESS'));
    for (const scoutAnalysis of analysis.scouts) {
      const { scout, percentComplete, missingRequirements } = scoutAnalysis;
      console.log(
        `  ${scout.name.padEnd(25)} ${progressBar(percentComplete)} ${formatPercent(percentComplete)}`
      );
      console.log(
        `  ${' '.repeat(25)} Target: ${colors.cyan}${scout.targetRank}${colors.reset} | Missing: ${missingRequirements.length} requirements`
      );
    }

    // Common Missing Requirements (highest impact)
    console.log(subHeader('\n🎯 HIGHEST IMPACT REQUIREMENTS'));
    console.log('  (Requirements needed by the most scouts)\n');

    const topGaps = analysis.commonMissingRequirements.slice(0, 8);
    for (const gap of topGaps) {
      const scoutNames = gap.scoutsMissing.map(s => s.name.split(' ')[0]).join(', ');
      console.log(
        `  ${colors.yellow}${gap.requirement.id.padEnd(8)}${colors.reset} ` +
        `[${gap.priority} scouts] ${gap.requirement.category}`
      );
      console.log(`           ${colors.dim}${gap.requirement.description.slice(0, 70)}...${colors.reset}`);
      console.log(`           ${colors.dim}Needed by: ${scoutNames}${colors.reset}\n`);
    }

    // Most needed categories
    console.log(subHeader('\n📁 CATEGORIES NEEDING MOST ATTENTION'));
    for (const category of summary.mostNeededCategories) {
      console.log(`  • ${category}`);
    }

    // Top Recommendations
    console.log(subHeader('\n⭐ TOP ACTIVITY RECOMMENDATIONS'));
    this.showRecommendations(analysis.recommendedActivities.slice(0, 5));
  }

  showRecommendations(recommendations: ActivityRecommendation[]): void {
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      const scoutNames = rec.benefitingScouts.map(b => b.scoutName.split(' ')[0]).join(', ');
      const reqIds = rec.requirementsCovered.map(rc => rc.requirementId).join(', ');

      console.log(
        `\n  ${colors.bright}${i + 1}. ${rec.activity.name}${colors.reset} ` +
        `(Score: ${colors.green}${rec.score}${colors.reset})`
      );
      console.log(`     ${colors.dim}${rec.activity.description}${colors.reset}`);
      console.log(`     ${colors.cyan}Time:${colors.reset} ${rec.activity.estimatedMinutes} min | ` +
        `${colors.cyan}Setting:${colors.reset} ${rec.activity.setting}`);
      console.log(`     ${colors.cyan}Benefits:${colors.reset} ${scoutNames}`);
      console.log(`     ${colors.cyan}Covers:${colors.reset} ${reqIds}`);
    }
  }

  showScoutProgress(scoutName?: string): void {
    console.log(header('SCOUT PROGRESS REPORT'));

    const scouts = this.tracker.getAllScouts();

    for (const scout of scouts) {
      if (scoutName && !scout.name.toLowerCase().includes(scoutName.toLowerCase())) {
        continue;
      }

      const analysis = this.tracker.analyzeScout(scout);
      const targetReqs = getRequirementsForRank(scout.targetRank);
      const completedIds = new Set(scout.completedRequirements.map(r => r.requirementId));

      console.log(subHeader(`\n${scout.name}`));
      console.log(`  Patrol: ${scout.patrol}`);
      console.log(`  Current Rank: ${scout.currentRank}`);
      console.log(`  Target Rank: ${colors.cyan}${scout.targetRank}${colors.reset}`);
      console.log(`  Progress: ${progressBar(analysis.percentComplete)} ${formatPercent(analysis.percentComplete)}`);

      // Group by category
      const categories = new Map<string, { completed: string[]; missing: string[] }>();
      for (const req of targetReqs) {
        if (!categories.has(req.category)) {
          categories.set(req.category, { completed: [], missing: [] });
        }
        const cat = categories.get(req.category)!;
        if (completedIds.has(req.id)) {
          cat.completed.push(req.number);
        } else {
          cat.missing.push(req.number);
        }
      }

      console.log(`\n  ${colors.bright}Requirements by Category:${colors.reset}`);
      for (const [category, { completed, missing }] of categories) {
        const total = completed.length + missing.length;
        const pct = (completed.length / total) * 100;
        console.log(`\n  ${category}`);
        if (completed.length > 0) {
          console.log(`    ${colors.green}✓ Completed:${colors.reset} ${completed.join(', ')}`);
        }
        if (missing.length > 0) {
          console.log(`    ${colors.red}○ Missing:${colors.reset} ${missing.join(', ')}`);
        }
      }
    }
  }

  generateMeetingPlan(patrolName: string = 'Eagle Patrol', duration: number = 90): void {
    console.log(header(`MEETING PLAN - ${duration} MINUTES`));

    const plan = this.optimizer.generateMeetingPlan(patrolName, duration);

    console.log(subHeader('\n📅 PROPOSED AGENDA'));

    let currentTime = 0;
    for (const activity of plan.activities) {
      const startMin = currentTime;
      const endMin = currentTime + activity.activity.estimatedMinutes;

      console.log(
        `\n  ${colors.bright}${startMin}-${endMin} min:${colors.reset} ${activity.activity.name}`
      );
      console.log(`    ${colors.dim}${activity.activity.description}${colors.reset}`);
      console.log(`    ${colors.cyan}Requirements:${colors.reset} ${activity.requirementsAddressed.join(', ')}`);

      // Show which scouts benefit
      const scoutNames = activity.scoutsParticipating
        .map(id => this.tracker.getScout(id)?.name.split(' ')[0])
        .filter(Boolean)
        .join(', ');
      console.log(`    ${colors.cyan}Benefits:${colors.reset} ${scoutNames}`);

      currentTime = endMin;
    }

    console.log(subHeader('\n📈 MEETING IMPACT'));
    console.log(`  Activities: ${plan.activities.length}`);
    console.log(`  Time Used: ${currentTime} of ${duration} minutes`);
    console.log(`  Advancement Score: ${colors.green}${plan.totalAdvancementScore}${colors.reset}`);

    console.log(subHeader('\n👤 SCOUT BENEFITS'));
    for (const [scoutId, reqIds] of plan.scoutsBenefiting) {
      const scout = this.tracker.getScout(scoutId);
      if (scout) {
        console.log(`  ${scout.name}: ${reqIds.length} requirements`);
        console.log(`    ${colors.dim}${reqIds.join(', ')}${colors.reset}`);
      }
    }
  }

  generateCampoutPlan(patrolName: string = 'Eagle Patrol'): void {
    console.log(header('CAMPOUT PLAN - ADVANCEMENT FOCUSED'));

    const plan = this.optimizer.generateCampoutPlan(patrolName, 'Advancement Weekend');

    const slots = ['Friday Evening', 'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening', 'Sunday Morning'];

    for (const slot of slots) {
      const slotActivities = plan.activities.filter(a => a.timeSlot === slot);
      if (slotActivities.length === 0) continue;

      console.log(subHeader(`\n${slot}`));

      for (const activity of slotActivities) {
        console.log(`\n  ${colors.bright}${activity.activity.name}${colors.reset}`);
        console.log(`    Duration: ${activity.activity.estimatedMinutes} min`);
        console.log(`    ${colors.dim}${activity.activity.description}${colors.reset}`);
        console.log(`    ${colors.cyan}Requirements:${colors.reset} ${activity.requirementsAddressed.join(', ')}`);

        const scoutNames = activity.scoutsParticipating
          .map(id => this.tracker.getScout(id)?.name.split(' ')[0])
          .filter(Boolean)
          .join(', ');
        console.log(`    ${colors.cyan}Scouts:${colors.reset} ${scoutNames}`);
      }
    }

    console.log(header('CAMPOUT SUMMARY'));
    console.log(`  Total Activities: ${plan.activities.length}`);
    console.log(`  Advancement Score: ${colors.green}${plan.totalAdvancementScore}${colors.reset}`);

    console.log(subHeader('\n👤 PROJECTED SCOUT ADVANCEMENT'));
    for (const [scoutId, reqIds] of plan.scoutsBenefiting) {
      const scout = this.tracker.getScout(scoutId);
      if (scout) {
        const analysis = this.tracker.analyzeScout(scout);
        const targetReqs = getRequirementsForRank(scout.targetRank);
        const currentCompleted = scout.completedRequirements.length;
        const projectedCompleted = currentCompleted + reqIds.length;
        const projectedPercent = (projectedCompleted / targetReqs.length) * 100;

        console.log(
          `  ${scout.name}: ${formatPercent(analysis.percentComplete)} → ${formatPercent(Math.min(projectedPercent, 100))}`
        );
        console.log(`    ${colors.dim}+${reqIds.length} requirements: ${reqIds.join(', ')}${colors.reset}`);
      }
    }
  }

  recommend(patrolName: string = 'Eagle Patrol', setting: 'meeting' | 'campout' = 'meeting'): void {
    console.log(header(`TOP RECOMMENDATIONS FOR ${setting.toUpperCase()}`));

    const recommendations = this.optimizer.getRecommendedActivities(patrolName, setting, 10);
    this.showRecommendations(recommendations);
  }

  /**
   * Scan a single handbook image using OCR
   */
  async scanImage(imagePath: string): Promise<void> {
    console.log(header('HANDBOOK OCR SCANNER'));

    const resolvedPath = path.resolve(imagePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`${colors.red}Error: File not found: ${resolvedPath}${colors.reset}`);
      return;
    }

    console.log(`${colors.cyan}Scanning:${colors.reset} ${resolvedPath}\n`);

    const scanner = new HandbookScanner();

    try {
      const result = await scanner.scanPage(resolvedPath);
      this.displayScanResult(result);
    } catch (error) {
      console.error(`${colors.red}Error scanning image:${colors.reset}`, error);
    }
  }

  /**
   * Scan all images in a folder
   */
  async scanFolder(folderPath: string): Promise<void> {
    console.log(header('SCANNING FOLDER FOR HANDBOOK IMAGES'));

    const resolvedPath = path.resolve(folderPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`${colors.red}Error: Folder not found: ${resolvedPath}${colors.reset}`);
      return;
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];
    const files = fs.readdirSync(resolvedPath)
      .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
      .map(f => path.join(resolvedPath, f));

    if (files.length === 0) {
      console.log(`${colors.yellow}No image files found in ${resolvedPath}${colors.reset}`);
      return;
    }

    console.log(`Found ${files.length} image(s) to scan\n`);

    const scanner = new HandbookScanner();
    const allResults: ScanResult[] = [];

    for (const file of files) {
      console.log(`\n${colors.cyan}Scanning:${colors.reset} ${path.basename(file)}`);
      try {
        const result = await scanner.scanPage(file);
        allResults.push(result);
        this.displayScanResultSummary(result, path.basename(file));
      } catch (error) {
        console.error(`${colors.red}Error scanning ${file}:${colors.reset}`, error);
      }
    }

    // Display combined summary
    this.displayCombinedResults(allResults);
  }

  /**
   * Display detailed scan result
   */
  private displayScanResult(result: ScanResult): void {
    console.log(subHeader('\n📋 SCAN RESULTS'));

    if (result.rank) {
      console.log(`  Detected Rank: ${colors.cyan}${result.rank}${colors.reset}`);
    } else {
      console.log(`  Detected Rank: ${colors.yellow}Unknown${colors.reset}`);
    }

    console.log(`  OCR Confidence: ${formatPercent(result.confidence)}`);

    if (result.warnings.length > 0) {
      console.log(subHeader('\n⚠️  WARNINGS'));
      for (const warn of result.warnings) {
        console.log(`  ${colors.yellow}!${colors.reset} ${warn}`);
      }
    }

    const completed = result.completedRequirements.filter(r => r.isCompleted);
    const uncertain = result.completedRequirements.filter(r => !r.isCompleted);

    if (completed.length > 0) {
      console.log(subHeader('\n✅ COMPLETED REQUIREMENTS DETECTED'));
      for (const req of completed) {
        const dateStr = req.dateCompleted ? ` (${req.dateCompleted})` : '';
        const signedStr = req.signedBy ? ` - ${req.signedBy}` : '';
        console.log(
          `  ${colors.green}✓${colors.reset} ${colors.cyan}${req.requirementId}${colors.reset}` +
          `${dateStr}${signedStr}`
        );
        console.log(`    ${colors.dim}Confidence: ${(req.confidence * 100).toFixed(0)}%${colors.reset}`);
      }
    }

    if (uncertain.length > 0) {
      console.log(subHeader('\n❓ REQUIREMENTS FOUND (COMPLETION UNCERTAIN)'));
      for (const req of uncertain) {
        console.log(
          `  ${colors.yellow}?${colors.reset} ${colors.cyan}${req.requirementId}${colors.reset}`
        );
        console.log(`    ${colors.dim}${req.rawText.slice(0, 60)}...${colors.reset}`);
      }
    }

    // Summary
    console.log(subHeader('\n📊 SUMMARY'));
    console.log(`  Requirements found: ${result.completedRequirements.length}`);
    console.log(`  Marked complete: ${colors.green}${completed.length}${colors.reset}`);
    console.log(`  Uncertain: ${colors.yellow}${uncertain.length}${colors.reset}`);

    // Show how to import
    if (completed.length > 0) {
      console.log(subHeader('\n💡 TO IMPORT THESE RESULTS'));
      console.log(`  The following requirement IDs were detected as complete:`);
      console.log(`  ${colors.cyan}${completed.map(r => r.requirementId).join(', ')}${colors.reset}`);
    }
  }

  /**
   * Display brief scan result summary
   */
  private displayScanResultSummary(result: ScanResult, filename: string): void {
    const completed = result.completedRequirements.filter(r => r.isCompleted);
    console.log(
      `  ${result.rank || 'Unknown rank'} - ` +
      `${colors.green}${completed.length} completed${colors.reset} - ` +
      `Confidence: ${formatPercent(result.confidence)}`
    );
  }

  /**
   * Display combined results from multiple scans
   */
  private displayCombinedResults(results: ScanResult[]): void {
    console.log(header('COMBINED SCAN RESULTS'));

    const allCompleted = new Map<string, { dates: string[], signers: string[] }>();

    for (const result of results) {
      for (const req of result.completedRequirements) {
        if (req.isCompleted) {
          if (!allCompleted.has(req.requirementId)) {
            allCompleted.set(req.requirementId, { dates: [], signers: [] });
          }
          const entry = allCompleted.get(req.requirementId)!;
          if (req.dateCompleted) entry.dates.push(req.dateCompleted);
          if (req.signedBy) entry.signers.push(req.signedBy);
        }
      }
    }

    console.log(subHeader('\n✅ ALL COMPLETED REQUIREMENTS'));

    // Group by rank prefix
    const secondClass = Array.from(allCompleted.entries())
      .filter(([id]) => id.startsWith('2C-'))
      .sort(([a], [b]) => a.localeCompare(b));

    const firstClass = Array.from(allCompleted.entries())
      .filter(([id]) => id.startsWith('1C-'))
      .sort(([a], [b]) => a.localeCompare(b));

    if (secondClass.length > 0) {
      console.log(`\n  ${colors.bright}Second Class:${colors.reset}`);
      for (const [id, data] of secondClass) {
        const date = data.dates[0] || '';
        const signer = data.signers[0] || '';
        console.log(`    ${colors.green}✓${colors.reset} ${id} ${date} ${signer}`);
      }
    }

    if (firstClass.length > 0) {
      console.log(`\n  ${colors.bright}First Class:${colors.reset}`);
      for (const [id, data] of firstClass) {
        const date = data.dates[0] || '';
        const signer = data.signers[0] || '';
        console.log(`    ${colors.green}✓${colors.reset} ${id} ${date} ${signer}`);
      }
    }

    console.log(subHeader('\n📊 TOTALS'));
    console.log(`  Second Class: ${colors.green}${secondClass.length}${colors.reset} requirements`);
    console.log(`  First Class: ${colors.green}${firstClass.length}${colors.reset} requirements`);
    console.log(`  Total: ${colors.green}${allCompleted.size}${colors.reset} unique requirements`);
  }

  async run(args: string[]): Promise<void> {
    const command = args[0] || 'help';
    const arg1 = args[1];
    const arg2 = args[2];

    switch (command) {
      case 'analyze':
        this.analyzePatrol(arg1 || 'Eagle Patrol');
        break;
      case 'show-progress':
        this.showScoutProgress(arg1);
        break;
      case 'scout':
        this.showScoutProgress(arg1);
        break;
      case 'plan-meeting':
        this.generateMeetingPlan(arg1 || 'Eagle Patrol', parseInt(arg2 || '90'));
        break;
      case 'plan-campout':
        this.generateCampoutPlan(arg1 || 'Eagle Patrol');
        break;
      case 'recommend':
        this.recommend(arg1 || 'Eagle Patrol', (arg2 as 'meeting' | 'campout') || 'meeting');
        break;
      case 'scan':
        if (!arg1) {
          console.error('Usage: scan <image-path>');
          console.error('Example: scan ./handbook-page.jpg');
          return;
        }
        await this.scanImage(arg1);
        break;
      case 'scan-folder':
        if (!arg1) {
          console.error('Usage: scan-folder <folder-path>');
          console.error('Example: scan-folder ./scout-photos/');
          return;
        }
        await this.scanFolder(arg1);
        break;
      case 'help':
      default:
        this.showHelp();
        break;
    }
  }
}

// Run CLI
const cli = new ScoutPlannerCLI();
cli.run(process.argv.slice(2)).catch(console.error);
