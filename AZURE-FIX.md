# Azure Deployment Fix

## Problem
Getting error: `{"error":"ENOENT: no such file or directory, stat '/home/site/wwwroot/public/index.html'}`

## Solutions Applied

### 1. Web.config File
Created `web.config` to properly configure IIS for Node.js apps.

### 2. Fallback File Serving
Updated `server.js` to handle file serving with fallback.

### 3. Root Directory Backup
Copied `index.html` to root directory as backup.

### 4. Startup Script
Created `startup.js` for proper Azure startup.

## Azure App Service Configuration

### Environment Variables
Make sure these are set in Azure App Service Configuration:

```
GEMINI_API_KEY = your_gemini_api_key
NODE_ENV = production
PORT = 8080
GEMINI_MODEL = gemini-1.5-flash
EMBEDDING_MODEL = embedding-001
VECTOR_DIMENSION = 768
INDEX_PATH = ./data/faiss_index
```

### Startup Command
In Azure App Service Configuration, set:
- **Startup Command**: `npm start`

### Application Settings
Add these to Application Settings:
- `WEBSITE_NODE_DEFAULT_VERSION`: `18.17.0`
- `WEBSITE_RUN_FROM_PACKAGE`: `1`

## Deployment Steps

1. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "Fix Azure deployment issues"
   git push origin main
   ```

2. **In Azure Portal**:
   - Go to your App Service
   - Navigate to "Deployment Center"
   - Trigger a new deployment

3. **Check logs**:
   - Go to "Log stream" in Azure Portal
   - Monitor for any errors

## Alternative Solutions

If the issue persists:

### Option 1: Use Azure Container Instances
Deploy using Docker instead of App Service.

### Option 2: Use Azure Functions
Convert to serverless functions.

### Option 3: Use Azure Static Web Apps
Deploy frontend and backend separately.

## Testing

After deployment, test:
1. Homepage loads: `https://your-app.azurewebsites.net`
2. API endpoints work
3. File uploads function
4. Question answering works

## Common Issues

1. **Port Issues**: Azure uses port 8080, not 3000
2. **File Permissions**: Ensure proper file permissions
3. **Environment Variables**: Double-check all are set
4. **Memory Limits**: F1 plan has 1GB RAM limit 