# RAG PDF Question Answering App

A Retrieval-Augmented Generation (RAG) application that allows you to upload PDF documents and ask questions about their content using AI. Built with Node.js, Express.js, Hugging Face API, and a custom vector store.

## Features

- 📄 **PDF Upload & Processing**: Upload PDF files and automatically extract and chunk text
- 🔍 **Semantic Search**: Find relevant document sections using vector embeddings
- 🤖 **AI-Powered Q&A**: Get intelligent answers based on document content
- 💾 **Persistent Storage**: Vector embeddings are saved to disk for future use
- 🌐 **Modern Web Interface**: Beautiful, responsive UI with drag-and-drop file upload
- 🔧 **REST API**: Full API support for integration with other applications

## Tech Stack

- **Backend**: Node.js + Express.js
- **AI Models**: Hugging Face API (sentence-transformers for embeddings, DialoGPT for generation)
- **Vector Database**: Custom implementation with cosine similarity search
- **PDF Processing**: pdf-parse library
- **Frontend**: Vanilla JavaScript with modern CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Hugging Face API key

## Installation

1. **Clone or download the project**
   ```bash
   cd rag-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `env.example` to `.env`
   - Add your Hugging Face API key:
   ```bash
   cp env.example .env
   ```

4. **Edit `.env` file**
   ```env
   HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
   PORT=3000
   NODE_ENV=development
   EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
   GENERATION_MODEL=microsoft/DialoGPT-medium
   VECTOR_DIMENSION=384
   INDEX_PATH=./data/faiss_index
   ```

## Getting a Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to your profile settings
4. Navigate to "Access Tokens"
5. Create a new token with "read" permissions
6. Copy the token and add it to your `.env` file

## Usage

### Starting the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

### Using the Web Interface

1. **Upload a PDF**: Drag and drop or click to upload a PDF file
2. **Wait for Processing**: The app will extract text, create embeddings, and store them
3. **Ask Questions**: Type questions in the chat interface and get AI-powered answers

### API Endpoints

#### Upload PDF
```http
POST /upload
Content-Type: multipart/form-data

Body: pdf file
```

Response:
```json
{
  "message": "PDF processed successfully",
  "chunks": 15
}
```

#### Ask Question
```http
POST /ask
Content-Type: application/json

{
  "question": "What is the main topic of the document?"
}
```

Response:
```json
{
  "question": "What is the main topic of the document?",
  "answer": "The document discusses...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Get Document Info
```http
GET /document-info
```

Response:
```json
{
  "totalVectors": 15,
  "totalDocuments": 15,
  "vectorDimension": 384,
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

#### Clear Data
```http
DELETE /clear
```

Response:
```json
{
  "message": "Document data cleared successfully"
}
```

## How It Works

1. **PDF Processing**: The app extracts text from uploaded PDFs and splits it into manageable chunks
2. **Embedding Generation**: Each text chunk is converted to a vector embedding using Hugging Face's sentence-transformers
3. **Vector Storage**: Embeddings are stored in a custom vector database with cosine similarity search
4. **Question Processing**: When you ask a question, it's also converted to an embedding
5. **Retrieval**: The system finds the most similar document chunks to your question
6. **Generation**: An AI model generates an answer based on the retrieved context

## Configuration Options

### Environment Variables

- `HUGGING_FACE_API_KEY`: Your Hugging Face API key (required)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `EMBEDDING_MODEL`: Hugging Face model for embeddings (default: sentence-transformers/all-MiniLM-L6-v2)
- `GENERATION_MODEL`: Hugging Face model for text generation (default: microsoft/DialoGPT-medium)
- `VECTOR_DIMENSION`: Dimension of embeddings (default: 384)
- `INDEX_PATH`: Path to store vector index (default: ./data/faiss_index)

### Model Options

You can change the models in your `.env` file:

**Embedding Models:**
- `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions, fast)
- `sentence-transformers/all-mpnet-base-v2` (768 dimensions, more accurate)
- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (multilingual)

**Generation Models:**
- `microsoft/DialoGPT-medium` (general purpose)
- `deepset/roberta-base-squad2` (question answering)
- `gpt2` (text generation)

## Project Structure

```
rag-app/
├── server.js              # Main Express server
├── services/
│   ├── pdfProcessor.js    # PDF text extraction and chunking
│   ├── huggingFaceService.js # Hugging Face API integration
│   ├── vectorStore.js     # Vector storage and similarity search
│   └── ragService.js      # RAG orchestration
├── public/
│   └── index.html         # Web interface
├── uploads/               # Temporary PDF storage
├── data/                  # Vector index storage
├── package.json
├── env.example
└── README.md
```

## Troubleshooting

### Common Issues

1. **"HUGGING_FACE_API_KEY is required"**
   - Make sure you've added your API key to the `.env` file

2. **"Failed to get embeddings"**
   - Check your internet connection
   - Verify your Hugging Face API key is valid
   - Ensure you have sufficient API credits

3. **"No documents have been processed"**
   - Upload a PDF file first before asking questions

4. **"Only PDF files are allowed"**
   - Make sure you're uploading a valid PDF file

### Performance Tips

- Use smaller PDFs for faster processing
- The first request to Hugging Face models may be slower (model loading)
- Consider using a more powerful server for large documents

## Development

### Adding New Features

1. **New Models**: Update the Hugging Face service to support different models
2. **Better Chunking**: Modify the PDF processor for different chunking strategies
3. **Advanced Search**: Enhance the vector store with more sophisticated search algorithms
4. **Authentication**: Add user authentication and document ownership

### Testing

```bash
# Test the API endpoints
curl -X POST -F "pdf=@your-document.pdf" http://localhost:3000/upload
curl -X POST -H "Content-Type: application/json" -d '{"question":"Your question"}' http://localhost:3000/ask
```

## License

This project is open source and available under the [ISC License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify your Hugging Face API key is working

---

**Happy Question Answering! 🤖📚** 