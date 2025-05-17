
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useSettings } from './SettingsContext';

const CurrencyPreview = () => {
  const { settings } = useSettings();
  const [previewAmount, setPreviewAmount] = useState(1000);
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

  const handlePreviewAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Permitir tanto vírgulas quanto pontos como separadores
    // Primeiro removemos todos os pontos e substituímos vírgulas por pontos para o parseFloat
    const cleanedValue = rawValue.replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(cleanedValue);
    
    if (!isNaN(numValue)) {
      setPreviewAmount(numValue);
    } else if (rawValue === '' || rawValue === '.' || rawValue === ',') {
      // Allow empty input or just a decimal separator
      setPreviewAmount(0);
    }
  };
  
  // Função para formatar o valor com separadores de milhares para exibição
  const formatInputValue = (value: number): string => {
    // Converte para string com , como separador decimal
    const valueStr = value.toString().replace('.', ',');
    
    // Se não houver parte decimal, adiciona ,00
    if (!valueStr.includes(',')) {
      return valueStr + ',00';
    }
    
    // Se a parte decimal tiver apenas um dígito, adiciona outro zero
    const parts = valueStr.split(',');
    if (parts[1] && parts[1].length === 1) {
      return parts[0] + ',' + parts[1] + '0';
    }
    
    return valueStr;
  };
  
  return (
    <div className="mt-6 bg-slate-50 p-4 rounded-md border">
      <h3 className="text-sm font-medium mb-2">Visualização da Formatação</h3>
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <Input
            type="text"
            value={formatInputValue(previewAmount)}
            onChange={handlePreviewAmountChange}
            placeholder="Valor (ex: 1.000,00)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Insira o valor usando vírgula ou ponto como separador (ex: 1.000,00 ou 1000,00)
          </p>
        </div>
        <div className="text-2xl font-semibold">→</div>
        <div className="bg-white px-4 py-2 border rounded-md text-lg font-semibold min-w-[200px] text-right">
          {formattedPreview}
        </div>
      </div>
    </div>
  );
};

export default CurrencyPreview;
