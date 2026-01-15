# Constructly AI - Construction Project Estimation Platform

> An AI-powered construction quotation and project estimation platform designed for construction professionals to generate accurate cost estimates, manage projects, and streamline the bidding process. Built with TypeScript, React, and Google Gemini AI.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Components](#components)
- [Services & Utilities](#services--utilities)
- [State Management](#state-management)
- [Hooks](#hooks)
- [Calculators](#calculators)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Payment System](#payment-system)
- [Plan Upload & AI Analysis](#plan-upload--ai-analysis)
- [Export Functionality](#export-functionality)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

---

## 🎯 Overview

**Constructly AI** is a full-stack web application that empowers construction professionals to:

- **Generate Accurate Estimates** - Specialized calculators for concrete, masonry, plumbing, electrical, roofing, earth works, finishes, rebar, and wardrobes
- **AI-Powered Assistance** - Leverages Google Gemini AI for intelligent cost analysis and architectural plan interpretation
- **Professional Quote Generation** - Create, manage, export (PDF/Excel), and track construction project quotes
- **Plan Upload & Analysis** - Upload architectural plans and PDFs for AI-powered material extraction and cost estimation
- **Dynamic Pricing** - Region-based and user-customizable material prices with real-time calculations
- **Preliminaries & BOQ Builder** - Generate preliminary costs and detailed bill of quantities
- **Project Management** - Track projects with calendar integration and status management
- **Admin Controls** - Comprehensive admin dashboard for system configuration and user management
- **Subscription System** - Tiered access with Free, Professional, and Premium plans
- **Export & Reporting** - Export quotes as PDF or Excel with detailed breakdowns

---

## ✨ Features

### Core Features

#### 1. **User Authentication & Profiles**

- Email/Password authentication
- Google OAuth 2.0 integration
- Password reset functionality
- User profiles with company information and location tracking
- Avatar upload
- Profile tier management (Free, Professional, Premium)

#### 2. **Specialized Construction Calculators**

- **Concrete Calculator** - Volume, wastage, aggregate ratios, and costs
- **Masonry Calculator** - Brick/block quantities, mortar, and labor estimates
- **Plumbing Calculator** - Pipe sizing, fittings, and labor costs
- **Electrical Calculator** - Wire gauges, load calculations, and labor hours
- **Roofing Calculator** - Material quantities, pitch calculations, and labor
- **Earth Works Calculator** - Excavation volume, soil classification, and equipment
- **Finishes Calculator** - Paint coverage, flooring, trim materials
- **Rebar Calculator** - Steel bar counts, weights, and spacing
- **Wardrobes Calculator** - Lump-sum or detailed component pricing
- **Volume Calculator** - Quick dimensional calculations

#### 3. **Quote Builder**

- Intuitive multi-section interface
- Material, labor, equipment, and services sections
- Real-time cost calculations
- Client information management
- Regional pricing adjustments
- Status tracking (draft, planning, started, in progress, completed, on hold)

#### 4. **Bill of Quantities (BOQ) Management**

- BOQ builder interface with AI support
- Material and labor line items
- Unit pricing and quantity adjustments
- Automated calculations

#### 5. **Preliminaries Builder**

- AI-powered preliminary cost generation
- Section-based cost breakdown
- Header and line items
- Automatic calculations

#### 6. **Dynamic Pricing System**

- Base material prices in database
- User-customizable pricing overrides
- Region-based price multipliers
- Labor rate customization
- Equipment rate management
- Service pricing overrides

#### 7. **Plan Upload & AI Analysis**

- Upload PDF and image files (JPG, PNG, WebP)
- Direct Gemini Vision API processing (client-side)
- Automatic material extraction from plans
- Floor count and area estimation
- Preliminary cost analysis

#### 8. **Painting & Multi-Layer Support**

- Multiple paint layer configuration
- Surface area calculations per layer
- Detailed layer-by-layer costing

#### 9. **Report Generation**

- PDF export with professional formatting
- Excel export with detailed breakdowns
- Quote and project reports
- Financial summaries

#### 10. **Project Calendar**

- Event scheduling and management
- Milestone tracking
- Project deadline management

#### 11. **Payment Processing**

- Paystack integration for card payments
- Subscription management
- Recurring billing
- Payment history tracking

#### 12. **Admin Dashboard**

- System-wide analytics
- User management and tier customization
- Configuration settings
- Variable management
- Material price management
- Reports and analytics

---

## 🛠 Technology Stack

### Frontend

- **React 18+** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - High-quality React components
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend & Database

- **Supabase** - PostgreSQL database, auth, real-time
- **PostgreSQL** - Relational database
- **PostgREST** - Auto-generated REST API

### External Services & APIs

- **Google Generative AI (Gemini 2.5)** - Vision API for plan analysis
- **Google OAuth 2.0** - Social authentication
- **Paystack** - Payment processing
- **UUID** - Unique identifier generation
- **File Saver** - Client-side file downloads

### Mobile & Desktop

- **Capacitor** - Cross-platform mobile framework (iOS/Android)

### Development Tools

- **ESLint** - Code quality
- **Prettier** - Code formatting
- **React DevTools** - Debugging

---

## 📁 Project Structure

```
Constructly-AI/
├── src/
│   ├── pages/                    # Route pages
│   │   ├── Index.tsx             # Landing page
│   │   ├── Auth.tsx              # Login/signup
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── QuoteBuilder.tsx      # Quote creation
│   │   ├── ViewAllQuotes.tsx     # Quote management
│   │   ├── Profile.tsx           # User profile
│   │   ├── AdminDashboard.tsx    # Admin controls
│   │   ├── Variables.tsx         # Variable management
│   │   ├── UploadPage.tsx        # Plan upload
│   │   ├── PaymentPage.tsx       # Subscription
│   │   ├── NotFound.tsx          # 404 page
│   │   └── auth/
│   │       └── update-password.tsx
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── PageFooter.tsx
│   │   ├── PageSections.tsx
│   │   ├── Testimonials.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Calculator.tsx
│   │   ├── EnhancedQuoteBuilder.tsx
│   │   ├── BOQBuilder.tsx
│   │   ├── PreliminariesBuilder.tsx
│   │   ├── WardrobesCalculator.tsx
│   │   ├── RenderMaterialEditor.tsx
│   │   ├── PaintingLayerConfig.tsx
│   │   ├── QuotesTab.tsx
│   │   ├── TiersTab.tsx
│   │   ├── RebarCalculationForm.tsx
│   │   ├── ConcreteCalculatorForm.tsx
│   │   ├── MasonryCalculatorForm.tsx
│   │   ├── PlumbingCalculator.tsx
│   │   ├── ElectricalCalculator.tsx
│   │   ├── RoofingCalculator.tsx
│   │   ├── EarthWorksForm.tsx
│   │   ├── FinishesCalculator.tsx
│   │   ├── Calendar.tsx
│   │   ├── PDFGenerator.tsx
│   │   ├── ExcelGenerator.tsx
│   │   ├── PaymentDialog.tsx
│   │   ├── AdminConfigDialogs.tsx
│   │   ├── ProfilePictureUpload.tsx
│   │   ├── QSSettings.tsx
│   │   ├── DashboardSettings.tsx
│   │   ├── Reports.tsx
│   │   ├── ProjectProgress.tsx
│   │   ├── QuoteExportDialog.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ui/                   # shadcn UI components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useQuotes.ts
│   │   ├── useRebarCalculator.ts
│   │   ├── useConcreteCalculator.ts
│   │   ├── useMasonryCalculatorNew.ts
│   │   ├── usePlumbingCalculator.ts
│   │   ├── useElectricalCalculator.ts
│   │   ├── useRoofingCalculator.ts
│   │   ├── useUniversalFinishesCalculator.ts
│   │   ├── useQuoteCalculations.ts
│   │   ├── useDynamicPricing.ts
│   │   ├── useMaterialPrices.ts
│   │   ├── useUserSettings.ts
│   │   ├── usePlanUpload.ts
│   │   ├── useCalendarEvents.ts
│   │   ├── useClientReviews.ts
│   │   └── use-toast.ts
│   │
│   ├── contexts/                 # React context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── PlanContext.tsx
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   ├── services/                 # Business logic services
│   │   ├── geminiService.ts
│   │   └── planParserService.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── advancedMaterialExtractor.ts
│   │   ├── boqAIService.ts
│   │   ├── preliminariesAIService.ts
│   │   ├── excavationCalculator.ts
│   │   ├── paintingCalculations.ts
│   │   ├── materialConsolidator.ts
│   │   ├── excelGenerator.ts
│   │   ├── exportUtils.ts
│   │   ├── exportBOQPDF.ts
│   │   └── doxGenerator.ts
│   │
│   ├── config/
│   │   └── materialConfig.ts
│   │
│   ├── types/
│   ├── lib/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── public/
│   ├── robots.txt
│   └── fonts/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── eslint.config.js
├── vercel.json
├── render.yaml
├── railway.json
├── capacitor.config.ts
├── index.html
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 16+ and npm
- Git
- Modern web browser

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Jeffrey-tech14/Constructly-AI.git
cd Constructly-AI

# 2. Install dependencies
npm install

# 3. Create .env.local file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_KEY=your_google_gemini_key
VITE_PAYSTACK_KEY=your_paystack_public_key

# 4. Start development server
npm run dev

# Server runs at http://localhost:5173
```

### Build for Production

```bash
# Standard build
npm run build

# High-memory build
npm run secure-build

# Preview production build
npm run preview
```

---

## 📦 Components

### Page Components

**Pages/Index.tsx** - Landing page with hero, features, testimonials, and pricing.
**Pages/Auth.tsx** - Authentication with email/password and Google OAuth.
**Pages/Dashboard.tsx** - Main dashboard with metrics, quotes, and calendar.
**Pages/QuoteBuilder.tsx** - Quote creation interface.
**Pages/ViewAllQuotes.tsx** - Quote management with filtering and export.
**Pages/Profile.tsx** - User profile management.
**Pages/AdminDashboard.tsx** - Admin controls and analytics.
**Pages/PaymentPage.tsx** - Subscription management.
**Pages/UploadPage.tsx** - Plan upload with AI analysis.
**Pages/Variables.tsx** - System variable management.

### Quote & BOQ Components

**EnhancedQuoteBuilder.tsx** - Main quote builder with multi-section support.
**BOQBuilder.tsx** - Bill of quantities builder.
**PreliminariesBuilder.tsx** - AI-generated preliminaries.
**QuotesTab.tsx** - Quote management interface.
**TiersTab.tsx** - Tier configuration.

### Calculator Components

**ConcreteCalculatorForm** - Volume and cost calculations.
**MasonryCalculatorForm** - Masonry materials and labor.
**PlumbingCalculator** - Plumbing estimates.
**ElectricalCalculator** - Electrical calculations.
**RoofingCalculator** - Roofing estimates.
**EarthWorksForm** - Excavation and earthworks.
**FinishesCalculator** - Finishes and paint.
**RebarCalculator** - Rebar calculations.
**WardrobesCalculator** - Wardrobes and cabinets (lump-sum or detailed).

### Material & Configuration

**RenderMaterialEditor.tsx** - Material configuration.
**PaintingLayerConfig.tsx** - Paint layer setup.

### Export & Reporting

**PDFGenerator.tsx** - PDF export with formatting.
**ExcelGenerator.tsx** - Excel export with worksheets.
**Reports.tsx** - Reporting interface.
**QuoteExportDialog.tsx** - Export options.

### UI Components

**Navbar.tsx** - Navigation bar.
**Hero.tsx** - Hero section.
**Testimonials.tsx** - Testimonials display.
**PageFooter.tsx** - Footer.
**Calendar.tsx** - Calendar and events.
**PaymentDialog.tsx** - Payment processing.
**ProfilePictureUpload.tsx** - Avatar upload.
**QSSettings.tsx** - Quote settings.
**DashboardSettings.tsx** - Dashboard settings.
**ProjectProgress.tsx** - Progress tracking.
**ProtectedRoute.tsx** - Auth guard.
**ThemeToggle.tsx** - Dark/light mode.

---

## 🔧 Services & Utilities

### Services

**geminiService.ts** - Material analysis using Gemini API.
**planParserService.ts** - Plan parsing with Gemini Vision API (client-side). Supports PDF and image files.

### Utilities

**boqAIService.ts** - AI-powered BOQ generation.
**preliminariesAIService.ts** - AI preliminaries generation.
**advancedMaterialExtractor.ts** - Material extraction with Gemini.
**materialConsolidator.ts** - Material consolidation and deduplication.
**paintingCalculations.ts** - Paint calculations.
**excavationCalculator.ts** - Excavation volume calculations.
**exportUtils.ts** - Export functionality.
**exportBOQPDF.ts** - BOQ PDF export.
**excelGenerator.ts** - Excel file generation.
**doxGenerator.ts** - Document generation.

---

## 🎯 State Management

### AuthContext

```typescript
- user: Current authenticated user
- profile: User profile data
- loading: Loading state
- authReady: Auth initialization complete
- signIn, signUp, signInWithGoogle, signOut, resetPassword, updateProfile
```

### ThemeContext

- Dark/light theme management
- Persists in localStorage
- Applies CSS classes

### PlanContext

- File upload tracking
- Extracted data caching
- Upload progress

---

## 🎣 Hooks

**useAuth** - Authentication state management.
**useQuotes** - Quote CRUD operations.
**useQuoteCalculations** - Core calculation engine.
**useDynamicPricing** - User pricing customization.
**useMaterialPrices** - Material price fetching.
**useUserSettings** - User settings.
**usePlanUpload** - Plan upload and parsing using `planParserService`.
**useCalendarEvents** - Calendar event management.
**use-toast** - Toast notifications.

---

## 🧮 Calculators

### Concrete Calculator

- Volume calculations
- Wastage percentage
- Aggregate ratios
- Regional pricing adjustments

### Masonry Calculator

- Brick/block quantities
- Mortar requirements
- Coursing layouts
- Material costs

### Plumbing Calculator

- Pipe sizing
- Fitting counts
- Labor hour estimation
- Cost estimates

### Electrical Calculator

- Wire gauge selection
- Load calculations
- Circuit design
- Labor hour estimation

### Roofing Calculator

- Roof pitch calculations
- Material quantities
- Labor estimates

### Earth Works Calculator

- Excavation volume
- Soil classification
- Compaction requirements
- Equipment hours

### Finishes Calculator

- Paint coverage
- Flooring quantities
- Trim and molding
- Labor costs

### Rebar Calculator

- Steel bar counts
- Length calculations
- Weight estimates
- Spacing calculations

### Wardrobes Calculator

- **Lump-Sum Mode** - Fixed amount pricing
- **Detailed Mode** - Component-based (boards, hinges, locks, drawer rails, glass)
- Usage tracker (`usesLumpSum` boolean)

---

## 📊 Database Schema

### Core Tables

**profiles**

- id, email, name, company, phone, location
- tier, quotes_used, total_projects
- avatar_url, subscription_status
- created_at, updated_at

**quotes**

- id, user_id, title, client_name, client_email, client_phone
- location, status, description
- total_amount, materials_cost, labor_cost, equipment_cost, services_cost
- discount_percentage, tax_percentage
- created_at, updated_at

**material_base_prices**

- id, name, category, base_price, unit, region
- created_at, updated_at

**user_material_prices**

- id, user_id, material_id, custom_price, region
- created_at, updated_at

**labor_types**

- id, name, category, base_rate, unit, region
- created_at

**user_labor_overrides**

- id, user_id, labor_type_id, custom_rate, region
- created_at

**calendar_events**

- id, user_id, title, description, event_date, event_time, quote_id
- created_at

**subscriptions**

- id, user_id, plan, amount, status
- subscription_code, authorization_code
- next_billing_date, cancel_at_period_end
- created_at, updated_at

---

## 🔐 Authentication

### Email/Password

- Supabase Auth
- Password hashing with bcrypt
- Session management with JWT
- Password reset via email

### Google OAuth 2.0

- One-click signup/login
- Automatic profile creation
- Secure token exchange

### Protected Routes

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

## 💳 Payment System

### Paystack Integration

1. User selects plan on PaymentPage
2. PaymentDialog initializes Paystack
3. Paystack processes payment
4. Payment verified server-side
5. Subscription activated
6. User tier upgraded

### Subscription Management

- Free/Professional/Premium plans
- Monthly billing cycles
- Automatic renewals
- Cancellation support
- Payment history tracking

---

## 📤 Plan Upload & AI Analysis

### Process Flow

1. Upload PDF or image (JPG, PNG, WebP)
2. Validate file format and size
3. Send to Gemini Vision API (client-side)
4. Extract materials and costs
5. Generate preliminary estimate
6. Review and export as quote

### Services

**planParserService.ts** - Direct Gemini Vision API integration

- Supports PDF, JPEG, PNG, WebP, GIF
- Returns structured ParsedPlanData
- Methods: parsePlanFile(), parsePlanFromUrl()

**preliminariesAIService.ts** - Preliminary cost generation

- AI-powered section creation
- Automatic calculations

---

## 📊 Export Functionality

### PDF Export

- Professional formatting
- Quote details and client info
- Item-by-item breakdown
- Materials, labor, equipment tables
- Summary totals
- Terms and conditions

### Excel Export

- Multiple worksheets:
  - Quote Summary
  - Materials Breakdown
  - Labor Breakdown
  - Equipment Breakdown
  - Services
  - Financial Summary
  - Client Information
- Formulas and formatting
- Charts and graphs

---

## 🔧 Development Workflow

### Available Scripts

```bash
npm run dev              # Start dev server
npm run build           # Production build
npm run secure-build    # High-memory build
npm run preview         # Preview prod build
npm run lint            # Run ESLint
```

### Code Style

- ESLint for quality
- Prettier for formatting
- TypeScript strict mode
- Tailwind CSS for styling

---

## 🚀 Deployment

### Vercel

```bash
npm run build
# Automatic CI/CD pipeline
```

### Render

```bash
# Configuration in render.yaml
# Auto-deploy on push
```

### Railway

```bash
# Configuration in railway.json
# Environment variables from dashboard
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_AI_KEY=your-gemini-api-key
VITE_PAYSTACK_KEY=your-paystack-public-key
VITE_APP_URL=https://constructly-ai.com
```

---

## 🎨 UI Components

40+ shadcn/ui components including:

- Button, Badge, Card
- Dialog, Drawer, Alert
- Tabs, Accordion, Collapsible
- Input, Textarea, Label
- Select, Checkbox, Radio
- Progress, Skeleton
- Toast, Popover, Tooltip
- Calendar, Date Picker
- And more...

---

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly UI
- Dark mode support
- WCAG 2.1 compliance

---

## 🤝 Contributing

```bash
# Fork, branch, commit, push, create PR
git checkout -b feature/amazing-feature
git commit -m "feat: Add amazing feature"
```

---

## 📄 License

© 2025 Jeff. All rights reserved. Unauthorized copying, distribution, or modification is strictly prohibited.

---

## 📞 Support

- GitHub Issues
- Email: support@constructly-ai.com
- Documentation: Wiki

---

## 🙏 Acknowledgments

- **shadcn/ui** - Component library
- **Supabase** - Backend infrastructure
- **Google Gemini** - AI capabilities
- **Tailwind CSS** - Styling
- **React Community** - Ecosystem
- **Paystack** - Payment processing

---

**Last Updated:** January 2026  
**Version:** 2.0.0  
**Maintainer:** Jeffrey Tech
