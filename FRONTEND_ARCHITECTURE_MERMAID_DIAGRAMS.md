# ZenCare Frontend Architecture - Mermaid Diagrams

## 1. Overall System Architecture

```mermaid
graph TB
    subgraph "Mobile Client Layer"
        RN[React Native App]
        TS[TypeScript]
        UI[UI Components]
    end

    subgraph "Presentation Layer"
        AUTH[Auth Screens]
        PATIENT[Patient Screens]
        DOCTOR[Doctor Screens]
        ADMIN[Admin Screens]
        NAV[Navigation System]
    end

    subgraph "State Management Layer"
        REDUX[Redux Toolkit]
        SLICES[State Slices]
        PERSIST[Redux Persist]
        ASYNC[AsyncStorage]
    end

    subgraph "Service Layer"
        API[API Client]
        SERVICES[Service Modules]
        AUTH_SVC[Auth Service]
        ADMIN_SVC[Admin Service]
        CHAT_SVC[Chat Service]
        DRUG_SVC[Drug Service]
    end

    subgraph "Utility Layer"
        TYPES[TypeScript Types]
        UTILS[Helper Functions]
        THEME[Theme System]
        CONFIG[Configuration]
    end

    subgraph "External Systems"
        BACKEND[Backend API]
        WS[WebSocket Server]
        STORAGE[File Storage]
        PUSH[Push Notifications]
    end

    RN --> PRESENTATION
    PRESENTATION --> REDUX
    REDUX --> API
    API --> BACKEND
    API --> WS
    REDUX --> ASYNC
    SERVICES --> BACKEND
    UI --> THEME
    SERVICES --> TYPES

    classDef layer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class PRESENTATION,REDUX,API,UTILS layer
    class BACKEND,WS,STORAGE,PUSH external
```

## 2. Architecture Layers Breakdown

### 2.1 Presentation Layer Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        subgraph "Navigation System"
            STACK[Stack Navigator]
            DRAWER_P[Patient Drawer]
            DRAWER_D[Doctor Drawer]
            DRAWER_A[Admin Drawer]
            TABS[Tab Navigator]
        end

        subgraph "Screen Components"
            AUTH_SCREENS[Auth Screens]
            PATIENT_SCREENS[Patient Screens]
            DOCTOR_SCREENS[Doctor Screens]
            ADMIN_SCREENS[Admin Screens]
            SHARED_SCREENS[Shared Screens]
        end

        subgraph "UI Components"
            AUTH_COMP[Auth Components]
            UI_COMP[UI Components]
            LAYOUT_COMP[Layout Components]
            DOMAIN_COMP[Domain Components]
        end

        subgraph "Role-Based Access"
            ROLE_CHECK[Role Checker]
            AUTH_GUARD[Auth Guard]
            PERMISSION[Permissions]
        end
    end

    STACK --> DRAWER_P
    STACK --> DRAWER_D
    STACK --> DRAWER_A
    DRAWER_P --> TABS
    DRAWER_D --> TABS

    AUTH_SCREENS --> AUTH_COMP
    PATIENT_SCREENS --> UI_COMP
    DOCTOR_SCREENS --> DOMAIN_COMP
    ADMIN_SCREENS --> LAYOUT_COMP

    ROLE_CHECK --> AUTH_GUARD
    AUTH_GUARD --> PERMISSION

    classDef nav fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef screen fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef comp fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef access fill:#ffebee,stroke:#c62828,stroke-width:2px

    class STACK,DRAWER_P,DRAWER_D,DRAWER_A,TABS nav
    class AUTH_SCREENS,PATIENT_SCREENS,DOCTOR_SCREENS,ADMIN_SCREENS,SHARED_SCREENS screen
    class AUTH_COMP,UI_COMP,LAYOUT_COMP,DOMAIN_COMP comp
    class ROLE_CHECK,AUTH_GUARD,PERMISSION access
