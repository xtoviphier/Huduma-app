# Huduma - Service Marketplace Application

## Overview

Huduma is a mobile-first service marketplace application that connects skilled workers with customers in Mombasa, Kenya. The name "Huduma" means "service" in Swahili/Kiswahili. The application is built as a Progressive Web App (PWA) using modern web technologies to provide a native mobile experience while maintaining cross-platform compatibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Kenyan flag color theme (red, green, black, white)
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Build Tool**: Vite with custom configuration for optimal development experience
- **PWA Features**: Service worker, manifest.json, and installable app functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time messaging
- **Session Management**: Express sessions with PostgreSQL session store

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: Shared between client and server (`/shared/schema.ts`)
- **Migrations**: Managed through Drizzle Kit

## Key Components

### User Management System
- **Dual User Types**: Customers and Service Providers
- **Authentication**: Phone number-based registration with SMS verification
- **Profile Management**: Mandatory fields include phone, name, location, and years of experience (for providers)
- **Internationalization**: Bilingual support (English/Swahili) with persistent language preferences

### Service Categories System
- **Predefined Categories**: Plumbing, electrical work, carpentry, mobile repair, etc.
- **Multilingual Support**: Category names and descriptions in both English and Swahili
- **Icon Integration**: Font Awesome icons for visual representation

### Real-time Communication
- **WebSocket Integration**: Live messaging between customers and service providers
- **Chat History**: Persistent message storage with photo attachment support
- **Push Notifications**: Browser-based notifications for job updates and messages

### Geolocation Services
- **Maps Integration**: Google Maps for location-based provider discovery
- **Distance Calculation**: Proximity-based provider filtering
- **Location Tracking**: Real-time job status updates with location context

### Job Management System
- **Booking Flow**: Customer request → Provider acceptance → Service delivery → Payment
- **Status Tracking**: Multi-state job progression (pending, accepted, in-progress, completed)
- **Review System**: Post-completion ratings and feedback

## Data Flow

### User Registration Flow
1. Phone number entry and validation
2. SMS verification (CAPTCHA)
3. Profile completion (name, location, user type)
4. Service provider additional details (experience, categories)

### Service Discovery Flow
1. Location-based provider search
2. Category filtering and distance radius adjustment
3. Provider profile viewing with ratings and reviews
4. Direct contact initiation

### Booking and Communication Flow
1. Job request creation with service description
2. Provider notification and acceptance (24-hour window)
3. Real-time chat activation with photo sharing
4. Job status updates and location tracking
5. Completion confirmation and payment processing

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Framework**: Radix UI components with Tailwind CSS
- **Maps**: Google Maps API for location services
- **Real-time**: WebSocket for instant messaging
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for internationalized date formatting

### Development Tools
- **TypeScript**: Strict type checking across frontend and backend
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Fast development server with HMR
- **Drizzle Kit**: Database schema management and migrations

### Payment Integration
- **M-Pesa**: Primary payment method for Kenyan market
- **Service Fees**: 10% platform commission on completed transactions

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API proxy
- **Database**: Neon development database with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Static build optimized for mobile performance
- **Backend**: ESBuild compilation to single bundled file
- **Deployment**: Configured for Replit hosting with automatic SSL

### Progressive Web App Features
- **Service Worker**: Offline capability and background sync
- **App Manifest**: Installable app with custom icons and splash screens
- **Push Notifications**: Real-time updates even when app is backgrounded
- **Responsive Design**: Mobile-first approach with desktop compatibility

### Performance Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Service worker with cache-first approach for static assets
- **Bundle Size**: Tree shaking and minimal bundle footprint

The application follows modern web development best practices with a focus on mobile user experience, real-time communication, and scalable architecture suitable for the Kenyan service marketplace.