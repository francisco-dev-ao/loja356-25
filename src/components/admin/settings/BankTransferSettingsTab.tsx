import React, { useState } from 'react';
import { useSettings } from './SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building as Bank, Loader2, ImagePlus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { ensureStorageBucket } from '@/lib/storage-utils';

const IBAN_REGEX = /^AO[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{4}[0-9]{4}[0-9]{4}[0-9]{1}$/;

const BankTransferSettingsTab: React.FC = () => {
  const { settings, handleInputChange, handleSaveSettings, saving } = useSettings();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [ibanError, setIbanError] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validar formato do IBAN
    if (settings.bank_iban && !IBAN_REGEX.test(settings.bank_iban?.replace(/\s/g, ''))) {
      setIbanError('IBAN inválido. O formato deve ser: AO06 0000 0000 0000 0000 0000 0');
      return;
    }
    
    setUploadingLogo(true);
    
    try {
      // Upload do logo se houver um novo
      if (logoFile) {
        // Verificar o acesso ao storage
        const { success, error: storageError } = await ensureStorageBucket('bank-logos');
        if (!success) {
          throw new Error(storageError || 'Erro ao acessar o armazenamento');
        }

        // Garantir extensão segura
        const fileExt = logoFile.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !['png', 'jpg', 'jpeg', 'svg'].includes(fileExt)) {
          throw new Error('Formato de arquivo não suportado. Use PNG, JPG ou SVG.');
        }

        // Nome do arquivo com timestamp para evitar colisões
        const timestamp = new Date().getTime();
        const safeFileName = `${timestamp}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        try {
          // Tentar upload no bucket
          const { data, error: uploadError } = await supabase.storage
            .from('bank-logos')
            .upload(safeFileName, logoFile, {
              contentType: logoFile.type,
              upsert: true
            });

          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            throw uploadError;
          }

          if (!data?.path) {
            throw new Error('Caminho do arquivo não retornado');
          }

          // Obter URL pública do logo usando o endpoint S3
          const { data: urlData } = await supabase.storage
            .from('bank-logos')
            .getPublicUrl(data.path);

          if (!urlData?.publicUrl) {
            throw new Error('URL pública não gerada');
          }

          settings.bank_logo_url = urlData.publicUrl;
        } catch (uploadError: any) {
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }
      }

      // Salvar todas as configurações
      await handleSaveSettings();
      setLogoFile(null);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      let errorMessage = 'Erro ao salvar configurações';
      
      if (error.message.includes('Bucket not found')) {
        errorMessage = 'Erro ao criar bucket de armazenamento. Por favor, tente novamente.';
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'Sem permissão para fazer upload. Por favor, faça login novamente.';
      } else if (error.message.includes('Invalid token')) {
        errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
      } else if (error.message.includes('canceled')) {
        errorMessage = 'Upload cancelado. Por favor, tente novamente.';
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
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
              </div>              <div className="space-y-2">
                <Label htmlFor="bank_iban">IBAN</Label>
                <Input
                  id="bank_iban"
                  name="bank_iban"
                  value={settings.bank_iban || ''}
                  onChange={(e) => {
                    handleInputChange(e);
                    setIbanError(null);
                  }}
                  placeholder="Ex: AO06 0000 0000 0000 0000 0000 0"
                  required
                  className={ibanError ? 'border-red-500' : ''}
                />
                {ibanError && (
                  <p className="text-sm text-red-500 mt-1">{ibanError}</p>
                )}
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

export default BankTransferSettingsTab;