```

### 2.2 State Management Layer Architecture

```mermaid
graph TB
    subgraph "State Management Layer"
        subgraph "Redux Store"
            STORE[Redux Store]
            ROOT_REDUCER[Root Reducer]
        end

        subgraph "State Slices"
            AUTH_SLICE[Auth Slice]
            CHAT_SLICE[Chat Slice]
            USER_SLICE[User Slice]
            ADMIN_SLICE[Admin Slice]
        end

        subgraph "Middleware"
            THUNK[Redux Thunk]
            PERSIST_MW[Persist Middleware]
            LOGGER[Logger Middleware]
        end

        subgraph "Persistence"
            PERSIST_CONFIG[Persist Config]
            ASYNC_STORAGE[AsyncStorage]
            WHITELIST[Whitelist]
            BLACKLIST[Blacklist]
        end

        subgraph "Selectors"
            AUTH_SEL[Auth Selectors]
            USER_SEL[User Selectors]
            CHAT_SEL[Chat Selectors]
        end
    end

    STORE --> ROOT_REDUCER
    ROOT_REDUCER --> AUTH_SLICE
    ROOT_REDUCER --> CHAT_SLICE
    ROOT_REDUCER --> USER_SLICE
    ROOT_REDUCER --> ADMIN_SLICE

    STORE --> THUNK
    STORE --> PERSIST_MW
    STORE --> LOGGER

    PERSIST_MW --> PERSIST_CONFIG
    PERSIST_CONFIG --> ASYNC_STORAGE
    PERSIST_CONFIG --> WHITELIST
    PERSIST_CONFIG --> BLACKLIST

    AUTH_SLICE --> AUTH_SEL
    USER_SLICE --> USER_SEL
    CHAT_SLICE --> CHAT_SEL

    classDef store fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef slice fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef middleware fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef persist fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef selector fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class STORE,ROOT_REDUCER store
    class AUTH_SLICE,CHAT_SLICE,USER_SLICE,ADMIN_SLICE slice
    class THUNK,PERSIST_MW,LOGGER middleware
    class PERSIST_CONFIG,ASYNC_STORAGE,WHITELIST,BLACKLIST persist
    class AUTH_SEL,USER_SEL,CHAT_SEL selector
```

### 2.3 Service Layer Architecture

```mermaid
graph TB
    subgraph "Service Layer"
        subgraph "API Client"
            AXIOS[Axios Instance]
            BASE_CONFIG[Base Configuration]
            INTERCEPTORS[Interceptors]
        end

        subgraph "Request Interceptors"
            TOKEN_INJECT[Token Injection]
            HEADERS[Header Setup]
            LOGGING[Request Logging]
        end

        subgraph "Response Interceptors"
            ERROR_HANDLE[Error Handling]
            TOKEN_REFRESH[Token Refresh]
            RESPONSE_LOG[Response Logging]
        end

        subgraph "Service Modules"
            AUTH_SERVICE[Auth Service]
            ADMIN_SERVICE[Admin Service]
            CHAT_SERVICE[Chat Service]
            DRUG_SERVICE[Drug Service]
            PATIENT_SERVICE[Patient Service]
            DOCTOR_SERVICE[Doctor Service]
        end

        subgraph "Mock Data"
            MOCK_ADMIN[Mock Admin Data]
            MOCK_DOCTOR[Mock Doctor Data]
            MOCK_PATIENT[Mock Patient Data]
        end
    end

    AXIOS --> BASE_CONFIG
    AXIOS --> INTERCEPTORS

    INTERCEPTORS --> TOKEN_INJECT
    INTERCEPTORS --> HEADERS
    INTERCEPTORS --> LOGGING

    INTERCEPTORS --> ERROR_HANDLE
    INTERCEPTORS --> TOKEN_REFRESH
    INTERCEPTORS --> RESPONSE_LOG

    AXIOS --> AUTH_SERVICE
    AXIOS --> ADMIN_SERVICE
    AXIOS --> CHAT_SERVICE
    AXIOS --> DRUG_SERVICE
    AXIOS --> PATIENT_SERVICE
    AXIOS --> DOCTOR_SERVICE

    AUTH_SERVICE --> MOCK_ADMIN
    AUTH_SERVICE --> MOCK_DOCTOR
    ADMIN_SERVICE --> MOCK_PATIENT

    classDef client fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef request fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef response fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef mock fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class AXIOS,BASE_CONFIG,INTERCEPTORS client
    class TOKEN_INJECT,HEADERS,LOGGING request
    class ERROR_HANDLE,TOKEN_REFRESH,RESPONSE_LOG response
    class AUTH_SERVICE,ADMIN_SERVICE,CHAT_SERVICE,DRUG_SERVICE,PATIENT_SERVICE,DOCTOR_SERVICE service
    class MOCK_ADMIN,MOCK_DOCTOR,MOCK_PATIENT mock
