# 1Fi Loan Management System (LMS)

A production-ready **Loan Against Mutual Funds (LAMF)** platform built as a technical assignment for 1Fi. This system enables users to leverage their mutual fund holdings as collateral for instant credit lines.

🔗 **Live Demo:** [frontend-lms.up.railway.app](https://frontend-lms.up.railway.app)  
📦 **Backend API:** [backend-lms.up.railway.app](https://backend-lms.up.railway.app/health)

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Backend** | Node.js + Express + TypeScript | Type safety, scalability |
| **Database** | PostgreSQL + Prisma 7 | Relational data, ORM with type generation |
| **Frontend** | Next.js 16 + React 19 | Server components, modern React |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Auth** | JWT + API Key middleware | Stateless auth for users + partners |
| **Deployment** | Railway | Simple cloud deployment |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                         Next.js 16 + React 19                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Dashboard  │  │  Eligibility│  │    Loans    │  │  Admin Panel        │ │
│  │    Page     │  │    Check    │  │   Manager   │  │  (Products, Users)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ HTTPS (REST API)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API                                     │
│                       Express.js + TypeScript                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Middleware Layer                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  JWT Auth   │  │  API Key    │  │  Validation │  │    CORS     │  │   │
│  │  │ (Users)     │  │ (Partners)  │  │   (Zod)     │  │   Helmet    │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Business Modules                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │   Auth   │ │Eligibility│ │   Loan   │ │Collateral│ │  Partner   │  │   │
│  │  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │    API     │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           Utilities                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │ EMI Calculator│  │ LTV Calculator│  │ Audit Logger │                │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ Prisma ORM
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PostgreSQL                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Users   │ │  Loans   │ │Collateral│ │ Products │ │   Audit Logs     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions
- **Modular Architecture**: Each domain (Auth, Loans, Collateral) is a separate module
- **Middleware Pipeline**: Auth → Validation → Controller → Service → Database
- **Type Safety**: End-to-end TypeScript with Prisma-generated types
- **Stateless API**: JWT tokens enable horizontal scaling

---

## Setup and Run Instructions

### Prerequisites
- Node.js 22+ (required for Prisma 7)
- PostgreSQL database (or use Railway)

### 1. Clone Repository
```bash
git clone https://github.com/ArpitRajputGithub/Loan-Management-system.git
cd Loan-Management-system
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your values:
# DATABASE_URL=postgresql://user:pass@host:5432/db
# JWT_SECRET=your-secret-key
# FRONTEND_URL=http://localhost:3000

# Push schema to database
npx prisma db push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local (optional for local dev)
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@1fi.com | admin123 |
| User | user@1fi.com | user123 |

---

## API Endpoints and Example Responses

### Authentication

#### POST `/api/v1/auth/login`
```json
// Request
{
  "email": "admin@1fi.com",
  "password": "admin123"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@1fi.com",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

### Eligibility Check (1Fi Core Flow)

#### POST `/api/v1/eligibility/check`
```json
// Request
{
  "pan": "ABCDE1234F",
  "mobile": "9876543210"
}

// Response
{
  "success": true,
  "data": {
    "eligible": true,
    "maxCreditLimit": 250000,
    "breakdown": [
      {
        "fundName": "HDFC Mid-Cap Opportunities Fund",
        "fundType": "EQUITY",
        "value": 180000,
        "ltv": 0.5,
        "eligibleAmount": 90000
      },
      {
        "fundName": "ICICI Prudential Liquid Fund",
        "fundType": "DEBT",
        "value": 200000,
        "ltv": 0.8,
        "eligibleAmount": 160000
      }
    ],
    "availableTenures": [3, 6, 12, 24, 36]
  }
}
```

### Loan Applications

#### GET `/api/v1/loan-applications`
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "applicationNumber": "LA-2025-00001",
      "status": "SUBMITTED",
      "requestedAmount": 100000,
      "selectedTenure": 12,
      "user": { "name": "John Doe", "email": "john@example.com" },
      "createdAt": "2025-12-26T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "total": 10, "totalPages": 1 }
}
```

#### POST `/api/v1/loan-applications/:id/approve` (Admin)
```json
// Request
{
  "approvedAmount": 95000
}

// Response
{
  "success": true,
  "message": "Application approved",
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "approvedAmount": 95000
  }
}
```

### Partner API (Fintech Integration)

#### POST `/api/v1/partner/applications`
```bash
# Header: X-API-KEY: 1fi_pk_xxxxx
```
```json
// Request
{
  "customer": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "pan": "XYZAB1234K",
    "mobile": "9988776655"
  },
  "requestedAmount": 50000,
  "selectedTenure": 6
}

