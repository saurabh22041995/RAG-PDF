const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { PDFProcessor } = require('./services/pdfProcessor');
const { VectorStore } = require('./services/vectorStore');
const { GeminiService } = require('./services/geminiService');
const { RAGService } = require('./services/ragService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create data directory for FAISS index
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Initialize services
const geminiService = new GeminiService();
const vectorStore = new VectorStore();
const pdfProcessor = new PDFProcessor();
const ragService = new RAGService(geminiService, vectorStore);

// Routes
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // Fallback for Azure deployment
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Upload PDF and process
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        console.log('Processing PDF:', req.file.filename);
        
        // Extract text from PDF
        const textChunks = await pdfProcessor.processPDF(req.file.path);
        
        // Generate embeddings and store in FAISS
        await ragService.processDocument(textChunks);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ 
            message: 'PDF processed successfully', 
            chunks: textChunks.length 
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ask question
app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        console.log('Processing question:', question);
        
        // Get answer using RAG
        const answerData = await ragService.getAnswer(question);
        
        res.json({ 
            question, 
            answer: answerData.answer,
            context: answerData.context,
            sources: answerData.sources,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing question:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get document info
app.get('/document-info', async (req, res) => {
    try {
        const info = await vectorStore.getDocumentInfo();
        res.json(info);
    } catch (error) {
        console.error('Error getting document info:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clear document data
app.delete('/clear', async (req, res) => {
    try {
        await vectorStore.clearIndex();
        res.json({ message: 'Document data cleared successfully' });
    } catch (error) {
        console.error('Error clearing document data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`RAG App server running on http://localhost:${PORT}`);
    console.log('Upload a PDF and start asking questions!');
}); 