```

### 2.4 Utility Layer Architecture

```mermaid
graph TB
    subgraph "Utility Layer"
        subgraph "TypeScript Types"
            NAV_TYPES[Navigation Types]
            API_TYPES[API Types]
            COMP_TYPES[Component Types]
            DOMAIN_TYPES[Domain Types]
            AUTH_TYPES[Auth Types]
        end

        subgraph "Helper Functions"
            DATE_UTILS[Date Utils]
            FORMAT_UTILS[Format Utils]
            VALIDATION[Validation Utils]
            STORAGE_UTILS[Storage Utils]
        end

        subgraph "Theme System"
            COLORS[Color Palette]
            TYPOGRAPHY[Typography]
            SPACING[Spacing System]
            SHADOWS[Shadow Styles]
        end

        subgraph "Configuration"
            ENV_CONFIG[Environment Config]
            API_CONFIG[API Configuration]
            APP_CONFIG[App Configuration]
            CONSTANTS[Constants]
        end
    end

    NAV_TYPES --> COMP_TYPES
    API_TYPES --> DOMAIN_TYPES
    AUTH_TYPES --> DOMAIN_TYPES

    DATE_UTILS --> FORMAT_UTILS
    FORMAT_UTILS --> VALIDATION
    VALIDATION --> STORAGE_UTILS

    COLORS --> TYPOGRAPHY
    TYPOGRAPHY --> SPACING
    SPACING --> SHADOWS

    ENV_CONFIG --> API_CONFIG
    API_CONFIG --> APP_CONFIG
    APP_CONFIG --> CONSTANTS

    classDef types fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef utils fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef theme fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef config fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class NAV_TYPES,API_TYPES,COMP_TYPES,DOMAIN_TYPES,AUTH_TYPES types
    class DATE_UTILS,FORMAT_UTILS,VALIDATION,STORAGE_UTILS utils
    class COLORS,TYPOGRAPHY,SPACING,SHADOWS theme
    class ENV_CONFIG,API_CONFIG,APP_CONFIG,CONSTANTS config
```

## 3. Navigation Flow Diagrams

### 3.1 Complete Navigation Structure

```mermaid
graph TB
    subgraph "App Navigation Stack"
        SPLASH[Splash Screen]
        WELCOME[Welcome Screen]
        LOGIN[Login Screen]

        subgraph "Authentication Flow"
            ROLE_SELECT[Role Selection]
            SIGNUP_DETAILS[SignUp Details]
            PHOTO_UPLOAD[Photo Upload]
            REG_SUBMITTED[Registration Submitted]
            EMAIL_VERIFY[Email Verification]
        end

        subgraph "Password Reset Flow"
            RESET_EMAIL[Reset Password Email]
            RESET_VERIFY[Reset Verification]
            NEW_PASSWORD[New Password]
        end

        subgraph "Main Application"
            PATIENT_DRAWER[Patient Drawer]
            DOCTOR_DRAWER[Doctor Drawer]
            ADMIN_DRAWER[Admin Drawer]
        end
    end

    SPLASH --> WELCOME
    WELCOME --> LOGIN
    LOGIN --> ROLE_SELECT
    ROLE_SELECT --> SIGNUP_DETAILS
    SIGNUP_DETAILS --> PHOTO_UPLOAD
    PHOTO_UPLOAD --> REG_SUBMITTED
    REG_SUBMITTED --> EMAIL_VERIFY

    LOGIN --> RESET_EMAIL
    RESET_EMAIL --> RESET_VERIFY
    RESET_VERIFY --> NEW_PASSWORD

    LOGIN --> PATIENT_DRAWER
    LOGIN --> DOCTOR_DRAWER
    LOGIN --> ADMIN_DRAWER

    classDef auth fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef reset fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef main fill:#e8f5e8,stroke:#388e3c,stroke-width:2px

    class SPLASH,WELCOME,LOGIN,ROLE_SELECT,SIGNUP_DETAILS,PHOTO_UPLOAD,REG_SUBMITTED,EMAIL_VERIFY auth
    class RESET_EMAIL,RESET_VERIFY,NEW_PASSWORD reset
    class PATIENT_DRAWER,DOCTOR_DRAWER,ADMIN_DRAWER main
