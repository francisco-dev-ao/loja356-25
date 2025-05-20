
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  minHeight?: string;
}

const LoadingIndicator = ({ 
  message = 'Carregando...', 
  size = 'medium',
  minHeight = '400px'
}: LoadingIndicatorProps) => {
  const sizeMap = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-12 w-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[${minHeight}]`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
