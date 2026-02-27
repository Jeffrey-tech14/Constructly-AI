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
│   │   ├── QuoteBuilder.tsx
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

**QuoteBuilder.tsx** - Main quote builder with multi-section support.
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

## 🔧 Troubleshooting & Common Errors

This section helps users identify and resolve common issues encountered while using Constructly AI.

### 1. **Plaster/Finish Showing Zero Values Across All Items**

**Problem:** When reviewing masonry or finishes calculations, all plaster/finish items display 0.

**Root Cause:** Missing masonry work configuration. Plaster calculations depend on masonry wall dimensions and surface areas.

**Solution:**

1. Navigate back to the **Masonry Calculator** section
2. Verify that you have:
   - Selected a **Block Type** (Large Block, Standard Block, or Small Block)
   - Entered **Wall Height** (in meters)
   - Entered **Wall Perimeter** (total linear meters of walls)
   - Ensured **Thickness values are numbers**, not NaN or blank
3. Check that block dimensions show actual numbers (e.g., "0.19", "0.14", "0.09")
4. Return to Finishes section - values should now calculate correctly

**Prevention:** Always complete masonry configuration before moving to finishes calculations.

### 2. **NaN (Not a Number) Values Appearing on Any Page**

**Problem:** Pages show "NaN" instead of calculated values, making quotes unusable.

**Root Cause:** Missing or incomplete QS (Quantity Surveying) Settings that calculators depend on.

**Solution:**

1. Go to **Dashboard** → **QS Settings** (gear icon)
2. Verify all required fields are populated:
   - **Material Prices** - All material categories have prices set
   - **Labor Rates** - Hourly or daily rates configured
   - **Equipment Costs** - If using equipment in calculations
   - **Regional Adjustments** - Location-based multipliers set
   - **Wastage Percentages** - Default wastage for materials (5-15%)
3. Check for any red validation alerts
4. Save settings and refresh the quote page
5. If NaN persists, clear browser cache and reload

**Common Missing Settings:**

- Concrete prices (affects Concrete, Foundation, Rebar calculators)
- Masonry block/brick prices
- Paint/finishing material prices
- Labor rates for skilled trades
- Equipment rental rates

### 3. **Door/Window Paint Calculations Show Zero**

**Problem:** Door and window paint calculations aren't computing quantities or costs.

**Root Cause:** Glass type, dimensions, or frame specifications are incomplete.

**Solution:**

1. In **DoorsWindowsEditor**, verify:
   - Glass Type is selected (Clear, Tinted, or Frosted)
   - Standard sizes are selected with valid dimensions (not custom with blank fields)
   - If custom size: Height AND Width both have numeric values
   - Frame Type is specified (Wood, Steel, Aluminum)
2. Ensure glass prices are configured in QS Settings under "Windows"
3. For transom/fanlight calculations, verify transom Height and Width are set
4. Check that door/window count is at least 1

**Prevention:** Complete all door/window specifications before moving to paint calculations.

### 4. **Ceiling Calculator Not Showing All Three Options**

**Problem:** Ceiling calculator only shows one ceiling type option instead of three (Gypsum, Painting, Other).

**Root Cause:** Material data not loaded or incomplete glass/ceiling material definitions.

**Solution:**

1. Navigate to **QS Settings**
2. Verify **Ceiling Materials** section includes:
   - Gypsum board products
   - Paint products (for painted ceilings)
   - Other ceiling types (wood, metal, etc.)
3. Refresh page
4. Try different ceiling type radio buttons - they should toggle independent material sets

### 5. **Concrete Calculator Showing Wrong Volume**

**Problem:** Concrete volume doesn't match manual calculations (L × W × H).

**Root Cause:** Typically confusion between different unit inputs or incorrect form work assumptions.

**Solution:**

