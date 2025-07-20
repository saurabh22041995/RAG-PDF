// Azure App Service startup script
const { spawn } = require('child_process');
const path = require('path');

// Set the working directory
process.chdir(__dirname);

// Start the server
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: process.env
});

server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
}); 