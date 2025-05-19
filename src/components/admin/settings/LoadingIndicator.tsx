
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingIndicator = () => {  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
    </div>
  );
};

export default LoadingIndicator;