```

### 3.2 Role-Based Navigation

```mermaid
graph TB
    subgraph "User Authentication"
        LOGIN_CHECK{Login Success?}
        ROLE_CHECK{User Role?}
    end

    subgraph "Patient Navigation"
        PATIENT_DRAWER[Patient Drawer]
        PATIENT_TABS[Patient Tabs]
        HOME_TAB[Home Tab]
        CALENDAR_TAB[Calendar Tab]
        AI_BOT_TAB[AI Bot Tab]
        MEDS_TAB[Medications Tab]
        PROFILE_TAB[Profile Tab]

        PATIENT_SCREENS[Patient Screens]
        APPOINTMENTS[Appointments]
        MEDICAL_HISTORY[Medical History]
        PRESCRIPTIONS[Prescriptions]
        TELEMEDICINE[Telemedicine]
    end

    subgraph "Doctor Navigation"
        DOCTOR_DRAWER[Doctor Drawer]
        DOCTOR_HOME[Doctor Home]
        DOCTOR_DASHBOARD[Doctor Dashboard]
        DOCTOR_APPOINTMENTS[Doctor Appointments]
        DOCTOR_PATIENTS[Doctor Patients]
        DOCTOR_PROFILE[Doctor Profile]
        AVAILABILITY[Availability]
    end

    subgraph "Admin Navigation"
        ADMIN_DRAWER[Admin Drawer]
        ADMIN_VERIFICATION[Doctor Verification]
        ADMIN_DASHBOARD[Admin Dashboard]
        ADMIN_SETTINGS[Admin Settings]
    end

    LOGIN_CHECK -->|Yes| ROLE_CHECK
    ROLE_CHECK -->|Patient| PATIENT_DRAWER
    ROLE_CHECK -->|Doctor| DOCTOR_DRAWER
    ROLE_CHECK -->|Admin| ADMIN_DRAWER

    PATIENT_DRAWER --> PATIENT_TABS
    PATIENT_TABS --> HOME_TAB
    PATIENT_TABS --> CALENDAR_TAB
    PATIENT_TABS --> AI_BOT_TAB
    PATIENT_TABS --> MEDS_TAB
    PATIENT_TABS --> PROFILE_TAB

    PATIENT_DRAWER --> PATIENT_SCREENS
    PATIENT_SCREENS --> APPOINTMENTS
    PATIENT_SCREENS --> MEDICAL_HISTORY
    PATIENT_SCREENS --> PRESCRIPTIONS
    PATIENT_SCREENS --> TELEMEDICINE

    DOCTOR_DRAWER --> DOCTOR_HOME
    DOCTOR_DRAWER --> DOCTOR_DASHBOARD
    DOCTOR_DRAWER --> DOCTOR_APPOINTMENTS
    DOCTOR_DRAWER --> DOCTOR_PATIENTS
    DOCTOR_DRAWER --> DOCTOR_PROFILE
    DOCTOR_DRAWER --> AVAILABILITY

    ADMIN_DRAWER --> ADMIN_VERIFICATION
    ADMIN_DRAWER --> ADMIN_DASHBOARD
    ADMIN_DRAWER --> ADMIN_SETTINGS

    classDef patient fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef doctor fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef admin fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class PATIENT_DRAWER,PATIENT_TABS,HOME_TAB,CALENDAR_TAB,AI_BOT_TAB,MEDS_TAB,PROFILE_TAB,PATIENT_SCREENS,APPOINTMENTS,MEDICAL_HISTORY,PRESCRIPTIONS,TELEMEDICINE patient
    class DOCTOR_DRAWER,DOCTOR_HOME,DOCTOR_DASHBOARD,DOCTOR_APPOINTMENTS,DOCTOR_PATIENTS,DOCTOR_PROFILE,AVAILABILITY doctor
    class ADMIN_DRAWER,ADMIN_VERIFICATION,ADMIN_DASHBOARD,ADMIN_SETTINGS admin
    class LOGIN_CHECK,ROLE_CHECK decision
```

## 4. Data Flow Diagrams

### 4.1 Authentication Data Flow

```mermaid
sequenceDiagram
    participant UI as Login Screen
    participant Action as Redux Action
    participant Service as Auth Service
    participant API as Backend API
    participant Store as Redux Store
    participant Storage as AsyncStorage

    UI->>Action: dispatch(loginUser)
    Action->>Service: authService.login()

    alt Mock User (Admin/Doctor)
        Service->>Service: Check mock credentials
        Service-->>Action: Return mock user data
    else Real API
        Service->>API: POST /auth/login
        API-->>Service: User data + tokens
        Service-->>Action: Return user data
    end

    Action->>Store: Update auth state
    Store->>Storage: Persist auth data
    Store-->>UI: Update user state

    alt Patient Role
        UI->>UI: Navigate to Patient Drawer
    else Doctor Role
        UI->>UI: Navigate to Doctor Drawer
    else Admin Role
        UI->>UI: Navigate to Admin Drawer
    end
