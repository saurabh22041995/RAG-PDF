const pdfParse = require('pdf-parse');
const fs = require('fs');

class PDFProcessor {
    constructor() {
        this.chunkSize = 1000; // Number of characters per chunk
        this.chunkOverlap = 200; // Overlap between chunks
    }

    async processPDF(filePath) {
        try {
            console.log('Reading PDF file:', filePath);
            
            // Read the PDF file
            const dataBuffer = fs.readFileSync(filePath);
            
            // Parse the PDF
            const data = await pdfParse(dataBuffer);
            
            console.log('PDF parsed successfully. Text length:', data.text.length);
            
            // Clean and chunk the text
            const cleanedText = this.cleanText(data.text);
            const chunks = this.createChunks(cleanedText);
            
            console.log('Created', chunks.length, 'text chunks');
            
            return chunks;
        } catch (error) {
            console.error('Error processing PDF:', error);
            throw new Error(`Failed to process PDF: ${error.message}`);
        }
    }

    cleanText(text) {
        // Remove extra whitespace and normalize
        return text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' ') // Replace multiple newlines with space
            .trim();
    }

    createChunks(text) {
        const chunks = [];
        let startIndex = 0;

        while (startIndex < text.length) {
            const endIndex = Math.min(startIndex + this.chunkSize, text.length);
            
            // Try to break at sentence boundaries
            let chunk = text.substring(startIndex, endIndex);
            
            // If we're not at the end of the text, try to find a good break point
            if (endIndex < text.length) {
                const lastPeriod = chunk.lastIndexOf('.');
                const lastQuestion = chunk.lastIndexOf('?');
                const lastExclamation = chunk.lastIndexOf('!');
                
                const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
                
                if (lastSentenceEnd > startIndex + this.chunkSize * 0.7) {
                    // Break at sentence end if it's not too early in the chunk
                    chunk = text.substring(startIndex, startIndex + lastSentenceEnd + 1);
                    startIndex = startIndex + lastSentenceEnd + 1;
                } else {
                    startIndex = endIndex - this.chunkOverlap;
                }
            } else {
                startIndex = endIndex;
            }

            // Clean up the chunk
            chunk = chunk.trim();
            
            if (chunk.length > 50) { // Only include chunks with meaningful content
                chunks.push(chunk);
            }
        }

        return chunks;
    }

    // Alternative chunking method by paragraphs
    createParagraphChunks(text) {
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const chunks = [];
        let currentChunk = '';

        for (const paragraph of paragraphs) {
            const cleanParagraph = paragraph.trim();
            
            if (currentChunk.length + cleanParagraph.length > this.chunkSize) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = cleanParagraph;
            } else {
                currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + cleanParagraph;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}

module.exports = { PDFProcessor }; 