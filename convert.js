const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.resolve('..', 'FleetMan_DES_Front', 'assets', 'logo-fleetMan.svg');
const destIcon = path.resolve('assets', 'images', 'icon.png');
const destAdaptive = path.resolve('assets', 'images', 'adaptive-icon.png');
const destSplash = path.resolve('assets', 'images', 'splash-icon.png');
const destLogoPng = path.resolve('assets', 'images', 'logo-fleetman.png');

async function convert() {
    try {
        let svgContent = fs.readFileSync(svgPath, 'utf8');
        
        // The SVG is black by default (fill="#000000").
        // Let's just create a high-res PNG from it (e.g. 1024x1024).
        // For the app icon, we can add a white background or make it transparent.
        
        // Change default black to the primary teal color for the icon, or leave it and let sharp color it?
        // Actually, we can just replace fill="#000000" with fill="#0ea5e9" (blue) or teal "#0d9488"
        svgContent = svgContent.replace(/fill="#000000"/g, 'fill="#0284c7"');
        
        console.log('Generating icon.png...');
        await sharp(Buffer.from(svgContent))
            .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .toFile(destIcon);
            
        console.log('Generating adaptive-icon.png...');
        await sharp(Buffer.from(svgContent))
            .resize(1024, 1024, { fit: 'contain', background: 'transparent' })
            .toFile(destAdaptive);
            
        console.log('Generating splash-icon.png...');
        await sharp(Buffer.from(svgContent))
            .resize(1024, 1024, { fit: 'contain', background: 'transparent' })
            .toFile(destSplash);

        console.log('Generating logo-fleetman.png...');
        await sharp(Buffer.from(svgContent))
            .resize(1024, 1024, { fit: 'contain', background: 'transparent' })
            .toFile(destLogoPng);
            
        console.log('All icons generated successfully!');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

convert();
