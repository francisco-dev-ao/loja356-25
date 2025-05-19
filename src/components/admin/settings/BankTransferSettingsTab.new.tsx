import React, { useState } from 'react';
import { useSettings } from './SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bank, Loader2, ImagePlus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export const BankTransferSettingsTab = () => {
  const { settings, handleInputChange, handleSaveSettings, saving } = useSettings();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setLogoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingLogo(true);

    try {
      // Upload do logo se houver um novo
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `bank-logos/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;
        
        // Obter URL pública do logo
        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(fileName);
          
        // Atualizar URL do logo nas configurações
        settings.bank_logo_url = publicUrl;
      }

      // Salvar todas as configurações
      await handleSaveSettings();
      setLogoFile(null);
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error(`Erro ao salvar configurações: ${error.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const previewUrl = settings.bank_logo_url || 'https://via.placeholder.com/160x80?text=Logo+do+Banco';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configurações de Transferência Bancária</CardTitle>
            <CardDescription>
              Configure as informações bancárias que serão exibidas para os clientes e nas faturas.
            </CardDescription>
          </div>
          <Bank className="h-8 w-8 text-microsoft-blue" />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertDescription>
              Estas informações serão exibidas nas instruções de pagamento por transferência bancária
              e nas faturas emitidas para os clientes.
            </AlertDescription>
          </Alert>

          <div>
            <h3 className="text-lg font-medium mb-4">Informações do Banco</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Nome do Banco</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  value={settings.bank_name || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: Banco BIC"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank_account_holder">Titular da Conta</Label>
                <Input
                  id="bank_account_holder"
                  name="bank_account_holder"
                  value={settings.bank_account_holder || ''}
                  onChange={handleInputChange}
                  placeholder="Nome completo do titular"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Detalhes da Conta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Número da Conta</Label>
                <Input
                  id="bank_account_number"
                  name="bank_account_number"
                  value={settings.bank_account_number || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 0000 0000 0000 0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_iban">IBAN</Label>
                <Input
                  id="bank_iban"
                  name="bank_iban"
                  value={settings.bank_iban || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: AO06 0000 0000 0000 0000 0000 0"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Logotipo do Banco</h3>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-40 h-20 flex-shrink-0 relative rounded-md overflow-hidden bg-slate-100">
                <img
                  src={previewUrl}
                  alt="Preview do logo do banco"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo do Banco
                  </Label>
                  <div className="mt-1 flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="logo"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      {settings.bank_logo_url ? 'Alterar logo' : 'Fazer upload do logo'}
                    </Label>
                    {logoFile && (
                      <span className="text-sm text-muted-foreground">
                        Selecionado: {logoFile.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    PNG ou SVG com fundo transparente. Máximo 2MB.
                  </p>
                </div>

                {settings.bank_logo_url && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <a
                      href={settings.bank_logo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Ver logo atual
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={saving || uploadingLogo}
            className="w-full md:w-auto"
          >
            {(saving || uploadingLogo) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {saving || uploadingLogo ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
