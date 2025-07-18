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

  generateProfessionalInvoice(data: InvoiceData): void {
    const { order, profile, companyInfo, paymentReference } = data;

    // Reset document
    this.doc = new jsPDF();

    // Header with professional styling
    this.addHeader(companyInfo);
    
    // Invoice information
    this.addInvoiceInfo(order);
    
    // Company and client information
    this.addCompanyClientInfo(companyInfo, profile);
    
    // Items table
    this.addItemsTable(order.items);
    
    // Payment information with Multicaixa reference
    this.addPaymentInfo(order, paymentReference);
    
    // Professional footer
    this.addFooter();
  }

  private addHeader(companyInfo: any): void {
    // Professional gradient header
    this.doc.setFillColor(41, 128, 185); // Professional blue
    this.doc.rect(0, 0, this.doc.internal.pageSize.width, 45, 'F');
    
    // Company name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyInfo.name || 'Office365', 20, 25);
    
    // Tagline
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Licenças Microsoft Originais', 20, 33);
    
    // Invoice title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FATURA', this.doc.internal.pageSize.width - 20, 30, { align: 'right' });
  }

  private addInvoiceInfo(order: any): void {
    let yPos = 60;
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(11);
    
    // Invoice details in a professional layout
    const invoiceDetails = [
      ['Nº da Fatura:', `INV-${order.id.substring(0, 8).toUpperCase()}`],
      ['Data de Emissão:', new Date(order.created_at).toLocaleDateString('pt-AO')],
      ['Data de Vencimento:', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-AO')],
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
    if (!items || items.length === 0) return;

    const tableColumn = ['Descrição', 'Qtd', 'Preço Unitário', 'Total'];
    const tableRows = items.map((item: any) => [
      item.product?.name || item.productName || 'Produto',
      item.quantity.toString(),
      `KZ ${this.formatCurrency(item.price)}`,
      `KZ ${this.formatCurrency(item.price * item.quantity)}`
    ]);

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
    this.doc.setFillColor(41, 128, 185);
    this.doc.rect(140, yPos, 55, 20, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TOTAL GERAL', 167, yPos + 8, { align: 'center' });
    this.doc.setFontSize(14);
    this.doc.text(`KZ ${this.formatCurrency(order.total)}`, 167, yPos + 15, { align: 'center' });

    yPos += 35;

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
      this.doc.rect(15, yPos, 180, 45, 'FD');

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(41, 128, 185);
      this.doc.text('PAGAMENTO POR REFERÊNCIA MULTICAIXA', 20, yPos + 8);

      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);

      // Payment details in two columns
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
      this.doc.text(`KZ ${this.formatCurrency(paymentReference.amount)}`, 35, yPos + 34);

      // Instructions box
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('INSTRUÇÕES DE PAGAMENTO:', 110, yPos + 18);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      
      const instructions = [
        '1. Vá a um ATM ou Multicaixa Express',
        '2. Selecione "Pagamentos" → "Outros Serviços"',
        `3. Digite a Entidade: ${paymentReference.entity}`,
        `4. Digite a Referência: ${paymentReference.reference}`,
        '5. Confirme o pagamento'
      ];

      instructions.forEach((instruction, index) => {
        this.doc.text(instruction, 110, yPos + 25 + (index * 4));
      });

      yPos += 55;
    } else {
      // Other payment methods
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const paymentMethod = order.payment_method === 'multicaixa' ? 'Multicaixa Express' : 'Transferência Bancária';
      this.doc.text(`Método: ${paymentMethod}`, 20, yPos + 8);
      yPos += 20;
    }

    // Terms and conditions
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TERMOS E CONDIÇÕES:', 20, yPos + 10);
    this.doc.setFont('helvetica', 'normal');
    
    const terms = [
      '• As licenças são enviadas por email após confirmação do pagamento',
      '• Suporte técnico gratuito por 30 dias após a compra',
      '• Política de reembolso conforme termos de uso',
      '• Para dúvidas, contacte o nosso suporte técnico'
    ];

    terms.forEach((term, index) => {
      this.doc.text(term, 20, yPos + 18 + (index * 5));
    });
  }

  private addFooter(): void {
    const pageHeight = this.doc.internal.pageSize.height;
    
    // Footer line
    this.doc.setDrawColor(41, 128, 185);
    this.doc.line(20, pageHeight - 30, this.doc.internal.pageSize.width - 20, pageHeight - 30);
    
    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    
    const footerText = 'Obrigado pela sua preferência!';
    const generateText = `Documento gerado automaticamente em ${new Date().toLocaleString('pt-AO')}`;
    
    this.doc.text(footerText, this.doc.internal.pageSize.width / 2, pageHeight - 20, { align: 'center' });
    this.doc.text(generateText, this.doc.internal.pageSize.width / 2, pageHeight - 12, { align: 'center' });
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('pt-AO', {
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
