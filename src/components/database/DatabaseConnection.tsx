import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseConfig, db } from '@/lib/database';
import { toast } from 'sonner';

interface DatabaseConnectionProps {
  onConnect: () => void;
}

export function DatabaseConnection({ onConnect }: DatabaseConnectionProps) {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: '',
    port: '5432',
    username: '',
    password: '',
    database: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!config.host || !config.username || !config.password || !config.database) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Save config to localStorage and set in database client
      localStorage.setItem('db_config', JSON.stringify(config));
      db.setConfig(config);
      
      // Test connection by attempting a simple query
      await db.query('SELECT 1 as test');
      
      toast.success('Conectado com sucesso ao PostgreSQL!');
      onConnect();
    } catch (error) {
      console.error('Database connection error:', error);
      toast.error('Erro ao conectar: Verifique as credenciais');
      localStorage.removeItem('db_config');
      db.setConfig(null);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Conexão PostgreSQL</CardTitle>
          <CardDescription>
            Configure a conexão com seu banco de dados PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host *</Label>
            <Input
              id="host"
              placeholder="localhost"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="port">Porta</Label>
            <Input
              id="port"
              placeholder="5432"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Usuário *</Label>
            <Input
              id="username"
              placeholder="postgres"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="database">Database *</Label>
            <Input
              id="database"
              placeholder="myapp"
              value={config.database}
              onChange={(e) => setConfig({ ...config, database: e.target.value })}
            />
          </div>
          
          <Button 
            onClick={handleConnect} 
            className="w-full"
            disabled={isConnecting}
          >
            {isConnecting ? 'Conectando...' : 'Conectar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}