const fs = require('fs');
const path = require('path');

// Note: We'll use a simple in-memory vector store since faiss-node might have compatibility issues
// In a production environment, you might want to use a proper vector database like Pinecone, Weaviate, or Qdrant

class VectorStore {
    constructor() {
        this.vectors = [];
        this.documents = [];
        this.indexPath = process.env.INDEX_PATH || './data/faiss_index';
        this.vectorDimension = parseInt(process.env.VECTOR_DIMENSION) || 384;
        
        // Create data directory if it doesn't exist
        const dataDir = path.dirname(this.indexPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        this.loadIndex();
    }

    async addVectors(vectors, documents) {
        try {
            console.log('Adding', vectors.length, 'vectors to store');
            
            // Validate input
            if (!Array.isArray(vectors) || !Array.isArray(documents)) {
                throw new Error('Vectors and documents must be arrays');
            }
            
            if (vectors.length !== documents.length) {
                throw new Error('Number of vectors must match number of documents');
            }

            // Add vectors and documents
            for (let i = 0; i < vectors.length; i++) {
                this.vectors.push(vectors[i]);
                this.documents.push(documents[i]);
            }

            // Save to disk
            await this.saveIndex();
            
            console.log('Successfully added vectors. Total vectors:', this.vectors.length);
        } catch (error) {
            console.error('Error adding vectors:', error);
            throw error;
        }
    }

    async search(queryVector, topK = 5) {
        try {
            if (this.vectors.length === 0) {
                return [];
            }

            console.log('Searching for top', topK, 'similar vectors');
            
            // Calculate cosine similarity for all vectors
            const similarities = this.vectors.map((vector, index) => {
                const similarity = this.cosineSimilarity(queryVector, vector);
                return { index, similarity, document: this.documents[index] };
            });

            // Sort by similarity (descending) and return top K
            similarities.sort((a, b) => b.similarity - a.similarity);
            
            const results = similarities.slice(0, topK);
            
            console.log('Search completed. Top similarity:', results[0]?.similarity);
            
            return results;
        } catch (error) {
            console.error('Error searching vectors:', error);
            throw error;
        }
    }

    cosineSimilarity(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    async saveIndex() {
        try {
            const indexData = {
                vectors: this.vectors,
                documents: this.documents,
                timestamp: new Date().toISOString()
            };

            fs.writeFileSync(this.indexPath, JSON.stringify(indexData, null, 2));
            console.log('Index saved to:', this.indexPath);
        } catch (error) {
            console.error('Error saving index:', error);
            throw error;
        }
    }

    loadIndex() {
        try {
            if (fs.existsSync(this.indexPath)) {
                const data = fs.readFileSync(this.indexPath, 'utf8');
                const indexData = JSON.parse(data);
                
                this.vectors = indexData.vectors || [];
                this.documents = indexData.documents || [];
                
                console.log('Index loaded. Vectors:', this.vectors.length);
            } else {
                console.log('No existing index found. Starting fresh.');
            }
        } catch (error) {
            console.error('Error loading index:', error);
            // Start fresh if there's an error loading
            this.vectors = [];
            this.documents = [];
        }
    }

    async clearIndex() {
        try {
            this.vectors = [];
            this.documents = [];
            
            if (fs.existsSync(this.indexPath)) {
                fs.unlinkSync(this.indexPath);
            }
            
            console.log('Index cleared successfully');
        } catch (error) {
            console.error('Error clearing index:', error);
            throw error;
        }
    }

    getDocumentInfo() {
        return {
            totalVectors: this.vectors.length,
            totalDocuments: this.documents.length,
            vectorDimension: this.vectorDimension,
            lastUpdated: this.vectors.length > 0 ? new Date().toISOString() : null
        };
    }

    // Get a specific document by index
    getDocument(index) {
        if (index >= 0 && index < this.documents.length) {
            return this.documents[index];
        }
        return null;
    }

    // Get multiple documents by indices
    getDocuments(indices) {
        return indices.map(index => this.getDocument(index)).filter(doc => doc !== null);
    }
}

module.exports = { VectorStore }; 