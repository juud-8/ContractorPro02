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
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration

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