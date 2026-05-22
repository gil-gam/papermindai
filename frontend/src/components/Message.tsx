import React from 'react';
import ReactMarkdown from 'react-markdown';
import './Message.css';

interface Fonte {
  file: string;
  page: number;
}

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    fontes?: Fonte[];
  };
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-role">
        {isUser ? 'Você' : 'Assistente'}
      </div>
      <div className="message-content">
        <ReactMarkdown>{message.content}</ReactMarkdown>
        {!isUser && message.fontes && message.fontes.length > 0 && (
          <div className="sources">
            <strong>Fontes:</strong>
            <ul>
              {message.fontes.map((fonte, index) => (
                <li key={index}>
                  Arquivo: {fonte.file} - Página: {fonte.page}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;