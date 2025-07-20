class RAGService {
    constructor(geminiService, vectorStore) {
        this.geminiService = geminiService;
        this.vectorStore = vectorStore;
        this.topK = 3; // Number of most relevant chunks to retrieve
    }

    async processDocument(textChunks) {
        try {
            console.log('Processing document with', textChunks.length, 'chunks');
            
            if (textChunks.length === 0) {
                throw new Error('No text chunks to process');
            }

            // Get embeddings for all text chunks
            const embeddings = await this.geminiService.getEmbeddings(textChunks);
            
            // Add vectors and documents to the vector store
            await this.vectorStore.addVectors(embeddings, textChunks);
            
            console.log('Document processing completed successfully');
        } catch (error) {
            console.error('Error processing document:', error);
            throw error;
        }
    }

    async getAnswer(question) {
        try {
            console.log('Getting answer for question:', question);
            
            // Check if we have any documents in the vector store
            const docInfo = this.vectorStore.getDocumentInfo();
            if (docInfo.totalVectors === 0) {
                throw new Error('No documents have been processed yet. Please upload a PDF first.');
            }

            // Get embedding for the question
            const questionEmbedding = await this.geminiService.getEmbeddings([question]);
            
            if (!questionEmbedding || questionEmbedding.length === 0) {
                throw new Error('Failed to generate embedding for the question');
            }

            // Search for similar documents
            const searchResults = await this.vectorStore.search(questionEmbedding[0], this.topK);
            
            if (searchResults.length === 0) {
                throw new Error('No relevant documents found for the question');
            }

            console.log('Found', searchResults.length, 'relevant document chunks');

            // Combine relevant context
            const context = this.buildContext(searchResults);
            
            // Generate answer using the context
            const answer = await this.geminiService.generateAnswer(question, context);
            
            return {
                answer: answer,
                context: context,
                sources: searchResults.map(result => ({
                    similarity: result.similarity,
                    document: result.document.substring(0, 200) + '...'
                }))
            };
        } catch (error) {
            console.error('Error getting answer:', error);
            throw error;
        }
    }

    buildContext(searchResults) {
        // Combine the most relevant document chunks into context
        const relevantChunks = searchResults
            .filter(result => result.similarity > 0.3) // Only include reasonably similar chunks
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3); // Take top 3 most relevant chunks

        if (relevantChunks.length === 0) {
            throw new Error('No sufficiently relevant context found');
        }

        // Combine chunks with clear separators
        const context = relevantChunks
            .map((result, index) => `[Document ${index + 1} - Similarity: ${result.similarity.toFixed(3)}]\n${result.document}`)
            .join('\n\n');

        return context;
    }

    async getAnswerWithFallback(question) {
        try {
            return await this.getAnswer(question);
        } catch (error) {
            console.log('Primary answer generation failed, trying fallback method:', error.message);
            
            // Fallback: try with a simpler approach
            try {
                const docInfo = this.vectorStore.getDocumentInfo();
                if (docInfo.totalVectors === 0) {
                    throw new Error('No documents available');
                }

                // Get a random document chunk as context
                const randomIndex = Math.floor(Math.random() * docInfo.totalDocuments);
                const randomDocument = this.vectorStore.getDocument(randomIndex);
                
                const answer = await this.geminiService.generateAnswer(question, randomDocument);
                
                return {
                    answer: answer,
                    context: randomDocument.substring(0, 200) + '...',
                    sources: [{
                        similarity: 'N/A (fallback)',
                        document: randomDocument.substring(0, 200) + '...'
                    }]
                };
            } catch (fallbackError) {
                throw new Error(`Both primary and fallback methods failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
            }
        }
    }

    // Get statistics about the RAG system
    getStats() {
        const docInfo = this.vectorStore.getDocumentInfo();
        return {
            totalDocuments: docInfo.totalDocuments,
            totalVectors: docInfo.totalVectors,
            vectorDimension: docInfo.vectorDimension,
            topK: this.topK,
            lastUpdated: docInfo.lastUpdated
        };
    }

    // Update the number of top results to retrieve
    setTopK(topK) {
        if (topK > 0 && topK <= 10) {
            this.topK = topK;
            console.log('Updated topK to:', topK);
        } else {
            throw new Error('topK must be between 1 and 10');
        }
    }
}

module.exports = { RAGService }; 