import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

export interface PreprocessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  originalPath: string;
}

export interface ImageRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Preprocess handbook photos for better OCR results
 */
export class ImagePreprocessor {
  /**
   * Load and preprocess an image for OCR
   */
  async preprocessForOCR(imagePath: string): Promise<PreprocessedImage> {
    const absolutePath = path.resolve(imagePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Image not found: ${absolutePath}`);
    }

    const image = sharp(absolutePath);
    const metadata = await image.metadata();

    // Preprocess: grayscale, enhance contrast, sharpen
    const processed = await image
      .grayscale()
      .normalize() // Enhance contrast
      .sharpen({ sigma: 1.5 }) // Sharpen text
      .modulate({ brightness: 1.1 }) // Slightly brighter
      .toBuffer();

    return {
      buffer: processed,
      width: metadata.width || 0,
      height: metadata.height || 0,
      originalPath: absolutePath,
    };
  }

  /**
   * Extract a region from an image (for processing specific columns)
   */
  async extractRegion(imagePath: string, region: ImageRegion): Promise<Buffer> {
    const image = sharp(imagePath);

    return await image
      .extract(region)
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
  }

  /**
   * Create high-contrast version for checkmark detection
   */
  async preprocessForCheckmarkDetection(imagePath: string): Promise<Buffer> {
    const image = sharp(imagePath);

    // High contrast, threshold for detecting marks
    return await image
      .grayscale()
      .normalize()
      .threshold(180) // Binary threshold
      .toBuffer();
  }

  /**
   * Split handbook page into columns for better processing
   * Handbook layout: [checkbox] [number] [description] [leader/date]
   */
  async splitIntoColumns(imagePath: string): Promise<{
    checkboxColumn: Buffer;
    contentColumn: Buffer;
    signatureColumn: Buffer;
  }> {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 1200;

    // Approximate column positions (these may need adjustment)
    // Checkbox: 0-8% of width
    // Content: 8-85% of width
    // Signature: 85-100% of width

    const checkboxColumn = await sharp(imagePath)
      .extract({
        left: 0,
        top: 0,
        width: Math.floor(width * 0.08),
        height,
      })
      .grayscale()
      .normalize()
      .toBuffer();

    const contentColumn = await sharp(imagePath)
      .extract({
        left: Math.floor(width * 0.08),
        top: 0,
        width: Math.floor(width * 0.77),
        height,
      })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();

    const signatureColumn = await sharp(imagePath)
      .extract({
        left: Math.floor(width * 0.85),
        top: 0,
        width: Math.floor(width * 0.15),
        height,
      })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();

    return {
      checkboxColumn,
      contentColumn,
      signatureColumn,
    };
  }

  /**
   * Enhance specifically for handwritten text (signatures, dates)
   */
  async enhanceForHandwriting(imagePath: string): Promise<Buffer> {
    return await sharp(imagePath)
      .grayscale()
      .normalize()
      .sharpen({ sigma: 2 })
      .modulate({ brightness: 1.2, saturation: 0 })
      .toBuffer();
  }

  /**
   * Rotate image if needed (detect and correct skew)
   */
  async autoRotate(imagePath: string): Promise<Buffer> {
    return await sharp(imagePath)
      .rotate() // Auto-rotate based on EXIF
      .toBuffer();
  }

  /**
   * Save processed image to temp file (for debugging)
   */
  async saveDebugImage(buffer: Buffer, outputPath: string): Promise<void> {
    await sharp(buffer).toFile(outputPath);
  }
}
