import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  paymentMethod: text("payment_method").notNull(), // cash, check, card, bank_transfer, paypal, stripe
  paymentDate: timestamp("payment_date").notNull(),
  reference: text("reference"), // check number, transaction ID, etc.
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Stripe Payment Intent ID
  stripeChargeId: text("stripe_charge_id"), // Stripe Charge ID
  stripeStatus: text("stripe_status"), // succeeded, pending, failed, canceled
  stripeCustomerId: text("stripe_customer_id"), // Stripe Customer ID
  stripeFeeAmount: decimal("stripe_fee_amount", { precision: 10, scale: 2 }), // Stripe processing fee
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

// Team management tables
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").notNull().references(() => users.id),
  settings: text("settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner, admin, member, viewer
  permissions: text("permissions").default("{}"),
  joinedAt: timestamp("joined_at").defaultNow(),
  status: text("status").default("active"), // active, inactive, pending
});

export const teamInvitations = pgTable("team_invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  invitedBy: text("invited_by").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  status: text("status").default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
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
  assignedTo: text("assigned_to").references(() => users.id),
  createdBy: text("created_by").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
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
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, joinedAt: true });
export const insertTeamInvitationSchema = createInsertSchema(teamInvitations).omit({ id: true, createdAt: true });

// User schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;

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
  assignedUser?: User;
  createdByUser?: User;
  team?: Team;
};

export type TeamWithMembers = Team & {
  members: (TeamMember & { user: User })[];
  owner: User;
};

export type TeamMemberWithUser = TeamMember & {
  user: User;
  team: Team;
};

// Parts/Items
export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }).default("each"), // each, box, hour, etc.
  inStock: integer("in_stock").default(0),
  minimumStock: integer("minimum_stock").default(0),
  taxable: boolean("taxable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPartSchema = createInsertSchema(parts).omit({ id: true, createdAt: true, updatedAt: true });
export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;

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

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  invitations: many(teamInvitations),
  tasks: many(tasks),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const teamInvitationsRelations = relations(teamInvitations, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvitations.teamId],
    references: [teams.id],
  }),
  invitedByUser: one(users, {
    fields: [teamInvitations.invitedBy],
    references: [users.id],
  }),
}));