```

### 4.2 Admin Doctor Verification Flow

```mermaid
sequenceDiagram
    participant Admin as Admin Screen
    participant Service as Admin Service
    participant API as Backend API
    participant State as Redux State

    Admin->>Service: getPendingDoctors()

    alt API Available
        Service->>API: GET /admin/pending-doctors
        API-->>Service: Pending doctors list
    else API Unavailable
        Service->>Service: Return mock data
    end

    Service-->>Admin: Doctors list
    Admin->>Admin: Display doctors

    Admin->>Service: verifyDoctor(doctorId)

    alt API Available
        Service->>API: PATCH /admin/doctors/{id}/verify
        API-->>Service: Success response
    else API Unavailable
        Service->>Service: Mock verification
    end

    Service-->>Admin: Verification success
    Admin->>State: Update pending doctors list
    Admin->>Admin: Remove doctor from list
```

### 4.3 Component Data Flow

```mermaid
graph TB
    subgraph "Data Flow Architecture"
        subgraph "UI Components"
            SCREEN[Screen Component]
            UI_COMP[UI Components]
            FORM[Form Components]
        end

        subgraph "State Management"
            SELECTOR[Redux Selectors]
            DISPATCH[Redux Dispatch]
            ACTIONS[Redux Actions]
        end

        subgraph "Business Logic"
            SERVICE[Service Layer]
            API_CALL[API Calls]
            MOCK_DATA[Mock Data]
        end

        subgraph "External"
            BACKEND[Backend API]
            STORAGE[Local Storage]
        end
    end

    SCREEN -->|useSelector| SELECTOR
    SCREEN -->|useDispatch| DISPATCH
    DISPATCH --> ACTIONS
    ACTIONS --> SERVICE

    SERVICE --> API_CALL
    SERVICE --> MOCK_DATA
    API_CALL --> BACKEND

    BACKEND -->|Response| SERVICE
    SERVICE -->|Success/Error| ACTIONS
    ACTIONS -->|Update State| SELECTOR
    SELECTOR -->|New Data| SCREEN

    SCREEN --> UI_COMP
    UI_COMP --> FORM
    FORM -->|User Input| DISPATCH

    ACTIONS --> STORAGE
    STORAGE -->|Persisted Data| SELECTOR

    classDef ui fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef state fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef logic fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class SCREEN,UI_COMP,FORM ui
    class SELECTOR,DISPATCH,ACTIONS state
    class SERVICE,API_CALL,MOCK_DATA logic
    class BACKEND,STORAGE external
```

## 5. Security & Performance Diagrams

### 5.1 Security Architecture

```mermaid
graph TB
    subgraph "Security Layer"
        subgraph "Authentication"
            JWT[JWT Tokens]
            REFRESH[Refresh Tokens]
            BIOMETRIC[Biometric Auth]
        end

        subgraph "Authorization"
            ROLE_GUARD[Role Guards]
            PERMISSION[Permissions]
            ACCESS_CONTROL[Access Control]
        end

        subgraph "Data Protection"
            ENCRYPTION[Data Encryption]
            SECURE_STORAGE[Secure Storage]
            VALIDATION[Input Validation]
        end

        subgraph "Network Security"
            HTTPS[HTTPS/TLS]
            TOKEN_INJECT[Auto Token Injection]
            ERROR_HANDLE[Secure Error Handling]
        end
    end

    JWT --> REFRESH
    REFRESH --> BIOMETRIC

    ROLE_GUARD --> PERMISSION
    PERMISSION --> ACCESS_CONTROL

    ENCRYPTION --> SECURE_STORAGE
    SECURE_STORAGE --> VALIDATION

    HTTPS --> TOKEN_INJECT
    TOKEN_INJECT --> ERROR_HANDLE

    JWT --> TOKEN_INJECT
    ROLE_GUARD --> ACCESS_CONTROL
    ENCRYPTION --> HTTPS

    classDef auth fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef authz fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef network fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class JWT,REFRESH,BIOMETRIC auth
    class ROLE_GUARD,PERMISSION,ACCESS_CONTROL authz
    class ENCRYPTION,SECURE_STORAGE,VALIDATION data
    class HTTPS,TOKEN_INJECT,ERROR_HANDLE network
