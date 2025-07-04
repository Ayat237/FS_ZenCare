# 🏥 ZenCare Admin Web Application - Complete Development Specification

## 📋 Project Overview

Create a modern, responsive web-based administration panel for ZenCare Healthcare Management System. This will be a React-based web application with a clean, professional UI for managing doctors, patients, appointments, and system administration.

## 🎯 Core Features Required

### 1. Authentication & Authorization

- **Admin Login System**
  - Email/password authentication
  - JWT token management
  - Session management with auto-logout
  - Role-based access control
  - Secure token storage

### 2. Doctor Management

- **Pending Doctor Verifications**

  - View list of doctors awaiting verification
  - Detailed doctor profile review
  - Document verification (education, certifications, licenses)
  - Approve/reject doctor applications
  - Send notification emails to doctors

- **Verified Doctors Management**
  - View all verified doctors
  - Doctor profile management
  - Suspend/reactivate doctor accounts
  - View doctor statistics and performance

### 3. Dashboard & Analytics

- **Overview Dashboard**

  - Key metrics and KPIs
  - Recent activities
  - Pending actions requiring attention
  - System health status

- **Analytics & Reports**
  - User registration trends
  - Doctor verification statistics
  - Appointment analytics
  - System usage metrics

## 🛠 Technical Stack Recommendations

### Frontend Framework

```json
{
  "framework": "React 18+ with TypeScript",
  "build": "Vite",
  "styling": "Tailwind CSS",
  "routing": "React Router v6",
  "state": "Zustand or Redux Toolkit",
  "forms": "React Hook Form",
  "validation": "Zod",
  "http": "Axios",
  "charts": "Recharts"
}
```

### UI Components

- **Component Library**: Shadcn/ui or Ant Design
- **Data Tables**: React Table (TanStack Table)
- **Date Handling**: Date-fns
- **Icons**: Lucide React or Heroicons

### Authentication & Security

- JWT token management with refresh tokens
- Axios interceptors for auth
- React Error Boundary for error handling
- Input validation and sanitization

## 🌐 API Integration Endpoints

### Base Configuration

```typescript
const API_BASE_URL = "http://localhost:4000";
```

### 1. Authentication Endpoint

```typescript
// POST /admin/login
interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

// Usage Example:
const response = await axios.post("/admin/login", {
  email: "zencare117@gmail.com",
  password: "HealthMinistry!11zencare7",
});
```

### 2. Pending Doctors Endpoint

```typescript
// GET /admin/pending-doctors
// Headers: Authorization: Bearer {token}

interface PendingDoctorsResponse {
  success: boolean;
  message: string;
  data: {
    doctors: Array<{
      userId: string;
      doctorData: {
        specialty: string;
        yearsOfExperience: string;
        education: Array<{
          degree: string;
          institution: string;
          graduationYear: number;
        }>;
        certifications: string[];
        hospitalAffiliation: Array<{
          name: string;
        }>;
        clinicBranches: Array<{
          address: {
            displayName: string;
            coordinates: {
              latitude: number;
              longitude: number;
            };
          };
          phoneNumber: string;
        }>;
      };
      profileImageObject: {
        URL: {
          secure_url: string;
          public_id: string;
        };
        customId: string;
      };
      verificationId: string | null;
    }>;
  };
}
```

### 3. Doctor Verification Endpoint

