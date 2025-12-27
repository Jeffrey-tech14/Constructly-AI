# Constructly AI - Construction Project Estimation Platform

> An AI-powered construction quotation and project estimation platform designed for construction professionals to generate accurate cost estimates, manage projects, and streamline the bidding process.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Core Components](#core-components)
- [Key Modules](#key-modules)
- [State Management](#state-management)
- [Calculators](#calculators)
- [Quote Management](#quote-management)
- [User Roles & Tiers](#user-roles--tiers)
- [Database Schema](#database-schema)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Payment System](#payment-system)
- [File Upload & Processing](#file-upload--processing)
- [Export Functionality](#export-functionality)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

---

## 🎯 Overview

**Constructly AI** is a full-stack web application that empowers construction professionals to:

- **Generate Accurate Estimates** - Specialized calculators for concrete, masonry, plumbing, electrical, roofing, earth works, and finishes
- **AI-Powered Assistance** - Leverages Google's Gemini AI for intelligent cost analysis and recommendations
- **Professional Quote Generation** - Create, export (PDF/Excel), and manage construction project quotes
- **Plan Upload & Analysis** - Upload architectural plans for AI-powered cost estimation
- **Dynamic Pricing** - Region-based and user-customizable material prices with real-time calculations
- **Project Management** - Track projects from quote to completion with calendar integration
- **Admin Controls** - Comprehensive admin dashboard for system configuration and user management
- **Subscription System** - Tiered access with Free, Professional, and Premium plans

---

## ✨ Features

### Core Features

#### 1. **User Authentication & Profiles**

- Email/Password authentication
- Google OAuth 2.0 integration
- Password reset functionality
- User profiles with company information, location tracking
- Avatar upload with profile pictures
- Profile tier management (Free, Professional, Premium)

#### 2. **Specialized Construction Calculators**

- **Concrete Calculator** - Calculate concrete volume and costs
- **Masonry Calculator** - Brick/block counts and material estimates
- **Plumbing Calculator** - Pipe sizing and fixture costs
- **Electrical Calculator** - Wire gauges, circuit calculations, labor costs
- **Roofing Calculator** - Material quantities and slope calculations
- **Earth Works Calculator** - Excavation and grading estimates
- **Finishes Calculator** - Paint, flooring, trim materials
- **Rebar Calculator** - Reinforcement steel calculations
- **Volume Calculator** - Quick dimensional calculations

#### 3. **Quote Builder**

- Intuitive UI for creating construction quotes
- Multi-section quote composition (materials, labor, equipment)
- Real-time cost calculations
- Client information management
- Project location and regional pricing adjustments
- Status tracking (draft, planning, started, in progress, completed, on hold)

#### 4. **Bill of Quantities (BOQ) Management**

- BOQ builder interface
- Material and labor line items
- Unit pricing and quantity adjustments
- Automated calculations

#### 5. **Dynamic Pricing System**

- Base material prices in database
- User-customizable pricing overrides
- Region-based price multipliers
- Labor rate customization
- Equipment rate management
- Service pricing overrides
- Transport rate calculations

#### 6. **Plan Upload & AI Analysis**

- Architecture plan image upload
- OCR (Optical Character Recognition) with Tesseract
- AI-powered cost estimation using Google Gemini
- Automatic material and labor extraction
- Preliminary cost analysis

#### 7. **Report Generation**

- PDF export with professional formatting
- Excel export with detailed breakdowns
- Quote and project reports
- Financial summaries
- Customizable report templates

#### 8. **Project Calendar**

- Event scheduling and management
- Milestone tracking
- Deadline reminders
- Client meeting calendar
- Integration with quote timeline

#### 9. **Payment Processing**

- Paystack integration for card payments
- Subscription management
- Recurring billing
- Payment history tracking
- Invoice generation

#### 10. **Admin Dashboard**

- System-wide analytics
- User management
- Configuration settings
- Variable management (labor rates, equipment costs)
- Material price management
- Tier customization
- Reports and analytics

---

## 🛠 Technology Stack

### Frontend

- **React 18+** - UI framework with hooks and functional components
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Framer Motion** - Animation and motion library
- **React Router** - Client-side routing
- **TanStack React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - TypeScript-first schema validation

### Backend & Database

- **Supabase** - PostgreSQL database, authentication, real-time subscriptions
- **PostgreSQL** - Relational database engine
- **PostgREST** - Auto-generated REST API from database schema

### External Services & APIs

- **Google Generative AI (Gemini)** - AI-powered text analysis and cost estimation
- **Google OAuth 2.0** - Social authentication
- **Paystack** - Payment processing
- **Tesseract.js** - OCR for plan image analysis
- **jsPDF** - PDF document generation
- **SheetJS** - Excel file generation

### Mobile & Desktop

- **Capacitor** - Cross-platform mobile framework (iOS/Android support)
- **Electron** (optional) - Desktop application packaging

### Development Tools

- **ESLint** - Code quality and linting
- **Prettier** - Code formatting
- **React DevTools** - Browser debugging
- **Vite DevTools** - Build optimization

---

## 📁 Project Structure

```
Constructly-AI/
├── src/
│   ├── pages/                    # Route pages
│   │   ├── Index.tsx             # Landing page
│   │   ├── Auth.tsx              # Login/signup page
│   │   ├── Dashboard.tsx         # Main user dashboard
│   │   ├── QuoteBuilder.tsx      # Quote creation interface
│   │   ├── ViewAllQuotes.tsx     # Quote history and management
│   │   ├── Profile.tsx           # User profile management
│   │   ├── AdminDashboard.tsx    # Admin controls
│   │   ├── Variables.tsx         # Variable management page
│   │   ├── UploadPage.tsx        # Plan upload interface
│   │   ├── PaymentPage.tsx       # Payment and subscription page
│   │   ├── NotFound.tsx          # 404 page
│   │   └── auth/
│   │       └── update-password.tsx # Password reset
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Hero.tsx              # Landing page hero section
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── Calculator.tsx        # Volume calculator dialog
│   │   ├── EnhancedQuoteBuilder.tsx # Main quote builder
│   │   ├── BOQBuilder.tsx        # Bill of quantities builder
│   │   ├── RebarCalculationForm.tsx
│   │   ├── ConcreteCalculatorForm.tsx
│   │   ├── MasonryCalculatorForm.tsx
│   │   ├── PlumbingCalculator.tsx
│   │   ├── ElectricalCalculator.tsx
│   │   ├── RoofingCalculator.tsx
│   │   ├── EarthWorksForm.tsx
│   │   ├── FinishesCalculator.tsx
│   │   ├── Calendar.tsx          # Event scheduling
│   │   ├── PDFGenerator.tsx      # PDF export
│   │   ├── ExcelGenerator.tsx    # Excel export
│   │   ├── PaymentDialog.tsx     # Payment UI
│   │   ├── AdminConfigDialogs.tsx
│   │   ├── ProfilePictureUpload.tsx
│   │   ├── QSSettings.tsx        # Quote settings
│   │   ├── DashboardSettings.tsx # Dashboard customization
│   │   ├── PageSections.tsx      # Page layout sections
│   │   ├── Reports.tsx           # Reporting interface
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   └── ui/                   # shadcn UI components (auto-generated)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── tabs.tsx
│   │       ├── input.tsx
│   │       └── ... (30+ UI components)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useQuotes.ts          # Quote management hook
│   │   ├── useRebarCalculator.ts # Rebar calculations
│   │   ├── useConcreteCalculator.ts
│   │   ├── useMasonryCalculatorNew.ts
│   │   ├── usePlumbingCalculator.ts
│   │   ├── useElectricalCalculator.ts
│   │   ├── useRoofingCalculator.ts
│   │   ├── useUniversalFinishesCalculator.ts
│   │   ├── useQuoteCalculations.ts # Main calculations logic
│   │   ├── useDynamicPricing.ts  # Dynamic pricing management
│   │   ├── useMaterialPrices.ts  # Material price fetching
│   │   ├── useUserSettings.ts    # User settings management
│   │   ├── usePlanUpload.ts      # Plan upload logic
│   │   ├── useCalendarEvents.ts  # Calendar events
│   │   ├── useClientReviews.ts   # Client reviews
│   │   └── use-toast.ts          # Toast notifications
│   │
│   ├── contexts/                 # React context providers
│   │   ├── AuthContext.tsx       # Authentication state
│   │   ├── ThemeContext.tsx      # Theme management (dark/light)
│   │   └── PlanContext.tsx       # Plan upload state
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client initialization
│   │       └── types.ts          # TypeScript types for database schema
│   │
│   ├── services/
│   │   └── geminiService.ts      # Google Gemini AI integration
│   │
│   ├── config/
│   │   └── materialConfig.ts     # Material configurations
│   │
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── lib/                      # Library functions
│   ├── assests/                  # Static images
│   ├── App.tsx                   # App root with routing
│   ├── App.css                   # Global styles
│   ├── index.css                 # Global CSS
│   └── main.tsx                  # Entry point
│
├── public/
│   ├── robots.txt
│   └── fonts/
│
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── eslint.config.js              # ESLint rules
├── vercel.json                   # Vercel deployment config
├── render.yaml                   # Render deployment config
├── railway.json                  # Railway deployment config
├── capacitor.config.ts           # Capacitor mobile config
├── index.html                    # HTML entry point
└── README.md                     # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 16+ and npm
- Git
- Modern web browser

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Jeffrey-tech14/Constructly-AI.git
cd Constructly-AI

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env.local file with:
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

# High-memory build (for larger projects)
npm run secure-build

# Preview production build
npm run preview
```

### Mobile Development (Capacitor)

```bash
# Build for mobile
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Sync and open in native IDE
npx cap sync
npx cap open android
npx cap open ios
```

---

## 🧩 Core Components

### Pages

#### **Index.tsx** - Landing Page

- Marketing hero section
- Feature showcase
- Call-to-action buttons
- Testimonials
- Pricing tiers display
- Navigation to signup/login

#### **Auth.tsx** - Authentication

- Login with email/password
- Signup with profile creation
- Google OAuth integration
- Password reset workflow
- Form validation
- Error handling

#### **Dashboard.tsx** - Main Dashboard

- Key metrics display (total value, active projects, completions)
- Recent quotes list
- Upcoming events calendar
- Quick action buttons
- Project statistics
- Tab-based interface (Overview, Reports, Calendar)

#### **QuoteBuilder.tsx** - Quote Creation

- Wrapped EnhancedQuoteBuilder component
- State management for quote data
- Navigation flow

#### **EnhancedQuoteBuilder.tsx** - Advanced Quote Interface

- Multi-section quote composition
- Material selection and pricing
- Labor cost calculations
- Equipment rental management
- Service additions
- Regional multipliers
- Client information form
- Real-time total calculations
- Preliminary cost generation
- Quote status management

#### **ViewAllQuotes.tsx** - Quote Management

- List all user quotes
- Filter by status, date, client
- Search functionality
- Quote details view
- Duplicate quote
- Edit quote
- Delete quote
- Export options (PDF/Excel)

#### **Profile.tsx** - User Profile

- Edit personal information
- Company details
- Location and timezone
- Avatar upload
- Subscription tier display
- Quotes usage statistics
- Account security settings
- Theme preferences

#### **AdminDashboard.tsx** - Admin Controls

- System analytics
- User management
- Configuration settings
- Material pricing management
- Labor rate configuration
- Equipment costs
- System variables
- User tier management
- Revenue reports

#### **PaymentPage.tsx** - Subscription Management

- Plan selection
- Pricing display
- Feature comparison
- Current subscription status
- Billing history
- Payment method management

### Calculators

#### **ConcreteCalculatorForm**

- Volume calculations
- Wastage percentage
- Aggregate ratios (sand, gravel, cement)
- Cost per cubic meter
- Regional pricing adjustments
- Material density calculations

#### **MasonryCalculatorForm**

- Brick/block quantities
- Mortar requirements
- Coursing layouts
- Wall area calculations
- Material costs per unit
- Labor estimates

#### **PlumbingCalculator**

- Pipe sizing by flow rate
- Fitting counts
- Material specifications
- Labor hours
- Cost estimates
- Code compliance checks

#### **ElectricalCalculator**

- Wire gauge selection
- Load calculations
- Circuit design
- Conduit sizing
- Labor hour estimation
- Material quantity calculations

#### **RoofingCalculator**

- Roof pitch calculations
- Material quantity from area
- Shingle/tile counts
- Underlayment requirements
- Labor estimates
- Weather resistance factors

#### **EarthWorksForm**

- Excavation volume
- Soil classification
- Compaction requirements
- Disposal costs
- Equipment hours
- Labor estimates

#### **UniversalFinishesCalculator**

- Paint coverage calculations
- Flooring material quantities
- Trim and molding
- Hardware and fixtures
- Labor hours
- Material costs

#### **RebarCalculator**

- Steel bar counts by size
- Length calculations
- Weight estimates
- Spacing calculations
- Tying wire requirements
- Cost per ton

---

## 🎲 Key Modules

### State Management & Context

#### **AuthContext.tsx**

Manages application-wide authentication state:

```typescript
interface AuthContextType {
  user: User | null; // Current authenticated user
  profile: Profile | null; // User profile data
  loading: boolean; // Loading state
  authReady: boolean; // Auth initialization complete
  refreshProfile: () => Promise<void>;
  signIn: (email, password) => Promise;
  signUp: (email, password, name?) => Promise;
  signInWithGoogle: () => Promise;
  signOut: () => Promise;
  resetPassword: (email) => Promise;
  updateProfile: (updates) => Promise;
}
```

#### **ThemeContext.tsx**

Manages dark/light theme preferences:

- Persists theme in localStorage
- Applies CSS class to document
- Provides theme toggle function

#### **PlanContext.tsx**

Manages architectural plan upload state:

- File upload tracking
- OCR processing state
- Extracted data caching
- Upload progress

### Custom Hooks

#### **useQuotes**

```typescript
// Manages quote CRUD operations
const {
  quotes,
  loading,
  error,
  createQuote,
  updateQuote,
  deleteQuote,
  fetchQuotes,
  exportPDF,
  exportExcel,
} = useQuotes();
```

#### **useDynamicPricing**

```typescript
// Manages user-customizable pricing
const {
  materialPrices,
  laborRates,
  equipmentRates,
  updateMaterialPrice,
  updateLaborRate,
  applyRegionalMultiplier,
} = useDynamicPricing(userId, region);
```

#### **useQuoteCalculations**

```typescript
// Core calculation engine for estimates
const {
  calculateMaterials,
  calculateLabor,
  calculateEquipment,
  calculateServices,
  calculateTotal,
  applyDiscount,
} = useQuoteCalculations();
```

#### **usePlanUpload**

```typescript
// Handles architectural plan uploads and OCR
const { upload, isProcessing, extractedData, ocrResult, generateEstimate } =
  usePlanUpload();
```

---

## 📊 Database Schema

### Key Tables

#### **profiles**

```sql
- id (UUID, PK)
- email (Text, Unique)
- name (Text)
- company (Text)
- phone (Text)
- location (Text)
- tier (Text) -- 'Free', 'Professional', 'Premium'
- quotes_used (Integer)
- total_projects (Integer)
- completed_projects (Integer)
- total_revenue (Numeric)
- is_admin (Boolean)
- overall_profit_margin (Numeric)
- avatar_url (Text)
- subscription_status (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **quotes**

```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- title (Text)
- client_name (Text)
- client_email (Text)
- client_phone (Text)
- location (Text)
- status (Text) -- 'draft', 'planning', 'started', 'in_progress', 'completed', 'on_hold'
- description (Text)
- total_amount (Numeric)
- materials_cost (Numeric)
- labor_cost (Numeric)
- equipment_cost (Numeric)
- services_cost (Numeric)
- discount_percentage (Numeric)
- tax_percentage (Numeric)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **material_base_prices**

```sql
- id (UUID, PK)
- name (Text)
- category (Text)
- base_price (Numeric)
- unit (Text)
- region (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **user_material_prices**

```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- material_id (UUID, FK → material_base_prices)
- custom_price (Numeric)
- region (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **labor_types**

```sql
- id (UUID, PK)
- name (Text)
- category (Text)
- base_rate (Numeric)
- unit (Text)
- region (Text)
- created_at (Timestamp)
```

#### **user_labor_overrides**

```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- labor_type_id (UUID, FK → labor_types)
- custom_rate (Numeric)
- region (Text)
- created_at (Timestamp)
```

#### **calendar_events**

```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- title (Text)
- description (Text)
- event_date (Date)
- event_time (Time)
- quote_id (UUID, FK → quotes)
- created_at (Timestamp)
```

#### **subscriptions**

```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- plan (Text) -- 'free', 'professional', 'premium'
- amount (Numeric)
- status (Text) -- 'active', 'past_due', 'cancelled'
- subscription_code (Text)
- authorization_code (Text)
- next_billing_date (Date)
- cancel_at_period_end (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

---

## 🔐 Authentication

### Email/Password Authentication

- Uses Supabase Auth
- Password hashing with bcrypt
- Session management with JWT tokens
- Password reset via email link

### Google OAuth 2.0

- One-click signup/login
- Automatic profile creation
- Email verification
- Secure token exchange

### Protected Routes

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

- Redirects unauthenticated users to login
- Checks user profile before rendering
- Maintains auth session across page reloads

### Session Management

- Automatic session persistence
- Token refresh handling
- Logout with session cleanup
- Multi-device session support

---

## 💳 Payment System

### Paystack Integration

```typescript
// Payment flow:
1. User selects plan on PaymentPage
2. PaymentDialog initializes Paystack popup
3. User enters card details
4. Paystack processes payment
5. Payment verified server-side
6. Subscription activated in database
7. User tier upgraded
```

### Subscription Management

- Plan selection (Free/Professional/Premium)
- Monthly billing cycles
- Automatic renewals
- Cancellation support
- Payment history tracking
- Invoice generation

### Tier Features

**Free Tier**

- 5 quotes/month
- Basic calculators
- No reports
- No calendar

**Professional Tier**

- 50 quotes/month
- All calculators
- Basic reports
- Calendar & events
- Plan upload (10/month)

**Premium Tier**

- Unlimited quotes
- AI plan analysis
- Advanced reports
- Priority support
- Custom pricing

---

## 📤 File Upload & Processing

### Plan Upload (UploadPage.tsx)

**Process Flow:**

1. User uploads architectural plan image
2. Image validated for format and size
3. Tesseract OCR extracts text/measurements
4. Google Gemini AI analyzes content
5. Materials and costs extracted
6. Preliminary estimate generated
7. User reviews and exports as quote

**Supported Formats:**

- JPEG, PNG, WebP
- Maximum 10MB
- Minimum 1024x768 resolution

**OCR Processing:**

- Text extraction from plans
- Measurement detection
- Label recognition
- Scale interpretation

**AI Analysis:**

- Cost estimation
- Material identification
- Labor hour calculation
- Risk assessment

---

## 📊 Export Functionality

### PDF Export (PDFGenerator.tsx)

```typescript
// Export includes:
- Quote header with client info
- Item-by-item breakdown
- Material costs table
- Labor costs table
- Equipment costs
- Services additions
- Summary totals
- Terms and conditions
- Company branding
```

### Excel Export (ExcelGenerator.tsx)

```typescript
// Export includes:
- Multiple worksheets:
  - Quote Summary
  - Materials Breakdown
  - Labor Breakdown
  - Equipment Breakdown
  - Services
  - Financial Summary
  - Client Information
- Formulas for calculations
- Formatting and styling
- Charts and graphs
```

---

## 🎨 UI Components (shadcn/ui)

### Available Components

- Button, Badge, Card
- Dialog, Drawer, Alert
- Tabs, Accordion, Collapsible
- Input, Textarea, Label
- Select, Checkbox, Radio
- Progress, Skeleton
- Toast, Popover, Tooltip
- Calendar, Date Picker
- Command, Combobox
- And 20+ more...

---

## 🔧 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:frontend   # Frontend only
npm run dev:backend    # Backend (if applicable)

# Building
npm run build          # Production build
npm run secure-build   # High-memory build
npm run preview        # Preview prod build

# Code Quality
npm run lint           # Run ESLint
```

### Code Style

- ESLint configuration for code quality
- Prettier for formatting (configured in VSCode)
- TypeScript strict mode enabled
- Tailwind CSS for styling

### Git Workflow

```bash
# Branch strategy
main              # Production branch
develop           # Development branch
feature/*         # Feature branches

# Commit messages
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
```

---

## 📱 Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach

- All layouts start mobile
- Progressive enhancement for larger screens
- Touch-friendly UI elements
- Optimized performance

### Dark Mode Support

- Theme toggle in navbar
- System preference detection
- Persistent theme selection
- WCAG contrast compliance

---

## ♿ Accessibility

### WCAG 2.1 Compliance

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast ratios (4.5:1)
- Focus indicators
- Screen reader compatible

---

## 🚀 Deployment

### Deployment Options

#### **Vercel**

```bash
# Automatic deployment from GitHub
# Configuration in vercel.json
npm run build
# Automatic CI/CD pipeline
```

#### **Render**

```bash
# Configuration in render.yaml
# Auto-deploy on push to main
```

#### **Railway**

```bash
# Configuration in railway.json
# Environment variables from Railway dashboard
```

#### **Docker**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google AI
VITE_GOOGLE_AI_KEY=your-gemini-api-key

# Payment
VITE_PAYSTACK_KEY=your-paystack-public-key

# Optional
VITE_APP_URL=https://constructly-ai.com
VITE_API_URL=https://api.constructly-ai.com
```

---

## 📈 Performance Optimization

### Bundle Optimization

- Code splitting by routes
- Dynamic imports for heavy components
- Tree shaking of unused code
- Minification and compression

### Runtime Performance

- React.memo for component optimization
- useMemo for expensive calculations
- useCallback for event handlers
- Lazy loading of images
- Infinite scroll for lists

### Database Optimization

- Indexed columns for queries
- Connection pooling
- Query result caching
- Pagination for large datasets

---

## 🐛 Debugging & Logging

### Browser DevTools

- React DevTools for component inspection
- Redux DevTools for state debugging
- Network tab for API calls
- Console for error logging

### Error Tracking

- Sentry integration (optional)
- Error boundaries for graceful failures
- User-friendly error messages
- Detailed console logs in development

---

## 🤝 Contributing

### Development Setup

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and commit
git add .
git commit -m "feat: Add amazing feature"

# 4. Push to fork
git push origin feature/amazing-feature

# 5. Create Pull Request
```

### Code Review Checklist

- TypeScript types are correct
- Components are properly documented
- Tests are included
- No console errors or warnings
- Responsive design tested
- Dark mode compatible

---

## 📄 License

© 2025 Jeff. All rights reserved. Unauthorized copying, distribution, or modification of this project is strictly prohibited.

---

## 📞 Support & Contact

For issues, questions, or feature requests:

- GitHub Issues: [Create an issue](https://github.com/Jeffrey-tech14/Constructly-AI/issues)
- Email: support@constructly-ai.com
- Documentation: [Wiki](https://github.com/Jeffrey-tech14/Constructly-AI/wiki)

---

## 🙏 Acknowledgments

- **shadcn/ui** - Component library foundation
- **Supabase** - Backend infrastructure
- **Google Gemini** - AI capabilities
- **Tailwind CSS** - Styling framework
- **React Community** - Ecosystem and libraries
- **Paystack** - Payment processing
- **Tesseract.js** - OCR engine

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Maintainer:** Jeffrey Tech
