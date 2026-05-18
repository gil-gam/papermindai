import { loadPdf } from "./pdfLoader.js";
import { splitText } from "./textSplitter.js";
import { type Document } from "../types/document.js";

export async function loadDocument(path: string): Promise<Document[]> {
  const text = await loadPdf(path);
  const parts = splitText(text);
  return parts.map(p => ({
    text: p,
    embedding: []
  }));
}