```

### 5.2 Performance Architecture

```mermaid
graph TB
    subgraph "Performance Optimization"
        subgraph "Code Optimization"
            LAZY_LOAD[Lazy Loading]
            CODE_SPLIT[Code Splitting]
            TREE_SHAKE[Tree Shaking]
        end

        subgraph "State Optimization"
            SELECTIVE_PERSIST[Selective Persistence]
            MINIMAL_UPDATE[Minimal State Updates]
            MEMOIZATION[Component Memoization]
        end

        subgraph "Memory Management"
            CLEANUP[Subscription Cleanup]
            IMAGE_CACHE[Image Caching]
            MEMORY_LEAK[Memory Leak Prevention]
        end

        subgraph "Network Optimization"
            REQUEST_CACHE[Request Caching]
            BATCH_REQUESTS[Request Batching]
            OFFLINE_SUPPORT[Offline Support]
        end
    end

    LAZY_LOAD --> CODE_SPLIT
    CODE_SPLIT --> TREE_SHAKE

    SELECTIVE_PERSIST --> MINIMAL_UPDATE
    MINIMAL_UPDATE --> MEMOIZATION

    CLEANUP --> IMAGE_CACHE
    IMAGE_CACHE --> MEMORY_LEAK

    REQUEST_CACHE --> BATCH_REQUESTS
    BATCH_REQUESTS --> OFFLINE_SUPPORT

    classDef code fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef state fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef memory fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef network fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class LAZY_LOAD,CODE_SPLIT,TREE_SHAKE code
    class SELECTIVE_PERSIST,MINIMAL_UPDATE,MEMOIZATION state
    class CLEANUP,IMAGE_CACHE,MEMORY_LEAK memory
    class REQUEST_CACHE,BATCH_REQUESTS,OFFLINE_SUPPORT network
```

## 6. Integration Architecture

### 6.1 External Service Integration

```mermaid
graph TB
    subgraph "ZenCare Frontend"
        APP[React Native App]
        API_CLIENT[API Client]
        WS_CLIENT[WebSocket Client]
        STORAGE[Local Storage]
    end

    subgraph "Backend Services"
        REST_API[REST API]
        WS_SERVER[WebSocket Server]
        AUTH_SERVICE[Auth Service]
        FILE_SERVICE[File Upload Service]
    end

    subgraph "External APIs"
        PUSH_SERVICE[Push Notification Service]
        MAP_SERVICE[Maps Service]
        PAYMENT_SERVICE[Payment Gateway]
    end

    subgraph "Native Features"
        CAMERA[Camera/Gallery]
        BIOMETRIC_AUTH[Biometric Authentication]
        LOCAL_STORAGE[Device Storage]
        NOTIFICATIONS[Local Notifications]
    end

    APP --> API_CLIENT
    APP --> WS_CLIENT
    APP --> STORAGE

    API_CLIENT --> REST_API
    WS_CLIENT --> WS_SERVER
    API_CLIENT --> AUTH_SERVICE
    API_CLIENT --> FILE_SERVICE

    APP --> PUSH_SERVICE
    APP --> MAP_SERVICE
    API_CLIENT --> PAYMENT_SERVICE

    APP --> CAMERA
    APP --> BIOMETRIC_AUTH
    STORAGE --> LOCAL_STORAGE
    APP --> NOTIFICATIONS

    classDef frontend fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef backend fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef native fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class APP,API_CLIENT,WS_CLIENT,STORAGE frontend
    class REST_API,WS_SERVER,AUTH_SERVICE,FILE_SERVICE backend
    class PUSH_SERVICE,MAP_SERVICE,PAYMENT_SERVICE external
    class CAMERA,BIOMETRIC_AUTH,LOCAL_STORAGE,NOTIFICATIONS native
