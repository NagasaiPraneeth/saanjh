const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
function executeCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error);
        process.exit(1);
    }
}

// Function to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Main setup process
console.log('🚀 Starting setup process...');

// 1. Build frontend
console.log('\n📦 Building frontend...');
executeCommand('cd ../frontend && npm run build');

// 2. Create build directory if it doesn't exist
console.log('\n📁 Creating build directory...');
if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
}

// 3. Copy frontend build files
console.log('\n📋 Copying frontend build files...');
copyDir('../frontend/dist', 'build');

// 4. Copy backend files
console.log('\n📋 Copying backend files...');
const filesToCopy = [
    'index.js',
    'route.js',
    'Schema.js',
    'vercel.json',
    'package.json',
    'package-lock.json',
    '.env'
];

const dirsToCopy = [
    'controllers',
    'node_modules'
];

// Copy individual files
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join('build', file));
    }
});

// Copy directories
dirsToCopy.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyDir(dir, path.join('build', dir));
    }
});

console.log('\n✅ Setup completed successfully!');
console.log('\nTo run the application:');
console.log('1. Navigate to the build directory');
console.log('2. Run: npm install');
console.log('3. Run: node index.js'); 