import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface InvoiceData {
  order: any;
  profile: any;
  companyInfo: any;
  paymentReference?: {
    entity: string;
    reference: string;
    amount: number;
    description: string;
  };
}

export class InvoicePDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateProfessionalInvoice(data: InvoiceData): Promise<void> {
    const { order, profile, companyInfo, paymentReference } = data;
    this.doc = new jsPDF();
    await this.addHeader(companyInfo);
    this.addInvoiceInfo(order);
    this.addCompanyClientInfo(companyInfo, profile);
    this.addItemsTable(order.items);
    this.addPaymentInfo(order, paymentReference);
    this.addFooter();
  }

  private async addHeader(companyInfo: any): Promise<void> {
    // Professional gradient header
    this.doc.setFillColor(41, 128, 185); // Professional blue
    this.doc.rect(0, 0, this.doc.internal.pageSize.width, 45, 'F');

    // Adicionar logo (Icone-02.png)
    try {
      const logoUrl = '/images/Icone-02.png';
      const logoImg = await fetch(logoUrl).then(r => r.blob());
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoImg);
      });
      const base64 = await base64Promise;
      this.doc.addImage(base64, 'PNG', 12, 8, 22, 22);
    } catch (e) {
      // Se falhar, apenas não mostra o logo
    }
    // Company name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyInfo.name || 'Office365', 40, 25);
    // Tagline
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Licenças Microsoft Originais', 40, 33);
    // Invoice title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PROFORMA', this.doc.internal.pageSize.width - 20, 30, { align: 'right' });
  }

  private addInvoiceInfo(order: any): void {
    let yPos = 60;
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(11);
    
    // Calcular validade (3 dias após emissão, com hora e minutos)
    let validade = null;
    if (order.created_at) {
      validade = new Date(order.created_at);
      validade.setDate(validade.getDate() + 3);
    }
    // Invoice details in a professional layout
    const invoiceDetails = [
      ['Nº da Proforma:', `PROF-${order.id.substring(0, 8).toUpperCase()}`],
      ['Data de Emissão:', new Date(order.created_at).toLocaleDateString('pt-PT') + ' ' + new Date(order.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })],
      ['Data de Vencimento:', validade ? `${validade.toLocaleDateString('pt-PT')} ${validade.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : '-'],
      ['Status:', order.payment_status === 'paid' ? 'PAGO' : 'PENDENTE']
    ];

    invoiceDetails.forEach(([label, value], index) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, 20, yPos + (index * 7));
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, 70, yPos + (index * 7));
    });
  }

  private addCompanyClientInfo(companyInfo: any, profile: any): void {
    const yStart = 95;
    
    // Company info box
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(15, yStart, 85, 50, 'FD');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('EMITENTE', 20, yStart + 8);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyInfo.name, 20, yStart + 16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(companyInfo.address, 20, yStart + 22);
    this.doc.text(`NIF: ${companyInfo.nif}`, 20, yStart + 28);
    this.doc.text(`Tel: ${companyInfo.phone}`, 20, yStart + 34);
    this.doc.text(companyInfo.email, 20, yStart + 40);
    
    // Client info box
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(110, yStart, 85, 50, 'FD');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('CLIENTE', 115, yStart + 8);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(profile.name || 'Cliente', 115, yStart + 16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(profile.address || 'Endereço não informado', 115, yStart + 22);
    this.doc.text(`NIF: ${profile.nif || 'Não informado'}`, 115, yStart + 28);
    this.doc.text(`Tel: ${profile.phone || 'Não informado'}`, 115, yStart + 34);
    this.doc.text(profile.email || 'Email não informado', 115, yStart + 40);
  }

  private addItemsTable(items: any[]): void {
    console.log('🔄 Adicionando tabela de itens:', items);
    
    if (!items || items.length === 0) {
      console.warn('⚠️ Nenhum item encontrado para a tabela');
      return;
    }

    const tableColumn = ['Descrição', 'Qtd', 'Preço Unitário', 'Total'];
    const tableRows = items.map((item: any) => {
      console.log('🔄 Processando item:', item);
      return [
        item.product?.name || item.productName || 'Produto',
        item.quantity.toString(),
        `${this.formatCurrency(item.price)} AOA`,
        `${this.formatCurrency(item.price * item.quantity)} AOA`
      ];
    });
    
    console.log('✅ Linhas da tabela geradas:', tableRows);

    // @ts-ignore
    this.doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 155,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [50, 50, 50]
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 95, halign: 'left' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    });
  }

  private addPaymentInfo(order: any, paymentReference?: any): void {
    // @ts-ignore
    let yPos = this.doc.lastAutoTable?.finalY || 180;
    yPos += 15;

    // Total amount box
    // Exibir subtotal, desconto e total
    let ySubtotal = yPos;
    if (order.subtotal && order.subtotal !== order.total) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text('Subtotal:', 140, ySubtotal);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${this.formatCurrency(order.subtotal)} AOA`, 195, ySubtotal, { align: 'right' });
      ySubtotal += 7;
    }
    if (order.discount_amount && order.discount_amount > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(220, 38, 38); // vermelho
      this.doc.text('Desconto:', 140, ySubtotal);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`- ${this.formatCurrency(order.discount_amount)} AOA`, 195, ySubtotal, { align: 'right' });
      ySubtotal += 7;
      this.doc.setTextColor(0, 0, 0);
    }
    if (order.coupon_code) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9);
      this.doc.setTextColor(41, 128, 185);
      this.doc.text(`Cupom: ${order.coupon_code}`, 140, ySubtotal);
      this.doc.setTextColor(0, 0, 0);
      ySubtotal += 7;
    }
    // Total geral
    this.doc.setFillColor(41, 128, 185);
    this.doc.rect(140, ySubtotal, 55, 20, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TOTAL GERAL', 167, ySubtotal + 8, { align: 'center' });
    this.doc.setFontSize(14);
    this.doc.text(`${this.formatCurrency(order.total)} AOA`, 167, ySubtotal + 15, { align: 'center' });
    yPos = ySubtotal + 35;

    // Payment method information
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INFORMAÇÕES DE PAGAMENTO', 20, yPos);

    yPos += 10;

    if (order.payment_method === 'multicaixa_ref' && paymentReference) {
      // Multicaixa Reference payment info in a professional box
      this.doc.setDrawColor(41, 128, 185);
      this.doc.setFillColor(240, 248, 255);
      this.doc.rect(15, yPos, 180, 55, 'FD');

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(41, 128, 185);
      this.doc.text('PAGAMENTO POR REFERÊNCIA MULTICAIXA', 20, yPos + 8);

      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);

      // Payment details
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Entidade:', 20, yPos + 18);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(paymentReference.entity, 45, yPos + 18);

      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Referência:', 20, yPos + 26);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(paymentReference.reference, 50, yPos + 26);

      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Valor:', 20, yPos + 34);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${this.formatCurrency(paymentReference.amount)} AOA`, 35, yPos + 34);

      // Data de validade da referência (3 dias após emissão, com hora e minutos)
      if (order.created_at) {
        const validade = new Date(order.created_at);
        validade.setDate(validade.getDate() + 3);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Validade:', 20, yPos + 42);
        this.doc.setFont('helvetica', 'normal');
        const validadeStr = `${validade.toLocaleDateString('pt-PT')} ${validade.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
        this.doc.text(validadeStr, 45, yPos + 42);
      }

      // Instruções de pagamento (layout limpo)
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(41, 128, 185);
      this.doc.text('Instruções de Pagamento:', 110, yPos + 18);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(9);
      const instructions = [
        '1. Vá a um ATM ou Multicaixa Express',
        '2. Selecione "Pagamentos ou Pagamentos por Referencia"',
        `3. Digite a Entidade: ${paymentReference.entity}`,
        `4. Digite a Referência: ${paymentReference.reference}`,
        '5. Confirme o pagamento'
      ];
      instructions.forEach((instruction, index) => {
        this.doc.text(instruction, 110, yPos + 25 + (index * 5));
      });
      yPos += 65;
    } else {
      // Other payment methods
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const paymentMethod = order.payment_method === 'multicaixa' ? 'Multicaixa Express' : 'Transferência Bancária';
      this.doc.text(`Método: ${paymentMethod}`, 20, yPos + 8);
      yPos += 20;
    }

    // Remover termos e condições (não exibir mais)
  }

  private addFooter(): void {
    const pageHeight = this.doc.internal.pageSize.height;
    
    // Footer line
    this.doc.setDrawColor(41, 128, 185);
    this.doc.line(20, pageHeight - 30, this.doc.internal.pageSize.width - 20, pageHeight - 30);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(220, 38, 38); // vermelho
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Este documento não serve como fatura, após o Pagamento a fatura final certificada pela AGT chegará automaticamente pelo seu email.', this.doc.internal.pageSize.width / 2, pageHeight - 12, { align: 'center', maxWidth: this.doc.internal.pageSize.width - 40 });
    // Restaurar cor padrão
    this.doc.setTextColor(100, 100, 100);
  }

  private formatCurrency(amount: number): string {
    // Formatar com separador de milhar ponto e decimal vírgula
    return amount.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  save(filename: string): void {
    this.doc.save(filename);
  }

  output(): string {
    return this.doc.output('datauristring');
  }
}
