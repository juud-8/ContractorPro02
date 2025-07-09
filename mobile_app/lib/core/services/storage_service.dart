import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';

import '../../features/invoices/data/models/invoice_models.dart';
import '../../features/clients/data/models/client_models.dart';
import '../../features/quotes/data/models/quote_models.dart';
import '../../features/payments/data/models/payment_models.dart';
import '../../features/expenses/data/models/expense_models.dart';
import '../../features/time_tracking/data/models/time_entry_models.dart';

class StorageService {
  static const String _invoicesBoxName = 'invoices';
  static const String _clientsBoxName = 'clients';
  static const String _quotesBoxName = 'quotes';
  static const String _paymentsBoxName = 'payments';
  static const String _expensesBoxName = 'expenses';
  static const String _timeEntriesBoxName = 'time_entries';
  static const String _settingsBoxName = 'settings';
  static const String _cacheBoxName = 'cache';
  
  static Future<void> init() async {
    final appDocumentDir = await getApplicationDocumentsDirectory();
    Hive.init(appDocumentDir.path);
    
    // Register adapters for custom types
    Hive.registerAdapter(InvoiceModelAdapter());
    Hive.registerAdapter(ClientModelAdapter());
    Hive.registerAdapter(QuoteModelAdapter());
    Hive.registerAdapter(PaymentModelAdapter());
    Hive.registerAdapter(ExpenseModelAdapter());
    Hive.registerAdapter(TimeEntryModelAdapter());
    
    // Open boxes
    await Future.wait([
      Hive.openBox<InvoiceModel>(_invoicesBoxName),
      Hive.openBox<ClientModel>(_clientsBoxName),
      Hive.openBox<QuoteModel>(_quotesBoxName),
      Hive.openBox<PaymentModel>(_paymentsBoxName),
      Hive.openBox<ExpenseModel>(_expensesBoxName),
      Hive.openBox<TimeEntryModel>(_timeEntriesBoxName),
      Hive.openBox(_settingsBoxName),
      Hive.openBox(_cacheBoxName),
    ]);
  }
  
  // Invoice operations
  Box<InvoiceModel> get _invoicesBox => Hive.box<InvoiceModel>(_invoicesBoxName);
  
  Future<void> saveInvoices(List<InvoiceModel> invoices) async {
    await _invoicesBox.clear();
    final invoiceMap = {for (var invoice in invoices) invoice.id: invoice};
    await _invoicesBox.putAll(invoiceMap);
  }
  
  List<InvoiceModel> getInvoices() {
    return _invoicesBox.values.toList();
  }
  
  InvoiceModel? getInvoice(int id) {
    return _invoicesBox.get(id);
  }
  
  Future<void> saveInvoice(InvoiceModel invoice) async {
    await _invoicesBox.put(invoice.id, invoice);
  }
  
  Future<void> deleteInvoice(int id) async {
    await _invoicesBox.delete(id);
  }
  
  // Client operations
  Box<ClientModel> get _clientsBox => Hive.box<ClientModel>(_clientsBoxName);
  
  Future<void> saveClients(List<ClientModel> clients) async {
    await _clientsBox.clear();
    final clientMap = {for (var client in clients) client.id: client};
    await _clientsBox.putAll(clientMap);
  }
  
  List<ClientModel> getClients() {
    return _clientsBox.values.toList();
  }
  
  ClientModel? getClient(int id) {
    return _clientsBox.get(id);
  }
  
  Future<void> saveClient(ClientModel client) async {
    await _clientsBox.put(client.id, client);
  }
  
  Future<void> deleteClient(int id) async {
    await _clientsBox.delete(id);
  }
  
  // Quote operations
  Box<QuoteModel> get _quotesBox => Hive.box<QuoteModel>(_quotesBoxName);
  
  Future<void> saveQuotes(List<QuoteModel> quotes) async {
    await _quotesBox.clear();
    final quoteMap = {for (var quote in quotes) quote.id: quote};
    await _quotesBox.putAll(quoteMap);
  }
  
