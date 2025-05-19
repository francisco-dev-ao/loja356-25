
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardContent } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const AccountTabs = () => {
  return (
    <CardContent className="p-6">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Cadastro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm redirectAfter={false} />
        </TabsContent>
        
        <TabsContent value="register">
          <RegisterForm redirectAfter={false} />
        </TabsContent>
      </Tabs>
    </CardContent>
  );
};

export default AccountTabs;
