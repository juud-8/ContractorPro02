# Mobile App Deployment Guide

## Overview
This document outlines the deployment process for the TradeInvoice Pro mobile application built with Flutter.

## Prerequisites

### Development Environment
- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase CLI tools

### Accounts and Services
- Google Play Developer Account ($25 one-time fee)
- Apple Developer Account ($99/year)
- Firebase project with authentication and messaging enabled
- Code signing certificates for iOS

## Build Configuration

### Environment Variables
Create environment-specific configuration files:

**lib/config/environments/development.dart**
```dart
const String API_BASE_URL = 'http://localhost:5000';
const String FIREBASE_WEB_API_KEY = 'your-dev-firebase-key';
const bool DEBUG_MODE = true;
```

**lib/config/environments/production.dart**
```dart
const String API_BASE_URL = 'https://your-production-api.com';
const String FIREBASE_WEB_API_KEY = 'your-prod-firebase-key';
const bool DEBUG_MODE = false;
```

### Build Flavors
Configure build flavors for different environments:

**android/app/build.gradle**
```gradle
android {
    flavorDimensions "default"
    productFlavors {
        development {
            dimension "default"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
        }
        production {
            dimension "default"
        }
    }
}
```

## Android Deployment

### 1. Prepare Release Build
```bash
# Generate release APK
flutter build apk --release --flavor production

# Generate App Bundle (recommended for Play Store)
flutter build appbundle --release --flavor production
```

### 2. Code Signing
- Generate upload key: `keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`
- Create `android/key.properties` with signing configuration
- Update `android/app/build.gradle` with signing config

### 3. Play Store Upload
- Create app listing in Google Play Console
- Upload App Bundle or APK
- Configure store listing, screenshots, and descriptions
- Set up release management and testing tracks
- Submit for review

### 4. Play Store Optimization
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: Various device sizes
- App description with keywords
- Privacy policy URL

## iOS Deployment

### 1. Prepare Release Build
```bash
# Build for iOS
flutter build ios --release --flavor production
```

### 2. Xcode Configuration
- Open `ios/Runner.xcworkspace` in Xcode
- Configure signing certificates and provisioning profiles
- Set deployment target (iOS 12.0+)
- Configure app icons and launch screens

### 3. App Store Upload
- Archive the app in Xcode
- Upload to App Store Connect via Xcode Organizer
- Configure app metadata and screenshots
- Set up TestFlight for beta testing
- Submit for App Store review

### 4. App Store Optimization
- App icon: 1024x1024 PNG
- Screenshots: Various device sizes (iPhone, iPad)
- App preview videos (optional)
- App description with keywords
- Privacy policy and terms of service

## Firebase Configuration

### 1. Project Setup
- Create Firebase project for production
- Enable Authentication (email/password, Google, Apple)
- Configure Firestore database rules
- Set up Cloud Messaging for notifications

### 2. Platform Configuration
**Android**: Download `google-services.json` and place in `android/app/`
**iOS**: Download `GoogleService-Info.plist` and add to Xcode project

### 3. Security Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## API Integration

### 1. Production API Setup
- Deploy backend API to production server
- Configure HTTPS with SSL certificates
- Set up database connections and environment variables
- Configure CORS for mobile app domain

### 2. Authentication Flow
- Implement JWT token refresh logic
- Handle token expiration gracefully
- Configure biometric authentication
- Set up secure token storage

### 3. API Endpoints
Ensure all endpoints are production-ready:
- Authentication: `/auth/login`, `/auth/register`
- Business logic: `/api/invoices`, `/api/customers`, etc.
- File uploads: `/api/upload` for receipts and documents
- Push notifications: `/api/notifications/register`

## Testing and Quality Assurance

### 1. Automated Testing
```bash
# Run unit tests
flutter test

# Run integration tests
flutter test integration_test/

# Run widget tests
flutter test test/widget_test.dart
```

### 2. Device Testing
- Test on various Android devices and API levels
- Test on different iOS devices and versions
- Test offline functionality thoroughly
- Verify camera and GPS features
- Test biometric authentication

### 3. Performance Testing
- Monitor app size and startup time
- Test memory usage and battery consumption
- Verify smooth scrolling and animations
- Check network request efficiency

## Release Management

### 1. Version Control
- Use semantic versioning (e.g., 1.0.0, 1.0.1, 1.1.0)
- Tag releases in Git
- Maintain changelog
- Create release branches

### 2. Staged Rollout
- Start with small percentage of users
- Monitor crash reports and user feedback
- Gradually increase rollout percentage
- Have rollback plan ready

### 3. Post-Release Monitoring
- Monitor crash reports (Firebase Crashlytics)
- Track user analytics and engagement
- Monitor API performance and errors
- Collect user feedback and reviews

## Continuous Integration/Continuous Deployment (CI/CD)

### 1. GitHub Actions Setup
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Mobile App
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.0.0'
      - run: flutter pub get
      - run: flutter test
      - run: flutter build apk --release
      - run: flutter build appbundle --release
```

### 2. Automated Testing
- Run tests on every commit
- Generate test coverage reports
- Run security scans
- Validate code quality

### 3. Automated Deployment
- Deploy to internal testing tracks
- Automated Play Store uploads
- TestFlight distribution for iOS
- Slack/email notifications for releases

## Security Considerations

### 1. Code Obfuscation
```bash
# Build with obfuscation
flutter build apk --obfuscate --split-debug-info=symbols/
flutter build appbundle --obfuscate --split-debug-info=symbols/
```

### 2. API Security
- Use HTTPS for all API communications
- Implement proper authentication and authorization
- Validate all inputs server-side
- Use rate limiting and request throttling

### 3. Data Protection
- Encrypt sensitive data at rest
- Use secure storage for tokens and credentials
- Implement proper session management
- Follow GDPR and privacy regulations

## Monitoring and Analytics

### 1. Crash Reporting
- Firebase Crashlytics for crash reports
- Custom logging for debugging
- Performance monitoring
- User session tracking

### 2. Analytics
- User engagement metrics
- Feature usage analytics
- Business metrics (invoices created, payments processed)
- Custom event tracking

### 3. Performance Monitoring
- App startup time
- API response times
- Memory usage patterns
- Battery consumption

## Maintenance and Updates

### 1. Regular Updates
- Security patches and bug fixes
- Feature updates based on user feedback
- Platform updates (iOS/Android)
- Dependency updates

### 2. User Support
- In-app help and documentation
- Contact support feature
- FAQ section
- Video tutorials

### 3. Backup and Recovery
- Regular database backups
- User data export functionality
- Account recovery mechanisms
- Data migration tools

## Cost Considerations

### 1. Development Costs
- Initial development: $40,000-$65,000
- Ongoing maintenance: $10,000-$20,000/year
- Third-party services: $200-$500/month

### 2. App Store Fees
- Google Play: $25 one-time + 15-30% revenue share
- Apple App Store: $99/year + 15-30% revenue share
- Payment processing: 2.9% + $0.30 per transaction

### 3. Infrastructure
- Firebase: $25-$100/month
- Push notifications: $0-$50/month
- Cloud storage: $10-$50/month
- API hosting: $20-$200/month

This deployment guide provides a comprehensive roadmap for successfully launching and maintaining the TradeInvoice Pro mobile application across both Android and iOS platforms.