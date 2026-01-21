import Tesseract from 'tesseract.js';
import { ImagePreprocessor } from './image-preprocessor.js';
import { RankName, CompletedRequirement } from '../types.js';
import { secondClassRequirements } from '../requirements/second-class.js';
import { firstClassRequirements } from '../requirements/first-class.js';

export interface ScanResult {
  rank: RankName | null;
  completedRequirements: ExtractedRequirement[];
  rawText: string;
  confidence: number;
  warnings: string[];
}

export interface ExtractedRequirement {
  requirementId: string;
  requirementNumber: string;
  isCompleted: boolean;
  dateCompleted?: string;
  signedBy?: string;
  confidence: number;
  rawText: string;
}

interface RequirementPattern {
  id: string;
  number: string;
  rank: RankName;
  category: string;
  keywords: string[]; // Key words from the description to help match
}

/**
 * Scanner for BSA handbook pages
 * Extracts requirement completion status from photos
 */
export class HandbookScanner {
  private preprocessor: ImagePreprocessor;
  private requirementPatterns: RequirementPattern[];

  constructor() {
    this.preprocessor = new ImagePreprocessor();
    this.requirementPatterns = this.buildRequirementPatterns();
  }

  /**
   * Build patterns for matching OCR text to requirements
   */
  private buildRequirementPatterns(): RequirementPattern[] {
    const patterns: RequirementPattern[] = [];

    for (const req of secondClassRequirements) {
      patterns.push({
        id: req.id,
        number: req.number,
        rank: 'Second Class',
        category: req.category,
        keywords: this.extractKeywords(req.description),
      });
    }

    for (const req of firstClassRequirements) {
      patterns.push({
        id: req.id,
        number: req.number,
        rank: 'First Class',
        category: req.category,
        keywords: this.extractKeywords(req.description),
      });
    }

    return patterns;
  }