// Response
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "applicationNumber": "LA-2025-00002",
    "status": "SUBMITTED"
  }
}
```

---

### Customer Management (KYC)

#### GET `/api/v1/customers`
```json
// Response
{
  "customers": [
    {
      "id": "uuid",
      "firstName": "Rahul",
      "lastName": "Sharma",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "kycStatus": "VERIFIED",
      "aadhaarVerified": true,
      "panVerified": true,
      "creditScore": 750
    }
  ],
  "pagination": { "page": 1, "total": 50, "totalPages": 3 }
}
```

#### GET `/api/v1/customers/kyc-stats`
```json
// Response
{
  "pending": 12,
  "inProgress": 5,
  "verified": 45,
  "rejected": 3,
  "total": 65
}
```

### EMI Schedule

#### GET `/api/v1/emi/calculate?principal=100000&rate=12&tenure=12`
```json
// Response
{
  "emiAmount": 8885,
  "totalPayment": 106620,
  "totalInterest": 6620,
  "schedule": [
    {
      "installmentNo": 1,
      "emiAmount": 8885,
      "principalAmount": 7885,
      "interestAmount": 1000,
      "openingBalance": 100000,
      "closingBalance": 92115
    }
  ]
}
```

#### GET `/api/v1/emi/loan/:loanId`
```json
// Response
{
  "paid": 3,
  "pending": 9,
  "overdue": 0,
  "totalPaid": 26655,
  "totalDue": 106620,
  "schedule": [...]
}
```

### Margin Calls (LTV Monitoring)

#### GET `/api/v1/margin-calls/ltv/:loanId`
```json
// Response
{
  "ltv": 68.5,
  "collateralValue": 200000,
  "outstandingAmount": 137000,
  "status": "WARNING",
  "thresholds": {
    "SAFE": 60,
    "WARNING": 70,
    "MARGIN_CALL": 75,
    "LIQUIDATION": 85
  }
}
```

#### POST `/api/v1/margin-calls/check`
Checks all active loans and creates margin calls if LTV exceeds threshold.

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    User     │       │  LoanApplication │       │    Loan     │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id          │◄──────│ userId           │       │ id          │
│ email       │       │ id               │◄──────│ loanAppId   │
│ name        │       │ applicationNumber│       │ loanNumber  │
│ role        │       │ status           │       │ principal   │
│ pan         │       │ requestedAmount  │       │ emiAmount   │
│ phone       │       │ approvedAmount   │       │ status      │
└─────────────┘       │ selectedTenure   │       └──────┬──────┘
                      │ loanProductId    │              │
      ┌───────────────│ productId        │              │
      │               └────────┬─────────┘              │
      │                        │                        │
      ▼                        ▼                        ▼
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│ LoanProduct │       │   Collateral     │       │ Transaction │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id          │       │ id               │       │ id          │
│ name        │       │ loanApplicationId│       │ loanId      │
│ interestRate│       │ loanId           │       │ type        │
│ equityLtv   │       │ fundName         │       │ amount      │
│ debtLtv     │       │ fundType         │       │ createdAt   │
│ minAmount   │       │ currentValue     │       └─────────────┘
│ maxAmount   │       │ lienStatus       │
└─────────────┘       └──────────────────┘
```

### Key Tables

#### Users
```sql
- id (UUID, PK)
- email (UNIQUE)
- passwordHash
- name
- role (ADMIN | USER)
- pan, phone
- createdAt, updatedAt
```

#### LoanApplication
```sql
- id (UUID, PK)
- applicationNumber (UNIQUE, e.g., LA-2025-00001)
- userId (FK → User)
- loanProductId (FK → LoanProduct)
- status (DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED | DISBURSED)
- requestedAmount, approvedAmount
- selectedTenure
- rejectionReason
- createdAt, updatedAt
```

#### Loan
```sql
- id (UUID, PK)
- loanNumber (UNIQUE, e.g., LN-2025-00001)
- loanApplicationId (FK → LoanApplication)
- principal, interestRate, tenureMonths
- emiAmount, outstandingPrincipal, outstandingInterest
- status (ACTIVE | CLOSED | DEFAULTED)
- disbursedAt, closedAt, nextEmiDate
```

#### Collateral
```sql
- id (UUID, PK)
- loanApplicationId (FK)
- loanId (FK, nullable)
- fundName, isin, folioNumber
- fundType (EQUITY | DEBT | HYBRID)
- units, nav, currentValue
- lienStatus (PENDING | MARKED | RELEASED)
- eligibleAmount
```

---

## Key Implementation Decisions

### 1. State Machine for Loan Applications
```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → DISBURSED
            ↓             ↓             ↓
         REJECTED      REJECTED      REJECTED
```
- Explicit validation at each transition
- Prevents invalid state changes

### 2. LTV Calculation
```typescript
LTV = Outstanding Principal / Current Collateral Value
- SAFE: LTV < 70%
- WARNING: 70% ≤ LTV < 85%
- CRITICAL: LTV ≥ 85%
```

### 3. EMI Calculation (Reducing Balance)
```typescript
EMI = P × r × (1+r)^n / ((1+r)^n - 1)
// P = Principal, r = monthly rate, n = tenure months
```

---

## Author

**Arpit Rajput**  
Built as a technical assignment for 1Fi

---

## License

MIT