```typescript
// PATCH /admin/verify-doctor/{userId}
// Headers: Authorization: Bearer {token}

interface VerifyDoctorRequest {
  isAdminApproved: boolean;
}

interface VerifyDoctorResponse {
  success: boolean;
  message: string;
  data: {
    doctor: any; // Updated doctor object
  };
}

// Usage Example:
const response = await axios.patch(
  `/admin/verify-doctor/${doctorId}`,
  { isAdminApproved: true },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

## 🎨 Design System

### Color Palette

```css
:root {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-900: #0c4a6e;

  /* Status Colors */
  --success-500: #10b981;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
  --info-500: #3b82f6;

  /* Neutral Colors */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-500: #64748b;
  --gray-900: #0f172a;
}
```

### Typography Scale

```css
.text-xs {
  font-size: 0.75rem;
} /* 12px */
.text-sm {
  font-size: 0.875rem;
} /* 14px */
.text-base {
  font-size: 1rem;
} /* 16px */
.text-lg {
  font-size: 1.125rem;
} /* 18px */
.text-xl {
  font-size: 1.25rem;
} /* 20px */
.text-2xl {
  font-size: 1.5rem;
} /* 24px */
.text-3xl {
  font-size: 1.875rem;
} /* 30px */
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Logo, Breadcrumbs, User Menu, Notifications)       │
├─────────────┬───────────────────────────────────────────────┤
│ Sidebar     │ Main Content Area                             │
│             │                                               │
│ 📊 Dashboard│ ┌─────────────────────────────────────────┐   │
│ 👨‍⚕️ Doctors  │ │ Page Content                            │   │
│ 👥 Users    │ │                                         │   │
│ ⚙️ Settings │ │                                         │   │
│ 📋 Reports  │ │                                         │   │
│             │ └─────────────────────────────────────────┘   │
└─────────────┴───────────────────────────────────────────────┘
```

## 📁 Recommended Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── Card.tsx
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── forms/                 # Form components
│   │   ├── LoginForm.tsx
│   │   └── DoctorVerificationForm.tsx
│   └── charts/                # Chart components
│       ├── MetricsChart.tsx
│       └── TrendChart.tsx
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── doctors/
│   │   ├── PendingDoctorsPage.tsx
│   │   ├── VerifiedDoctorsPage.tsx
│   │   └── DoctorDetailPage.tsx
│   ├── users/
│   │   └── UsersPage.tsx
│   └── settings/
│       └── SettingsPage.tsx
├── services/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── doctors.ts
│   │   ├── users.ts
│   │   └── apiClient.ts
│   └── utils/
│       ├── dateHelpers.ts
│       └── formatters.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useDoctors.ts
│   └── useLocalStorage.ts
├── store/
│   ├── authStore.ts
│   ├── doctorStore.ts
│   └── index.ts
├── types/
│   ├── auth.ts
│   ├── doctor.ts
│   └── api.ts
├── utils/
│   ├── constants.ts
│   ├── validators.ts
│   └── helpers.ts
└── styles/
    ├── globals.css
    └── components.css
```

## 🔧 Key Components Implementation

### 1. Authentication Components

#### LoginForm.tsx

```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  // Form implementation with validation
};
```

#### ProtectedRoute.tsx

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  // Auth checking logic
};
```

### 2. Doctor Management Components

#### PendingDoctorsTable.tsx

```typescript
interface PendingDoctorsTableProps {
  doctors: PendingDoctor[];
  onVerify: (doctorId: string, approved: boolean) => void;
  isLoading: boolean;
}

const PendingDoctorsTable: React.FC<PendingDoctorsTableProps> = ({
  doctors,
  onVerify,
  isLoading,
}) => {
  // Table implementation with sorting, filtering, pagination
};
```

#### DoctorDetailModal.tsx

```typescript
interface DoctorDetailModalProps {
  doctor: PendingDoctor;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (approved: boolean) => void;
}

const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onVerify,
}) => {
  // Detailed doctor profile with verification actions
};
```

### 3. Dashboard Components

#### StatCard.tsx

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
}) => {
  // Statistics card with trend indicators
};
```

#### ActivityFeed.tsx

```typescript
interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  limit = 10,
}) => {
  // Recent activities list
};
```

## 🔒 Security Implementation

### Authentication Service

```typescript
class AuthService {
  private token: string | null = null;

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post("/admin/login", credentials);
    this.token = response.data.data.token;
    localStorage.setItem("adminToken", this.token);
    return response.data;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem("adminToken");
  }

  getToken(): string | null {
    return this.token || localStorage.getItem("adminToken");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
```

### Axios Interceptor

