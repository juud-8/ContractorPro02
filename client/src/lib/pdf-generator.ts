import jsPDF from 'jspdf';
import { Customer, Settings } from '@shared/schema';

interface InvoiceData {
  invoiceNumber: string;
  customer: Customer;
  projectDescription: string;
  issueDate: string;
  dueDate?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  showLineItems: boolean;
  showLogo: boolean;
  showPaymentTerms: boolean;
  settings?: Settings;
}

interface QuoteData {
  quoteNumber: string;
  customer: Customer;
  projectDescription: string;
  issueDate: string;
  validUntil?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  settings?: Settings;
}

export function generateInvoicePDF(invoiceData: InvoiceData) {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Company header
  if (invoiceData.showLogo) {
    doc.setFillColor(33, 150, 243); // Blue color
    doc.rect(20, 20, 15, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(invoiceData.settings?.companyName?.charAt(0) || 'C', 25, 30);
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(invoiceData.settings?.companyName || 'Your Company', 20, 45);
  doc.setFontSize(10);
  doc.text(invoiceData.settings?.companyAddress || '123 Main Street', 20, 52);
  if (invoiceData.settings?.companyPhone) {
    doc.text(invoiceData.settings.companyPhone, 20, 58);
  }
  if (invoiceData.settings?.companyEmail) {
    doc.text(invoiceData.settings.companyEmail, 20, 64);
  }
  
  // Invoice title and number
  doc.setFontSize(20);
  doc.text('INVOICE', 150, 30);
  doc.setFontSize(12);
  doc.text(invoiceData.invoiceNumber, 150, 40);
  doc.text(new Date(invoiceData.issueDate).toLocaleDateString(), 150, 48);
  
  // Customer information
  doc.setFontSize(12);
  doc.text('Bill To:', 20, 85);
  doc.text(invoiceData.customer.name, 20, 95);
  if (invoiceData.customer.address) {
    doc.text(invoiceData.customer.address, 20, 105);
  }
  if (invoiceData.customer.city && invoiceData.customer.state) {
    doc.text(`${invoiceData.customer.city}, ${invoiceData.customer.state} ${invoiceData.customer.zipCode || ''}`, 20, 115);
  }
  
  // Project description
  if (invoiceData.projectDescription) {
    doc.text(`Project: ${invoiceData.projectDescription}`, 20, 135);
  }
  
  let yPosition = 155;
  
  // Line items table
  if (invoiceData.showLineItems && invoiceData.lineItems.length > 0) {
    doc.setFontSize(10);
    doc.text('Description', 20, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Rate', 140, yPosition);
    doc.text('Amount', 170, yPosition);
    
    yPosition += 10;
    doc.line(20, yPosition - 5, 190, yPosition - 5);
    
    invoiceData.lineItems.forEach((item) => {
      doc.text(item.description, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`$${item.rate.toFixed(2)}`, 140, yPosition);
      doc.text(`$${item.amount.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    yPosition += 10;
  }
  
  // Totals
  doc.line(120, yPosition - 5, 190, yPosition - 5);
  doc.text('Subtotal:', 120, yPosition);
  doc.text(`$${invoiceData.subtotal.toFixed(2)}`, 170, yPosition);
  yPosition += 10;
  
  if (invoiceData.taxRate > 0) {
    doc.text(`Tax (${invoiceData.taxRate}%):`, 120, yPosition);
    doc.text(`$${invoiceData.taxAmount.toFixed(2)}`, 170, yPosition);
    yPosition += 10;
  }
  
  doc.setFontSize(12);
  doc.text('Total:', 120, yPosition);
  doc.text(`$${invoiceData.total.toFixed(2)}`, 170, yPosition);
  
  // Notes
  if (invoiceData.notes) {
    yPosition += 20;
    doc.setFontSize(10);
    doc.text('Notes:', 20, yPosition);
    doc.text(invoiceData.notes, 20, yPosition + 10);
  }
  
  // Payment terms
  if (invoiceData.showPaymentTerms) {
    yPosition += 30;
    doc.setFontSize(9);
    doc.text('Payment Terms: Net 30 days', 20, yPosition);
  }
  
  // Save the PDF
  doc.save(`${invoiceData.invoiceNumber}.pdf`);
}

export function generateQuotePDF(quoteData: QuoteData) {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Company header
  doc.setFillColor(33, 150, 243); // Blue color
  doc.rect(20, 20, 15, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(quoteData.settings?.companyName?.charAt(0) || 'C', 25, 30);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(quoteData.settings?.companyName || 'Your Company', 20, 45);
  doc.setFontSize(10);
  doc.text(quoteData.settings?.companyAddress || '123 Main Street', 20, 52);
  if (quoteData.settings?.companyPhone) {
    doc.text(quoteData.settings.companyPhone, 20, 58);
  }
  if (quoteData.settings?.companyEmail) {
    doc.text(quoteData.settings.companyEmail, 20, 64);
  }
  
  // Quote title and number
  doc.setFontSize(20);
  doc.text('QUOTE', 150, 30);
  doc.setFontSize(12);
  doc.text(quoteData.quoteNumber, 150, 40);
  doc.text(new Date(quoteData.issueDate).toLocaleDateString(), 150, 48);
  if (quoteData.validUntil) {
    doc.setFontSize(10);
    doc.text(`Valid until: ${new Date(quoteData.validUntil).toLocaleDateString()}`, 150, 56);
  }
  
  // Customer information
  doc.setFontSize(12);
  doc.text('Quote For:', 20, 85);
  doc.text(quoteData.customer.name, 20, 95);
  if (quoteData.customer.address) {
    doc.text(quoteData.customer.address, 20, 105);
  }
  if (quoteData.customer.city && quoteData.customer.state) {
    doc.text(`${quoteData.customer.city}, ${quoteData.customer.state} ${quoteData.customer.zipCode || ''}`, 20, 115);
  }
  
  // Project description
  if (quoteData.projectDescription) {
    doc.text(`Project: ${quoteData.projectDescription}`, 20, 135);
  }
  
  let yPosition = 155;
  
  // Line items table
  if (quoteData.lineItems.length > 0) {
    doc.setFontSize(10);
    doc.text('Description', 20, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Rate', 140, yPosition);
    doc.text('Amount', 170, yPosition);
    
    yPosition += 10;
    doc.line(20, yPosition - 5, 190, yPosition - 5);
    
    quoteData.lineItems.forEach((item) => {
      doc.text(item.description, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`$${item.rate.toFixed(2)}`, 140, yPosition);
      doc.text(`$${item.amount.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    yPosition += 10;
  }
  
  // Totals
  doc.line(120, yPosition - 5, 190, yPosition - 5);
  doc.text('Subtotal:', 120, yPosition);
  doc.text(`$${quoteData.subtotal.toFixed(2)}`, 170, yPosition);
  yPosition += 10;
  
  if (quoteData.taxRate > 0) {
    doc.text(`Tax (${quoteData.taxRate}%):`, 120, yPosition);
    doc.text(`$${quoteData.taxAmount.toFixed(2)}`, 170, yPosition);
    yPosition += 10;
  }
  
  doc.setFontSize(12);
  doc.text('Total:', 120, yPosition);
  doc.text(`$${quoteData.total.toFixed(2)}`, 170, yPosition);
  
  // Notes
  if (quoteData.notes) {
    yPosition += 20;
    doc.setFontSize(10);
    doc.text('Notes:', 20, yPosition);
    doc.text(quoteData.notes, 20, yPosition + 10);
  }
  
  // Quote validity
  yPosition += 30;
  doc.setFontSize(9);
  const validityText = quoteData.validUntil 
    ? `This quote is valid until ${new Date(quoteData.validUntil).toLocaleDateString()}`
    : 'This quote is valid for 30 days from issue date';
  doc.text(validityText, 20, yPosition);
  
  // Save the PDF
  doc.save(`${quoteData.quoteNumber}.pdf`);
}
