const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOCAL = process.env.LOCAL ?? false;
const LOCAL_REPO_DIR = process.env.LOCAL_REPO_DIR;
const REPO_PATH = process.env.REPO_PATH ?? "https://github.com/gemini-testing/testplane";

const tempDir = path.join(__dirname, '.testplane');

if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
}

if (LOCAL) {
    // Create a symlink to the local repo
    execSync(`cp -r ${LOCAL_REPO_DIR}/. ${tempDir}`);
    console.log(`Copied local testplane repo from ${LOCAL_REPO_DIR} to ${tempDir}`);
} else {
    fs.mkdirSync(tempDir);

    // Clone repo to temp
    execSync(`git clone ${REPO_PATH} ${tempDir}`);
    process.chdir(tempDir);

    // Run npm ci to install dependencies
    execSync('npm ci', { stdio: 'inherit' });

    console.log(`Cloned remote testplane repo to ${tempDir}`);
}