```typescript
// Request interceptor
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

## 📱 Responsive Design Requirements

### Breakpoints

```css
/* Mobile First */
.container {
  @apply w-full px-4;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    @apply px-6;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    @apply px-8 max-w-7xl mx-auto;
  }
}
```

### Mobile Navigation

- Collapsible sidebar drawer
- Touch-friendly buttons (min 44px)
- Optimized table layouts
- Responsive modals

## 🚀 Development Phases

### Phase 1: Project Setup & Authentication (Week 1)

- [ ] Initialize Vite + React + TypeScript project
- [ ] Setup Tailwind CSS and Shadcn/ui
- [ ] Implement authentication system
- [ ] Create login page and protected routes
- [ ] Setup API client with interceptors

### Phase 2: Core Admin Features (Week 2)

- [ ] Dashboard with metrics
- [ ] Pending doctors list and table
- [ ] Doctor detail view and modal
- [ ] Doctor verification functionality
- [ ] Search and filtering capabilities

### Phase 3: Advanced Features (Week 3)

- [ ] Charts and data visualization
- [ ] Activity feed and notifications
- [ ] User management pages
- [ ] System settings
- [ ] Audit logging

### Phase 4: Polish & Deployment (Week 4)

- [ ] Responsive design refinements
- [ ] Error handling and loading states
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Testing and bug fixes
- [ ] Production deployment

## 📊 Dashboard Metrics

### Key Performance Indicators

```typescript
interface DashboardMetrics {
  totalDoctors: number;
  pendingVerifications: number;
  verifiedToday: number;
  activeUsers: number;
  totalAppointments: number;
  systemUptime: string;
}
```

### Chart Data Types

```typescript
interface ChartData {
  registrationTrends: Array<{
    date: string;
    doctors: number;
    patients: number;
  }>;
  verificationStatus: Array<{
    status: "pending" | "approved" | "rejected";
    count: number;
  }>;
}
```

## 🔧 Environment Configuration

### .env File

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_NAME=ZenCare Admin
VITE_JWT_SECRET=your-jwt-secret-key
VITE_ENVIRONMENT=development
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

## 🎯 Success Criteria

### Functional Requirements

- ✅ Admin can login securely with proper authentication
- ✅ Admin can view all pending doctor verifications
- ✅ Admin can review detailed doctor profiles
- ✅ Admin can approve/reject doctors with verification workflow
- ✅ Dashboard displays relevant metrics and system status
- ✅ Application is fully responsive across all devices
- ✅ All API endpoints integrate correctly with backend

### Non-Functional Requirements

- ✅ Application loads within 3 seconds
- ✅ All forms validate input properly
- ✅ Error states are handled gracefully
- ✅ UI follows accessibility guidelines (WCAG 2.1)
- ✅ Code follows TypeScript best practices
- ✅ Security measures prevent common vulnerabilities

## 🔧 Quick Start Commands

### For Bolt.new

```
Create a React TypeScript admin dashboard for ZenCare healthcare management.
Features needed:
1. Admin login with JWT authentication
2. Pending doctors verification table with approve/reject actions
3. Doctor detail modal with profile review
4. Metrics dashboard with charts
5. Responsive design using Vite + Tailwind CSS + Shadcn/ui

API endpoints:
- POST /admin/login (auth)
- GET /admin/pending-doctors (list)
- PATCH /admin/verify-doctor/{userId} (verify)

Base URL: http://localhost:4000
```

### For Lovable.dev

```
Build a modern admin web application for ZenCare healthcare platform.

Core features:
- Admin authentication system
- Doctor verification workflow with detailed review
- Analytics dashboard with metrics and charts
- User management interface
- Responsive design for all devices

Tech stack: React + TypeScript + Tailwind CSS + Vite
UI: Professional healthcare admin theme with blue color scheme
```

## 🚀 Getting Started

1. **Clone and Setup**

   ```bash
   npm create vite@latest zencare-admin -- --template react-ts
   cd zencare-admin
   npm install
   ```

2. **Install Dependencies**

   ```bash
   npm install axios react-router-dom @tanstack/react-query zustand
   npm install tailwindcss @headlessui/react @heroicons/react
   npm install react-hook-form @hookform/resolvers zod
   npm install recharts date-fns lucide-react
   ```

3. **Setup Tailwind CSS**

   ```bash
   npx tailwindcss init -p
   ```

4. **Configure API Client**

   ```typescript
   // src/services/apiClient.ts
   import axios from "axios";

   const apiClient = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,
     timeout: 10000,
   });

   export default apiClient;
   ```

This specification provides everything needed to create a comprehensive, production-ready admin web application that integrates seamlessly with your existing ZenCare backend APIs.

---

**Note**: This specification is designed to be comprehensive enough for any web development platform (Bolt.new, Lovable.dev, or custom development) to create a fully functional admin interface for the ZenCare healthcare management system.
