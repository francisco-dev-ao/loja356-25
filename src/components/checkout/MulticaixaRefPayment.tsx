import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MulticaixaRefPayment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Multicaixa Referência</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Pagamento por referência em desenvolvimento. Use o backend PostgreSQL.
        </p>
      </CardContent>
    </Card>
  );
}