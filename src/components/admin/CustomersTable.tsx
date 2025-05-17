
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserPlus, Trash2, Key, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const newCustomerSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  phone: z.string().optional(),
  nif: z.string().optional(),
  address: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

type NewCustomerFormValues = z.infer<typeof newCustomerSchema>;

const CustomersTable = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  const form = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      nif: '',
      address: '',
      isAdmin: false,
    },
  });

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', currentPage],
    queryFn: async () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + itemsPerPage - 1);
        
      if (error) throw error;
      return data;
    },
  });

  const { data: totalCustomers } = useQuery({
    queryKey: ['totalCustomers'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      return count || 0;
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: NewCustomerFormValues) => {
      // First create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          name: data.name,
        },
      });
      
      if (authError) throw authError;
      
      // Then update the profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          nif: data.nif,
          address: data.address,
          role: data.isAdmin ? 'admin' : 'customer',
        })
        .eq('id', authData.user.id);
      
      if (profileError) throw profileError;
      
      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast.success('Cliente criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    }
  });

  const updateCustomerRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      
      if (error) throw error;
      return { id, role };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`Papel do usuário atualizado para ${data.role}`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar papel do usuário: ${error.message}`);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string, password: string }) => {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password,
      });
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      setIsResetPasswordDialogOpen(false);
      setSelectedCustomer(null);
      setNewPassword('');
      toast.success('Senha redefinida com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao redefinir senha: ${error.message}`);
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete the user from auth which will cascade to profiles
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir cliente: ${error.message}`);
    }
  });
  
  const deleteMultipleCustomersMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Delete multiple users
      for (const id of ids) {
        const { error } = await supabase.auth.admin.deleteUser(id);
        if (error) throw error;
      }
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSelectedCustomers([]);
      toast.success('Clientes excluídos com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir clientes: ${error.message}`);
    }
  });

  const sendPasswordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return email;
    },
    onSuccess: (email) => {
      toast.success(`Email de redefinição de senha enviado para ${email}`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar email de redefinição de senha: ${error.message}`);
    }
  });

  const totalPages = Math.ceil((totalCustomers || 0) / itemsPerPage);

  const onSubmit = (data: NewCustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  const handleResetPassword = () => {
    if (selectedCustomer && newPassword) {
      resetPasswordMutation.mutate({
        id: selectedCustomer.id,
        password: newPassword,
      });
    }
  };

  const handleSendPasswordReset = (email: string) => {
    sendPasswordResetMutation.mutate(email);
  };

  const handleDeleteCustomer = (id: string) => {
    deleteCustomerMutation.mutate(id);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (!customers) return;
    
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(customer => customer.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCustomers.length > 0) {
      deleteMultipleCustomersMutation.mutate(selectedCustomers);
    }
  };

  const handleToggleAdminRole = (customer: any) => {
    const newRole = customer.role === 'admin' ? 'customer' : 'admin';
    updateCustomerRoleMutation.mutate({ id: customer.id, role: newRole });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando clientes...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Erro ao carregar clientes: {(error as Error).message}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">Gerenciamento de Clientes</h2>
        
        <div className="flex space-x-2">
          {selectedCustomers.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Selecionados ({selectedCustomers.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir {selectedCustomers.length} clientes selecionados? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para criar um novo cliente.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input placeholder="******" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="Telefone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIF</FormLabel>
                        <FormControl>
                          <Input placeholder="NIF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Administrador</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Este usuário terá privilégios de administrador.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createCustomerMutation.isPending}
                    >
                      {createCustomerMutation.isPending ? 'Criando...' : 'Criar Cliente'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Dialog 
        open={isResetPasswordDialogOpen} 
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Digite a nova senha para o cliente {selectedCustomer?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Digite a nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleResetPassword}
              disabled={!newPassword || resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={customers?.length > 0 && selectedCustomers.length === customers.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>NIF</TableHead>
              <TableHead>Data de Registro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={() => handleSelectCustomer(customer.id)}
                    />
                  </TableCell>
                  <TableCell>{customer.name || '—'}</TableCell>
                  <TableCell>{customer.email || '—'}</TableCell>
                  <TableCell>{customer.phone || '—'}</TableCell>
                  <TableCell>{customer.nif || '—'}</TableCell>
                  <TableCell>
                    {customer.created_at ? format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>
                              Sim, excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsResetPasswordDialogOpen(true);
                        }}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSendPasswordReset(customer.email || '')}
                        disabled={!customer.email}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant={customer.role === 'admin' ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => handleToggleAdminRole(customer)}
                      >
                        <User className="h-4 w-4" />
                        {customer.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">Nenhum cliente encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Logic for showing pagination items
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CustomersTable;
