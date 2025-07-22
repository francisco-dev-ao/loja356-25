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
    description?: string;
  };
}

export class InvoicePDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF({ format: 'a4', unit: 'mm' });
  }

  async generateProfessionalInvoice(data: InvoiceData): Promise<void> {
    const { order, profile, companyInfo, paymentReference } = data;
    this.doc = new jsPDF({ format: 'a4', unit: 'mm' });

    await this.addHeader(companyInfo);
    this.addInvoiceInfo(order);
    // Use order.client if exists, else fallback to profile
    const clientInfo = (order.client || {}) as any;
    await this.addCompanyClientInfo(companyInfo, clientInfo, profile);
    this.addItemsTable(order.items);
    this.addPaymentInfo(order, paymentReference);
    this.addFooter();
  }

  private async addHeader(companyInfo: any): Promise<void> {
    const width = this.doc.internal.pageSize.width;
    this.doc.setFillColor(41, 128, 185);
    this.doc.rect(0, 0, width, 45, 'F');

    try {
      const logoUrl = '/images/Icone-02.png';
      const res = await fetch(logoUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      const base64: string = await new Promise(resolve => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      this.doc.addImage(base64, 'PNG', 12, 8, 22, 22);
    } catch {}

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyInfo.name, 40, 25);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Licenças Microsoft Originais', 40, 33);

    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PROFORMA', width - 20, 30, { align: 'right' });
  }

  private addInvoiceInfo(order: any): void {
    let yPos = 60;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(11);
    const created = order.created_at ? new Date(order.created_at) : new Date();
    const due = new Date(created);
    due.setDate(due.getDate() + 3);

    const details = [
      ['Nº do Pedido:', `PED-${(order.id || '').substring(0, 8).toUpperCase()}`],
      ['Data de Emissão:', created.toLocaleDateString('pt-PT')],
      ['Data de Vencimento:', due.toLocaleDateString('pt-PT')],
      ['Status:', order.payment_status === 'paid' ? 'PAGO' : 'PENDENTE'],
    ];

    details.forEach(([label, val], idx) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, 20, yPos + idx * 7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(val, 70, yPos + idx * 7);
    });
  }

  /**
   * companyInfo: issuer info
   * clientInfo: from order.client
   * fallbackProfile: from user profile
   */
  private addCompanyClientInfo(
    companyInfo: any,
    clientInfo: any,
    fallbackProfile: any
  ): void {
    const y = 95;
    // Issuer block
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(15, y, 85, 50, 'F');
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('EMITENTE', 20, y + 8);
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(companyInfo.name, 20, y + 16);
    this.doc.text(companyInfo.address, 20, y + 22);
    this.doc.text(`NIF: ${companyInfo.nif}`, 20, y + 28);
    this.doc.text(`Tel: ${companyInfo.phone}`, 20, y + 34);
    this.doc.text(companyInfo.email, 20, y + 40);

    // Client block - fundo cinza claro
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(110, y, 85, 50, 'F');
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('CLIENTE', 115, y + 8);
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    // Name
    const name = clientInfo.name || fallbackProfile.name || 'Cliente';
    this.doc.text(name, 115, y + 16);

    // Address fallback
    const address = clientInfo.address || fallbackProfile.address || '-';
    this.doc.text(address, 115, y + 22);

    // NIF fallback
    const nif = clientInfo.nif || fallbackProfile.nif || '-';
    this.doc.text(`NIF: ${nif}`, 115, y + 28);

    // Phone fallback
    const phone = clientInfo.phone || fallbackProfile.phone || '-';
    this.doc.text(`Tel: ${phone}`, 115, y + 34);

    // Email fallback
    const email = clientInfo.email || fallbackProfile.email || '-';
    this.doc.text(email, 115, y + 40);
  }

  private addItemsTable(items: any[]): void {
    const startY = 155;

    (this.doc as any).autoTable({
      startY,
      head: [['Descrição', 'Qtd', 'Preço Unitário', 'Total']],
      body: items.map(item => [
        item.product?.name || item.productName || '-',
        item.quantity.toString(),
        `${this.formatCurrency(item.price)} AOA`,
        `${this.formatCurrency(item.price * item.quantity)} AOA`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      margin: { top: startY, bottom: 60 },
      didDrawPage: () => {
        this.addPageFooter();
      },
      pageBreak: 'auto',
    });
  }

  private addPaymentInfo(order: any, paymentReference?: any): void {
    let y = (this.doc as any).lastAutoTable.finalY + 10;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INFORMAÇÕES DE PAGAMENTO', 20, y);
    y += 8;

    if (order.payment_method === 'multicaixa_ref' && paymentReference) {
      this.doc.setFillColor(240, 248, 255);
      this.doc.rect(15, y, 180, 60, 'F');
      this.doc.setFontSize(10);
      this.doc.setTextColor(0);
      this.doc.text(`Entidade: ${paymentReference.entity}`, 20, y + 10);
      this.doc.text(`Referência: ${paymentReference.reference}`, 20, y + 18);
      this.doc.text(`Valor: ${this.formatCurrency(paymentReference.amount)} AOA`, 20, y + 26);
      const due = new Date(order.created_at);
      due.setDate(due.getDate() + 3);
      this.doc.text(`Validade: ${due.toISOString().split('T')[0].split('-').reverse().join('/')}`, 20, y + 34);
    }
  }

  private addFooter(): void {
    this.doc.setPage(this.doc.getNumberOfPages());
    this.addPageFooter();
  }

  private addPageFooter(): void {
    const width = this.doc.internal.pageSize.width;
    const height = this.doc.internal.pageSize.height;
    this.doc.setFontSize(10);
    this.doc.setTextColor(100);
    this.doc.text(
      'Este documento não serve como fatura oficial. Após pagamento a fatura certificada será enviada.',
      width / 2,
      height - 15,
      { align: 'center', maxWidth: width - 30 }
    );
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  save(filename: string): void {
    this.doc.save(filename);
  }

  output(): string {
    return this.doc.output('datauristring');
  }
}
