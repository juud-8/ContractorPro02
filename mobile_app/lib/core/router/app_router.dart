import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/invoices/presentation/pages/invoices_page.dart';
import '../../features/invoices/presentation/pages/invoice_detail_page.dart';
import '../../features/invoices/presentation/pages/create_invoice_page.dart';
import '../../features/clients/presentation/pages/clients_page.dart';
import '../../features/clients/presentation/pages/client_detail_page.dart';
import '../../features/quotes/presentation/pages/quotes_page.dart';
import '../../features/payments/presentation/pages/payments_page.dart';
import '../../features/expenses/presentation/pages/expenses_page.dart';
import '../../features/time_tracking/presentation/pages/time_tracking_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../shared/presentation/pages/main_navigation_page.dart';
import '../services/auth_service.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final authService = context.read<AuthService>();
      final isAuthenticated = authService.isAuthenticated;
      
      if (!isAuthenticated && !state.location.startsWith('/auth')) {
        return '/auth/login';
      }
      
      if (isAuthenticated && state.location.startsWith('/auth')) {
        return '/dashboard';
      }
      
      return null;
    },
    routes: [
      // Authentication routes
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/auth/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      
      // Main application routes with bottom navigation
      ShellRoute(
        builder: (context, state, child) {
          return MainNavigationPage(child: child);
        },
        routes: [
          GoRoute(
            path: '/dashboard',
            name: 'dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: '/invoices',
            name: 'invoices',
            builder: (context, state) => const InvoicesPage(),
            routes: [
              GoRoute(
                path: '/create',
                name: 'create_invoice',
                builder: (context, state) => const CreateInvoicePage(),
              ),
              GoRoute(
                path: '/:invoiceId',
                name: 'invoice_detail',
                builder: (context, state) {
                  final invoiceId = state.pathParameters['invoiceId']!;
                  return InvoiceDetailPage(invoiceId: invoiceId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/clients',
            name: 'clients',
            builder: (context, state) => const ClientsPage(),
            routes: [
              GoRoute(
                path: '/:clientId',
                name: 'client_detail',
                builder: (context, state) {
                  final clientId = state.pathParameters['clientId']!;
                  return ClientDetailPage(clientId: clientId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/quotes',
            name: 'quotes',
            builder: (context, state) => const QuotesPage(),
          ),
          GoRoute(
            path: '/payments',
            name: 'payments',
            builder: (context, state) => const PaymentsPage(),
          ),
          GoRoute(
            path: '/expenses',
            name: 'expenses',
            builder: (context, state) => const ExpensesPage(),
          ),
          GoRoute(
            path: '/time-tracking',
            name: 'time_tracking',
            builder: (context, state) => const TimeTrackingPage(),
          ),
          GoRoute(
            path: '/settings',
            name: 'settings',
            builder: (context, state) => const SettingsPage(),
          ),
        ],
      ),
    ],
  );
}