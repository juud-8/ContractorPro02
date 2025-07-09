import { 
  customers, 
  invoices, 
  invoiceLineItems, 
  quotes, 
  quoteLineItems,
  type Customer, 
  type InsertCustomer, 
  type Invoice, 
  type InsertInvoice,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  type Quote,
  type InsertQuote,
  type QuoteLineItem,
  type InsertQuoteLineItem,
  type InvoiceWithCustomer,
  type QuoteWithCustomer
} from "@shared/schema";

export interface IStorage {
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Invoice operations
  getInvoices(): Promise<InvoiceWithCustomer[]>;
  getInvoice(id: number): Promise<InvoiceWithCustomer | undefined>;
  createInvoice(invoice: InsertInvoice, lineItems: InsertInvoiceLineItem[]): Promise<InvoiceWithCustomer>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>, lineItems?: InsertInvoiceLineItem[]): Promise<InvoiceWithCustomer | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Quote operations
  getQuotes(): Promise<QuoteWithCustomer[]>;
  getQuote(id: number): Promise<QuoteWithCustomer | undefined>;
  createQuote(quote: InsertQuote, lineItems: InsertQuoteLineItem[]): Promise<QuoteWithCustomer>;
  updateQuote(id: number, quote: Partial<InsertQuote>, lineItems?: InsertQuoteLineItem[]): Promise<QuoteWithCustomer | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Stats operations
  getStats(): Promise<{
    totalRevenue: number;
    pendingInvoices: number;
    overdue: number;
    activeCustomers: number;
  }>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer> = new Map();
  private invoices: Map<number, Invoice> = new Map();
  private invoiceLineItems: Map<number, InvoiceLineItem[]> = new Map();
  private quotes: Map<number, Quote> = new Map();
  private quoteLineItems: Map<number, QuoteLineItem[]> = new Map();
  private currentCustomerId = 1;
  private currentInvoiceId = 1;
  private currentQuoteId = 1;
  private currentLineItemId = 1;

  constructor() {
    // Initialize with empty data
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer: Customer = {
      id: this.currentCustomerId++,
      ...insertCustomer,
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  async getInvoices(): Promise<InvoiceWithCustomer[]> {
    const invoicesArray = Array.from(this.invoices.values());
    return invoicesArray.map(invoice => ({
      ...invoice,
      customer: this.customers.get(invoice.customerId)!,
      lineItems: this.invoiceLineItems.get(invoice.id) || []
    }));
  }

  async getInvoice(id: number): Promise<InvoiceWithCustomer | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    return {
      ...invoice,
      customer: this.customers.get(invoice.customerId)!,
      lineItems: this.invoiceLineItems.get(invoice.id) || []
    };
  }

  async createInvoice(insertInvoice: InsertInvoice, lineItems: InsertInvoiceLineItem[]): Promise<InvoiceWithCustomer> {
    const invoice: Invoice = {
      id: this.currentInvoiceId++,
      ...insertInvoice,
    };
    
    this.invoices.set(invoice.id, invoice);
    
    const processedLineItems = lineItems.map(item => ({
      ...item,
      id: this.currentLineItemId++,
      invoiceId: invoice.id,
    }));
    
    this.invoiceLineItems.set(invoice.id, processedLineItems);
    
    return {
      ...invoice,
      customer: this.customers.get(invoice.customerId)!,
      lineItems: processedLineItems
    };
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>, lineItems?: InsertInvoiceLineItem[]): Promise<InvoiceWithCustomer | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...updates };
    this.invoices.set(id, updatedInvoice);
    
    if (lineItems) {
      const processedLineItems = lineItems.map(item => ({
        ...item,
        id: this.currentLineItemId++,
        invoiceId: id,
      }));
      this.invoiceLineItems.set(id, processedLineItems);
    }
    
    return {
      ...updatedInvoice,
      customer: this.customers.get(updatedInvoice.customerId)!,
      lineItems: this.invoiceLineItems.get(id) || []
    };
  }

  async deleteInvoice(id: number): Promise<boolean> {
    this.invoiceLineItems.delete(id);
    return this.invoices.delete(id);
  }

  async getQuotes(): Promise<QuoteWithCustomer[]> {
    const quotesArray = Array.from(this.quotes.values());
    return quotesArray.map(quote => ({
      ...quote,
      customer: this.customers.get(quote.customerId)!,
      lineItems: this.quoteLineItems.get(quote.id) || []
    }));
  }

  async getQuote(id: number): Promise<QuoteWithCustomer | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    return {
      ...quote,
      customer: this.customers.get(quote.customerId)!,
      lineItems: this.quoteLineItems.get(quote.id) || []
    };
  }

  async createQuote(insertQuote: InsertQuote, lineItems: InsertQuoteLineItem[]): Promise<QuoteWithCustomer> {
    const quote: Quote = {
      id: this.currentQuoteId++,
      ...insertQuote,
    };
    
    this.quotes.set(quote.id, quote);
    
    const processedLineItems = lineItems.map(item => ({
      ...item,
      id: this.currentLineItemId++,
      quoteId: quote.id,
    }));
    
    this.quoteLineItems.set(quote.id, processedLineItems);
    
    return {
      ...quote,
      customer: this.customers.get(quote.customerId)!,
      lineItems: processedLineItems
    };
  }

  async updateQuote(id: number, updates: Partial<InsertQuote>, lineItems?: InsertQuoteLineItem[]): Promise<QuoteWithCustomer | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const updatedQuote = { ...quote, ...updates };
    this.quotes.set(id, updatedQuote);
    
    if (lineItems) {
      const processedLineItems = lineItems.map(item => ({
        ...item,
        id: this.currentLineItemId++,
        quoteId: id,
      }));
      this.quoteLineItems.set(id, processedLineItems);
    }
    
    return {
      ...updatedQuote,
      customer: this.customers.get(updatedQuote.customerId)!,
      lineItems: this.quoteLineItems.get(id) || []
    };
  }

  async deleteQuote(id: number): Promise<boolean> {
    this.quoteLineItems.delete(id);
    return this.quotes.delete(id);
  }

  async getStats(): Promise<{
    totalRevenue: number;
    pendingInvoices: number;
    overdue: number;
    activeCustomers: number;
  }> {
    const invoicesArray = Array.from(this.invoices.values());
    const customersArray = Array.from(this.customers.values());
    
    const totalRevenue = invoicesArray
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    
    const pendingInvoices = invoicesArray.filter(inv => inv.status === 'sent').length;
    const overdue = invoicesArray.filter(inv => inv.status === 'overdue').length;
    const activeCustomers = customersArray.filter(c => c.status === 'active').length;
    
    return {
      totalRevenue,
      pendingInvoices,
      overdue,
      activeCustomers
    };
  }
}

export const storage = new MemStorage();