1. Verify all dimensions are in **meters**, not centimeters or mixed units
2. Check if **Form Work** is enabled (affects calculations)
3. Verify **Concrete Mix Ratio** selected is appropriate
4. Confirm **Wastage %** is reasonable (typically 5-10%)
5. For slabs: Ensure you're using clear span, not including beams
6. For columns: Verify height calculation includes all stories

**Common Errors:**

- Entering 300cm instead of 3m
- Using perimeter instead of length for linear elements
- Mixing 1:3:6 and 1:4:8 mixes without intent

### 6. **Rebar Calculator Showing Incorrect Quantities**

**Problem:** Reinforcement bar counts don't match specifier drawings.

**Root Cause:** Spacing, length, or hook configuration mismatched with specifications.

**Solution:**

1. Verify **Bar Spacing** matches the drawing (e.g., 150mm, 200mm)
2. Check **Main Bar Size** and **Distribution Bar Size** match specs
3. Confirm **Effective Depth** is correctly calculated: d = h - (cover + link size + main bar radius)
4. For hooked bars: Verify **Hook Length** configuration if applicable
5. Validate **Cover** matches structural requirements (typically 25-50mm)

**Prevention:** Reference structural drawings before inputting rebar specifications.

### 7. **Plumbing/Electrical Pipe Sizing Shows Warnings**

**Problem:** Pipe size recommendations appear incorrect or cause validation errors.

**Root Cause:** Load calculation or pressure drop considerations not properly configured.

**Solution:**

1. For **Plumbing**:
   - Verify fixture unit values match actual fixtures
   - Check water supply pressure settings (typically 300-400 kPa)
   - Confirm pipe material (PVC, copper, HDPE) is selected
2. For **Electrical**:
   - Verify cable size matches load current calculation
   - Check voltage drop doesn't exceed 3% (5% acceptable for sub-circuits)
   - Confirm circuit breaker rating matches cable ampacity

### 8. **Saving Quote Show Errors or Quote Disappears**

**Problem:** Quote fails to save or disappears after refresh.

**Root Cause:** Common causes include NaN values, missing core data, or authentication issues.

**Solution:**

1. **Before Saving**: Check entire quote for NaN values (use Find: "NaN")
2. **Check Authentication**: Verify you're logged in (check profile icon)
3. **Core Data Check**: Ensure these sections are complete:
   - Project Name provided
   - Location selected
   - At least one calculator with valid values
4. **Browser Console**: Press F12 → Console, check for errors
5. **Try Exporting**: Attempt PDF/Excel export to identify problematic sections
6. **Manual Save**: Complete high-value sections one at a time and save

### 9. **PDF/Excel Export Shows Blank Values or Wrong Calculations**

**Problem:** Exported documents contain blank cells, NaN, or calculations differ from on-screen.

**Root Cause:** Export templates may not be sync'd with live calculations or formatting issues.

**Solution:**

1. **Verify On-Screen Values**: Confirm all values display correctly before exporting
2. **Clear Cache**: Hard refresh browser (Ctrl+Shift+R) then re-export
3. **Try Different Format**: If PDF fails, try Excel export (or vice versa)
4. **Check Printer Settings**: For PDF exports, ensure proper page orientation (landscape recommended)
5. **Flatten Values**: Some exports calculate formulas - ensure base data is correct
6. **File Size**: If file is unusually large/small, export may be corrupted - retry

**Prevention:** Always visually verify quote on-screen before exporting for client delivery.

### 10. **Material Prices Not Updating When QS Settings Changed**

**Problem:** Calculators show old prices even after updating QS Settings.

**Root Cause:** Cached values or missing refresh trigger.

**Solution:**

1. **Save QS Settings** - Ensure you hit Save/Update button
2. **Navigate Away and Back** - Go to another section then return
3. **Hard Refresh**: Press Ctrl+Shift+R (full cache clear)
4. **Check Effective Date**: Some pricing may have start/end dates
5. **Verify Material Names**: Material names in calculator must exactly match QS Settings names
6. **Browser Console**: Check for load errors (F12 → Console)

