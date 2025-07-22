import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CouponsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cupons</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Sistema de cupons em desenvolvimento. Use o backend PostgreSQL.
        </p>
      </CardContent>
    </Card>
  );
}