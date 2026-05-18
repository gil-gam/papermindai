import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { type TextSplitterConfig, getPdfFiles } from './config.ts'

export class DocumentProcessor {
    private textSplitterConfig: TextSplitterConfig

    constructor(textSplitterConfig: TextSplitterConfig) {
        this.textSplitterConfig = textSplitterConfig
    }

    async loadAndSplit() {
        const files = getPdfFiles()

        if (files.length === 0) {
            console.warn('⚠️  Nenhum PDF para processar.')
            return []
        }

        console.log(`📁 Encontrados ${files.length} PDF(s) para processar`);

        const splitter = new RecursiveCharacterTextSplitter(
            this.textSplitterConfig
        )

        const allChunks: Array<{
            pageContent: string
            metadata: { source: string }
        }> = []

        for (const filePath of files) {
            const loader = new PDFLoader(filePath)
            const rawDocuments = await loader.load()
            console.log(`   📄 "${filePath}" → ${rawDocuments.length} páginas`)

            const chunks = await splitter.splitDocuments(rawDocuments)

            const mapped = chunks.map(doc => ({
                pageContent: doc.pageContent,
                metadata: {
                    source: doc.metadata.source ?? filePath,
                }
            }))

            allChunks.push(...mapped)
        }

        console.log(`✅ Total: ${allChunks.length} chunks de ${files.length} PDF(s)`)

        return allChunks
    }
}