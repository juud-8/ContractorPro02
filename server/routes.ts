import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertInvoiceSchema, 
  insertInvoiceLineItemSchema,
  insertQuoteSchema,
  insertQuoteLineItemSchema,
  insertSettingsSchema,
  insertPaymentSchema,
  insertExpenseSchema,
  insertTimeEntrySchema,
  insertTaskSchema,
  insertNotificationSchema,
  insertPartSchema
} from "@shared/schema";
import { z } from "zod";

const invoiceCreateSchema = z.object({
  invoice: insertInvoiceSchema,
  lineItems: z.array(insertInvoiceLineItemSchema)
});

const quoteCreateSchema = z.object({
  quote: insertQuoteSchema,
  lineItems: z.array(insertQuoteLineItemSchema)
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { invoice, lineItems } = invoiceCreateSchema.parse(req.body);
      const newInvoice = await storage.createInvoice(invoice, lineItems);
      res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { invoice, lineItems } = req.body;
      const updatedInvoice = await storage.updateInvoice(id, invoice || {}, lineItems);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Quote routes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const { quote, lineItems } = quoteCreateSchema.parse(req.body);
      const newQuote = await storage.createQuote(quote, lineItems);
      res.status(201).json(newQuote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.put("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quote, lineItems } = req.body;
      const updatedQuote = await storage.updateQuote(id, quote || {}, lineItems);
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(updatedQuote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, expenseData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Time entry routes
  app.get("/api/time-entries", async (req, res) => {
    try {
      const timeEntries = await storage.getTimeEntries();
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.post("/api/time-entries", async (req, res) => {
    try {
      const timeEntryData = insertTimeEntrySchema.parse(req.body);
      const timeEntry = await storage.createTimeEntry(timeEntryData);
      res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.put("/api/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntryData = insertTimeEntrySchema.partial().parse(req.body);
      const timeEntry = await storage.updateTimeEntry(id, timeEntryData);
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  app.delete("/api/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTimeEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markNotificationAsRead(id);
      if (!updated) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/read-all", async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead();
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Team management routes
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeam(parseInt(req.params.id));
      if (team) {
        res.json(team);
      } else {
        res.status(404).json({ message: "Team not found" });
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const team = await storage.createTeam(req.body);
      res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.updateTeam(parseInt(req.params.id), req.body);
      if (team) {
        res.json(team);
      } else {
        res.status(404).json({ message: "Team not found" });
      }
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeam(parseInt(req.params.id));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Team not found" });
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  app.post("/api/teams/:id/members", async (req, res) => {
    try {
      const member = await storage.addTeamMember(req.body);
      res.json(member);
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  app.delete("/api/teams/:teamId/members/:userId", async (req, res) => {
    try {
      const success = await storage.removeTeamMember(
        parseInt(req.params.teamId),
        req.params.userId
      );
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });

  app.put("/api/teams/:teamId/members/:userId/role", async (req, res) => {
    try {
      const success = await storage.updateTeamMemberRole(
        parseInt(req.params.teamId),
        req.params.userId,
        req.body.role
      );
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error updating team member role:", error);
      res.status(500).json({ message: "Failed to update team member role" });
    }
  });

  app.get("/api/teams/:id/invitations", async (req, res) => {
    try {
      const invitations = await storage.getTeamInvitations(parseInt(req.params.id));
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching team invitations:", error);
      res.status(500).json({ message: "Failed to fetch team invitations" });
    }
  });

  app.post("/api/teams/:id/invitations", async (req, res) => {
    try {
      const invitation = await storage.createTeamInvitation(req.body);
      res.json(invitation);
    } catch (error) {
      console.error("Error creating team invitation:", error);
      res.status(500).json({ message: "Failed to create team invitation" });
    }
  });

  app.post("/api/invitations/:token/accept", async (req, res) => {
    try {
      const success = await storage.acceptTeamInvitation(req.params.token);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Invalid or expired invitation" });
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  app.delete("/api/invitations/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeamInvitation(parseInt(req.params.id));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Invitation not found" });
      }
    } catch (error) {
      console.error("Error deleting invitation:", error);
      res.status(500).json({ message: "Failed to delete invitation" });
    }
  });

  // Parts routes
  app.get("/api/parts", async (req, res) => {
    try {
      const parts = await storage.getParts();
      res.json(parts);
    } catch (error) {
      console.error("Error fetching parts:", error);
      res.status(500).json({ message: "Failed to fetch parts" });
    }
  });

  app.get("/api/parts/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      const parts = await storage.searchParts(q);
      res.json(parts);
    } catch (error) {
      console.error("Error searching parts:", error);
      res.status(500).json({ message: "Failed to search parts" });
    }
  });

  app.get("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const part = await storage.getPart(id);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      console.error("Error fetching part:", error);
      res.status(500).json({ message: "Failed to fetch part" });
    }
  });

  app.post("/api/parts", async (req, res) => {
    try {
      const validation = insertPartSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.message });
      }
      const part = await storage.createPart(validation.data);
      res.json(part);
    } catch (error) {
      console.error("Error creating part:", error);
      res.status(500).json({ message: "Failed to create part" });
    }
  });

  app.put("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertPartSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.message });
      }
      const part = await storage.updatePart(id, validation.data);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      console.error("Error updating part:", error);
      res.status(500).json({ message: "Failed to update part" });
    }
  });

  app.delete("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePart(id);
      if (!success) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json({ message: "Part deleted successfully" });
    } catch (error) {
      console.error("Error deleting part:", error);
      res.status(500).json({ message: "Failed to delete part" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
