import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  static Future<void> init() async {
    // Request permissions
    await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    
    // Initialize local notifications
    const initializationSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initializationSettingsIOS = DarwinInitializationSettings();
    const initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );
    
    await _localNotifications.initialize(initializationSettings);
    
    // Set up message handlers
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
    
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);
  }
  
  static Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }
  
  static Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }
  
  static Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }
  
  static Future<void> showLocalNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidNotificationDetails = AndroidNotificationDetails(
      'default_channel',
      'Default Channel',
      channelDescription: 'Default notification channel',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: false,
    );
    
    const iosNotificationDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidNotificationDetails,
      iOS: iosNotificationDetails,
    );
    
    await _localNotifications.show(
      id,
      title,
      body,
      notificationDetails,
      payload: payload,
    );
  }
  
  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    debugPrint('Received foreground message: ${message.messageId}');
    
    // Show local notification when app is in foreground
    if (message.notification != null) {
      await showLocalNotification(
        id: message.hashCode,
        title: message.notification!.title ?? 'TradeInvoice Pro',
        body: message.notification!.body ?? 'You have a new notification',
        payload: message.data['route'],
      );
    }
  }
  
  static Future<void> _handleMessageOpenedApp(RemoteMessage message) async {
    debugPrint('Notification opened app: ${message.messageId}');
    
    // Handle navigation based on notification data
    final route = message.data['route'];
    if (route != null) {
      // Navigate to specific route
      // This would typically be handled by a navigation service
      debugPrint('Navigate to: $route');
    }
  }
  
  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    debugPrint('Received background message: ${message.messageId}');
    
    // Handle background message
    // This function must be top-level or static
  }
  
  // Business-specific notification methods
  static Future<void> showInvoiceNotification({
    required String clientName,
    required String invoiceNumber,
    required String amount,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title: 'Invoice Created',
      body: 'Invoice $invoiceNumber for $clientName (\$$amount) has been created',
      payload: '/invoices',
    );
  }
  
  static Future<void> showPaymentNotification({
    required String clientName,
    required String amount,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title: 'Payment Received',
      body: 'Payment of \$$amount received from $clientName',
      payload: '/payments',
    );
  }
  
  static Future<void> showQuoteNotification({
    required String clientName,
    required String quoteNumber,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title: 'Quote Approved',
      body: 'Quote $quoteNumber for $clientName has been approved',
      payload: '/quotes',
    );
  }
  
  static Future<void> showExpenseReminderNotification({
    required String description,
    required String amount,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title: 'Expense Reminder',
      body: 'Don\'t forget to record: $description (\$$amount)',
      payload: '/expenses',
    );
  }
  
  static Future<void> showTimeTrackingNotification({
    required String projectName,
    required String duration,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title: 'Time Tracking',
      body: 'You\'ve been working on $projectName for $duration',
      payload: '/time-tracking',
    );
  }
}