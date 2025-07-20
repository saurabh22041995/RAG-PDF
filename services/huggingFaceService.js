const axios = require('axios');

class HuggingFaceService {
    constructor() {
        this.apiKey = process.env.HUGGING_FACE_API_KEY;
        this.embeddingModel = process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
        this.generationModel = process.env.GENERATION_MODEL || 'microsoft/DialoGPT-medium';
        this.baseURL = 'https://api-inference.huggingface.co/models';
        
        if (!this.apiKey) {
            throw new Error('HUGGING_FACE_API_KEY is required in environment variables');
        }
    }

    async getEmbeddings(texts) {
        try {
            console.log('Getting embeddings for', texts.length, 'texts');
            
            // Use a BERT model that's known to work well with the API
            const embeddingModel = 'bert-base-uncased';
            
            const response = await axios.post(
                `${this.baseURL}/${embeddingModel}`,
                { inputs: texts },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Handle different response formats
            if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.embeddings)) {
                return response.data.embeddings;
            } else if (response.data && response.data.length > 0 && Array.isArray(response.data[0])) {
                return response.data;
            } else {
                console.log('Response data:', JSON.stringify(response.data, null, 2));
                throw new Error('Unexpected response format from Hugging Face API');
            }
        } catch (error) {
            console.error('Error getting embeddings:', error.response?.data || error.message);
            
            // Try with a different approach using a feature extraction model
            try {
                console.log('Trying with a feature extraction model...');
                const featureModel = 'sentence-transformers/all-MiniLM-L6-v2';
                const response = await axios.post(
                    `${this.baseURL}/${featureModel}`,
                    texts,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (response.data && Array.isArray(response.data)) {
                    return response.data;
                } else {
                    throw new Error('Feature extraction model also failed');
                }
            } catch (altError) {
                // Try with a completely different model
                try {
                    console.log('Trying with a different model family...');
                    const differentModel = 'sentence-transformers/paraphrase-MiniLM-L3-v2';
                    const response = await axios.post(
                        `${this.baseURL}/${differentModel}`,
                        texts,
                        {
                            headers: {
                                'Authorization': `Bearer ${this.apiKey}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    if (response.data && Array.isArray(response.data)) {
                        return response.data;
                    } else {
                        throw new Error('Different model family also failed');
                    }
                } catch (finalError) {
                    throw new Error(`Failed to get embeddings: ${error.message}`);
                }
            }
        }
    }

    async generateText(prompt, maxLength = 150) {
        try {
            console.log('Generating text for prompt:', prompt.substring(0, 100) + '...');
            
            const response = await axios.post(
                `${this.baseURL}/${this.generationModel}`,
                {
                    inputs: prompt,
                    parameters: {
                        max_length: maxLength,
                        temperature: 0.7,
                        do_sample: true,
                        return_full_text: false
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data[0].generated_text;
            } else {
                throw new Error('Unexpected response format from Hugging Face API');
            }
        } catch (error) {
            console.error('Error generating text:', error.response?.data || error.message);
            throw new Error(`Failed to generate text: ${error.message}`);
        }
    }

    async generateAnswer(question, context) {
        try {
            // Create a prompt that includes the context and question
            const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;
            
            const answer = await this.generateText(prompt, 200);
            
            // Clean up the answer
            return answer.replace(/^Answer:\s*/i, '').trim();
        } catch (error) {
            console.error('Error generating answer:', error);
            throw new Error(`Failed to generate answer: ${error.message}`);
        }
    }

    // Alternative method using a more suitable model for Q&A
    async generateAnswerWithQA(question, context) {
        try {
            // Use a model better suited for question answering
            const qaModel = 'deepset/roberta-base-squad2';
            
            const response = await axios.post(
                `${this.baseURL}/${qaModel}`,
                {
                    inputs: {
                        question: question,
                        context: context
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.answer) {
                return response.data.answer;
            } else {
                throw new Error('Unexpected response format from QA model');
            }
        } catch (error) {
            console.error('Error with QA model, falling back to text generation:', error.message);
            // Fall back to the regular text generation method
            return this.generateAnswer(question, context);
        }
    }

    // Test the API connection
    async testConnection() {
        try {
            const testText = 'Hello world';
            const embeddings = await this.getEmbeddings([testText]);
            
            if (embeddings && embeddings.length > 0 && embeddings[0].length > 0) {
                console.log('Hugging Face API connection successful');
                return true;
            } else {
                throw new Error('Invalid embeddings response');
            }
        } catch (error) {
            console.error('Hugging Face API connection failed:', error.message);
            
            // Try a simpler test with a different model
            try {
                console.log('Trying with a simpler model...');
                const simpleModel = 'sentence-transformers/paraphrase-MiniLM-L3-v2';
                const response = await axios.post(
                    `${this.baseURL}/${simpleModel}`,
                    { inputs: ['test'] },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (response.data && Array.isArray(response.data)) {
                    console.log('Alternative model test successful');
                    return true;
                }
            } catch (altError) {
                console.error('Alternative model also failed:', altError.message);
            }
            
            return false;
        }
    }
}

module.exports = { HuggingFaceService }; 