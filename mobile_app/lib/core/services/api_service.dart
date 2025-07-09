import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:retrofit/retrofit.dart';
import 'package:json_annotation/json_annotation.dart';

import '../../features/auth/data/models/auth_models.dart';
import '../../features/invoices/data/models/invoice_models.dart';
import '../../features/clients/data/models/client_models.dart';
import '../../features/quotes/data/models/quote_models.dart';
import '../../features/payments/data/models/payment_models.dart';
import '../../features/expenses/data/models/expense_models.dart';
import '../../features/time_tracking/data/models/time_entry_models.dart';
import '../../features/dashboard/data/models/dashboard_models.dart';

part 'api_service.g.dart';

@RestApi()
abstract class ApiService {
  factory ApiService({String? baseUrl}) {
    final dio = Dio();
    
    // Add authentication interceptor
    dio.interceptors.add(AuthInterceptor());
    
    // Add logging interceptor for debugging
    dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print(obj),
    ));
    
    return _ApiService(dio, baseUrl: baseUrl ?? 'https://your-api-base-url.com');
  }
  
  // Authentication endpoints
  @POST('/auth/login')
  Future<AuthResponse> login(@Body() LoginRequest request);
  
  @POST('/auth/register')
  Future<AuthResponse> register(@Body() RegisterRequest request);
  
  @POST('/auth/logout')
  Future<void> logout();
  
  @GET('/auth/me')
  Future<User> getCurrentUser();
  
  // Dashboard endpoints
  @GET('/api/stats')
  Future<DashboardStats> getDashboardStats();
  
  @GET('/api/notifications')
  Future<List<NotificationModel>> getNotifications();
  
  // Invoice endpoints
  @GET('/api/invoices')
  Future<List<InvoiceModel>> getInvoices();
  
  @GET('/api/invoices/{id}')
  Future<InvoiceModel> getInvoice(@Path('id') int id);
  
  @POST('/api/invoices')
  Future<InvoiceModel> createInvoice(@Body() CreateInvoiceRequest request);
  
  @PUT('/api/invoices/{id}')
  Future<InvoiceModel> updateInvoice(@Path('id') int id, @Body() UpdateInvoiceRequest request);
  
  @DELETE('/api/invoices/{id}')
  Future<void> deleteInvoice(@Path('id') int id);
  
  // Client endpoints
  @GET('/api/customers')
  Future<List<ClientModel>> getClients();
  
  @GET('/api/customers/{id}')
  Future<ClientModel> getClient(@Path('id') int id);
  
  @POST('/api/customers')
  Future<ClientModel> createClient(@Body() CreateClientRequest request);
  
  @PUT('/api/customers/{id}')
  Future<ClientModel> updateClient(@Path('id') int id, @Body() UpdateClientRequest request);
  
  @DELETE('/api/customers/{id}')
  Future<void> deleteClient(@Path('id') int id);
  
  // Quote endpoints
  @GET('/api/quotes')
  Future<List<QuoteModel>> getQuotes();
  
  @GET('/api/quotes/{id}')
  Future<QuoteModel> getQuote(@Path('id') int id);
  
  @POST('/api/quotes')
  Future<QuoteModel> createQuote(@Body() CreateQuoteRequest request);
  
  @PUT('/api/quotes/{id}')
  Future<QuoteModel> updateQuote(@Path('id') int id, @Body() UpdateQuoteRequest request);
  
  @DELETE('/api/quotes/{id}')
  Future<void> deleteQuote(@Path('id') int id);
  
  // Payment endpoints
  @GET('/api/payments')
  Future<List<PaymentModel>> getPayments();
  
  @POST('/api/payments')
  Future<PaymentModel> createPayment(@Body() CreatePaymentRequest request);
  
  @DELETE('/api/payments/{id}')
  Future<void> deletePayment(@Path('id') int id);
  
  // Expense endpoints
  @GET('/api/expenses')
  Future<List<ExpenseModel>> getExpenses();
  
  @POST('/api/expenses')
  Future<ExpenseModel> createExpense(@Body() CreateExpenseRequest request);
  
  @PUT('/api/expenses/{id}')
  Future<ExpenseModel> updateExpense(@Path('id') int id, @Body() UpdateExpenseRequest request);
  
  @DELETE('/api/expenses/{id}')
  Future<void> deleteExpense(@Path('id') int id);
  
  // Time tracking endpoints
  @GET('/api/time-entries')
  Future<List<TimeEntryModel>> getTimeEntries();
  
  @POST('/api/time-entries')
  Future<TimeEntryModel> createTimeEntry(@Body() CreateTimeEntryRequest request);
  
  @PUT('/api/time-entries/{id}')
  Future<TimeEntryModel> updateTimeEntry(@Path('id') int id, @Body() UpdateTimeEntryRequest request);
  
  @DELETE('/api/time-entries/{id}')
  Future<void> deleteTimeEntry(@Path('id') int id);
  
  // Settings endpoints
  @GET('/api/settings')
  Future<Settings> getSettings();
  
  @PUT('/api/settings')
  Future<Settings> updateSettings(@Body() UpdateSettingsRequest request);
}

class AuthInterceptor extends Interceptor {
  static const _storage = FlutterSecureStorage();
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    super.onRequest(options, handler);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Clear stored token on authentication error
      await _storage.delete(key: 'auth_token');
      // Redirect to login page
      // This would typically be handled by a navigation service
    }
    super.onError(err, handler);
  }
}