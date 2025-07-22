import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrdersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Tabela de pedidos em desenvolvimento. Use o backend PostgreSQL.
        </p>
      </CardContent>
    </Card>
  );
}