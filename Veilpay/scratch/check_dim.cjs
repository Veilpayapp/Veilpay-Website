const fs = require('fs');

function readPNGDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    if (buffer.toString('ascii', 1, 4) === 'PNG') {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        console.log(`${filePath}: ${width}x${height}`);
    } else {
        console.log(`${filePath}: Not a PNG`);
    }
}

try {
    readPNGDimensions('public/MOCKUP2.png');
    readPNGDimensions('public/image2.png');
} catch(e) {
    console.error(e);
}
