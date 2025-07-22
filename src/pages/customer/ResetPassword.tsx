import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Funcionalidade em desenvolvimento. Use o backend PostgreSQL para implementar redefinição de senha.
          </p>
          <Button asChild className="w-full">
            <Link to="/customer/login">Voltar para Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}