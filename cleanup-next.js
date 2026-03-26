const fs = require('fs');
const path = require('path');

// Remove .next directory
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  console.log('Removing .next directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('.next directory removed successfully');
} else {
  console.log('.next directory does not exist');
}

// Remove .next-turbopack directory  if it exists
const nextTurbopackDir = path.join(__dirname, '.next-turbopack');
if (fs.existsSync(nextTurbopackDir)) {
  console.log('Removing .next-turbopack directory...');
  fs.rmSync(nextTurbopackDir, { recursive: true, force: true });
  console.log('.next-turbopack directory removed successfully');
}

console.log('Cleanup completed');
