import React, { useState, useEffect } from 'react';

interface ElasticLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LOADING_MESSAGES = [
  "Electing Master Node...",
  "Rebalancing Shards...",
  "Warming up the Heap...",
  "Running Vector Search...",
  "Ingesting Knowledge...",
  "Optimizing Segments...",
  "Applying ILM Policy...",
  "Calculating Aggregations...",
  "Deploying Beats Agents..."
];

const ElasticLoader: React.FC<ElasticLoaderProps> = ({ text, size = 'md' }) => {
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (text) return; // If explicit text provided, don't cycle
    const interval = setInterval(() => {
      setMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, [text]);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* The Elastic Stack Animation */}
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} rounded-full bg-elastic-teal animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizeClasses[size]} rounded-full bg-elastic-pink animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizeClasses[size]} rounded-full bg-elastic-yellow animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {/* Text */}
      <p className="text-gray-400 font-mono text-sm animate-pulse">
        {text || message}
      </p>
    </div>
  );
};

export default ElasticLoader;