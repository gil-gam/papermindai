import pdf from "pdf-parse";
import fs from "fs/promises";

export async function loadPdf(path: string) {
  const data = await fs.readFile(path);
  const res = await pdf(data);
  return res.text;
}