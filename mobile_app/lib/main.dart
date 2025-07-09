import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:permission_handler/permission_handler.dart';

import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/services/api_service.dart';
import 'core/services/storage_service.dart';
import 'core/services/auth_service.dart';
import 'core/services/notification_service.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/dashboard/presentation/bloc/dashboard_bloc.dart';
import 'features/invoices/presentation/bloc/invoice_bloc.dart';
import 'features/clients/presentation/bloc/client_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize services
  await StorageService.init();
  await NotificationService.init();
  
  // Request necessary permissions
  await _requestPermissions();
  
  runApp(TradeInvoiceProApp());
}

Future<void> _requestPermissions() async {
  await [
    Permission.camera,
    Permission.location,
    Permission.notification,
    Permission.storage,
  ].request();
}

class TradeInvoiceProApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<ApiService>(
          create: (context) => ApiService(),
        ),
        RepositoryProvider<StorageService>(
          create: (context) => StorageService(),
        ),
        RepositoryProvider<AuthService>(
          create: (context) => AuthService(),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              authService: context.read<AuthService>(),
            ),
          ),
          BlocProvider<DashboardBloc>(
            create: (context) => DashboardBloc(
              apiService: context.read<ApiService>(),
            ),
          ),
          BlocProvider<InvoiceBloc>(
            create: (context) => InvoiceBloc(
              apiService: context.read<ApiService>(),
              storageService: context.read<StorageService>(),
            ),
          ),
          BlocProvider<ClientBloc>(
            create: (context) => ClientBloc(
              apiService: context.read<ApiService>(),
              storageService: context.read<StorageService>(),
            ),
          ),
        ],
        child: MaterialApp.router(
          title: 'TradeInvoice Pro',
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.system,
          routerConfig: AppRouter.router,
          debugShowCheckedModeBanner: false,
        ),
      ),
    );
  }
}