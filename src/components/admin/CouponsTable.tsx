
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
};

const CouponsTable = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit coupon state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewCoupon, setIsNewCoupon] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    valid_from: new Date().toISOString(),
    valid_until: null,
    max_uses: null,
    current_uses: 0,
  });

  // Date picker state
  const [validFromDate, setValidFromDate] = useState<Date | undefined>(new Date());
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState({
    from: false,
    until: false,
  });
  
  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('code');
      
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Update dates when dialog opens
  useEffect(() => {
    if (isEditDialogOpen && !isNewCoupon && currentCoupon.valid_from) {
      setValidFromDate(new Date(currentCoupon.valid_from));
      
      if (currentCoupon.valid_until) {
        setValidUntilDate(new Date(currentCoupon.valid_until));
      } else {
        setValidUntilDate(undefined);
      }
    } else if (isNewCoupon) {
      setValidFromDate(new Date());
      setValidUntilDate(undefined);
    }
  }, [isEditDialogOpen, isNewCoupon, currentCoupon]);
  
  // Filter coupons
  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Edit coupon
  const handleEditClick = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setIsNewCoupon(false);
    setIsEditDialogOpen(true);
  };
  
  // New coupon
  const handleNewClick = () => {
    setCurrentCoupon({
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      valid_from: new Date().toISOString(),
      valid_until: null,
      max_uses: null,
      current_uses: 0,
    });
    setValidFromDate(new Date());
    setValidUntilDate(undefined);
    setIsNewCoupon(true);
    setIsEditDialogOpen(true);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCurrentCoupon(prev => ({
      ...prev,
      [name]: name === 'discount_value' || name === 'max_uses' || name === 'current_uses'
        ? parseFloat(value) || 0
        : value
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setCurrentCoupon(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (type: 'from' | 'until', date?: Date | null) => {
    if (type === 'from' && date) {
      setValidFromDate(date);
      setCurrentCoupon(prev => ({
        ...prev,
        valid_from: date.toISOString()
      }));
    } else if (type === 'until') {
      setValidUntilDate(date || undefined);
      setCurrentCoupon(prev => ({
        ...prev,
        valid_until: date ? date.toISOString() : null
      }));
    }
  };
  
  // Save coupon
  const handleSaveCoupon = async () => {
    try {
      if (!currentCoupon.code) {
        toast.error('O código do cupom é obrigatório');
        return;
      }

      if (!currentCoupon.discount_value || currentCoupon.discount_value <= 0) {
        toast.error('O valor do desconto deve ser maior que zero');
        return;
      }

      if (isNewCoupon) {
        // Check if code already exists
        const { data: existingCoupon, error: checkError } = await supabase
          .from('coupons')
          .select('id')
          .eq('code', currentCoupon.code)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingCoupon) {
          toast.error('Este código de cupom já existe');
          return;
        }
        
        const { error } = await supabase
          .from('coupons')
          .insert({
            code: currentCoupon.code,
            discount_type: currentCoupon.discount_type,
            discount_value: currentCoupon.discount_value,
            valid_from: currentCoupon.valid_from,
            valid_until: currentCoupon.valid_until,
            max_uses: currentCoupon.max_uses,
            current_uses: 0,
          });
          
        if (error) throw error;
        toast.success('Cupom adicionado com sucesso!');
      } else {
        const { error } = await supabase
          .from('coupons')
          .update({
            code: currentCoupon.code,
            discount_type: currentCoupon.discount_type,
            discount_value: currentCoupon.discount_value,
            valid_from: currentCoupon.valid_from,
            valid_until: currentCoupon.valid_until,
            max_uses: currentCoupon.max_uses,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentCoupon.id);
          
        if (error) throw error;
        toast.success('Cupom atualizado com sucesso!');
      }
      
      setIsEditDialogOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Erro ao salvar cupom');
    }
  };
  
  // Delete coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom? Esta ação é irreversível.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);
        
      if (error) throw error;
      
      toast.success('Cupom excluído com sucesso!');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Erro ao excluir cupom');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  // Check if coupon is valid
  const isCouponValid = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    
    if (validFrom > now) {
      return false; // Not valid yet
    }
    
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return false; // Expired
    }
    
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return false; // Max uses reached
    }
    
    return true;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Gerenciar Cupons de Desconto</h2>
        <Button onClick={handleNewClick} className="bg-green-600 hover:bg-green-700">
          <Plus size={16} className="mr-2" />
          Novo Cupom
        </Button>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Buscar cupons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <span className="font-medium">{coupon.code}</span>
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' ? 'Percentual' : 'Valor Fixo'}
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `${formatCurrency(coupon.discount_value)} kz`}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>De: {formatDate(coupon.valid_from)}</p>
                      <p>Até: {coupon.valid_until ? formatDate(coupon.valid_until) : 'Sem data limite'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.max_uses 
                      ? `${coupon.current_uses}/${coupon.max_uses}` 
                      : `${coupon.current_uses} (ilimitado)`}
                  </TableCell>
                  <TableCell>
                    {isCouponValid(coupon) ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditClick(coupon)}
                    >
                      <Pencil size={16} className="mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Nenhum cupom encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isNewCoupon ? 'Adicionar Cupom' : 'Editar Cupom'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium">
                Código do Cupom
                <Input
                  name="code"
                  value={currentCoupon.code || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="DESCONTO20"
                />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium">
                Tipo de Desconto
                <Select 
                  value={currentCoupon.discount_type || 'percentage'} 
                  onValueChange={(value) => handleSelectChange('discount_type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo de desconto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (kz)</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              
              <label className="text-sm font-medium">
                Valor do Desconto
                <Input
                  name="discount_value"
                  type="number"
                  value={currentCoupon.discount_value || 0}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder={currentCoupon.discount_type === 'percentage' ? "0-100" : "0.00"}
                />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium">
                Data de Início
                <div className="mt-1">
                  <Popover open={datePickerOpen.from} onOpenChange={(open) => setDatePickerOpen({...datePickerOpen, from: open})}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {validFromDate ? format(validFromDate, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={validFromDate}
                        onSelect={(date) => {
                          handleDateChange('from', date);
                          setDatePickerOpen({...datePickerOpen, from: false});
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </label>
              
              <label className="text-sm font-medium">
                Data de Validade (opcional)
                <div className="mt-1">
                  <Popover open={datePickerOpen.until} onOpenChange={(open) => setDatePickerOpen({...datePickerOpen, until: open})}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {validUntilDate 
                          ? format(validUntilDate, 'PPP', { locale: ptBR }) 
                          : 'Sem data limite'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="p-2 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            handleDateChange('until', null);
                            setDatePickerOpen({...datePickerOpen, until: false});
                          }}
                        >
                          Sem limite
                        </Button>
                      </div>
                      <Calendar
                        mode="single"
                        selected={validUntilDate}
                        onSelect={(date) => {
                          handleDateChange('until', date);
                          setDatePickerOpen({...datePickerOpen, until: false});
                        }}
                        disabled={(date) => {
                          if (!validFromDate) return false;
                          return date < validFromDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </label>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium">
                Limite de Usos (opcional)
                <Input
                  name="max_uses"
                  type="number"
                  value={currentCoupon.max_uses || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Deixe em branco para ilimitado"
                />
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCoupon}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsTable;
