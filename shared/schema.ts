import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  customerType: text("customer_type").notNull().default("residential"), // residential, commercial
  status: text("status").notNull().default("active"), // active, inactive
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  projectDescription: text("project_description"),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  issueDate: timestamp("issue_date").notNull(),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  // Customization options
  showLineItems: boolean("show_line_items").notNull().default(true),
  showLogo: boolean("show_logo").notNull().default(true),
  showPaymentTerms: boolean("show_payment_terms").notNull().default(true),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  projectDescription: text("project_description"),
  status: text("status").notNull().default("draft"), // draft, sent, accepted, rejected, expired
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  validUntil: timestamp("valid_until"),
  issueDate: timestamp("issue_date").notNull(),
  acceptedDate: timestamp("accepted_date"),
  notes: text("notes"),
});

export const quoteLineItems = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotes.id).notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  relatedId: integer("related_id"), // ID of related invoice/quote/customer
  relatedType: text("related_type"), // invoice, quote, customer
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("Your Company"),
  companyAddress: text("company_address").default(""),
  companyPhone: text("company_phone").default(""),
  companyEmail: text("company_email").default(""),
  companyWebsite: text("company_website").default(""),
  logoUrl: text("logo_url"),
  logoFileName: text("logo_file_name"),
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  paymentTerms: text("payment_terms").default("Net 30"),
  invoiceTemplate: text("invoice_template").notNull().default("standard"),
  quoteTemplate: text("quote_template").notNull().default("standard"),
  currency: text("currency").default("USD"),
  dateFormat: text("date_format").default("MM/DD/YYYY"),
  timeZone: text("time_zone").default("America/New_York"),
  autoGenerateNumbers: boolean("auto_generate_numbers").default(true),
  invoicePrefix: text("invoice_prefix").default("INV"),
  quotePrefix: text("quote_prefix").default("QUO"),
  nextInvoiceNumber: integer("next_invoice_number").default(1),
  nextQuoteNumber: integer("next_quote_number").default(1),
  brandColor: text("brand_color").default("#2563eb"),
  accentColor: text("accent_color").default("#10b981"),
  showLineItemTotals: boolean("show_line_item_totals").default(true),
  requireProjectDescription: boolean("require_project_description").default(false),
  defaultPaymentMethod: text("default_payment_method").default("Check"),
  bankName: text("bank_name").default(""),
  accountNumber: text("account_number").default(""),
  routingNumber: text("routing_number").default(""),
  emailSignature: text("email_signature").default(""),
  invoiceFooter: text("invoice_footer").default(""),
  quoteFooter: text("quote_footer").default(""),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, check, card, bank_transfer, paypal
  paymentDate: timestamp("payment_date").notNull(),
  reference: text("reference"), // check number, transaction ID, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  category: text("category").notNull(), // materials, labor, travel, equipment, etc.
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  receipt: text("receipt"), // file path or URL
  billable: boolean("billable").default(true),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  projectDescription: text("project_description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  billable: boolean("billable").default(true),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending, in_progress, completed, cancelled
  priority: text("priority").default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  assignedTo: text("assigned_to"), // team member name or ID
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true });
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({ id: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true });
export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Extended types for API responses
export type InvoiceWithCustomer = Invoice & {
  customer: Customer;
  lineItems: InvoiceLineItem[];
};

export type QuoteWithCustomer = Quote & {
  customer: Customer;
  lineItems: QuoteLineItem[];
};

export type InvoiceWithPayments = Invoice & {
  customer: Customer;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
};

export type ExpenseWithCustomer = Expense & {
  customer?: Customer;
};

export type TimeEntryWithCustomer = TimeEntry & {
  customer?: Customer;
};

export type TaskWithCustomer = Task & {
  customer?: Customer;
};

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
  quotes: many(quotes),
  expenses: many(expenses),
  timeEntries: many(timeEntries),
  tasks: many(tasks),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
  expenses: many(expenses),
  timeEntries: many(timeEntries),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  lineItems: many(quoteLineItems),
}));

export const quoteLineItemsRelations = relations(quoteLineItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLineItems.quoteId],
    references: [quotes.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  customer: one(customers, {
    fields: [expenses.customerId],
    references: [customers.id],
  }),
  invoice: one(invoices, {
    fields: [expenses.invoiceId],
    references: [invoices.id],
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  customer: one(customers, {
    fields: [timeEntries.customerId],
    references: [customers.id],
  }),
  invoice: one(invoices, {
    fields: [timeEntries.invoiceId],
    references: [invoices.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  customer: one(customers, {
    fields: [tasks.customerId],
    references: [customers.id],
  }),
}));

export const settingsRelations = relations(settings, ({ }) => ({}));
