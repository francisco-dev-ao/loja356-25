import { supabase } from '@/integrations/supabase/client';

export async function ensureStorageBucket(bucketName: string) {
  try {
    // Tentar usar o bucket solicitado
    const { data: bucketInfo, error: bucketError } = await supabase.storage
      .getBucket(bucketName);

    // Se o bucket não existe, tentar criá-lo
    if (bucketError?.message?.includes('not found')) {
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
        fileSizeLimit: 2 * 1024 * 1024 // 2MB
      });

      if (createError) {
        console.error('Erro ao criar bucket:', createError);
        return {
          success: false,
          error: 'Erro ao criar bucket de armazenamento: ' + createError.message
        };
      }
    }

    // Verificar se podemos listar arquivos (confirma permissões)
    const { data: objects, error: listError } = await supabase.storage
      .from(bucketName)
      .list();

    if (listError) {
      console.error('Erro ao listar bucket:', listError);
      return {
        success: false,
        error: 'Erro ao acessar bucket: ' + listError.message
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao verificar storage:', error);
    return {
      success: false,
      error: `Erro ao verificar storage: ${error.message}`
    };
  }
}