  List<QuoteModel> getQuotes() {
    return _quotesBox.values.toList();
  }
  
  QuoteModel? getQuote(int id) {
    return _quotesBox.get(id);
  }
  
  Future<void> saveQuote(QuoteModel quote) async {
    await _quotesBox.put(quote.id, quote);
  }
  
  Future<void> deleteQuote(int id) async {
    await _quotesBox.delete(id);
  }
  
  // Payment operations
  Box<PaymentModel> get _paymentsBox => Hive.box<PaymentModel>(_paymentsBoxName);
  
  Future<void> savePayments(List<PaymentModel> payments) async {
    await _paymentsBox.clear();
    final paymentMap = {for (var payment in payments) payment.id: payment};
    await _paymentsBox.putAll(paymentMap);
  }
  
  List<PaymentModel> getPayments() {
    return _paymentsBox.values.toList();
  }
  
  Future<void> savePayment(PaymentModel payment) async {
    await _paymentsBox.put(payment.id, payment);
  }
  
  Future<void> deletePayment(int id) async {
    await _paymentsBox.delete(id);
  }
  
  // Expense operations
  Box<ExpenseModel> get _expensesBox => Hive.box<ExpenseModel>(_expensesBoxName);
  
  Future<void> saveExpenses(List<ExpenseModel> expenses) async {
    await _expensesBox.clear();
    final expenseMap = {for (var expense in expenses) expense.id: expense};
    await _expensesBox.putAll(expenseMap);
  }
  
  List<ExpenseModel> getExpenses() {
    return _expensesBox.values.toList();
  }
  
  Future<void> saveExpense(ExpenseModel expense) async {
    await _expensesBox.put(expense.id, expense);
  }
  
  Future<void> deleteExpense(int id) async {
    await _expensesBox.delete(id);
  }
  
  // Time entry operations
  Box<TimeEntryModel> get _timeEntriesBox => Hive.box<TimeEntryModel>(_timeEntriesBoxName);
  
  Future<void> saveTimeEntries(List<TimeEntryModel> timeEntries) async {
    await _timeEntriesBox.clear();
    final timeEntryMap = {for (var entry in timeEntries) entry.id: entry};
    await _timeEntriesBox.putAll(timeEntryMap);
  }
  
  List<TimeEntryModel> getTimeEntries() {
    return _timeEntriesBox.values.toList();
  }
  
  Future<void> saveTimeEntry(TimeEntryModel timeEntry) async {
    await _timeEntriesBox.put(timeEntry.id, timeEntry);
  }
  
  Future<void> deleteTimeEntry(int id) async {
    await _timeEntriesBox.delete(id);
  }
  
  // Settings operations
  Box get _settingsBox => Hive.box(_settingsBoxName);
  
  Future<void> saveSetting(String key, dynamic value) async {
    await _settingsBox.put(key, value);
  }
  
  T? getSetting<T>(String key) {
    return _settingsBox.get(key) as T?;
  }
  
  Future<void> deleteSetting(String key) async {
    await _settingsBox.delete(key);
  }
  
  // Cache operations
  Box get _cacheBox => Hive.box(_cacheBoxName);
  
  Future<void> cacheData(String key, dynamic value) async {
    await _cacheBox.put(key, value);
  }
  
  T? getCachedData<T>(String key) {
    return _cacheBox.get(key) as T?;
  }
  
  Future<void> clearCache() async {
    await _cacheBox.clear();
  }
  
  // Utility methods
  Future<void> clearAllData() async {
    await Future.wait([
      _invoicesBox.clear(),
      _clientsBox.clear(),
      _quotesBox.clear(),
      _paymentsBox.clear(),
      _expensesBox.clear(),
      _timeEntriesBox.clear(),
      _settingsBox.clear(),
      _cacheBox.clear(),
    ]);
  }
  
  int get totalCachedItems {
    return _invoicesBox.length +
        _clientsBox.length +
        _quotesBox.length +
        _paymentsBox.length +
        _expensesBox.length +
        _timeEntriesBox.length;
  }
}