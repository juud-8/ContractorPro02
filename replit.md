# Contractor Invoice Management System

## Overview

This is a full-stack web application built for contractors to manage invoices, quotes, and customers. The system uses a modern tech stack with React frontend, Express backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom contractor-themed color palette
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage implementation)
- **Database Provider**: PostgreSQL (Replit-managed database)
- **API Pattern**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration
- **Storage Layer**: Abstracted interface with PostgreSQL implementation

### Database Schema
The application uses four main entities:
- **Customers**: Store client information (name, contact details, type)
- **Invoices**: Track billing documents with line items
- **Quotes**: Manage estimates and proposals
- **Line Items**: Individual items for invoices and quotes

## Key Components

### Data Layer
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Storage Interface**: Abstracted data access layer for future extensibility
- **Schema Validation**: Zod schemas for runtime type checking

### Business Logic
- **Invoice Management**: Create, update, delete invoices with line items
- **Quote System**: Generate and track quotes (placeholder implementation)
- **Customer Management**: Full CRUD operations for customer records
- **Statistics**: Dashboard metrics for revenue, pending invoices, overdue items

### UI Components
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Component Library**: Extensive shadcn/ui component collection
- **Theme System**: Custom contractor-focused color scheme
- **PDF Generation**: jsPDF integration for invoice printing

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Layer**: Express routes handle HTTP requests and validate data
3. **Business Logic**: Storage layer processes business operations
4. **Database**: Drizzle ORM executes type-safe SQL queries
5. **Response**: JSON data flows back through the layers to update UI

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography

### Development Tools
- Vite for build tooling and development server
- TypeScript for type safety
- Zod for schema validation
- ESBuild for production bundling

### Database and Hosting
- Neon Database for serverless PostgreSQL
- Drizzle Kit for database migrations
- Connection pooling with @neondatabase/serverless

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development and production modes with different Vite configurations
- Replit-specific plugins for development environment

### Server Architecture
- Express serves both API routes and static frontend files
- Middleware for logging, error handling, and request parsing
- Development: Vite dev server integration with HMR
- Production: Static file serving from dist directory

The application is designed to be a single deployable unit that can run on platforms like Replit, with the ability to scale to more complex hosting environments as needed.

## Recent Changes

### January 2025 - Mobile App Development Phase
- ✅ Completed full quote management system with builder, preview, and PDF generation
- ✅ Implemented comprehensive reports section with financial analytics and charts
- ✅ Added quote status tracking (draft, sent, accepted, rejected, expired)
- ✅ Created detailed financial reporting with revenue trends, customer analysis, and activity tracking
- ✅ Enhanced PDF generation system to support both invoices and quotes
- ✅ Added interactive charts using Recharts for data visualization
- ✅ Implemented sample data for better application demonstration
- ✅ Fixed all TypeScript compilation issues and improved data flow
- ✅ **Database Integration**: Migrated from in-memory storage to PostgreSQL database
- ✅ **Persistent Storage**: All data now stored in PostgreSQL with Drizzle ORM
- ✅ **Database Schema**: Created tables for customers, invoices, quotes, and line items
- ✅ **Sample Data**: Pre-populated database with realistic contractor data
- ✅ **Settings System**: Complete company settings with logo upload functionality
- ✅ **Logo Integration**: Logo appears in invoices, quotes, and PDF exports
- ✅ **Company Information**: Customizable company details (name, address, phone, email)
- ✅ **Invoice/Quote Templates**: Template selection options for different document styles
- ✅ **Mobile App Architecture**: Complete Flutter project structure with clean architecture
- ✅ **Core Mobile Services**: API integration, local storage, authentication, and notification services
- ✅ **Mobile Navigation**: Bottom navigation with routing system for all main features
- ✅ **Offline Functionality**: Hive-based local storage for offline invoice and client management
- ✅ **Security Features**: Biometric authentication and secure token storage implementation
- ✅ **Team Management**: Complete multi-user team system with roles and permissions
- ✅ **Enhanced Dashboard**: Added profit margins, team statistics, and financial overview
- ✅ **Permission System**: Role-based access control with Owner, Admin, Manager, Member roles
- ✅ **Team Invitations**: Email-based invitations with shareable links and expiration tracking
- ✅ **UI Improvements**: Enhanced teams page with statistics, member avatars, and role management
- ✅ **Parts/Items Management**: Complete inventory system for frequently used parts and materials
- ✅ **Parts Database**: Comprehensive parts table with SKU, pricing, stock levels, and categories
- ✅ **Sample Parts Data**: Pre-populated with common contractor items (lumber, electrical, plumbing, etc.)
- ✅ **Stripe Payment Processing**: Real payment processing integration with Stripe API
- ✅ **Payment Intent Creation**: Secure payment intent creation for invoices
- ✅ **Payment Confirmation**: Automatic payment confirmation and invoice status updates
- ✅ **Payment Checkout Page**: Complete payment form with Stripe Elements integration
- ✅ **Payment Success Page**: Payment confirmation and receipt display

### Current Status
The application now includes:
- **Complete Quote System**: Full CRUD operations, PDF generation, status management
- **Advanced Reports**: Revenue analytics, customer insights, invoice tracking, growth metrics
- **Professional UI**: Contractor-themed design with responsive layout
- **PostgreSQL Database**: Persistent storage with Drizzle ORM and proper relations
- **Sample Data**: Pre-populated database with realistic invoices, quotes, and customers
- **PDF Generation**: Both invoices and quotes can be exported as professional PDFs
- **Data Visualization**: Interactive charts showing revenue trends, status distributions, and customer analytics
- **Settings Management**: Complete company settings with logo upload, tax rates, payment terms
- **Logo Support**: Upload and display company logos in documents and PDFs
- **Customizable Templates**: Different template options for invoices and quotes
- **Advanced Customization**: Extended settings with branding, localization, document numbering
- **Email Functionality**: Professional email sending with PDF attachments for invoices and quotes
- **Template Selection**: Multiple professional templates with brand customization options
- **Notification System**: Real-time alerts and notifications for business activities
- **Document Customization**: Full control over invoice and quote appearance and content
- **Mobile App Development**: Comprehensive Flutter-based mobile application with offline functionality
- **Cross-Platform Support**: Single codebase for iOS and Android with native performance
- **Mobile-First Features**: GPS tracking, camera integration, biometric authentication, push notifications
- **Team Management System**: Complete multi-user team functionality with roles and permissions
- **Permission-Based Access**: Role-based access control (Owner, Admin, Manager, Member)
- **Team Invitations**: Email invitations with shareable links and expiration dates
- **Enhanced Dashboard**: Comprehensive business metrics with profit margins and team statistics
- **Team Activity Tracking**: Monitor team member actions and collaboration
- **Parts Inventory System**: Manage frequently used parts with SKU tracking, stock levels, and categories
- **Quick Parts Selection**: Easy part search and selection for invoices and quotes
- **Stock Management**: Track inventory levels with low stock alerts
- **Labor Items**: Support for hourly labor rates alongside physical parts
- **Stripe Payment Processing**: Real payment processing for invoices with credit card support
- **Secure Payment Checkout**: Professional payment forms with Stripe Elements integration
- **Payment Status Tracking**: Automatic payment confirmation and invoice status updates
- **Payment Receipts**: Digital receipts and payment confirmation pages