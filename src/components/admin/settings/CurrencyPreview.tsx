
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useSettings } from './SettingsContext';

const CurrencyPreview = () => {
  const { settings } = useSettings();
  const [previewAmount, setPreviewAmount] = useState(1000);
  const [inputValue, setInputValue] = useState('1.000,00');
  const [formattedPreview, setFormattedPreview] = useState('');
  
  useEffect(() => {
    // Update currency preview when settings change
    try {
      const preview = new Intl.NumberFormat(settings.currency_locale, {
        style: 'currency',
        currency: settings.currency_code,
        minimumFractionDigits: settings.currency_min_digits,
        maximumFractionDigits: settings.currency_max_digits
      }).format(previewAmount);
      
      setFormattedPreview(preview);
    } catch (error) {
      console.error('Error formatting currency preview:', error);
      setFormattedPreview('Formato inválido');
    }
  }, [settings.currency_locale, settings.currency_code, settings.currency_min_digits, settings.currency_max_digits, previewAmount]);

  useEffect(() => {
    // Update input value when previewAmount changes
    setInputValue(formatInputValue(previewAmount));
  }, [previewAmount]);

  const handlePreviewAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Remove all dots and replace commas with dots for numerical conversion
    const cleanedValue = newValue.replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(cleanedValue);
    
    if (!isNaN(numValue)) {
      setPreviewAmount(numValue);
    }
  };
  
  // Função para formatar o valor com separadores de milhares para exibição
  const formatInputValue = (value: number): string => {
    if (isNaN(value)) return '';
    
    // Converte para string usando formatação brasileira/portuguesa
    const parts = value.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  };
  
  return (
    <div className="mt-4 sm:mt-6 bg-slate-50 p-3 sm:p-4 rounded-md border">
      <h3 className="text-sm font-medium mb-2">Visualização da Formatação</h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="w-full sm:flex-grow">
          <Input
            type="text"
            value={inputValue}
            onChange={handlePreviewAmountChange}
            placeholder="Valor (ex: 1.000,00)"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Insira o valor usando vírgula ou ponto como separador (ex: 1.000,00 ou 1000,00)
          </p>
        </div>
        <div className="hidden sm:block text-2xl font-semibold">→</div>
        <div className="block sm:hidden text-lg font-semibold mt-2 mb-1">↓</div>
        <div className="bg-white px-3 py-2 sm:px-4 sm:py-2 border rounded-md text-base sm:text-lg font-semibold min-w-0 sm:min-w-[200px] text-right w-full sm:w-auto">
          {formattedPreview}
        </div>
      </div>
    </div>
  );
};

export default CurrencyPreview;
