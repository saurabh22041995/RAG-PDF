const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        this.embeddingModel = process.env.EMBEDDING_MODEL || 'embedding-001';
        
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY is required in environment variables');
        }
        
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.geminiModel = this.genAI.getGenerativeModel({ model: this.model });
        this.embeddingModelInstance = this.genAI.getGenerativeModel({ model: this.embeddingModel });
    }

    async getEmbeddings(texts) {
        try {
            console.log('Getting embeddings for', texts.length, 'texts');
            
            const embeddings = [];
            
            for (const text of texts) {
                const result = await this.embeddingModelInstance.embedContent(text);
                const embedding = result.embedding;
                embeddings.push(embedding.values);
            }
            
            console.log('Successfully generated embeddings');
            return embeddings;
        } catch (error) {
            console.error('Error getting embeddings:', error.message);
            throw new Error(`Failed to get embeddings: ${error.message}`);
        }
    }

    async generateText(prompt, maxLength = 150) {
        try {
            console.log('Generating text for prompt:', prompt.substring(0, 100) + '...');
            
            const result = await this.geminiModel.generateContent(prompt);
            const response = await result.response;
            
            // Handle different response formats
            let text;
            if (typeof response.text === 'function') {
                text = response.text();
            } else if (typeof response === 'string') {
                text = response;
            } else if (response && response.text) {
                text = response.text;
            } else if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
                text = response.candidates[0].content.parts[0].text;
            } else {
                console.log('Response structure:', JSON.stringify(response, null, 2));
                throw new Error('Unexpected response format from Gemini API');
            }
            
            // Ensure text is a string
            if (typeof text !== 'string') {
                console.log('Text is not a string:', typeof text, text);
                text = String(text);
            }
            
            // Limit the response length if needed
            if (text.length > maxLength) {
                return text.substring(0, maxLength) + '...';
            }
            
            return text;
        } catch (error) {
            console.error('Error generating text:', error.message);
            throw new Error(`Failed to generate text: ${error.message}`);
        }
    }

    async generateAnswer(question, context) {
        try {
            // Create a prompt that includes the context and question
            const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide a clear and concise answer based on the context provided.`;
            
            const answer = await this.generateText(prompt, 1000);
            
            // Clean up the answer and ensure it's a string
            let cleanAnswer = answer.replace(/^Answer:\s*/i, '').trim();
            
            // Ensure the answer is a string
            if (typeof cleanAnswer !== 'string') {
                console.log('Answer is not a string, converting:', typeof cleanAnswer, cleanAnswer);
                cleanAnswer = String(cleanAnswer);
            }
            
            console.log('Generated answer:', cleanAnswer.substring(0, 100) + '...');
            return cleanAnswer;
        } catch (error) {
            console.error('Error generating answer:', error);
            throw new Error(`Failed to generate answer: ${error.message}`);
        }
    }

    // Test the API connection
    async testConnection() {
        try {
            const testText = 'Hello world';
            const embeddings = await this.getEmbeddings([testText]);
            
            if (embeddings && embeddings.length > 0 && embeddings[0].length > 0) {
                console.log('Gemini API connection successful');
                return true;
            } else {
                throw new Error('Invalid embeddings response');
            }
        } catch (error) {
            console.error('Gemini API connection failed:', error.message);
            return false;
        }
    }
}

module.exports = { GeminiService }; 