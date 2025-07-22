import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BankTransferSettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Transferência Bancária</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidade em desenvolvimento. Use o backend PostgreSQL para configurações avançadas.
        </p>
      </CardContent>
    </Card>
  );
}