```

### 6.2 Component Integration Flow

```mermaid
graph TB
    subgraph "Feature Integration"
        subgraph "Admin Feature"
            ADMIN_SCREEN[Admin Doctor Verification Screen]
            ADMIN_SERVICE[Admin Service]
            ADMIN_TYPES[Admin Types]
            ADMIN_NAV[Admin Navigation]
        end

        subgraph "Core System"
            AUTH_SYSTEM[Authentication System]
            NAV_SYSTEM[Navigation System]
            STATE_SYSTEM[State Management]
            API_SYSTEM[API System]
        end

        subgraph "Shared Resources"
            UI_COMPONENTS[UI Components]
            THEME_SYSTEM[Theme System]
            TYPE_SYSTEM[Type System]
            UTIL_SYSTEM[Utility System]
        end
    end

    ADMIN_SCREEN --> ADMIN_SERVICE
    ADMIN_SCREEN --> ADMIN_NAV
    ADMIN_SERVICE --> ADMIN_TYPES

    ADMIN_SCREEN --> UI_COMPONENTS
    ADMIN_SCREEN --> THEME_SYSTEM
    ADMIN_SERVICE --> API_SYSTEM
    ADMIN_NAV --> NAV_SYSTEM
    ADMIN_TYPES --> TYPE_SYSTEM

    AUTH_SYSTEM --> STATE_SYSTEM
    NAV_SYSTEM --> STATE_SYSTEM
    API_SYSTEM --> AUTH_SYSTEM

    UI_COMPONENTS --> THEME_SYSTEM
    THEME_SYSTEM --> TYPE_SYSTEM
    TYPE_SYSTEM --> UTIL_SYSTEM

    classDef admin fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef core fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef shared fill:#e8f5e8,stroke:#388e3c,stroke-width:2px

    class ADMIN_SCREEN,ADMIN_SERVICE,ADMIN_TYPES,ADMIN_NAV admin
    class AUTH_SYSTEM,NAV_SYSTEM,STATE_SYSTEM,API_SYSTEM core
    class UI_COMPONENTS,THEME_SYSTEM,TYPE_SYSTEM,UTIL_SYSTEM shared
