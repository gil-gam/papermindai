// ChatBox.tsx
import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';   
import './ChatBox.css';

interface Fonte {
  file: string;
  page: number;
}

interface Mensagem {
  role: 'user' | 'assistant';
  content: string;
  fontes?: Fonte[];
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Mensagem = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });

      if (!response.ok) {
        throw new Error('Erro na API');
      }

      const data = await response.json();

      const assistantMessage: Mensagem = {
        role: 'assistant',
        content: data.resposta,
        fontes: data.fontes
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      const errorMessage: Mensagem = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.'
      };

      setMessages(prev => [...prev, errorMessage]);

    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbox-container">
      <div className="messages-wrapper">
        {messages.length === 0 && (
          <div className="empty-state">
            Faça uma pergunta sobre os documentos carregados.
          </div>
        )}

        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta..."
          rows={2}
        />

        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;