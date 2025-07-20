# Azure Deployment Guide

## Prerequisites
1. Azure account (free tier available)
2. GitHub account (for GitHub Actions deployment)
3. Gemini API key

## Option 1: Azure App Service (Recommended)

### Step 1: Create Azure App Service
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "App Service"
4. Click "Create"
5. Fill in the details:
   - **Resource Group**: Create new or use existing
   - **Name**: `your-rag-app-name`
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Choose closest to you
   - **App Service Plan**: 
     - **Name**: `your-rag-app-plan`
     - **SKU and size**: F1 (Free)
6. Click "Review + create" then "Create"

### Step 2: Configure Environment Variables
1. Go to your App Service
2. Navigate to "Settings" > "Configuration"
3. Add these Application settings:
   ```
   GEMINI_API_KEY = your_actual_gemini_api_key
   NODE_ENV = production
   PORT = 8080
   GEMINI_MODEL = gemini-1.5-flash
   EMBEDDING_MODEL = embedding-001
   VECTOR_DIMENSION = 768
   INDEX_PATH = ./data/faiss_index
   ```

### Step 3: Deploy Your Code
1. Go to "Deployment Center"
2. Choose "GitHub" as source
3. Connect your GitHub account
4. Select your repository
5. Choose branch (main)
6. Click "Save"

## Option 2: Azure Container Instances

### Step 1: Build and Push Docker Image
```bash
# Build the image
docker build -t your-rag-app .

# Tag for Azure Container Registry
docker tag your-rag-app yourregistry.azurecr.io/your-rag-app:latest

# Push to registry
docker push yourregistry.azurecr.io/your-rag-app:latest
```

### Step 2: Deploy Container
1. Go to Azure Portal
2. Create "Container Instances"
3. Configure with your image
4. Set environment variables

## Option 3: GitHub Actions (Automated Deployment)

### Step 1: Set up GitHub Secrets
1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Add secret: `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Get the publish profile from Azure App Service

### Step 2: Update azure-deploy.yml
Replace `your-rag-app-name` with your actual app name.

### Step 3: Push to GitHub
The workflow will automatically deploy on push to main branch.

## Environment Variables for Production

Set these in Azure App Service Configuration:

```
GEMINI_API_KEY = your_gemini_api_key
NODE_ENV = production
PORT = 8080
GEMINI_MODEL = gemini-1.5-flash
EMBEDDING_MODEL = embedding-001
VECTOR_DIMENSION = 768
INDEX_PATH = ./data/faiss_index
```

## Free Tier Limitations

### Azure App Service F1 (Free):
- 1 GB RAM
- 1 GB storage
- 60 minutes/day CPU time
- Perfect for development and small-scale use

### Azure Container Instances (Free):
- 2 vCPUs, 4 GB RAM per month
- Good for containerized apps

## Cost Optimization Tips

1. **Use F1 App Service Plan**: Completely free
2. **Monitor Usage**: Stay within free tier limits
3. **Optimize API Calls**: Cache responses when possible
4. **Use Azure Functions**: For serverless deployment

## Troubleshooting

### Common Issues:
1. **Port Issues**: Azure uses port 8080, not 3000
2. **Environment Variables**: Make sure all are set in Azure
3. **Memory Limits**: F1 plan has 1GB RAM limit
4. **File Storage**: Use Azure Blob Storage for persistent file storage

### Performance Tips:
1. **Enable CORS**: For web frontend
2. **Use CDN**: For static files
3. **Optimize Dependencies**: Remove unused packages
4. **Monitor Logs**: Use Azure Application Insights

## Next Steps

1. Choose your deployment method
2. Set up your Azure account
3. Configure environment variables
4. Deploy your application
5. Test the deployment
6. Monitor performance and costs 