# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Get Your Hugging Face API Key
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up/Login
3. Go to Settings → Access Tokens
4. Create a new token with "read" permissions
5. Copy the token

### 2. Configure Environment
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your API key
# Replace "your_hugging_face_api_key_here" with your actual token
```

### 3. Test the Setup
```bash
# Run the test to verify everything works
npm test
```

### 4. Start the Application
```bash
# Development mode (recommended)
npm run dev

# Or production mode
npm start
```

### 5. Open Your Browser
Go to: http://localhost:3000

## 📋 What You Can Do

1. **Upload a PDF** - Drag & drop or click to upload
2. **Wait for Processing** - The app will extract text and create embeddings
3. **Ask Questions** - Type questions in the chat interface
4. **Get AI Answers** - Based on your document content

## 🔧 API Usage

### Upload PDF
```bash
curl -X POST -F "pdf=@your-document.pdf" http://localhost:3000/upload
```

### Ask Question
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"question":"What is the main topic?"}' \
  http://localhost:3000/ask
```

## 🐛 Troubleshooting

**"HUGGING_FACE_API_KEY is required"**
- Make sure you've added your API key to `.env`

**"Failed to get embeddings"**
- Check your internet connection
- Verify your API key is valid
- Ensure you have API credits

**"No documents processed"**
- Upload a PDF first before asking questions

## 📁 Project Structure
```
rag-app/
├── server.js              # Main server
├── services/              # Core services
├── public/index.html      # Web interface
├── test.js               # Test script
├── README.md             # Full documentation
└── SETUP.md              # This file
```

## 🎯 Next Steps

1. Try uploading different types of PDFs
2. Experiment with different questions
3. Check the console logs for debugging
4. Read the full README.md for advanced features

---

**Happy Question Answering! 🤖📚** 