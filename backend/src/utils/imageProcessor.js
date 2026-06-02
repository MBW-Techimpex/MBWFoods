const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Compresses an image to be under a certain size limit if possible.
 * @param {string} inputPath 
 * @param {string} uploadDir 
 * @param {number} sizeLimitKB 
 * @returns {Promise<{filename: string, path: string, size: number}>}
 */
async function compressImage(inputPath, uploadDir, sizeLimitKB = 50) {
    try {
        const ext = path.extname(inputPath).toLowerCase();
        let basename = path.basename(inputPath, ext);
        
        // Sanitize basename: replace spaces and special chars with underscores
        basename = basename.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        
        // Convert to webp as requested
        const outputFilename = `${basename}.webp`;
        const outputPath = path.join(uploadDir, outputFilename);

        console.log(`[PROCESSOR] Converting to WebP: ${outputFilename}`);

        // If input and output are same, we need to be careful
        const isSamePath = inputPath === outputPath;
        const processingPath = isSamePath ? outputPath + '.tmp' : outputPath;

        const metadata = await sharp(inputPath).metadata();
        console.log(`[PROCESSOR] Original: ${metadata.width}x${metadata.height}, ${metadata.format}`);

        let width = metadata.width || 1200;
        if (width > 1200) width = 1200; // start max width at 1200 for better optimization

        let quality = 75;
        let lastSize = 0;

        // Helper to perform compression
        const process = async (w, q) => {
            return sharp(inputPath)
                .resize({ width: w, withoutEnlargement: true })
                .webp({ quality: q, effort: 4 })
                .toFile(processingPath);
        };

        // Try initial compression
        await process(width, quality);
        lastSize = fs.statSync(processingPath).size / 1024;
        console.log(`[PROCESSOR] Initial compressed size: ${lastSize.toFixed(2)} KB (width: ${width}, quality: ${quality})`);

        // Check if we are too large (Maximum 50KB)
        let attempts = 0;
        const maxAttempts = 15;
        while (lastSize > 50 && attempts < maxAttempts) {
            attempts++;
            if (quality > 30) {
                // First try reducing quality
                quality = Math.max(30, quality - 10);
            } else if (width > 400) {
                // If quality is already low, reduce width
                width = Math.max(400, Math.round(width * 0.8));
                quality = 50; // reset quality slightly for the smaller dimensions
            } else {
                // Bottomed out on options, just reduce quality further
                quality = Math.max(15, quality - 5);
                if (quality === 15) break;
            }
            
            await process(width, quality);
            lastSize = fs.statSync(processingPath).size / 1024;
            console.log(`[PROCESSOR] Too large loop: Attempt ${attempts}, size: ${lastSize.toFixed(2)} KB (width: ${width}, quality: ${quality})`);
        }

        // Check if we are too small (Minimum 10KB) - only if we have room to scale quality up
        if (lastSize < 10 && quality < 95 && (metadata.width > 200 || metadata.height > 200)) {
            let upAttempts = 0;
            while (lastSize < 10 && quality < 95 && upAttempts < 5) {
                upAttempts++;
                quality = Math.min(95, quality + 10);
                await process(width, quality);
                lastSize = fs.statSync(processingPath).size / 1024;
                console.log(`[PROCESSOR] Too small loop: Attempt ${upAttempts}, size: ${lastSize.toFixed(2)} KB (width: ${width}, quality: ${quality})`);
            }
        }

        if (isSamePath) {
            // If we used a temp path, move it back to original
            fs.renameSync(processingPath, outputPath);
        }

        return {
            filename: outputFilename,
            path: outputPath,
            size: lastSize
        };
    } catch (error) {
        console.error('[PROCESSOR] Fatal Error:', error);
        throw error;
    }
}

module.exports = { compressImage };
