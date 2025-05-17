
import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
    </div>
  );
};

export default LoadingIndicator;
