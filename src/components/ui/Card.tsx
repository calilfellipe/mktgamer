import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div 
      className={`
        bg-gray-900 border border-gray-800 rounded-lg p-6 
        ${hover ? 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}