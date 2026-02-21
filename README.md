# Constructly AI - Construction Project Estimation Platform

> An AI-powered construction quotation and project estimation platform designed for construction professionals to generate accurate cost estimates, manage projects, and streamline the bidding process. Built with TypeScript, React, and Google Gemini AI.

## 📋 Table of Contents

- [Technical Documentation](#-technical-documentation)
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

## 📚 Technical Documentation

For detailed technical information, developers should refer to our comprehensive documentation:

| Document                                     | Purpose                                                                                                                                                                                                  | Audience                                  |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [**TECHNICAL.md**](TECHNICAL.md)             | Complete system architecture, calculator patterns, hooks, state management, API integration, database schema deep dive, performance optimization, error handling, and deployment architecture            | Backend & Frontend Developers, Architects |
| [**DESIGN_PATTERNS.md**](DESIGN_PATTERNS.md) | Reusable patterns, best practices, form handling patterns, calculation patterns, pricing patterns, UI patterns, error handling approaches, performance optimization patterns, and anti-patterns to avoid | All Developers                            |
| [**TESTING_GUIDE.md**](TESTING_GUIDE.md)     | Comprehensive testing strategy, unit tests for calculations, hook testing, component testing, async testing, integration testing, E2E testing, and test utilities                                        | QA Engineers, Test Developers             |
| [**DATA_MODEL.md**](DATA_MODEL.md)           | Complete TypeScript interfaces, database schema relationships, validation schemas, material pricing models, and component data structures                                                                | Developers working with data              |

**Quick Start for Developers:**

1. Read **TECHNICAL.md** for system overview and architecture
2. Reference **DESIGN_PATTERNS.md** when building new calculators or components
3. Use **DATA_MODEL.md** for TypeScript interface definitions
4. Follow **TESTING_GUIDE.md** for writing tests

---

## 🎯 Overview

**Constructly AI** is a full-stack web application that empowers construction professionals to:

- **Generate Accurate Estimates** - Specialized calculators for concrete, masonry, plumbing, electrical, roofing, earth works, finishes, rebar, and wardrobes
- **AI-Powered Assistance** - Leverages Google Gemini AI for intelligent architectural plan interpretation
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
- **Masonry Calculator** - Brick/block quantities, mortar estimates with DPC, hoop iron, and plaster
- **Plumbing Calculator** - Pipe sizing, fittings costs
- **Electrical Calculator** - Wire gauges, load calculations
- **Roofing Calculator** - Material quantities, pitch calculations, and labor
- **Earth Works Calculator** - Excavation volume, soil classification, and equipment
- **Internal Finishes Calculator** - Paint coverage (with optional checkbox), flooring, trim, wet area tiling
- **External Finishes Calculator** - Cladding, painting, plaster thickness calculations
- **Painting Calculator** - Multi-layer painting specs (skimming, undercoat, finishing paint) for interior/exterior walls
- **Doors & Windows Editor** - Comprehensive door/window scheduling with frames, architrave, ironmongery, transom/fanlight options
- **Door/Window Paint Calculator** - Specialized paint calculations for doors and windows
- **Ceiling Calculator** - Suspended ceiling, drop ceiling, and ceiling paint calculations
- **Flooring Calculator** - Flooring materials with subfloor and adhesive requirements
- **Kitchen & Wardrobes Calculator** - Lump-sum or detailed component pricing with assembly details and Custom countertop measurements and material selection
- **Foundation Walling Calculator** - Concrete footings, foundation blocks, and perimeter calculations
- **Rebar Calculator** - Steel bar counts, weights, and spacing patterns
- **Walling Calculator** - Brick/block walls with mortar and plaster calculations
- **Finishes Calculator** - General finishes handling
- **Equipment Selector** - Construction equipment selection and rental costs
- **Services Selector** - Third-party services and subcontractor management
- **Subcontractors Selector** - Subcontractor pricing and management
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
- Material line items
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

#### 8. **Comprehensive Door & Window Management**

- Standard and custom door/window sizing
- Multiple door types (steel, flush, panel, T&G)
- Glass types (clear, tinted, frosted) with thickness recommendations
- Frame specifications with wall-thickness-based sizing
- **Transom/Fanlight** - Optional checkbox-enabled upper glazing
- **Architrave** - Decorative trim with automatic quantity calculation
- **Ironmongery** - All hardware components checkbox-enabled:
  - Hinges with auto-quantity (typically 3)
  - Locks with size specifications
  - Handles and pulls
  - Bolts and closers
  - All with dynamic pricing from material database

#### 9. **Advanced Finishes System**

- **Internal Finishes**
  - Material finishes (stone, tiles, wood, stucco, gypsum board, panels) always visible
  - **Paint checkbox** - Optional paint layer with auto-initialization
  - **Wet area tiling** - Kitchen/bathroom with specific tile sizes and adhesive requirements
- **External Finishes**
  - Material cladding options
  - Exterior painting with multi-layer specs
  - Plaster thickness calculations (default 25mm)
  - Wall pointing and jointing
  - Keying preparation option

#### 10. **Painting & Multi-Layer Support**

- Multiple paint layer configuration (skimming, undercoat, finishing)
- Surface area calculations per layer
- Coverage rate-aware sizing with wastage
- Separate calculators for interior walls, exterior walls, and door/window finishes
- Real-time cost calculations based on material pricing

#### 11. **Equipment & Services Management**

- Equipment selector for construction tools and machinery
- Equipment rental rates with time-based pricing
- Services selector for third-party work
- Subcontractor management with fixed/hourly rates
- Labor hour estimation for all activities

#### 12. **Report Generation**

- PDF export with professional formatting and compliance
- Excel export with detailed worksheets and calculations
- Material Schedule PDF generation
- Quote and project reports
- Financial summaries with BOQ integration

#### 13. **Project Calendar**

- Event scheduling and management
- Milestone tracking
- Project deadline management
- Integration with quotes

#### 14. **Payment Processing**

- Paystack integration for card payments
- Subscription management
- Recurring billing cycles
- Payment history tracking
- Payment verification and confirmation

#### 15. **Admin Dashboard**

- System-wide analytics and reporting
- User management with tier customization
- Configuration settings and preferences
- Variable and constant management
- Material price management with regional multipliers
- Reports, analytics, and user activity tracking

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
│   │   ├── PreliminariesOptionsPage.tsx
│   │   ├── WardrobesCalculator.tsx
│   │   ├── KitchenAndWardrobesCalculator.tsx
│   │   ├── RenderMaterialEditor.tsx
│   │   ├── PaintingLayerConfig.tsx
│   │   ├── PaintingCalculator.tsx
│   │   ├── QuotesTab.tsx
│   │   ├── TiersTab.tsx
│   │   ├── RebarCalculationForm.tsx
│   │   ├── ConcreteCalculatorForm.tsx
│   │   ├── MasonryCalculatorForm.tsx
│   │   ├── PlumbingCalculator.tsx
│   │   ├── ElectricalCalculator.tsx
│   │   ├── RoofingCalculator.tsx
│   │   ├── EarthWorksForm.tsx
│   │   ├── InternalFinishesCalculator.tsx
│   │   ├── ExternalFinishesCalculator.tsx
│   │   ├── FlooringCalculator.tsx
│   │   ├── CeilingCalculator.tsx
│   │   ├── CountertopsCalculator.tsx
│   │   ├── WallingCalculator.tsx
│   │   ├── FoundationWallingCalculator.tsx
│   │   ├── DoorsWindowsEditor.tsx
│   │   ├── DoorWindowPaintCalculator.tsx
│   │   ├── EquipmentSelector.tsx
│   │   ├── ServicesSelector.tsx
│   │   ├── SubcontractorsSelector.tsx
│   │   ├── OtherFinishes.tsx
│   │   ├── Calendar.tsx
│   │   ├── PDFGenerator.tsx
│   │   ├── ExcelGenerator.tsx
│   │   ├── MaterialSchedulePDF.tsx
│   │   ├── PaymentGate.tsx
│   │   ├── AdminConfigDialogs.tsx
│   │   ├── ProfilePictureUpload.tsx
│   │   ├── QSSettings.tsx
│   │   ├── DashboardSettings.tsx
│   │   ├── Reports.tsx
│   │   ├── ProjectProgress.tsx
│   │   ├── QuoteExportDialog.tsx
│   │   ├── UserGuide.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── PublicLayout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ui/                   # shadcn UI components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useQuotes.ts
│   │   ├── useQuoteCalculations.ts
│   │   ├── useQuoteGeometry.ts
│   │   ├── useRebarCalculator.ts
│   │   ├── useConcreteCalculator.ts
│   │   ├── useMasonryCalculatorNew.ts
│   │   ├── usePlumbingCalculator.ts
│   │   ├── useElectricalCalculator.ts
│   │   ├── useRoofingCalculator.ts
│   │   ├── usePaintingCalculator.ts
│   │   ├── useUniversalFinishesCalculator.ts
│   │   ├── useInternalFinishesCalculator.ts
│   │   ├── useExternalFinishesCalculator.ts
│   │   ├── useFlooringCalculator.ts
│   │   ├── useFoundationWallingCalculator.ts
│   │   ├── useWallingCalculator.ts
│   │   ├── useEquipmentCalculator.ts
│   │   ├── useServicesCalculator.ts
│   │   ├── useSubcontractorsCalculator.ts
│   │   ├── useDynamicPricing.ts
│   │   ├── useMaterialPrices.ts
│   │   ├── useUserSettings.ts
│   │   ├── usePlanUpload.ts
│   │   ├── useCalendarEvents.ts
│   │   ├── useClientReviews.ts
│   │   ├── useBBSUpload.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── use-mobile.tsx
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
**MasonryCalculatorForm** - Masonry materials, labor, DPC, hoop iron, and plaster.
**PlumbingCalculator** - Plumbing pipe, fittings
**ElectricalCalculator** - Wire gauge selection, load calculations, and labor.
**RoofingCalculator** - Roofing material quantities costs.
**EarthWorksForm** - Excavation volume, soil classification, and equipment.
**InternalFinishesCalculator** - Paint finishes (checkbox-based), materials, wet area tiling.
**ExternalFinishesCalculator** - Cladding, painting, plaster with thickness calculations.
**PaintingCalculator** - Multi-layer painting (skimming, undercoat, finishing) for walls.
**DoorsWindowsEditor** - Door/window scheduling with frames, architrave, ironmongery, transom options.
**DoorWindowPaintCalculator** - Specialized paint calculations for doors and windows.
**CeilingCalculator** - Suspended and drop-ceiling calculations with paint.
**FlooringCalculator** - Flooring materials with subfloor and adhesive requirements.
**CountertopsCalculator** - Custom countertop measurements and materials.
**KitchenAndWardrobesCalculator** - Kitchen and wardrobe design (lump-sum or detailed).
**FoundationWallingCalculator** - Foundation blocks and concrete footings.
**RebarCalculator** - Rebar counts, weights, and spacing calculations.
**WallingCalculator** - Brick/block walling with mortar and plaster.
**OtherFinishes** - General finishes processing.
**EquipmentSelector** - Construction equipment rental and costs.
**ServicesSelector** - Services and subcontractor management.
**SubcontractorsSelector** - Subcontractor pricing and selection.

### Material & Configuration

**RenderMaterialEditor.tsx** - Material configuration.
**PaintingLayerConfig.tsx** - Paint layer setup with coverage rates.
**ProfilePictureUpload.tsx** - Avatar upload.

### Export & Reporting

**PDFGenerator.tsx** - PDF export with professional formatting.
**ExcelGenerator.tsx** - Excel export with multiple worksheets.
**MaterialSchedulePDF.tsx** - Material schedule PDF generation.
**Reports.tsx** - Reporting interface.
**QuoteExportDialog.tsx** - Export options and compliance.

### UI Components

**Navbar.tsx** - Navigation with theme and profile controls.
**Hero.tsx** - Landing page hero section.
**Testimonials.tsx** - Client testimonials carousel.
**PageFooter.tsx** - Footer with links and social.
**PageSections.tsx** - Reusable section components.
**Calendar.tsx** - Calendar with event scheduling.
**PaymentGate.tsx** - Payment processing UI.
**QSSettings.tsx** - Quote settings and configuration.
**DashboardSettings.tsx** - Dashboard preferences.
**ProjectProgress.tsx** - Progress tracking visualization.
**ProtectedRoute.tsx** - Authentication guard component.
**PublicLayout.tsx** - Public page layout wrapper.
**UserGuide.tsx** - In-app user guidance.
**ErrorBoundary.tsx** - Error handling boundary.
**ThemeToggle.tsx** - Dark/light mode toggle.

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

**useAuth** - Authentication state management with profile data.
**useQuotes** - Quote CRUD operations and retrieval.
**useQuoteCalculations** - Core quote calculation engine.
**useQuoteGeometry** - Wall dimensions and geometry calculations.
**useDynamicPricing** - User pricing customization and overrides.
**useMaterialPrices** - Material price fetching with region support.
**useUserSettings** - User preferences and profile settings.
**usePlanUpload** - Plan upload and parsing using `planParserService`.
**useCalendarEvents** - Calendar event CRUD operations.
**usePaintingCalculator** - Multi-layer painting specifications and calculations.
**useConcreteCalculator** - Concrete volume and material calculations.
**useMasonryCalculatorNew** - Masonry, DPC, hoop iron, plaster, doors/windows calculations.
**usePlumbingCalculator** - Plumbing material calculations.
**useElectricalCalculator** - Electrical calculations
**useRoofingCalculator** - Roofing calculations and material quantities.
**useRebarCalculator** - Rebar counts, weights, and spacing.
**useUniversalFinishesCalculator** - Generic finishes calculation engine.
**useInternalFinishesCalculator** - Internal wall finishes (with paint option).
**useExternalFinishesCalculator** - External finishes and plaster thickness.
**useFlooringCalculator** - Flooring materials and adhesive requirements.
**useFoundationWallingCalculator** - Foundation and footing calculations.
**useWallingCalculator** - Wall construction material and labor.
**useEquipmentCalculator** - Equipment rental and costs.
**useServicesCalculator** - Third-party services pricing.
**useSubcontractorsCalculator** - Subcontractor management and costs.
**useBBSUpload** - BBS (Bills of Supply) document handling.
**useOnlineStatus** - Network connectivity tracking.
**use-mobile** - Mobile device detection.
**useClientReviews** - Client review management.
**use-toast** - Toast notifications.

---

## 🧮 Calculators

### Concrete Calculator

- Concrete volume calculations
- Aggregate ratios (cement, sand, gravel)
- Wastage percentage adjustments
- Regional pricing with multipliers
- Total material costs

### Masonry Calculator

- Brick/block quantities with joint factors
- Mortar requirements (sand + cement)
- DPC (Damp Proof Course) membrane coverage
- Hoop iron specifications (20kg/25kg rolls)
- Plaster requirements with thickness options (internal/external)
- Door/window deductions
- Material costs

### Plumbing Calculator

- Pipe sizing based on flow rates
- Pipe fitting counts and types
- Labor hour estimation
- Regional material pricing
- Total plumbing system cost

### Electrical Calculator

- Wire gauge selection based on load
- Circuit design and protection
- Load calculations in kW/kVA
- Labor hour estimation
- Material costs

### Roofing Calculator

- Roof pitch and coverage calculations
- Material quantities (shingles, trusses, etc.)
- Underlayment and trim materials
- Labor hour estimation
- Cost breakdowns

### Earth Works Calculator

- Excavation volume calculations
- Soil classification and handling
- Compaction requirements
- Equipment hours and costs
- Material removal and disposal

### Internal Finishes Calculator

- **Paint Finishes** (Checkbox-optional)
  - Multi-layer painting (skimming, undercoat, finishing)
  - Surface area calculations
  - Paint coverage rates and wastage
- **Material Finishes**
  - Stone cladding, tile cladding, wood paneling
  - Gypsum board, smooth stucco, fluted panels
- **Wet Area Tiling**
  - Kitchen and bathroom wall tiling
  - Adhesive and grout requirements
  - Corner strips and edge treatment
  - Tile sizes from 150x150mm to 1200x600mm

### External Finishes Calculator

- **Painting** - Multi-layer exterior paint specifications
- **Material Finishes** - Cladding (marble, limestone, marzella, wall master)
- **Plaster** - Thickness calculations (standard 25mm) with cement/sand requirements
- **Wall Pointing** - Mortar jointing calculations

### Painting Calculator (Standalone)

- Multi-layer specifications for interior and exterior walls
- **Layer Types:**
  - Skimming (preparation layer)
  - Undercoat (primer)
  - Finishing Paint (top coat)
- Coverage rate calculations per layer
- Wastage adjustments based on QS settings
- Quick initialization for wall dimensions

### Doors & Windows Editor

**Doors:**

- Door types: Steel, solid flush, semi-solid flush, panel, T&G
- Standard and custom sizing
- Frame types: Wood, steel, aluminum
- Transom/fanlight (optional checkbox)
- Architrave with standard sizes
- Quarter round molding
- **Ironmongery** (hinges, locks, handles, bolts, closers) - all checkbox-enabled

**Windows:**

- Standard and custom sizes
- Glass types: Clear, tinted, frosted
- Glass thickness: 3-12mm with recommendations
- Frame sizing by wall thickness
- Glazing putty calculations
- Optional ironmongery

### Ceiling Calculator

- Suspended ceiling (drop-down) calculations
- Ceiling area and material requirements
- Paint coverage for ceiling finishing

### Flooring Calculator

- Flooring material selection
- Subfloor preparation
- Adhesive and grout requirements
- Labor hour estimation

### Countertops Calculator

- Custom countertop dimensions
- Material selection and pricing
- Edge treatments and finish options

### Kitchen & Wardrobes Calculator

- **Lump-Sum Mode** - Fixed amount pricing
- **Detailed Mode** - Component-based:
  - Cabinet boards (melamine, plywood, solid wood)
  - Hardware (hinges, soft-close dampers)
  - Locks and handles
  - Drawer rails and guides
  - Glass doors and shelves
  - Finishing materials
- Assembly and installation labor

### Foundation Walling Calculator

- Foundation depth and width calculations
- Concrete footing volume
- Foundation block/brick requirements
- Ground preparation labor

### Rebar Calculator

- Bar diameter selection (10mm, 12mm, 16mm, 20mm, etc.)
- Bar count and spacing calculations
- Length calculations with overlap
- Weight per bar and total weight
- Cost estimation

### Walling Calculator

- Brick/block wall construction
- Mortar requirements
- Plaster and finishing
- Labor hour estimation

### Equipment Selector

- Equipment rental rates
- Daily/weekly/monthly pricing
- Equipment transport costs
- Fuel and operator costs

### Services Selector

- Third-party service pricing
- Subcontractor management
- Service labor hour estimation

### Subcontractors Selector

- Subcontractor rate cards
- Fixed price vs. hourly rates
- Service category selection
- Total subcontract cost

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

**Last Updated:** February 2026  
**Version:** 2.1.0  
**Maintainer:** Jeffrey Tech