  /**
   * Extract key words from requirement description for matching
   */
  private extractKeywords(description: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'your',
      'you', 'how', 'what', 'when', 'where', 'which', 'who', 'that', 'this',
    ]);

    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Scan a handbook page image and extract requirement completions
   */
  async scanPage(imagePath: string): Promise<ScanResult> {
    const warnings: string[] = [];

    console.log(`Scanning: ${imagePath}`);

    // Preprocess the image
    const preprocessed = await this.preprocessor.preprocessForOCR(imagePath);

    // Run OCR
    console.log('Running OCR...');
    const ocrResult = await Tesseract.recognize(preprocessed.buffer, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\rOCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    console.log('\n');

    const rawText = ocrResult.data.text;
    const confidence = ocrResult.data.confidence;

    // Detect which rank page this is
    const rank = this.detectRank(rawText);
    if (!rank) {
      warnings.push('Could not determine rank from page. Attempting to match requirements anyway.');
    }

    // Extract requirement completions
    const completedRequirements = this.extractCompletions(rawText, rank, ocrResult.data);

    return {
      rank,
      completedRequirements,
      rawText,
      confidence,
      warnings,
    };
  }

  /**
   * Detect which rank's requirements are on this page
   */
  private detectRank(text: string): RankName | null {
    const upperText = text.toUpperCase();

    if (upperText.includes('SECOND CLASS RANK REQUIREMENTS') ||
        upperText.includes('SECOND CLASS RANK')) {
      return 'Second Class';
    }

    if (upperText.includes('FIRST CLASS RANK REQUIREMENTS') ||
        upperText.includes('FIRST CLASS RANK')) {
      return 'First Class';
    }

    if (upperText.includes('TENDERFOOT RANK')) {
      return 'Tenderfoot';
    }

    // Try to infer from categories
    if (upperText.includes('COOKING AND TOOLS')) {
      return 'Second Class'; // This category is specific to 2nd class
    }

    if (upperText.includes('TOOLS') && upperText.includes('LASHING')) {
      return 'First Class'; // Tools with lashings is First Class
    }

    return null;
  }

  /**
   * Extract completed requirements from OCR text
   */
  private extractCompletions(
    text: string,
    rank: RankName | null,
    ocrData: Tesseract.Page
  ): ExtractedRequirement[] {
    const extracted: ExtractedRequirement[] = [];
    const lines = text.split('\n');

    // Track current category
    let currentCategory = '';

    // Pattern to match requirement numbers like "1a.", "2b.", "10.", etc.
    const reqNumberPattern = /^(\d+[a-g]?)[.\s]/i;

    // Pattern to detect dates (various formats)
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}|\d{1,2}[\/\-]\d{1,2})/;

    // Pattern to detect initials (2-4 capital letters or mixed case)
    const initialsPattern = /\b([A-Z]{2,4}|[A-Z][a-z]?[A-Z]?)\b/;

    // Detect checkmarks/completion indicators
    const checkmarkPatterns = [
      /[✓✔☑√]/,
      /\[x\]/i,
      /\[✓\]/,
      /^[vV]\s/,
      /^\s*[xX]\s/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check for category headers
      if (this.isCategoryHeader(line)) {
        currentCategory = this.normalizeCategory(line);
        continue;
      }

      // Try to match requirement number
      const reqMatch = line.match(reqNumberPattern);
      if (reqMatch) {
        const reqNumber = reqMatch[1].toLowerCase();

        // Find matching requirement in our database
        const matchedReq = this.matchRequirement(reqNumber, currentCategory, rank, line);

        if (matchedReq) {
          // Check if this requirement appears to be completed
          const isCompleted = this.detectCompletion(line, lines, i);

          // Try to extract date and initials
          const dateMatch = line.match(datePattern) ||
                          (lines[i + 1] && lines[i + 1].match(datePattern));
          const initialsMatch = line.match(initialsPattern) ||
                              (lines[i + 1] && lines[i + 1].match(initialsPattern));

          // Look at the context (nearby lines) for signature info
          const contextLines = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' ');
          const contextDate = contextLines.match(datePattern);
          const contextInitials = contextLines.match(initialsPattern);

          // Parse the date, or use current date if completed but date unreadable
          let parsedDate = this.parseDate(dateMatch?.[1] || contextDate?.[1]);

          // RULE: If completed but no date could be parsed, use current date
          // (Assumption: if there's writing in signature cell, it's complete)
          if (isCompleted && !parsedDate) {
            parsedDate = new Date().toISOString().split('T')[0];
          }

          extracted.push({
            requirementId: matchedReq.id,
            requirementNumber: reqNumber,
            isCompleted,
            dateCompleted: parsedDate,
            signedBy: initialsMatch?.[1] || contextInitials?.[1],
            confidence: isCompleted ? 0.7 : 0.5,
            rawText: line,
          });
        }
      }
    }

    return extracted;
  }

  /**
   * Check if a line is a category header
   */
  private isCategoryHeader(line: string): boolean {
    const categories = [
      'CAMPING AND OUTDOOR ETHICS',
      'COOKING AND TOOLS',
      'COOKING',
      'TOOLS',
      'NAVIGATION',
      'NATURE',
      'AQUATICS',
      'FIRST AID AND EMERGENCY PREPAREDNESS',
      'FIRST AID',
      'FITNESS',
      'CITIZENSHIP',
      'PERSONAL SAFETY AWARENESS',
      'PERSONAL SAFETY',
      'SCOUT SPIRIT',
      'LEADERSHIP',
    ];

    const upperLine = line.toUpperCase().trim();
    return categories.some(cat => upperLine.includes(cat));
  }

  /**
   * Normalize category name
   */
  private normalizeCategory(line: string): string {
    return line.toUpperCase().trim();
  }

  /**
   * Match a requirement number to our database
   */
  private matchRequirement(
    number: string,
    category: string,
    rank: RankName | null,
    lineText: string
  ): RequirementPattern | null {
    // First try exact match with rank
    if (rank) {
      const exactMatch = this.requirementPatterns.find(
        p => p.number.toLowerCase() === number && p.rank === rank
      );
      if (exactMatch) return exactMatch;
    }

    // Try matching by category
    if (category) {
      const categoryMatch = this.requirementPatterns.find(
        p => p.number.toLowerCase() === number &&
             p.category.toUpperCase().includes(category.replace(/\s+/g, ' ').trim())
      );
      if (categoryMatch) return categoryMatch;
    }

    // Try matching by keywords in the line
    const lineKeywords = this.extractKeywords(lineText);
    let bestMatch: RequirementPattern | null = null;
    let bestScore = 0;

    for (const pattern of this.requirementPatterns) {
      if (pattern.number.toLowerCase() !== number) continue;

      const score = pattern.keywords.filter(kw =>
        lineKeywords.some(lkw => lkw.includes(kw) || kw.includes(lkw))
      ).length;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    return bestMatch;
  }

  /**
   * Detect if a requirement line shows completion
   * Rule: ONLY initials/text at end of line indicates completion (leader signed off)
   * Checkmarks mean nothing - only a leader's initials in the signature box counts
   */
  private detectCompletion(line: string, allLines: string[], lineIndex: number): boolean {
    // ONLY check for initials/text at end of line
    // This represents a leader signing off on the requirement
    const initialsAtEnd = /[A-Za-z]{2,}\s*$/;
    if (initialsAtEnd.test(line)) {
      return true;
    }

    // Also check if there's a date WITH initials (date alone doesn't count, but date+initials does)
    // Pattern: date followed by initials, e.g., "1/25/25 JG" or "1/25 DAT"
    const dateWithInitials = /\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}\s+[A-Za-z]{2,}/;
    if (dateWithInitials.test(line)) {
      return true;
    }

    return false;
  }

  /**
   * Parse date string into ISO format
   */
  private parseDate(dateStr: string | undefined): string | undefined {
    if (!dateStr) return undefined;

    // Try to parse various date formats
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length >= 2) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      let year = parts[2] || new Date().getFullYear().toString();

      // Handle 2-digit years
      if (year.length === 2) {
        year = (parseInt(year) > 50 ? '19' : '20') + year;
      }

      return `${year}-${month}-${day}`;
    }

    return undefined;
  }

  /**
   * Convert scan results to CompletedRequirement format
   */
  toCompletedRequirements(scanResult: ScanResult): CompletedRequirement[] {
    return scanResult.completedRequirements
      .filter(r => r.isCompleted)
      .map(r => ({
        requirementId: r.requirementId,
        dateCompleted: r.dateCompleted || new Date().toISOString().split('T')[0],
        signedBy: r.signedBy,
        notes: `OCR confidence: ${(r.confidence * 100).toFixed(0)}%`,
      }));
  }

  /**
   * Scan multiple pages and merge results
   */
  async scanMultiplePages(imagePaths: string[]): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    for (const path of imagePaths) {
      try {
        const result = await this.scanPage(path);
        results.push(result);
      } catch (error) {
        console.error(`Error scanning ${path}:`, error);
        results.push({
          rank: null,
          completedRequirements: [],
          rawText: '',
          confidence: 0,
          warnings: [`Failed to scan: ${error}`],
        });
      }
    }

    return results;
  }
}
