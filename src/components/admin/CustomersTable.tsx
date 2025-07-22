import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Tabela de clientes em desenvolvimento. Use o backend PostgreSQL.
        </p>
      </CardContent>
    </Card>
  );
}