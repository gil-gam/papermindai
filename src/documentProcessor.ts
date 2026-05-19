import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { type TextSplitterConfig, getPdfFiles } from "./config.js";

export class DocumentProcessor {
  private textSplitterConfig: TextSplitterConfig;

  constructor(textSplitterConfig: TextSplitterConfig) {
    this.textSplitterConfig = textSplitterConfig;
  }

  async loadAndSplit() {
    const files = getPdfFiles();

    if (files.length === 0) {
      console.warn("⚠️ Nenhum PDF para processar.");
      return [];
    }

    console.log(`📁 Encontrados ${files.length} PDF(s) para processar`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.textSplitterConfig.chunkSize,
      chunkOverlap: this.textSplitterConfig.chunkOverlap,
    });

    const allChunks: Array<{
      pageContent: string;
      metadata: { source: string; pageNumber: number };
    }> = [];

    for (const filePath of files) {
      const loader = new PDFLoader(filePath);
      const rawDocuments = await loader.load();

      console.log(` 📄 "${filePath}" → ${rawDocuments.length} páginas`);

      const chunks = await splitter.splitDocuments(rawDocuments);

      const mapped = chunks.map((doc) => ({
        pageContent: doc.pageContent,
        metadata: {
          source: filePath,
          pageNumber: doc.metadata.loc?.pageNumber ?? 0,
        },
      }));

      allChunks.push(...mapped);
    }

    console.log(
      `✅ Total: ${allChunks.length} chunks gerados a partir de ${files.length} PDF(s)`
    );

    return allChunks;
  }
}