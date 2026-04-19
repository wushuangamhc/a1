/**
 * Post-build script to reorganize compiled Lua files.
 * Moves files from game/A1/scripts/vscripts/src/vscripts/ to game/A1/scripts/vscripts/
 * and fixes require paths.
 */

const fs = require('fs');
const path = require('path');

const VSCRIPTS_DIR = path.join(__dirname, '..', 'game', 'A1', 'scripts', 'vscripts');
const SRC_VSCRIPTS_DIR = path.join(VSCRIPTS_DIR, 'src', 'vscripts');

function moveFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.renameSync(src, dest);
}

function moveDirectoryContents(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) {
        return;
    }

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            moveDirectoryContents(srcPath, destPath);
            fs.rmdirSync(srcPath);
        } else {
            moveFile(srcPath, destPath);
        }
    }
}

function fixRequirePaths(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const filePath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            fixRequirePaths(filePath);
        } else if (entry.name.endsWith('.lua')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Fix src.vscripts. prefix in require paths
            content = content.replace(/require\("src\.vscripts\./g, 'require("');
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
}

// Move compiled files from src/vscripts/ up to vscripts/
if (fs.existsSync(SRC_VSCRIPTS_DIR)) {
    console.log('Moving compiled Lua files to correct location...');
    moveDirectoryContents(SRC_VSCRIPTS_DIR, VSCRIPTS_DIR);

    // Clean up empty src/vscripts/ and src/ directories
    const srcDir = path.join(VSCRIPTS_DIR, 'src');
    if (fs.existsSync(path.join(srcDir, 'vscripts'))) {
        fs.rmdirSync(path.join(srcDir, 'vscripts'));
    }
    if (fs.existsSync(srcDir)) {
        fs.rmdirSync(srcDir);
    }

    console.log('Post-build reorganization complete.');
} else {
    console.log('No src/vscripts/ directory found, skipping reorganization.');
}

// Fix require paths in all Lua files
console.log('Fixing require paths...');
fixRequirePaths(VSCRIPTS_DIR);
console.log('Require path fix complete.');
