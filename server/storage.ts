import { 
  customers, 
  invoices, 
  invoiceLineItems, 
  quotes, 
  quoteLineItems,
  settings,
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
  type Settings,
  type InsertSettings,
  type InvoiceWithCustomer,
  type QuoteWithCustomer
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getInvoices(): Promise<InvoiceWithCustomer[]> {
    const invoicesResult = await db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id));

    const invoiceLineItemsResult = await db.select().from(invoiceLineItems);

    return invoicesResult.map(row => ({
      ...row.invoices,
      customer: row.customers!,
      lineItems: invoiceLineItemsResult.filter(item => item.invoiceId === row.invoices.id)
    }));
  }

  async getInvoice(id: number): Promise<InvoiceWithCustomer | undefined> {
    const [invoiceResult] = await db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, id));

    if (!invoiceResult) return undefined;

    const lineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id));

    return {
      ...invoiceResult.invoices,
      customer: invoiceResult.customers!,
      lineItems
    };
  }

  async createInvoice(insertInvoice: InsertInvoice, lineItems: InsertInvoiceLineItem[]): Promise<InvoiceWithCustomer> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();

    const insertedLineItems = await db
      .insert(invoiceLineItems)
      .values(lineItems.map((item, index) => ({
        ...item,
        invoiceId: invoice.id,
        sortOrder: item.sortOrder || index
      })))
      .returning();

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, invoice.customerId));

    return {
      ...invoice,
      customer,
      lineItems: insertedLineItems
    };
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>, lineItems?: InsertInvoiceLineItem[]): Promise<InvoiceWithCustomer | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();

    if (!invoice) return undefined;

    if (lineItems) {
      await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));
      await db
        .insert(invoiceLineItems)
        .values(lineItems.map((item, index) => ({
          ...item,
          invoiceId: id,
          sortOrder: item.sortOrder || index
        })));
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, invoice.customerId));

    const updatedLineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id));

    return {
      ...invoice,
      customer,
      lineItems: updatedLineItems
    };
  }

  async deleteInvoice(id: number): Promise<boolean> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getQuotes(): Promise<QuoteWithCustomer[]> {
    const quotesResult = await db
      .select()
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id));

    const quoteLineItemsResult = await db.select().from(quoteLineItems);

    return quotesResult.map(row => ({
      ...row.quotes,
      customer: row.customers!,
      lineItems: quoteLineItemsResult.filter(item => item.quoteId === row.quotes.id)
    }));
  }

  async getQuote(id: number): Promise<QuoteWithCustomer | undefined> {
    const [quoteResult] = await db
      .select()
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .where(eq(quotes.id, id));

    if (!quoteResult) return undefined;

    const lineItems = await db
      .select()
      .from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, id));

    return {
      ...quoteResult.quotes,
      customer: quoteResult.customers!,
      lineItems
    };
  }

  async createQuote(insertQuote: InsertQuote, lineItems: InsertQuoteLineItem[]): Promise<QuoteWithCustomer> {
    const [quote] = await db
      .insert(quotes)
      .values(insertQuote)
      .returning();

    const insertedLineItems = await db
      .insert(quoteLineItems)
      .values(lineItems.map((item, index) => ({
        ...item,
        quoteId: quote.id,
        sortOrder: item.sortOrder || index
      })))
      .returning();

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, quote.customerId));

    return {
      ...quote,
      customer,
      lineItems: insertedLineItems
    };
  }

  async updateQuote(id: number, updates: Partial<InsertQuote>, lineItems?: InsertQuoteLineItem[]): Promise<QuoteWithCustomer | undefined> {
    const [quote] = await db
      .update(quotes)
      .set(updates)
      .where(eq(quotes.id, id))
      .returning();

    if (!quote) return undefined;

    if (lineItems) {
      await db.delete(quoteLineItems).where(eq(quoteLineItems.quoteId, id));
      await db
        .insert(quoteLineItems)
        .values(lineItems.map((item, index) => ({
          ...item,
          quoteId: id,
          sortOrder: item.sortOrder || index
        })));
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, quote.customerId));

    const updatedLineItems = await db
      .select()
      .from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, id));

    return {
      ...quote,
      customer,
      lineItems: updatedLineItems
    };
  }

  async deleteQuote(id: number): Promise<boolean> {
    await db.delete(quoteLineItems).where(eq(quoteLineItems.quoteId, id));
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getStats(): Promise<{
    totalRevenue: number;
    pendingInvoices: number;
    overdue: number;
    activeCustomers: number;
  }> {
    const invoicesData = await db.select().from(invoices);
    const customersData = await db.select().from(customers);
    
    const totalRevenue = invoicesData
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    
    const pendingInvoices = invoicesData.filter(inv => inv.status === 'sent').length;
    const overdue = invoicesData.filter(inv => inv.status === 'overdue').length;
    const activeCustomers = customersData.filter(c => c.status === 'active').length;
    
    return {
      totalRevenue,
      pendingInvoices,
      overdue,
      activeCustomers
    };
  }

  async getSettings(): Promise<Settings> {
    let [settingsRecord] = await db.select().from(settings);
    
    if (!settingsRecord) {
      // Create default settings if none exist
      [settingsRecord] = await db
        .insert(settings)
        .values({
          companyName: "Your Company",
          companyAddress: "",
          companyPhone: "",
          companyEmail: "",
          logoUrl: null,
          logoFileName: null,
          defaultTaxRate: "0",
          paymentTerms: "Net 30",
          invoiceTemplate: "standard",
          quoteTemplate: "standard",
        })
        .returning();
    }
    
    return settingsRecord;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    let [settingsRecord] = await db.select().from(settings);
    
    if (!settingsRecord) {
      // Create new settings if none exist
      [settingsRecord] = await db
        .insert(settings)
        .values({
          companyName: "Your Company",
          companyAddress: "",
          companyPhone: "",
          companyEmail: "",
          logoUrl: null,
          logoFileName: null,
          defaultTaxRate: "0",
          paymentTerms: "Net 30",
          invoiceTemplate: "standard",
          quoteTemplate: "standard",
          ...updates,
        })
        .returning();
    } else {
      // Update existing settings
      [settingsRecord] = await db
        .update(settings)
        .set(updates)
        .where(eq(settings.id, settingsRecord.id))
        .returning();
    }
    
    return settingsRecord;
  }
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
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample customer data
    const sampleCustomers = [
      {
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        address: "123 Oak Street",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        customerType: "residential",
        status: "active",
      },
      {
        name: "ABC Construction Co.",
        email: "info@abcconstruction.com",
        phone: "(555) 987-6543",
        address: "456 Industrial Blvd",
        city: "Springfield",
        state: "IL",
        zipCode: "62702",
        customerType: "commercial",
        status: "active",
      },
      {
        name: "Maria Rodriguez",
        email: "maria.rodriguez@email.com",
        phone: "(555) 456-7890",
        address: "789 Pine Avenue",
        city: "Springfield",
        state: "IL",
        zipCode: "62703",
        customerType: "residential",
        status: "active",
      },
    ];

    sampleCustomers.forEach((customer, index) => {
      this.customers.set(index + 1, {
        id: index + 1,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        customerType: customer.customerType,
        status: customer.status,
      });
    });

    this.currentCustomerId = sampleCustomers.length + 1;

    // Sample invoices
    const sampleInvoices = [
      {
        invoiceNumber: "INV-2024-001",
        customerId: 1,
        projectDescription: "Kitchen Renovation",
        status: "paid",
        subtotal: "4500.00",
        taxRate: "8.25",
        taxAmount: "371.25",
        total: "4871.25",
        issueDate: new Date("2024-01-15"),
        dueDate: new Date("2024-02-15"),
        paidDate: new Date("2024-01-20"),
        notes: "Payment received via check",
        showLineItems: true,
        showLogo: true,
        showPaymentTerms: true,
      },
      {
        invoiceNumber: "INV-2024-002",
        customerId: 2,
        projectDescription: "Office Renovation",
        status: "sent",
        subtotal: "8750.00",
        taxRate: "8.25",
        taxAmount: "721.88",
        total: "9471.88",
        issueDate: new Date("2024-01-20"),
        dueDate: new Date("2024-02-20"),
        paidDate: null,
        notes: "Net 30 payment terms",
        showLineItems: true,
        showLogo: true,
        showPaymentTerms: true,
      },
    ];

    sampleInvoices.forEach((invoice, index) => {
      const id = index + 1;
      this.invoices.set(id, {
        id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        projectDescription: invoice.projectDescription,
        status: invoice.status,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidDate: invoice.paidDate,
        notes: invoice.notes,
        showLineItems: invoice.showLineItems,
        showLogo: invoice.showLogo,
        showPaymentTerms: invoice.showPaymentTerms,
      });
    });

    this.currentInvoiceId = sampleInvoices.length + 1;

    // Sample invoice line items
    const sampleLineItems = [
      [
        { description: "Demolition and cleanup", quantity: "1", rate: "800.00", amount: "800.00", sortOrder: 0 },
        { description: "Cabinet installation", quantity: "1", rate: "2500.00", amount: "2500.00", sortOrder: 1 },
        { description: "Countertop installation", quantity: "1", rate: "1200.00", amount: "1200.00", sortOrder: 2 },
      ],
      [
        { description: "Flooring installation", quantity: "500", rate: "8.50", amount: "4250.00", sortOrder: 0 },
        { description: "Electrical work", quantity: "1", rate: "2000.00", amount: "2000.00", sortOrder: 1 },
        { description: "Painting", quantity: "1", rate: "2500.00", amount: "2500.00", sortOrder: 2 },
      ],
    ];

    sampleLineItems.forEach((lineItems, invoiceIndex) => {
      const invoiceId = invoiceIndex + 1;
      const processedLineItems = lineItems.map((item) => ({
        id: this.currentLineItemId++,
        invoiceId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sortOrder: item.sortOrder,
      }));
      this.invoiceLineItems.set(invoiceId, processedLineItems);
    });

    // Sample quotes
    const sampleQuotes = [
      {
        quoteNumber: "QUO-2024-001",
        customerId: 1,
        projectDescription: "Deck Construction",
        status: "sent",
        subtotal: "6500.00",
        taxRate: "8.25",
        taxAmount: "536.25",
        total: "7036.25",
        issueDate: new Date("2024-01-10"),
        validUntil: new Date("2024-02-10"),
        acceptedDate: null,
        notes: "Quote includes all materials and labor",
      },
      {
        quoteNumber: "QUO-2024-002",
        customerId: 2,
        projectDescription: "Warehouse Expansion",
        status: "accepted",
        subtotal: "25000.00",
        taxRate: "8.25",
        taxAmount: "2062.50",
        total: "27062.50",
        issueDate: new Date("2024-01-05"),
        validUntil: new Date("2024-02-05"),
        acceptedDate: new Date("2024-01-18"),
        notes: "Project to begin February 1st",
      },
    ];

    sampleQuotes.forEach((quote, index) => {
      const id = index + 1;
      this.quotes.set(id, {
        id,
        quoteNumber: quote.quoteNumber,
        customerId: quote.customerId,
        projectDescription: quote.projectDescription,
        status: quote.status,
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: quote.total,
        issueDate: quote.issueDate,
        validUntil: quote.validUntil,
        acceptedDate: quote.acceptedDate,
        notes: quote.notes,
      });
    });

    this.currentQuoteId = sampleQuotes.length + 1;

    // Sample quote line items
    const sampleQuoteLineItems = [
      [
        { description: "Deck framing", quantity: "1", rate: "3000.00", amount: "3000.00", sortOrder: 0 },
        { description: "Decking material", quantity: "1", rate: "2500.00", amount: "2500.00", sortOrder: 1 },
        { description: "Railing installation", quantity: "1", rate: "1000.00", amount: "1000.00", sortOrder: 2 },
      ],
      [
        { description: "Foundation work", quantity: "1", rate: "12000.00", amount: "12000.00", sortOrder: 0 },
        { description: "Steel framework", quantity: "1", rate: "8000.00", amount: "8000.00", sortOrder: 1 },
        { description: "Roofing", quantity: "1", rate: "5000.00", amount: "5000.00", sortOrder: 2 },
      ],
    ];

    sampleQuoteLineItems.forEach((lineItems, quoteIndex) => {
      const quoteId = quoteIndex + 1;
      const processedLineItems = lineItems.map((item) => ({
        id: this.currentLineItemId++,
        quoteId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sortOrder: item.sortOrder,
      }));
      this.quoteLineItems.set(quoteId, processedLineItems);
    });
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
      name: insertCustomer.name,
      email: insertCustomer.email || null,
      phone: insertCustomer.phone || null,
      address: insertCustomer.address || null,
      city: insertCustomer.city || null,
      state: insertCustomer.state || null,
      zipCode: insertCustomer.zipCode || null,
      customerType: insertCustomer.customerType || "residential",
      status: insertCustomer.status || "active",
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
      invoiceNumber: insertInvoice.invoiceNumber,
      customerId: insertInvoice.customerId,
      projectDescription: insertInvoice.projectDescription || null,
      status: insertInvoice.status || "draft",
      subtotal: insertInvoice.subtotal,
      taxRate: insertInvoice.taxRate || "0",
      taxAmount: insertInvoice.taxAmount || "0",
      total: insertInvoice.total,
      dueDate: insertInvoice.dueDate || null,
      issueDate: insertInvoice.issueDate,
      paidDate: insertInvoice.paidDate || null,
      notes: insertInvoice.notes || null,
      showLineItems: insertInvoice.showLineItems ?? true,
      showLogo: insertInvoice.showLogo ?? true,
      showPaymentTerms: insertInvoice.showPaymentTerms ?? true,
    };
    
    this.invoices.set(invoice.id, invoice);
    
    const processedLineItems = lineItems.map(item => ({
      id: this.currentLineItemId++,
      invoiceId: invoice.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      sortOrder: item.sortOrder || 0,
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
        id: this.currentLineItemId++,
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sortOrder: item.sortOrder || 0,
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
      quoteNumber: insertQuote.quoteNumber,
      customerId: insertQuote.customerId,
      projectDescription: insertQuote.projectDescription || null,
      status: insertQuote.status || "draft",
      subtotal: insertQuote.subtotal,
      taxRate: insertQuote.taxRate || "0",
      taxAmount: insertQuote.taxAmount || "0",
      total: insertQuote.total,
      validUntil: insertQuote.validUntil || null,
      issueDate: insertQuote.issueDate,
      acceptedDate: insertQuote.acceptedDate || null,
      notes: insertQuote.notes || null,
    };
    
    this.quotes.set(quote.id, quote);
    
    const processedLineItems = lineItems.map(item => ({
      id: this.currentLineItemId++,
      quoteId: quote.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      sortOrder: item.sortOrder || 0,
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
        id: this.currentLineItemId++,
        quoteId: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sortOrder: item.sortOrder || 0,
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

  async getSettings(): Promise<Settings> {
    // Mock settings for MemStorage
    return {
      id: 1,
      companyName: "Your Company",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      logoUrl: null,
      logoFileName: null,
      defaultTaxRate: "0",
      paymentTerms: "Net 30",
      invoiceTemplate: "standard",
      quoteTemplate: "standard",
    };
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    // Mock update for MemStorage
    return {
      id: 1,
      companyName: "Your Company",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      logoUrl: null,
      logoFileName: null,
      defaultTaxRate: "0",
      paymentTerms: "Net 30",
      invoiceTemplate: "standard",
      quoteTemplate: "standard",
      ...updates,
    };
  }
}

export const storage = new DatabaseStorage();
