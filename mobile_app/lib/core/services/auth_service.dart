import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';

import '../../features/auth/data/models/auth_models.dart';
import 'api_service.dart';

class AuthService {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'auth_token';
  static const _userKey = 'user_data';
  static const _biometricKey = 'biometric_enabled';
  
  final ApiService _apiService;
  final LocalAuthentication _localAuth = LocalAuthentication();
  
  AuthService() : _apiService = ApiService();
  
  // Authentication state
  bool get isAuthenticated => _currentUser != null;
  User? _currentUser;
  User? get currentUser => _currentUser;
  
  // Initialize auth service
  Future<void> init() async {
    await _loadStoredUser();
  }
  
  // Login methods
  Future<AuthResult> login(String email, String password) async {
    try {
      final request = LoginRequest(email: email, password: password);
      final response = await _apiService.login(request);
      
      await _storeAuthData(response.token, response.user);
      _currentUser = response.user;
      
      return AuthResult.success();
    } catch (e) {
      return AuthResult.failure(_getErrorMessage(e));
    }
  }
  
  Future<AuthResult> loginWithBiometrics() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics;
      if (!isAvailable) {
        return AuthResult.failure('Biometric authentication not available');
      }
      
      final isEnabled = await isBiometricEnabled();
      if (!isEnabled) {
        return AuthResult.failure('Biometric authentication not enabled');
      }
      
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Authenticate to access TradeInvoice Pro',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
      
      if (authenticated) {
        await _loadStoredUser();
        return AuthResult.success();
      } else {
        return AuthResult.failure('Biometric authentication failed');
      }
    } catch (e) {
      return AuthResult.failure(_getErrorMessage(e));
    }
  }
  
  // Registration
  Future<AuthResult> register(String name, String email, String password) async {
    try {
      final request = RegisterRequest(
        name: name,
        email: email,
        password: password,
      );
      final response = await _apiService.register(request);
      
      await _storeAuthData(response.token, response.user);
      _currentUser = response.user;
      
      return AuthResult.success();
    } catch (e) {
      return AuthResult.failure(_getErrorMessage(e));
    }
  }
  
  // Logout
  Future<void> logout() async {
    try {
      await _apiService.logout();
    } catch (e) {
      // Continue with logout even if API call fails
    }
    
    await _clearAuthData();
    _currentUser = null;
  }
  
  // Biometric authentication setup
  Future<bool> isBiometricAvailable() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics;
      final availableBiometrics = await _localAuth.getAvailableBiometrics();
      return isAvailable && availableBiometrics.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
  
  Future<bool> isBiometricEnabled() async {
    final enabled = await _storage.read(key: _biometricKey);
    return enabled == 'true';
  }
  
  Future<void> enableBiometric() async {
    await _storage.write(key: _biometricKey, value: 'true');
  }
  
  Future<void> disableBiometric() async {
    await _storage.delete(key: _biometricKey);
  }
  
  // Token management
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }
  
  Future<bool> isTokenValid() async {
    try {
      final token = await getToken();
      if (token == null) return false;
      
      final user = await _apiService.getCurrentUser();
      _currentUser = user;
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Private methods
  Future<void> _storeAuthData(String token, User user) async {
    await Future.wait([
      _storage.write(key: _tokenKey, value: token),
      _storage.write(key: _userKey, value: json.encode(user.toJson())),
    ]);
  }
  
  Future<void> _loadStoredUser() async {
    final userData = await _storage.read(key: _userKey);
    if (userData != null) {
      final userJson = json.decode(userData);
      _currentUser = User.fromJson(userJson);
    }
  }
  
  Future<void> _clearAuthData() async {
    await Future.wait([
      _storage.delete(key: _tokenKey),
      _storage.delete(key: _userKey),
    ]);
  }
  
  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('401')) {
      return 'Invalid credentials';
    } else if (error.toString().contains('404')) {
      return 'User not found';
    } else if (error.toString().contains('500')) {
      return 'Server error. Please try again later.';
    } else {
      return 'An error occurred. Please try again.';
    }
  }
}

class AuthResult {
  final bool isSuccess;
  final String? errorMessage;
  
  AuthResult.success() : isSuccess = true, errorMessage = null;
  AuthResult.failure(this.errorMessage) : isSuccess = false;
}