### 11. **Door/Window Count Not Syncing with BOQ Builder**

**Problem:** Door/window totals in DoorsWindowsEditor don't match BOQ quantities.

**Root Cause:** Count field or BOQ refresh not syncing properly.

**Solution:**

1. Verify each door/window item has a **Qty** value ≥ 1
2. Check that all items are in the **same room/section** if grouped
3. Save the quote (Force Save to trigger sync)
4. Navigate to BOQ Builder and **refresh** the page
5. Verify that sums show: (Individual Qty × Item Count)

**Common Mistake:** Setting Count = 0 (disabled items don't export)

### 12. **Custom Size Door/Window Not Calculating Price**

**Problem:** Custom-sized doors/windows show blank price or won't calculate.

**Root Cause:** Custom pricing not entered or dimensions incomplete.

**Solution:**

1. In **DoorsWindowsEditor**, select custom size option
2. Enter **both Height and Width** in meters (required)
3. For custom pricing: Enter **Price (Ksh)** field (optional - will use material rates if blank)
4. Verify frame specifications are complete
5. Check that glass type is selected if transom is enabled

**Prevention:** For production quotes, prefer standard sizes when possible - they have pre-configured pricing.

### 13. **Kitchen/Wardrobes Calculator Not Showing Component Breakdown**

**Problem:** Kitchen layout shows as lump sum only, can't see individual cabinet costs.

**Root Cause:** Calculator mode not switched to detailed component view.

**Solution:**

1. In **Kitchen and Wardrobes Calculator**, toggle between:
   - **Lump Sum** mode (quick pricing for entire kitchen)
   - **Detailed Components** mode (individual cabinet breakdown)
2. Select appropriate mode for your quotation style
3. Ensure all cabinet dimensions are in meters
4. Verify material selections match available pricing in QS Settings

### 14. **Ceiling Paint Coverage Shows Higher Than Expected**

**Problem:** Paint quantity for ceiling seems excessive compared to floor area.

**Root Cause:** Multi-coat specification or primer included in calculation.

**Solution:**

1. Review **Painting Calculator** settings for:
   - Number of coats (typically 2 for finish, may include primer)
   - Paint type selection (affects coverage rate)
   - Surface condition (new vs. repaint affects coverage)
2. Verify **Room Height/Slope** doesn't inflate the ceiling area
3. Check **Waste Factor %** (typically 10-15% for ceiling application)
4. Compare with manufacturer's coverage rates (typically 10-12 m²/liter for ceilings)

### 15. **Profile Picture Upload Fails**

**Problem:** Avatar upload shows error or image doesn't appear.

**Root Cause:** File size, format, or permission issues.

**Solution:**

1. **File Format**: Use JPG, PNG, or WebP only
2. **File Size**: Keep under 5MB (recommended: 1-2MB)
3. **Image Dimensions**: Minimum 200×200 pixels recommended
4. **Permissions**: Ensure browser has camera/file access permission
5. **Storage**: Check your account isn't at storage limit
6. Try uploading from a different browser or device

---

### Quick Diagnostic Checklist

When something isn't working, go through this checklist:

- [ ] Have you refreshed the page (Ctrl+F5)?
- [ ] Are you logged in? (Check profile icon)
- [ ] Have you saved the quote? (Try manual save)
- [ ] Do QS Settings have all required data? (Check for blank/NaN)
- [ ] Are dependent calculators complete? (E.g., masonry before finishes)
- [ ] Does browser console show errors? (F12 → Console)
- [ ] Try using a different browser or private/incognito window
- [ ] Clear browser cache completely and retry

**Still Having Issues?**

- Check documentation: [TECHNICAL.md](TECHNICAL.md), [DESIGN_PATTERNS.md](DESIGN_PATTERNS.md)
- Review recent changes in project
- Contact support with: browser type, screen screenshot, and steps to reproduce

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
