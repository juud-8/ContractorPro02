import { 
  customers, 
  invoices, 
  invoiceLineItems, 
  quotes, 
  quoteLineItems,
  settings,
  payments,
  expenses,
  timeEntries,
  tasks,
  notifications,
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
  type Payment,
  type InsertPayment,
  type Expense,
  type InsertExpense,
  type TimeEntry,
  type InsertTimeEntry,
  type Task,
  type InsertTask,
  type Notification,
  type InsertNotification,
  type InvoiceWithCustomer,
  type QuoteWithCustomer,
  type ExpenseWithCustomer,
  type TimeEntryWithCustomer,
  type TaskWithCustomer,
  teams,
  teamMembers,
  teamInvitations,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember,
  type TeamInvitation,
  type InsertTeamInvitation,
  type TeamWithMembers,
  type TeamMemberWithUser,
  parts,
  type Part,
  type InsertPart,
  recurringPayments,
  type RecurringPayment,
  type InsertRecurringPayment,
  type RecurringPaymentWithCustomer,
  paymentPlans,
  type PaymentPlan,
  type InsertPaymentPlan,
  type PaymentPlanWithDetails,
  paymentPlanInstallments,
  type PaymentPlanInstallment,
  type InsertPaymentPlanInstallment,
  type PaymentPlanInstallmentWithPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lt, lte } from "drizzle-orm";

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

  // Payment operations
  getPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  deletePayment(id: number): Promise<boolean>;

  // Expense operations
  getExpenses(): Promise<ExpenseWithCustomer[]>;
  createExpense(expense: InsertExpense): Promise<ExpenseWithCustomer>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithCustomer | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Time entry operations
  getTimeEntries(): Promise<TimeEntryWithCustomer[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntryWithCustomer>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntryWithCustomer | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;

  // Task operations
  getTasks(): Promise<TaskWithCustomer[]>;
  createTask(task: InsertTask): Promise<TaskWithCustomer>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<TaskWithCustomer | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Notification operations
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;

  // Team management operations
  getTeams(): Promise<TeamWithMembers[]>;
  getTeam(id: number): Promise<TeamWithMembers | undefined>;
  createTeam(team: InsertTeam): Promise<TeamWithMembers>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<TeamWithMembers | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMemberWithUser>;
  removeTeamMember(teamId: number, userId: string): Promise<boolean>;
  updateTeamMemberRole(teamId: number, userId: string, role: string): Promise<boolean>;
  getTeamInvitations(teamId: number): Promise<TeamInvitation[]>;
  createTeamInvitation(invitation: InsertTeamInvitation): Promise<TeamInvitation>;
  acceptTeamInvitation(token: string): Promise<boolean>;
  deleteTeamInvitation(id: number): Promise<boolean>;
  
  // Team permissions
  checkTeamPermission(teamId: number, userId: string, permission: string): Promise<boolean>;
  updateTeamMemberPermissions(teamId: number, userId: string, permissions: string): Promise<boolean>;
  
  // Parts operations
  getParts(): Promise<Part[]>;
  getPart(id: number): Promise<Part | undefined>;
  createPart(part: InsertPart): Promise<Part>;
  updatePart(id: number, part: Partial<InsertPart>): Promise<Part | undefined>;
  deletePart(id: number): Promise<boolean>;
  searchParts(query: string): Promise<Part[]>;

  // Recurring payment operations
  getRecurringPayments(): Promise<RecurringPaymentWithCustomer[]>;
  getRecurringPayment(id: number): Promise<RecurringPaymentWithCustomer | undefined>;
  createRecurringPayment(recurringPayment: InsertRecurringPayment): Promise<RecurringPaymentWithCustomer>;
  updateRecurringPayment(id: number, recurringPayment: Partial<InsertRecurringPayment>): Promise<RecurringPaymentWithCustomer | undefined>;
  deleteRecurringPayment(id: number): Promise<boolean>;
  processRecurringPayments(): Promise<number>; // Returns number of payments processed

  // Payment plan operations
  getPaymentPlans(): Promise<PaymentPlanWithDetails[]>;
  getPaymentPlan(id: number): Promise<PaymentPlanWithDetails | undefined>;
  createPaymentPlan(paymentPlan: InsertPaymentPlan, installments: InsertPaymentPlanInstallment[]): Promise<PaymentPlanWithDetails>;
  updatePaymentPlan(id: number, paymentPlan: Partial<InsertPaymentPlan>): Promise<PaymentPlanWithDetails | undefined>;
  deletePaymentPlan(id: number): Promise<boolean>;
  getPaymentPlanByInvoice(invoiceId: number): Promise<PaymentPlanWithDetails | undefined>;
  processPaymentPlanInstallment(installmentId: number, paymentIntentId: string): Promise<boolean>;
  getOverdueInstallments(): Promise<PaymentPlanInstallmentWithPayment[]>;
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

  // Payment operations
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async deletePayment(id: number): Promise<boolean> {
    const result = await db
      .delete(payments)
      .where(eq(payments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Expense operations
  async getExpenses(): Promise<ExpenseWithCustomer[]> {
    const result = await db.query.expenses.findMany({
      with: {
        customer: true,
      },
    });
    return result.map(expense => ({
      ...expense,
      customer: expense.customer || undefined,
    }));
  }

  async createExpense(insertExpense: InsertExpense): Promise<ExpenseWithCustomer> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    
    const result = await db.query.expenses.findFirst({
      where: eq(expenses.id, expense.id),
      with: {
        customer: true,
      },
    });
    
    return {
      ...result!,
      customer: result!.customer || undefined,
    };
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<ExpenseWithCustomer | undefined> {
    const [updated] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    const result = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
      with: {
        customer: true,
      },
    });
    
    if (!result) return undefined;
    
    return {
      ...result,
      customer: result.customer || undefined,
    };
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(eq(expenses.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Time entry operations
  async getTimeEntries(): Promise<TimeEntryWithCustomer[]> {
    const result = await db.query.timeEntries.findMany({
      with: {
        customer: true,
      },
    });
    return result.map(entry => ({
      ...entry,
      customer: entry.customer || undefined,
    }));
  }

  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntryWithCustomer> {
    const [timeEntry] = await db
      .insert(timeEntries)
      .values(insertTimeEntry)
      .returning();
    
    const result = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, timeEntry.id),
      with: {
        customer: true,
      },
    });
    
    return {
      ...result!,
      customer: result!.customer || undefined,
    };
  }

  async updateTimeEntry(id: number, updates: Partial<InsertTimeEntry>): Promise<TimeEntryWithCustomer | undefined> {
    const [updated] = await db
      .update(timeEntries)
      .set(updates)
      .where(eq(timeEntries.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    const result = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, id),
      with: {
        customer: true,
      },
    });
    
    if (!result) return undefined;
    
    return {
      ...result,
      customer: result.customer || undefined,
    };
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(timeEntries)
      .where(eq(timeEntries.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Task operations
  async getTasks(): Promise<TaskWithCustomer[]> {
    const result = await db.query.tasks.findMany({
      with: {
        customer: true,
      },
    });
    return result.map(task => ({
      ...task,
      customer: task.customer || undefined,
      assignedUser: undefined,
      createdByUser: undefined,
      team: undefined,
    }));
  }

  async createTask(insertTask: InsertTask): Promise<TaskWithCustomer> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    
    const result = await db.query.tasks.findFirst({
      where: eq(tasks.id, task.id),
      with: {
        customer: true,
      },
    });
    
    return {
      ...result!,
      customer: result!.customer || undefined,
      assignedUser: undefined,
      createdByUser: undefined,
      team: undefined,
    };
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<TaskWithCustomer | undefined> {
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    const result = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        customer: true,
      },
    });
    
    if (!result) return undefined;
    
    return {
      ...result,
      customer: result.customer || undefined,
      assignedUser: undefined,
      createdByUser: undefined,
      team: undefined,
    };
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async markAllNotificationsAsRead(): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.isRead, false));
    return (result.rowCount || 0) > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Team management operations
  async getTeams(): Promise<TeamWithMembers[]> {
    const result = await db.query.teams.findMany({
      with: {
        members: {
          with: {
            user: true,
          },
        },
        owner: true,
      },
    });
    return result;
  }

  async getTeam(id: number): Promise<TeamWithMembers | undefined> {
    const result = await db.query.teams.findFirst({
      where: eq(teams.id, id),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        owner: true,
      },
    });
    return result;
  }

  async createTeam(insertTeam: InsertTeam): Promise<TeamWithMembers> {
    const [team] = await db
      .insert(teams)
      .values(insertTeam)
      .returning();
    
    // Add the owner as a team member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: insertTeam.ownerId,
      role: "owner",
      status: "active",
    });

    const result = await db.query.teams.findFirst({
      where: eq(teams.id, team.id),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        owner: true,
      },
    });
    
    return result!;
  }

  async updateTeam(id: number, updates: Partial<InsertTeam>): Promise<TeamWithMembers | undefined> {
    const [updated] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    const result = await db.query.teams.findFirst({
      where: eq(teams.id, id),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        owner: true,
      },
    });
    
    return result;
  }

  async deleteTeam(id: number): Promise<boolean> {
    const result = await db
      .delete(teams)
      .where(eq(teams.id, id));
    return (result.rowCount || 0) > 0;
  }

  async addTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMemberWithUser> {
    const [member] = await db
      .insert(teamMembers)
      .values(insertTeamMember)
      .returning();
    
    const result = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.id, member.id),
      with: {
        user: true,
        team: true,
      },
    });
    
    return result!;
  }

  async removeTeamMember(teamId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async updateTeamMemberRole(teamId: number, userId: string, role: string): Promise<boolean> {
    const result = await db
      .update(teamMembers)
      .set({ role })
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getTeamInvitations(teamId: number): Promise<TeamInvitation[]> {
    return await db.select().from(teamInvitations).where(eq(teamInvitations.teamId, teamId));
  }

  async createTeamInvitation(insertInvitation: InsertTeamInvitation): Promise<TeamInvitation> {
    const [invitation] = await db
      .insert(teamInvitations)
      .values(insertInvitation)
      .returning();
    return invitation;
  }

  async acceptTeamInvitation(token: string): Promise<boolean> {
    const invitation = await db.query.teamInvitations.findFirst({
      where: eq(teamInvitations.token, token),
    });
    
    if (!invitation || invitation.status !== "pending") {
      return false;
    }
    
    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      await db.update(teamInvitations)
        .set({ status: "expired" })
        .where(eq(teamInvitations.id, invitation.id));
      return false;
    }
    
    // Add user to team
    await db.insert(teamMembers).values({
      teamId: invitation.teamId,
      userId: invitation.email, // This would need to be resolved to actual user ID
      role: invitation.role,
      status: "active",
    });
    
    // Mark invitation as accepted
    await db.update(teamInvitations)
      .set({ status: "accepted" })
      .where(eq(teamInvitations.id, invitation.id));
    
    return true;
  }

  async deleteTeamInvitation(id: number): Promise<boolean> {
    const result = await db
      .delete(teamInvitations)
      .where(eq(teamInvitations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async checkTeamPermission(teamId: number, userId: string, permission: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    
    if (!member) return false;
    
    // Owner has all permissions
    if (member.role === "owner") return true;
    
    // Admin has most permissions except owner-specific ones
    if (member.role === "admin" && permission !== "delete_team" && permission !== "transfer_ownership") {
      return true;
    }
    
    // Manager permissions
    if (member.role === "manager") {
      const managerPermissions = ["invite_members", "manage_tasks", "view_reports", "edit_projects"];
      return managerPermissions.includes(permission);
    }
    
    // Member permissions
    const memberPermissions = ["view_team", "view_tasks", "create_tasks"];
    return memberPermissions.includes(permission);
  }

  async updateTeamMemberPermissions(teamId: number, userId: string, permissions: string): Promise<boolean> {
    const result = await db
      .update(teamMembers)
      .set({ permissions })
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    
    return (result.rowCount || 0) > 0;
  }

  // Parts operations
  async getParts(): Promise<Part[]> {
    const allParts = await db.select().from(parts).orderBy(parts.name);
    
    // If no parts exist, create sample parts
    if (allParts.length === 0) {
      const sampleParts = [
        {
          name: "2x4 Lumber - 8ft",
          description: "Standard framing lumber",
          sku: "LUM-2X4-8",
          unitPrice: "5.99",
          category: "Lumber",
          unit: "each",
          inStock: 50,
          minimumStock: 20,
          taxable: true,
        },
        {
          name: "Drywall Sheet 4x8",
          description: "1/2 inch gypsum board",
          sku: "DRY-4X8-12",
          unitPrice: "12.50",
          category: "Drywall",
          unit: "each",
          inStock: 30,
          minimumStock: 10,
          taxable: true,
        },
        {
          name: "Electrical Outlet",
          description: "Standard 15A duplex outlet",
          sku: "ELEC-OUT-15",
          unitPrice: "2.99",
          category: "Electrical",
          unit: "each",
          inStock: 100,
          minimumStock: 50,
          taxable: true,
        },
        {
          name: "PVC Pipe 2\"",
          description: "2 inch PVC pipe - 10ft length",
          sku: "PVC-2-10",
          unitPrice: "8.99",
          category: "Plumbing",
          unit: "each",
          inStock: 25,
          minimumStock: 10,
          taxable: true,
        },
        {
          name: "Interior Paint",
          description: "Premium interior latex paint - White",
          sku: "PAINT-INT-W",
          unitPrice: "35.99",
          category: "Paint",
          unit: "gallon",
          inStock: 15,
          minimumStock: 5,
          taxable: true,
        },
        {
          name: "Concrete Mix",
          description: "80lb bag ready-mix concrete",
          sku: "CONC-80LB",
          unitPrice: "7.99",
          category: "Concrete",
          unit: "bag",
          inStock: 40,
          minimumStock: 20,
          taxable: true,
        },
        {
          name: "Roofing Shingles",
          description: "Architectural shingles - bundle covers 33.3 sq ft",
          sku: "ROOF-ARCH-BDL",
          unitPrice: "42.99",
          category: "Roofing",
          unit: "bundle",
          inStock: 60,
          minimumStock: 30,
          taxable: true,
        },
        {
          name: "Labor - General",
          description: "General construction labor",
          sku: "LABOR-GEN",
          unitPrice: "45.00",
          category: "Labor",
          unit: "hour",
          inStock: 0,
          minimumStock: 0,
          taxable: false,
        },
        {
          name: "Labor - Electrical",
          description: "Licensed electrician labor",
          sku: "LABOR-ELEC",
          unitPrice: "85.00",
          category: "Labor",
          unit: "hour",
          inStock: 0,
          minimumStock: 0,
          taxable: false,
        },
        {
          name: "Labor - Plumbing",
          description: "Licensed plumber labor",
          sku: "LABOR-PLUMB",
          unitPrice: "90.00",
          category: "Labor",
          unit: "hour",
          inStock: 0,
          minimumStock: 0,
          taxable: false,
        },
      ];

      for (const part of sampleParts) {
        await this.createPart(part);
      }
      
      return await db.select().from(parts).orderBy(parts.name);
    }
    
    return allParts;
  }

  async getPart(id: number): Promise<Part | undefined> {
    const [part] = await db.select().from(parts).where(eq(parts.id, id));
    return part;
  }

  async createPart(insertPart: InsertPart): Promise<Part> {
    const [part] = await db
      .insert(parts)
      .values(insertPart)
      .returning();
    return part;
  }

  async updatePart(id: number, updates: Partial<InsertPart>): Promise<Part | undefined> {
    const [part] = await db
      .update(parts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(parts.id, id))
      .returning();
    return part;
  }

  async deletePart(id: number): Promise<boolean> {
    const result = await db
      .delete(parts)
      .where(eq(parts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchParts(query: string): Promise<Part[]> {
    // For now, return all parts and filter on the client side
    // In production, you'd use a proper search query
    const allParts = await this.getParts();
    const lowerQuery = query.toLowerCase();
    return allParts.filter(part => 
      part.name.toLowerCase().includes(lowerQuery) ||
      (part.description && part.description.toLowerCase().includes(lowerQuery)) ||
      (part.sku && part.sku.toLowerCase().includes(lowerQuery))
    );
  }

  // Recurring payment operations
  async getRecurringPayments(): Promise<RecurringPaymentWithCustomer[]> {
    const results = await db.query.recurringPayments.findMany({
      with: {
        customer: true,
      },
      orderBy: (recurringPayments, { desc }) => [desc(recurringPayments.createdAt)],
    });
    return results;
  }

  async getRecurringPayment(id: number): Promise<RecurringPaymentWithCustomer | undefined> {
    const result = await db.query.recurringPayments.findFirst({
      where: eq(recurringPayments.id, id),
      with: {
        customer: true,
      },
    });
    return result;
  }

  async createRecurringPayment(insertRecurringPayment: InsertRecurringPayment): Promise<RecurringPaymentWithCustomer> {
    const [recurringPayment] = await db
      .insert(recurringPayments)
      .values(insertRecurringPayment)
      .returning();
    
    const result = await this.getRecurringPayment(recurringPayment.id);
    return result!;
  }

  async updateRecurringPayment(id: number, updates: Partial<InsertRecurringPayment>): Promise<RecurringPaymentWithCustomer | undefined> {
    const [recurringPayment] = await db
      .update(recurringPayments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(recurringPayments.id, id))
      .returning();
    
    if (!recurringPayment) return undefined;
    return await this.getRecurringPayment(recurringPayment.id);
  }

  async deleteRecurringPayment(id: number): Promise<boolean> {
    const result = await db
      .delete(recurringPayments)
      .where(eq(recurringPayments.id, id));
    return (result.rowCount || 0) > 0;
  }

  async processRecurringPayments(): Promise<number> {
    // Get all active recurring payments with nextPaymentDate <= now
    const now = new Date();
    const duePayments = await db.query.recurringPayments.findMany({
      where: and(
        eq(recurringPayments.status, "active"),
        lte(recurringPayments.nextPaymentDate, now)
      ),
      with: {
        customer: true,
      },
    });

    let processed = 0;
    for (const recurringPayment of duePayments) {
      try {
        // Create an invoice for this recurring payment
        const invoice = await this.createInvoice({
          customerId: recurringPayment.customerId,
          projectDescription: recurringPayment.name,
          status: "sent",
          subtotal: recurringPayment.amount,
          taxRate: recurringPayment.taxRate,
          taxAmount: (parseFloat(recurringPayment.amount) * parseFloat(recurringPayment.taxRate) / 100).toFixed(2),
          total: (parseFloat(recurringPayment.amount) * (1 + parseFloat(recurringPayment.taxRate) / 100)).toFixed(2),
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          issueDate: now,
          notes: `Recurring payment: ${recurringPayment.description || ''}`,
        }, [{
          description: recurringPayment.name,
          quantity: "1",
          rate: recurringPayment.amount,
          amount: recurringPayment.amount,
        }]);

        // Calculate next payment date based on interval
        let nextDate = new Date(recurringPayment.nextPaymentDate);
        switch (recurringPayment.interval) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + recurringPayment.intervalCount);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + (7 * recurringPayment.intervalCount));
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + recurringPayment.intervalCount);
            break;
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + recurringPayment.intervalCount);
            break;
        }

        // Update the recurring payment with new next payment date
        await db
          .update(recurringPayments)
          .set({ 
            nextPaymentDate: nextDate,
            updatedAt: new Date(),
          })
          .where(eq(recurringPayments.id, recurringPayment.id));

        // Create a notification
        await this.createNotification({
          title: "Recurring Payment Processed",
          message: `Invoice created for ${recurringPayment.name} - ${recurringPayment.customer.name}`,
          type: "success",
          relatedId: invoice.id,
          relatedType: "invoice",
        });

        processed++;
      } catch (error) {
        console.error(`Failed to process recurring payment ${recurringPayment.id}:`, error);
        await this.createNotification({
          title: "Recurring Payment Failed",
          message: `Failed to create invoice for ${recurringPayment.name}`,
          type: "error",
          relatedId: recurringPayment.id,
          relatedType: "recurring_payment",
        });
      }
    }

    return processed;
  }

  // Payment plan operations
  async getPaymentPlans(): Promise<PaymentPlanWithDetails[]> {
    const results = await db.query.paymentPlans.findMany({
      with: {
        customer: true,
        invoice: true,
        installments: {
          orderBy: (installments, { asc }) => [asc(installments.installmentNumber)],
        },
      },
      orderBy: (paymentPlans, { desc }) => [desc(paymentPlans.createdAt)],
    });
    return results;
  }

  async getPaymentPlan(id: number): Promise<PaymentPlanWithDetails | undefined> {
    const result = await db.query.paymentPlans.findFirst({
      where: eq(paymentPlans.id, id),
      with: {
        customer: true,
        invoice: true,
        installments: {
          orderBy: (installments, { asc }) => [asc(installments.installmentNumber)],
        },
      },
    });
    return result;
  }

  async createPaymentPlan(insertPaymentPlan: InsertPaymentPlan, installments: InsertPaymentPlanInstallment[]): Promise<PaymentPlanWithDetails> {
    const [paymentPlan] = await db
      .insert(paymentPlans)
      .values(insertPaymentPlan)
      .returning();
    
    // Create installments
    if (installments.length > 0) {
      await db.insert(paymentPlanInstallments).values(
        installments.map(installment => ({
          ...installment,
          paymentPlanId: paymentPlan.id,
        }))
      );
    }
    
    const result = await this.getPaymentPlan(paymentPlan.id);
    return result!;
  }

  async updatePaymentPlan(id: number, updates: Partial<InsertPaymentPlan>): Promise<PaymentPlanWithDetails | undefined> {
    const [paymentPlan] = await db
      .update(paymentPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentPlans.id, id))
      .returning();
    
    if (!paymentPlan) return undefined;
    return await this.getPaymentPlan(paymentPlan.id);
  }

  async deletePaymentPlan(id: number): Promise<boolean> {
    const result = await db
      .delete(paymentPlans)
      .where(eq(paymentPlans.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPaymentPlanByInvoice(invoiceId: number): Promise<PaymentPlanWithDetails | undefined> {
    const result = await db.query.paymentPlans.findFirst({
      where: eq(paymentPlans.invoiceId, invoiceId),
      with: {
        customer: true,
        invoice: true,
        installments: {
          orderBy: (installments, { asc }) => [asc(installments.installmentNumber)],
        },
      },
    });
    return result;
  }

  async processPaymentPlanInstallment(installmentId: number, paymentIntentId: string): Promise<boolean> {
    try {
      const [installment] = await db
        .update(paymentPlanInstallments)
        .set({
          status: "paid",
          paidDate: new Date(),
          stripePaymentIntentId: paymentIntentId,
        })
        .where(eq(paymentPlanInstallments.id, installmentId))
        .returning();
      
      if (!installment) return false;

      // Check if all installments are paid
      const plan = await db.query.paymentPlans.findFirst({
        where: eq(paymentPlans.id, installment.paymentPlanId),
        with: {
          installments: true,
        },
      });

      if (plan && plan.installments.every(inst => inst.status === "paid")) {
        // Update payment plan status to completed
        await db
          .update(paymentPlans)
          .set({ status: "completed", updatedAt: new Date() })
          .where(eq(paymentPlans.id, plan.id));
        
        // Update invoice status to paid
        await db
          .update(invoices)
          .set({ status: "paid", paidDate: new Date() })
          .where(eq(invoices.id, plan.invoiceId));
      }

      return true;
    } catch (error) {
      console.error("Failed to process payment plan installment:", error);
      return false;
    }
  }

  async getOverdueInstallments(): Promise<PaymentPlanInstallmentWithPayment[]> {
    const now = new Date();
    const overdueInstallments = await db.query.paymentPlanInstallments.findMany({
      where: and(
        eq(paymentPlanInstallments.status, "pending"),
        lt(paymentPlanInstallments.dueDate, now)
      ),
      with: {
        payment: true,
      },
    });
    
    // Update status to overdue
    for (const installment of overdueInstallments) {
      await db
        .update(paymentPlanInstallments)
        .set({ status: "overdue" })
        .where(eq(paymentPlanInstallments.id, installment.id));
    }
    
    return overdueInstallments;
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
      companyWebsite: "",
      logoUrl: null,
      logoFileName: null,
      defaultTaxRate: "0",
      paymentTerms: "Net 30",
      invoiceTemplate: "standard",
      quoteTemplate: "standard",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      timeZone: "America/New_York",
      autoGenerateNumbers: true,
      invoicePrefix: "INV",
      quotePrefix: "QUO",
      nextInvoiceNumber: 1,
      nextQuoteNumber: 1,
      brandColor: "#2563eb",
      accentColor: "#10b981",
      showLineItemTotals: true,
      requireProjectDescription: false,
      defaultPaymentMethod: "Check",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      emailSignature: "",
      invoiceFooter: "",
      quoteFooter: "",
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
      companyWebsite: "",
      logoUrl: null,
      logoFileName: null,
      defaultTaxRate: "0",
      paymentTerms: "Net 30",
      invoiceTemplate: "standard",
      quoteTemplate: "standard",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      timeZone: "America/New_York",
      autoGenerateNumbers: true,
      invoicePrefix: "INV",
      quotePrefix: "QUO",
      nextInvoiceNumber: 1,
      nextQuoteNumber: 1,
      brandColor: "#2563eb",
      accentColor: "#10b981",
      showLineItemTotals: true,
      requireProjectDescription: false,
      defaultPaymentMethod: "Check",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      emailSignature: "",
      invoiceFooter: "",
      quoteFooter: "",
      ...updates,
    };
  }

  // Payment operations (stub implementations for interface compliance)
  async getPayments(): Promise<Payment[]> {
    return [];
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    return {
      id: 1,
      invoiceId: payment.invoiceId ?? null,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      reference: payment.reference || null,
      notes: payment.notes || null,
      createdAt: new Date(),
    };
  }

  async deletePayment(id: number): Promise<boolean> {
    return true;
  }

  // Expense operations (stub implementations for interface compliance)
  async getExpenses(): Promise<ExpenseWithCustomer[]> {
    return [];
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseWithCustomer> {
    return {
      id: 1,
      date: expense.date,
      customerId: expense.customerId ?? null,
      invoiceId: expense.invoiceId ?? null,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      receipt: expense.receipt || null,
      billable: expense.billable || false,
      createdAt: new Date(),
      customer: expense.customerId ? this.customers.get(expense.customerId) : undefined,
    };
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<ExpenseWithCustomer | undefined> {
    return undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return true;
  }

  // Time entry operations (stub implementations for interface compliance)
  async getTimeEntries(): Promise<TimeEntryWithCustomer[]> {
    return [];
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntryWithCustomer> {
    return {
      id: 1,
      customerId: timeEntry.customerId ?? null,
      projectDescription: timeEntry.projectDescription,
      startTime: timeEntry.startTime,
      endTime: timeEntry.endTime || null,
      duration: timeEntry.duration || null,
      hourlyRate: timeEntry.hourlyRate || null,
      notes: timeEntry.notes || null,
      billable: timeEntry.billable || false,
      invoiceId: timeEntry.invoiceId ?? null,
      createdAt: new Date(),
      customer: timeEntry.customerId ? this.customers.get(timeEntry.customerId) : undefined,
    };
  }

  async updateTimeEntry(id: number, updates: Partial<InsertTimeEntry>): Promise<TimeEntryWithCustomer | undefined> {
    return undefined;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    return true;
  }

  // Task operations (stub implementations for interface compliance)
  async getTasks(): Promise<TaskWithCustomer[]> {
    return [];
  }

  async createTask(task: InsertTask): Promise<TaskWithCustomer> {
    return {
      id: 1,
      title: task.title,
      description: task.description || null,
      status: task.status || "pending",
      priority: task.priority || "medium",
      customerId: task.customerId ?? null,
      assignedTo: task.assignedTo || null,
      dueDate: task.dueDate || null,
      estimatedHours: task.estimatedHours || null,
      actualHours: task.actualHours || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: task.customerId ? this.customers.get(task.customerId) : undefined,
      teamId: task.teamId ?? null,
      createdBy: task.createdBy || null,
      assignedUser: undefined,
      createdByUser: undefined,
      team: undefined,
    };
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<TaskWithCustomer | undefined> {
    return undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    return true;
  }

  // Notification operations (stub implementations for interface compliance)
  async getNotifications(): Promise<Notification[]> {
    return [];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    return {
      id: 1,
      type: notification.type || "system",
      title: notification.title,
      message: notification.message,
      isRead: false,
      relatedId: notification.relatedId || null,
      relatedType: notification.relatedType || null,
      createdAt: new Date(),
    };
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    return true;
  }

  async markAllNotificationsAsRead(): Promise<boolean> {
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return true;
  }

  // Team management operations (stub implementations)
  async getTeams(): Promise<TeamWithMembers[]> {
    return [];
  }

  async getTeam(id: number): Promise<TeamWithMembers | undefined> {
    return undefined;
  }

  async createTeam(team: InsertTeam): Promise<TeamWithMembers> {
    throw new Error("Team management not implemented in memory storage");
  }

  async updateTeam(id: number, team: Partial<InsertTeam>): Promise<TeamWithMembers | undefined> {
    return undefined;
  }

  async deleteTeam(id: number): Promise<boolean> {
    return false;
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMemberWithUser> {
    throw new Error("Team management not implemented in memory storage");
  }

  async removeTeamMember(teamId: number, userId: string): Promise<boolean> {
    return false;
  }

  async updateTeamMemberRole(teamId: number, userId: string, role: string): Promise<boolean> {
    return false;
  }

  async getTeamInvitations(teamId: number): Promise<TeamInvitation[]> {
    return [];
  }

  async createTeamInvitation(invitation: InsertTeamInvitation): Promise<TeamInvitation> {
    throw new Error("Team management not implemented in memory storage");
  }

  async acceptTeamInvitation(token: string): Promise<boolean> {
    return false;
  }

  async deleteTeamInvitation(id: number): Promise<boolean> {
    return false;
  }

  async checkTeamPermission(teamId: number, userId: string, permission: string): Promise<boolean> {
    // Stub implementation for memory storage
    return true;
  }

  async updateTeamMemberPermissions(teamId: number, userId: string, permissions: string): Promise<boolean> {
    // Stub implementation for memory storage
    return false;
  }

  // Parts operations (stub implementations)
  async getParts(): Promise<Part[]> {
    return [];
  }

  async getPart(id: number): Promise<Part | undefined> {
    return undefined;
  }

  async createPart(part: InsertPart): Promise<Part> {
    return {
      id: 1,
      name: part.name,
      description: part.description || null,
      sku: part.sku || null,
      unitPrice: part.unitPrice,
      category: part.category || null,
      unit: part.unit || "each",
      inStock: part.inStock || 0,
      minimumStock: part.minimumStock || 0,
      taxable: part.taxable ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updatePart(id: number, part: Partial<InsertPart>): Promise<Part | undefined> {
    return undefined;
  }

  async deletePart(id: number): Promise<boolean> {
    return false;
  }

  async searchParts(query: string): Promise<Part[]> {
    return [];
  }

  // Recurring payment operations (stub implementations)
  async getRecurringPayments(): Promise<RecurringPaymentWithCustomer[]> {
    return [];
  }

  async getRecurringPayment(id: number): Promise<RecurringPaymentWithCustomer | undefined> {
    return undefined;
  }

  async createRecurringPayment(recurringPayment: InsertRecurringPayment): Promise<RecurringPaymentWithCustomer> {
    return {
      id: 1,
      customerId: recurringPayment.customerId,
      name: recurringPayment.name,
      description: recurringPayment.description || null,
      amount: recurringPayment.amount,
      interval: recurringPayment.interval,
      intervalCount: recurringPayment.intervalCount,
      startDate: recurringPayment.startDate,
      endDate: recurringPayment.endDate || null,
      nextPaymentDate: recurringPayment.nextPaymentDate,
      status: recurringPayment.status || "active",
      stripeSubscriptionId: recurringPayment.stripeSubscriptionId || null,
      stripePriceId: recurringPayment.stripePriceId || null,
      paymentMethod: recurringPayment.paymentMethod || "card",
      taxRate: recurringPayment.taxRate || "0",
      notes: recurringPayment.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: this.customers.get(recurringPayment.customerId)!,
    };
  }

  async updateRecurringPayment(id: number, recurringPayment: Partial<InsertRecurringPayment>): Promise<RecurringPaymentWithCustomer | undefined> {
    return undefined;
  }

  async deleteRecurringPayment(id: number): Promise<boolean> {
    return false;
  }

  async processRecurringPayments(): Promise<number> {
    return 0;
  }

  // Payment plan operations (stub implementations)
  async getPaymentPlans(): Promise<PaymentPlanWithDetails[]> {
    return [];
  }

  async getPaymentPlan(id: number): Promise<PaymentPlanWithDetails | undefined> {
    return undefined;
  }

  async createPaymentPlan(paymentPlan: InsertPaymentPlan, installments: InsertPaymentPlanInstallment[]): Promise<PaymentPlanWithDetails> {
    return {
      id: 1,
      invoiceId: paymentPlan.invoiceId,
      customerId: paymentPlan.customerId,
      planName: paymentPlan.planName,
      totalAmount: paymentPlan.totalAmount,
      numberOfPayments: paymentPlan.numberOfPayments,
      paymentInterval: paymentPlan.paymentInterval,
      firstPaymentAmount: paymentPlan.firstPaymentAmount || null,
      regularPaymentAmount: paymentPlan.regularPaymentAmount,
      startDate: paymentPlan.startDate,
      status: paymentPlan.status || "active",
      stripeSetupIntentId: paymentPlan.stripeSetupIntentId || null,
      stripePaymentMethodId: paymentPlan.stripePaymentMethodId || null,
      notes: paymentPlan.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: this.customers.get(paymentPlan.customerId)!,
      invoice: this.invoices.get(paymentPlan.invoiceId)!,
      installments: [],
    };
  }

  async updatePaymentPlan(id: number, paymentPlan: Partial<InsertPaymentPlan>): Promise<PaymentPlanWithDetails | undefined> {
    return undefined;
  }

  async deletePaymentPlan(id: number): Promise<boolean> {
    return false;
  }

  async getPaymentPlanByInvoice(invoiceId: number): Promise<PaymentPlanWithDetails | undefined> {
    return undefined;
  }

  async processPaymentPlanInstallment(installmentId: number, paymentIntentId: string): Promise<boolean> {
    return false;
  }

  async getOverdueInstallments(): Promise<PaymentPlanInstallmentWithPayment[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();
