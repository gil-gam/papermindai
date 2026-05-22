# 📌 Projeto: Assistente RAG para dúvidas sobre as disciplinas da Pós‑Graduação em Engenharia de Software com IA
Este projeto implementa um sistema de **RAG (Retrieval-Augmented Generation)** que responde perguntas sobre o conteúdo das disciplinas da pós-graduação em Engenharia de Software com Inteligência Artificial Aplicada.

A solução utiliza:

Embeddings locais via **Transformers.js (MiniLM‑L6‑v2)**
**Neo4j** como vetor‑store
**Node.js + Express** no backend
**React + Vite** no frontend
**OpenRouter** para geração de respostas

Permite consultar PDFs através de linguagem natural.

## 📐 Arquitetura

``` 
backend/
  src/
    index.ts   -> ingestão de PDFs
    ask.ts     -> lógica RAG
    server.ts  -> API /api/ask
    files/     -> PDFs
frontend/
  src/App.tsx  -> interface React
```

## ⚙️ Variáveis de Ambiente (.env)

``` 
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet:beta
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=RAG-System

PDF_FOLDER=./backend/src/files
PORT=3000
```

## 🚀 Como rodar
**1. Ingestão dos PDFs**
```
npx tsx backend/src/index.ts
```
**2. Backend**
```
npx tsx server.ts
```
**3. Frontend**
```
cd frontend
npm install
npm run dev
```
**Acesse:**
```
http://localhost:5173
```
## 🧪 Exemplo de uso
**Pergunta:** O que o manual diz sobre identidade visual?

Retorno inclui resposta + fontes do PDF.

**📄 LicençaMIT**

# 

# 📌 Project: RAG Assistant for answering questions about the graduate program in Software Engineering with AI
This project implements a **RAG (Retrieval-Augmented Generation)** assistant designed to answer questions based on course materials from a graduate program in **Software Engineering with Applied Artificial Intelligence**.

It uses: 

Local embeddings via **Transformers.js (MiniLM‑L6‑v2)**
**Neo4j** as vector‑store
**Node.js + Express** backend
**React + Vite** frontend
**OpenRouter** LLMs

It enables natural‑language queries over PDF files.

## 📐 Architecture
```
backend/
  src/
    index.ts   -> PDF ingestion
    ask.ts     -> RAG logic
    server.ts  -> API /api/ask
    files/     -> PDFs
frontend/
  src/App.tsx  -> React UI
```

## ⚙️ Environment Variables (.env)
```
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet:beta
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=RAG-System

PDF_FOLDER=./backend/src/files
PORT=3000
```

## 🚀 How to Run
**1. PDF ingestion**
```
npx tsx backend/src/index.ts
```
**2. Backend**
```
npx tsx server.ts
```
**3. Frontend**
```
cd frontend
npm install
npm run dev
```
## Open: 
```
http://localhost:5173
```

## 🧪 Example 
**Query:** What does the branding manual say about visual identity?

Returns the answer + PDF sources.

**📄 LicenseMIT.**

