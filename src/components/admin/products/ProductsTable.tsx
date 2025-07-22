import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Tabela de produtos será integrada quando a API estiver configurada.
        </p>
      </CardContent>
    </Card>
  );
}