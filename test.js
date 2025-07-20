require('dotenv').config();
const { GeminiService } = require('./services/geminiService');
const { VectorStore } = require('./services/vectorStore');
const { RAGService } = require('./services/ragService');

async function testServices() {
    console.log('🧪 Testing RAG Services...\n');

    try {
        // Test Gemini Service
        console.log('1. Testing Gemini Service...');
        const geminiService = new GeminiService();
        
        // Test connection
        const connectionTest = await geminiService.testConnection();
        if (connectionTest) {
            console.log('✅ Gemini API connection successful');
        } else {
            console.log('❌ Gemini API connection failed');
            return;
        }

        // Test embeddings
        const testTexts = ['Hello world', 'This is a test document'];
        const embeddings = await geminiService.getEmbeddings(testTexts);
        console.log(`✅ Generated embeddings for ${embeddings.length} texts`);
        console.log(`   Embedding dimension: ${embeddings[0].length}\n`);

        // Test Vector Store
        console.log('2. Testing Vector Store...');
        const vectorStore = new VectorStore();
        
        // Add test vectors
        await vectorStore.addVectors(embeddings, testTexts);
        console.log('✅ Added vectors to store');

        // Test search
        const searchResults = await vectorStore.search(embeddings[0], 2);
        console.log(`✅ Search returned ${searchResults.length} results`);
        console.log(`   Top similarity: ${searchResults[0]?.similarity.toFixed(3)}\n`);

        // Test RAG Service
        console.log('3. Testing RAG Service...');
        const ragService = new RAGService(geminiService, vectorStore);
        
        // Test document processing
        await ragService.processDocument(testTexts);
        console.log('✅ Document processing successful');

        // Test question answering
        const answer = await ragService.getAnswer('What is this document about?');
        console.log('✅ Question answering successful');
        console.log(`   Answer: ${answer.answer.substring(0, 100)}...\n`);

        // Test stats
        const stats = ragService.getStats();
        console.log('4. System Statistics:');
        console.log(`   Total Documents: ${stats.totalDocuments}`);
        console.log(`   Total Vectors: ${stats.totalVectors}`);
        console.log(`   Vector Dimension: ${stats.vectorDimension}`);
        console.log(`   Top K: ${stats.topK}\n`);

        console.log('🎉 All tests passed! Your RAG system is working correctly.');
        console.log('\nNext steps:');
        console.log('1. Add your Gemini API key to the .env file');
        console.log('2. Run: npm install');
        console.log('3. Run: npm run dev');
        console.log('4. Open http://localhost:3000 in your browser');
        console.log('5. Upload a PDF and start asking questions!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure you have a valid GEMINI_API_KEY in your .env file');
        console.log('2. Check your internet connection');
        console.log('3. Verify that all dependencies are installed: npm install');
        console.log('4. Get your Gemini API key from: https://makersuite.google.com/app/apikey');
    }
}

// Run the test
testServices(); 