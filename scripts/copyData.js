const fs = require('fs-extra');
const path = require('path');

async function copyData() {
    const srcDir = path.join(__dirname, '../src/data');
    const destDir = path.join(__dirname, '../dist/src/data');

    try {
        await fs.ensureDir(destDir);
        await fs.copy(srcDir, destDir);
        console.log('✅ Successfully copied data directory to dist/src/data');
    } catch (err) {
        console.error('❌ Error copying data directory:', err);
        process.exit(1);
    }
}

copyData();
