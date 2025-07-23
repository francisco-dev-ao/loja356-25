import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Database, CheckCircle } from 'lucide-react';

interface DatabaseConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface DatabaseConnectionProps {
  onConfigChange: (config: DatabaseConfig | null) => void;
}

export default function DatabaseConnection({ onConfigChange }: DatabaseConnectionProps) {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: '',
    port: '5432',
    username: '',
    password: '',
    database: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('db_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setIsConnected(true);
        onConfigChange(parsed);
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, [onConfigChange]);

  const handleSaveConfig = () => {
    setIsLoading(true);
    
    // Validate required fields
    if (!config.host || !config.username || !config.password || !config.database) {
      alert('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    try {
      // Save to localStorage
      localStorage.setItem('db_config', JSON.stringify(config));
      setIsConnected(true);
      onConfigChange(config);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving config:', error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('db_config');
    setIsConnected(false);
    setConfig({
      host: '',
      port: '5432',
      username: '',
      password: '',
      database: ''
    });
    onConfigChange(null);
  };

  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Conectado ao PostgreSQL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Host:</strong> {config.host}</p>
            <p><strong>Database:</strong> {config.database}</p>
            <p><strong>Usuário:</strong> {config.username}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleDisconnect}
            className="w-full"
          >
            Desconectar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Configuração PostgreSQL
        </CardTitle>
        <CardDescription>
          Insira as credenciais do seu banco PostgreSQL. Elas serão salvas localmente no seu navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Suas credenciais ficam apenas no seu navegador local. Não são enviadas para nenhum servidor.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="host">Host *</Label>
          <Input
            id="host"
            type="text"
            placeholder="ex: localhost ou bd.exemplo.com"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">Porta</Label>
          <Input
            id="port"
            type="text"
            placeholder="5432"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Usuário *</Label>
          <Input
            id="username"
            type="text"
            placeholder="Nome do usuário"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Senha do banco"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="database">Nome da Database *</Label>
          <Input
            id="database"
            type="text"
            placeholder="Nome da database"
            value={config.database}
            onChange={(e) => setConfig({ ...config, database: e.target.value })}
          />
        </div>

        <Button 
          onClick={handleSaveConfig} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Conectando...' : 'Conectar'}
        </Button>
      </CardContent>
    </Card>
  );
}