```

This comprehensive set of Mermaid diagrams covers all aspects of your ZenCare frontend architecture, from the overall system design down to specific implementation details. These diagrams will be perfect for your graduation project book and provide clear visual representations of your application's architecture.
UIComponents["`**UI Components**
• Buttons
• Inputs (OTP, Forms)
• Modals
• Overlays
• Feedback Components`"]

            AuthComponents["`**Auth Components**
            • Login Forms
            • Role Selectors
            • Verification Inputs
            • Registration Forms`"]

            DomainComponents["`**Domain Components**
            • Doctor Cards
            • Appointment Cards
            • Medication Lists
            • Chat Bubbles
            • Prescription Forms`"]

            LayoutComponents["`**Layout Components**
            • Headers
            • Navigation Bars
            • Containers
            • Safe Areas`"]
        end
    end

    %% State Management Layer
    subgraph StateLayer ["`**🗄️ STATE MANAGEMENT LAYER**`"]
        Redux["`**Redux Toolkit Store**
        Centralized State Management`"]

        subgraph Slices ["`**State Slices**`"]
            AuthSlice["`**Auth Slice**
            • User Data
            • Authentication Status
            • Role Management
            • Token Management`"]

            ChatSlice["`**Chat Slice**
            • Message History
            • Active Conversations
            • Online Status
            • Typing Indicators`"]

            OtherSlices["`**Other Slices**
            • Appointments
            • Notifications
            • Settings`"]
        end

        Persistence["`**Redux Persist**
        AsyncStorage Integration
        • Selective Persistence
        • Automatic Rehydration`"]
    end

    %% Service Layer
    subgraph ServiceLayer ["`**🔗 SERVICE LAYER**`"]
        APIClient["`**API Client**
        Axios HTTP Client
        • Base Configuration
        • Request Interceptors
        • Response Interceptors
        • Error Handling`"]

        subgraph Services ["`**API Services**`"]
            AuthService["`**Auth Service**
            • Login/Logout
            • Registration
            • Email Verification
            • Password Reset
            • Token Refresh`"]

            ChatService["`**Chat Service**
            • Send Messages
            • Fetch History
            • WebSocket Connection
            • File Uploads`"]

            DoctorService["`**Doctor Service**
            • Doctor Search
            • Availability
            • Specialties
            • Reviews`"]

            DrugService["`**Drug Service**
            • Medication Search
            • Drug Information
            • Interaction Checks`"]
        end
    end

    %% Utility Layer
    subgraph UtilityLayer ["`**🛠️ UTILITY LAYER**`"]
        Types["`**TypeScript Types**
        • Navigation Types
        • API Response Types
        • Component Props
        • Domain Models`"]

        Utils["`**Utilities**
        • Date Formatting
        • Validation Helpers
        • Image Utilities
        • Constants`"]

        Theme["`**Theme System**
        • Color Palette
        • Typography
        • Spacing
        • Component Styles`"]

        Config["`**Configuration**
        • API URLs
        • Environment Variables
        • Feature Flags`"]
    end

    %% External Services
    subgraph ExternalServices ["`**🌐 EXTERNAL SERVICES**`"]
        BackendAPI["`**ZenCare Backend API**
        RESTful API
        • Authentication
        • User Management
        • Healthcare Data
        • File Upload`"]

        WebSocket["`**Real-time Services**
        WebSocket Connection
        • Live Chat
        • Notifications
        • Status Updates`"]

        NativeServices["`**Native Services**
        • Camera/Gallery
        • Location Services
        • Push Notifications
        • Biometric Auth`"]
    end

    %% Data Flow Connections
    App --> Navigation
    Navigation --> Screens
    Screens --> Components

    Components --> Redux
    Redux --> Slices
    Redux --> Persistence

    Components --> Services
    Services --> APIClient
    APIClient --> BackendAPI
    ChatService --> WebSocket

    Components --> Utils
    Components --> Theme
    Components --> Types
    Services --> Config

    Components --> NativeServices

    %% Bidirectional data flow
    AuthSlice <--> AuthService
    ChatSlice <--> ChatService
    Redux <--> Persistence

    %% Styling for better visualization
    classDef layerStyle fill:#e1f5fe,stroke:#01579b,stroke-width:3px,color:#000
    classDef componentStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef serviceStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef externalStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000

    class PresentationLayer,StateLayer,ServiceLayer,UtilityLayer layerStyle
    class Navigation,Screens,Components,Redux,Slices componentStyle
    class APIClient,Services serviceStyle
    class ExternalServices,BackendAPI,WebSocket,NativeServices externalStyle

````

## Simplified High-Level Architecture Diagram

For a more concise overview, here's a simplified version:

```mermaid
graph TD
    %% Main App
    App["`**ZenCare Mobile App**`"]

    %% Core Layers
    UI["`**🎨 UI Layer**
    Screens & Components`"]

    State["`**🗄️ State Management**
    Redux + Persistence`"]

    API["`**🔗 API Layer**
    Services & HTTP Client`"]

    Backend["`**🌐 Backend Services**
    REST API + WebSocket`"]

    %% Navigation Flow
    subgraph UserFlows ["`**User Flows**`"]
        PatientFlow["`**Patient Journey**
        Register → Browse Doctors → Book → Chat`"]

        DoctorFlow["`**Doctor Journey**
        Register → Verification → Manage Patients → Consult`"]
    end

    %% Key Features
    subgraph Features ["`**Core Features**`"]
        Auth["`**🔐 Authentication**
        Role-based Access Control`"]

        Telemedicine["`**💬 Telemedicine**
        Video Calls & Chat`"]

        Appointments["`**📅 Appointments**
        Booking & Management`"]

        Prescriptions["`**💊 Prescriptions**
        Digital Prescriptions`"]
    end

    %% Connections
    App --> UI
    UI --> State
    UI --> API
    API --> Backend

    App --> UserFlows
    UserFlows --> Features
    Features --> State

    %% Styling
    classDef appStyle fill:#e3f2fd,stroke:#0d47a1,stroke-width:3px
    classDef layerStyle fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef flowStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef featureStyle fill:#fff8e1,stroke:#ff6f00,stroke-width:2px

    class App appStyle
    class UI,State,API,Backend layerStyle
    class UserFlows,PatientFlow,DoctorFlow flowStyle
    class Features,Auth,Telemedicine,Appointments,Prescriptions featureStyle
````

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Redux Store
    participant API as API Service
    participant B as Backend

    Note over U,B: User Authentication Flow

    U->>C: Login Action
    C->>S: Dispatch loginUser()
    S->>API: authService.login()
    API->>B: POST /auth/login
    B-->>API: User Data + Token
    API-->>S: User Object
    S-->>C: Updated Auth State
    C-->>U: Navigate to Dashboard

    Note over U,B: Data Fetching Flow

    U->>C: Load Doctors
    C->>API: doctorService.getDoctors()
    API->>B: GET /doctors
    B-->>API: Doctors List
    API-->>C: Doctors Data
    C-->>U: Display Doctors

    Note over U,B: Real-time Communication

    U->>C: Send Message
    C->>S: Dispatch sendMessage()
    S->>API: chatService.sendMessage()
    API->>B: WebSocket Message
    B-->>API: Message Delivered
    API-->>S: Update Chat State
    S-->>C: New Message State
    C-->>U: Message Sent UI
```

## Usage Instructions

1. **For Documentation**: Copy the first comprehensive diagram code into Mermaid Live Editor
2. **For Presentations**: Use the simplified high-level diagram
3. **For Technical Discussions**: Use the data flow sequence diagram
4. **For Development**: Reference the detailed architecture documentation above

The diagrams are designed to be rendered in Mermaid Live Editor and can be exported as SVG, PNG, or embedded in documentation.
