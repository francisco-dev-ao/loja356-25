
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NifInputProps {
  nif: string;
  setNif: (value: string) => void;
  setCompanyName: (value: string) => void;
  setAddress: (value: string) => void;
  setPhone: (value: string) => void;
  setNifError: (value: string) => void;
  nifError: string;
}

export const NifInput: React.FC<NifInputProps> = ({ 
  nif, 
  setNif, 
  setCompanyName, 
  setAddress, 
  setPhone,
  setNifError,
  nifError
}) => {
  const [isCheckingNif, setIsCheckingNif] = useState(false);

  const validateNifFormat = (value: string) => {
    // Check if it's a potential NIF (numbers only, up to 10 digits)
    const nifRegex = /^\d{1,10}$/;
    // Check if it's a potential BI (alphanumeric, typical format like 006887386BE049)
    const biRegex = /^[0-9A-Z]{1,15}$/;
    
    return nifRegex.test(value) || biRegex.test(value);
  };

  const handleNifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || validateNifFormat(value)) {
      setNif(value.toUpperCase());
      setNifError('');
    }
  };

  const handleNifBlur = async () => {
    if (!nif) return;
    setIsCheckingNif(true);
    setNifError('');
    try {
      // Nova API para consultar NIF
      const response = await fetch(`https://api-nif.angohost.ao/consultar/${nif}`);
      const data = await response.json();
      if (response.ok && data.data) {
        setCompanyName(data.data.nome || '');
        setAddress(data.data.endereco || '');
        setPhone(data.data.numero_contacto || '');
        toast.success('Dados encontrados e preenchidos automaticamente!');
      } else {
        setNifError('NIF não encontrado ou inválido.');
      }
    } catch (error) {
      console.error('Erro ao consultar NIF:', error);
      setNifError('Erro ao consultar o NIF. Por favor, tente novamente.');
    } finally {
      setIsCheckingNif(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="nif">NIF ou B.I</Label>
      <Input
        id="nif"
        type="text"
        value={nif}
        onChange={handleNifChange}
        onBlur={handleNifBlur}
        placeholder="NIF ou B.I"
        className={nifError ? "border-red-500" : ""}
        disabled={isCheckingNif}
        required
      />
      {isCheckingNif && (
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <div className="animate-spin h-4 w-4 border-2 border-microsoft-blue border-t-transparent rounded-full mr-2"></div>
          <span>Consultando seus dados...</span>
        </div>
      )}
      {nifError && <p className="text-red-500 text-sm">{nifError}</p>}
      <p className="text-xs text-muted-foreground">
        Ao informar o NIF, preencheremos alguns campos automaticamente.
      </p>
    </div>
  );
};
