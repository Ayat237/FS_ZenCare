# ZenCare Frontend Architecture Documentation

## 1. System Overview Diagram

This diagram shows the high-level architecture of the ZenCare mobile application built with React Native and Expo.

```mermaid
block-beta
    columns 5

    block:auth["🔐 Authentication Layer"]:2
        login["Login/Register"]
        roleAuth["Role-based Auth"]
        jwt["JWT Token Management"]
    end

    block:nav["🧭 Navigation Layer"]:2
        stack["Stack Navigation"]
        drawer["Drawer Navigation"]
        tab["Tab Navigation"]
        roleNav["Role-based Routing"]
    end

    space

    block:state["🗄️ State Management"]:2
        redux["Redux Store"]
        authSlice["Auth Slice"]
        chatSlice["Chat Slice"]
        persist["Redux Persist"]
    end

    block:service["🌐 Service Layer"]:2
        apiClient["API Client"]
        authSvc["Auth Service"]
        chatSvc["Chat Service"]
        appointSvc["Appointment Service"]
    end

    space

    block:components["🎨 UI Components"]:4
        authComp["Auth Components"]
        doctorComp["Doctor Components"]
        patientComp["Patient Components"]
        adminComp["Admin Components"]
        sharedComp["Shared Components"]
    end

    space

    block:external["🔌 External Services"]:4
        backend["Backend REST API"]
        jitsi["Jitsi Meet Video Calls"]
        location["Location Services"]
        device["Device Features"]
    end
```

**Description:**
The ZenCare frontend follows a layered architecture pattern with clear separation of concerns. The application is built using React Native with Expo framework, providing cross-platform compatibility. The architecture consists of five main layers: Authentication for user security, Navigation for routing, State Management using Redux, Service Layer for API communication, and UI Components for user interface. Each layer communicates through well-defined interfaces ensuring modularity and maintainability.

## 2. Application Layers Architecture

This diagram illustrates the detailed layer structure and data flow within the application.

```mermaid
graph TB
    subgraph "Presentation Layer"
        A1[Screens] --> A2[Components]
        A2 --> A3[Hooks]
        A3 --> A4[Utils]
    end

    subgraph "Navigation Layer"
        B1[App Navigation]
        B2[Stack Navigators]
        B3[Drawer Navigators]
        B4[Tab Navigators]
        B1 --> B2
        B1 --> B3
        B1 --> B4
    end

    subgraph "State Management Layer"
        C1[Redux Store]
        C2[Auth Slice]
        C3[Chat Slice]
        C4[Redux Persist]
        C1 --> C2
        C1 --> C3
        C1 --> C4
    end

    subgraph "Service Layer"
        D1[API Client]
        D2[Auth Service]
        D3[HTTP Interceptors]
        D4[Error Handling]
        D1 --> D2
        D1 --> D3
        D1 --> D4
    end

    subgraph "Configuration Layer"
        E1[Theme Configuration]
        E2[API Configuration]
        E3[Navigation Configuration]
        E4[Storage Configuration]
    end

    subgraph "External Layer"
        F1[Backend REST API]
        F2[AsyncStorage]
        F3[Expo Services]
        F4[Device Features]
    end

    A1 --> B1
    A2 --> C1
    A3 --> D1
    D1 --> F1
    C4 --> F2
    A4 --> F3
    A1 --> F4
```

**Description:**
The application follows a six-layer architecture ensuring clear separation of concerns and maintainability. The Presentation Layer handles user interface and interactions, Navigation Layer manages routing between screens, State Management Layer controls application state using Redux, Service Layer handles external communications, Configuration Layer manages app settings, and External Layer interfaces with backend services and device features. Data flows unidirectionally from external sources through services to state management and finally to the presentation layer.

## 3. Component Architecture Diagram

This diagram shows the hierarchical structure of React Native components and their relationships.

```mermaid
graph TD
    A[App.tsx] --> B[AppNavigation]

    B --> C[AuthStack]
    B --> D[MainDrawer]

    C --> C1[LoginScreen]
    C --> C2[SignUpScreen]
    C --> C3[EmailVerification]
    C --> C4[ResetPassword]

    D --> D1[DoctorDrawer]
    D --> D2[PatientDrawer]
    D --> D3[AdminDrawer]

    D1 --> D1A[DoctorHomeScreen]
    D1 --> D1B[AppointmentsScreen]
    D1 --> D1C[PatientsScreen]
    D1 --> D1D[ProfileScreen]

    D2 --> D2A[PatientHomeScreen]
    D2 --> D2B[BookingScreen]
    D2 --> D2C[MedicationsScreen]
    D2 --> D2D[LabResultsScreen]

    D3 --> D3A[AdminDashboard]
    D3 --> D3B[UserManagement]
    D3 --> D3C[SystemSettings]

    E[Shared Components] --> E1[AuthButton]
    E --> E2[LoadingOverlay]
    E --> E3[ErrorOverlay]
    E --> E4[SuccessOverlay]
    E --> E5[BackButton]

    F[Role-Specific Components] --> F1[Doctor Components]
    F --> F2[Patient Components]
    F --> F3[Admin Components]

    F1 --> F1A[AppointmentCard]
    F1 --> F1B[PatientCard]
    F1 --> F1C[PrescriptionForm]

    F2 --> F2A[DoctorCard]
    F2 --> F2B[BookingCard]
    F2 --> F2C[MedicationCard]
```

**Description:**
The component architecture follows a hierarchical structure with App.tsx as the root component. Navigation components control the flow between different user roles (Doctor, Patient, Admin). Each role has dedicated screens and components tailored to their specific needs. Shared components provide common functionality across the application, while role-specific components handle specialized features. This structure promotes code reusability and maintains clear separation between different user experiences.

## 4. State Management Flow Diagram

This diagram illustrates how Redux manages application state and data flow.

```mermaid
flowchart TD
    subgraph "🎯 UI Layer"
        A[React Components]
        B[Custom Hooks]
        C[Event Handlers]
    end

    subgraph "⚡ Action Layer"
        D[User Actions]
        E[API Actions]
        F[System Actions]
    end

    subgraph "🏪 Redux Store"
        G[Store Dispatcher]
        H[Middleware Pipeline]

        subgraph "📊 State Slices"
            I[Auth Slice]
            J[Chat Slice]
            K[UI Slice]
        end

        subgraph "💾 Persistence"
            L[Redux Persist]
            M[AsyncStorage]
        end
    end

    subgraph "🔄 Data Flow"
        N[State Selectors]
        O[State Updates]
        P[Re-rendering]
    end

    A --> D
    B --> E
    C --> F

    D --> G
    E --> G
    F --> G

    G --> H
    H --> I
    H --> J
    H --> K

    I --> L
    J --> L
    K --> L
    L --> M

    I --> N
    J --> N
    K --> N

    N --> O
    O --> P
    P --> A

    style G fill:#e1f5fe
    style I fill:#f3e5f5
    style J fill:#e8f5e8
    style L fill:#fff3e0
```

**Description:**
The state management system uses Redux Toolkit for predictable state updates. Components dispatch actions to the Redux store, which processes them through reducers to update the application state. The Auth Slice manages user authentication and authorization data, while the Chat Slice handles real-time messaging state. Redux Persist ensures critical data like authentication tokens survive app restarts by storing them in AsyncStorage. Middleware handles cross-cutting concerns like data persistence and serialization checks.

## 5. Navigation Flow Diagram

This diagram shows the navigation structure and user flow through the application.

```mermaid
flowchart TD
    Start([🚀 App Launch]) --> Auth{🔐 Authenticated?}

    Auth -->|❌ No| AuthStack[📱 Authentication Stack]
    Auth -->|✅ Yes| RoleCheck{👤 User Role?}

    subgraph "🔑 Authentication Flow"
        AuthStack --> Welcome[👋 Welcome Screen]
        Welcome --> Login[🔑 Login Screen]
        Welcome --> SignUp[📝 Sign Up Flow]

        subgraph "📋 Registration Process"
            SignUp --> Details[📊 User Details]
            Details --> Photo[📸 Photo Upload]
            Photo --> Verify[📧 Email Verification]
        end

        Login --> Success[✅ Auth Success]
        Verify --> Success
    end

    Success --> RoleCheck

    subgraph "👨‍⚕️ Doctor Interface"
        RoleCheck -->|Doctor| DocDrawer[🏥 Doctor Dashboard]
        DocDrawer --> DocHome[🏠 Home]
        DocDrawer --> Appointments[📅 Appointments]
        DocDrawer --> Patients[👥 Patients]
        DocDrawer --> DocProfile[👤 Profile]
        DocDrawer --> VideoCall[🎥 Video Consultation]
    end

    subgraph "🧑‍💼 Patient Interface"
        RoleCheck -->|Patient| PatDrawer[👤 Patient Dashboard]
        PatDrawer --> PatHome[🏠 Home]
        PatDrawer --> FindDoctors[🔍 Find Doctors]
        PatDrawer --> PatAppointments[📅 My Appointments]
        PatDrawer --> Medications[💊 Medications]
        PatDrawer --> LabResults[📋 Lab Results]
        PatDrawer --> AIBot[🤖 AI Chat Bot]
    end

    subgraph "🛠️ Admin Interface"
        RoleCheck -->|Admin| AdminDrawer[⚙️ Admin Panel]
        AdminDrawer --> AdminDash[📊 Dashboard]
        AdminDrawer --> UserMgmt[👥 User Management]
        AdminDrawer --> DocVerify[✅ Doctor Verification]
        AdminDrawer --> Analytics[📈 System Analytics]
    end

    subgraph "🚪 Logout Flow"
        Logout[🚪 Logout]
        DocProfile --> Logout
        PatHome --> Logout
        AdminDash --> Logout
        Logout --> AuthStack
    end

    style Start fill:#e8f5e8
    style Success fill:#e8f5e8
    style DocDrawer fill:#e3f2fd
    style PatDrawer fill:#f3e5f5
    style AdminDrawer fill:#fff3e0
    style Logout fill:#ffebee
```

**Description:**
The navigation system implements role-based routing with conditional flows based on user authentication and role. Unauthenticated users access the Auth Stack containing login and registration flows. Upon successful authentication, users are routed to role-specific drawer navigations. Each role (Doctor, Patient, Admin) has customized screens and functionality. The system ensures secure access control and smooth user experience transitions between different application states.

## 6. Service Layer Architecture

This diagram details the service layer responsible for external communications and data management.

```mermaid
flowchart TD
    subgraph "🎯 Frontend Application"
        A[React Components]
        B[Redux Actions]
        C[Custom Hooks]
    end

    subgraph "🔧 Service Layer"
        subgraph "📡 API Services"
            D[🔐 Auth Service]
            E[📅 Appointment Service]
            F[💬 Chat Service]
            G[👤 User Service]
            H[👨‍⚕️ Doctor Service]
            I[🧑‍💼 Patient Service]
            J[⚙️ Admin Service]
        end

        subgraph "🌐 HTTP Client Core"
            K[📨 Axios HTTP Client]
            L[📤 Request Interceptors]
            M[📥 Response Interceptors]
            N[⚠️ Error Handler]
            O[🎫 Token Manager]
        end
    end

    subgraph "🔌 External Integration"
        subgraph "🖥️ Backend Services"
            P[🗄️ REST API Server]
            Q[🔐 Authentication Server]
            R[📁 File Storage Server]
        end

        subgraph "📱 Device Services"
            S[📷 Camera API]
            T[📄 Document Picker]
            U[💾 AsyncStorage]
            V[📍 Location Services]
        end

        subgraph "🌟 Third-party Services"
            W[🎥 Jitsi Meet SDK]
            X[🔔 Push Notifications]
            Y[☁️ Cloud Storage]
        end
    end

    A --> D
    A --> E
    A --> F
    B --> G
    B --> H
    C --> I
    C --> J

    D --> K
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L
    K --> M
    L --> O
    M --> N

    K --> P
    K --> Q
    K --> R

    D --> U
    H --> S
    I --> T
    E --> V

    F --> W
    G --> X
    H --> Y

    style K fill:#e3f2fd
    style P fill:#e8f5e8
    style W fill:#fff3e0
    style S fill:#f3e5f5
```

**Description:**
The service layer acts as an abstraction between the application logic and external dependencies. API services handle specific domain operations while the API client core manages HTTP communications with the backend. Request and response interceptors handle cross-cutting concerns like authentication tokens and error logging. External services integration provides specialized functionality like video calling and location services. Device integration ensures seamless access to native device capabilities while maintaining platform compatibility.

## 7. Security Architecture Diagram

This diagram illustrates the security measures implemented in the frontend application.

```mermaid
flowchart TD
    subgraph "🔐 Authentication Security"
        A[👤 User Login] --> B[🎫 JWT Token Generation]
        B --> C[🔒 Secure Token Storage]
        C --> D[💾 Encrypted AsyncStorage]

        E[⏰ Token Expiry Check] --> F[🔄 Auto Token Refresh]
        F --> G[🚪 Auto Logout on Failure]
    end

    subgraph "🌐 Network Security"
        H[📡 HTTPS Enforcement] --> I[🔐 TLS Encryption]
        I --> J[📜 Certificate Validation]
        J --> K[🛡️ Request Signing]

        L[🔍 Request Validation] --> M[🧹 Input Sanitization]
        M --> N[✅ Schema Validation]
    end

    subgraph "🎭 Access Control"
        O[👥 Role-Based Access] --> P[🚏 Route Guards]
        P --> Q[👁️ Component Visibility]
        Q --> R[🚫 Feature Restrictions]

        S[🔑 Permission Checks] --> T[📱 Device Permissions]
        T --> U[📊 API Permissions]
    end

    subgraph "🛡️ Data Protection"
        V[🔒 Data Encryption] --> W[📁 File Encryption]
        W --> X[🗄️ Storage Encryption]
        X --> Y[🧹 Secure Data Cleanup]

        Z[🔍 Input Validation] --> AA[⚠️ Error Boundaries]
        AA --> BB[📝 Secure Logging]
    end

    subgraph "🚨 Threat Mitigation"
        CC[🛡️ XSS Prevention] --> DD[🔐 CSRF Protection]
        DD --> EE[⏱️ Rate Limiting]
        EE --> FF[🚫 Injection Prevention]

        GG[📱 App Integrity] --> HH[🔍 Code Obfuscation]
        HH --> II[🛡️ Runtime Protection]
    end

    B --> E
    C --> H
    P --> S
    V --> Z
    CC --> GG

    style B fill:#e8f5e8
    style H fill:#e3f2fd
    style O fill:#fff3e0
    style V fill:#f3e5f5
    style CC fill:#ffebee
```

**Description:**
The security architecture implements multiple layers of protection to ensure user data safety and application integrity. Authentication uses JWT tokens stored securely in encrypted AsyncStorage. API communications are protected through HTTPS with token-based authentication and automatic session management. Role-based access control restricts user capabilities based on their privileges. Input validation and type safety prevent injection attacks and data corruption. Network security ensures encrypted data transmission, while privacy protection minimizes data exposure and implements secure cleanup procedures.

## 8. Technology Stack Diagram

This diagram shows the complete technology stack used in the frontend development.

```mermaid
graph TB
    subgraph "Development Framework"
        A1[React Native 0.79.4]
        A2[Expo SDK 53]
        A3[TypeScript]
        A4[JavaScript ES6+]
    end

    subgraph "UI/UX Libraries"
        B1[React Native Paper]
        B2[React Native Vector Icons]
        B3[React Native Linear Gradient]
        B4[Custom Theme System]
        B5[Responsive Design]
    end

    subgraph "Navigation"
        C1[React Navigation 6]
        C2[Stack Navigator]
        C3[Drawer Navigator]
        C4[Tab Navigator]
        C5[Nested Navigation]
    end

    subgraph "State Management"
        D1[Redux Toolkit]
        D2[React Redux]
        D3[Redux Persist]
        D4[AsyncStorage]
    end

    subgraph "HTTP & APIs"
        E1[Axios HTTP Client]
        E2[REST API Integration]
        E3[Request/Response Interceptors]
        E4[Error Handling]
    end

    subgraph "Media & Files"
        F1[Expo Image Picker]
        F2[Expo Document Picker]
        F3[React Native PDF]
        F4[File Upload System]
    end

    subgraph "Real-time Features"
        G1[React Native Jitsi Meet]
        G2[WebRTC Video Calls]
        G3[Chat Messaging]
        G4[Live Updates]
    end

    subgraph "Device Integration"
        H1[Expo Location]
        H2[Expo Permissions]
        H3[Device Camera]
        H4[Push Notifications]
    end
```

**Description:**
The technology stack represents a modern, cross-platform mobile development approach using React Native and Expo. The framework provides native performance with JavaScript development efficiency. UI libraries ensure consistent design language and responsive layouts. Navigation libraries handle complex routing scenarios with nested navigators. State management uses Redux for predictable data flow. HTTP integration enables seamless backend communication. Media libraries support file handling and document management. Real-time features enable video consultations and instant messaging. Device integration provides access to native capabilities while maintaining cross-platform compatibility.

---

## Summary

These diagrams collectively represent the comprehensive frontend architecture of the ZenCare mobile application. The architecture emphasizes:

- **Modularity**: Clear separation of concerns across different layers
- **Scalability**: Extensible structure for future feature additions
- **Security**: Multi-layered security approach for data protection
- **Performance**: Optimized state management and navigation
- **Maintainability**: Well-organized component hierarchy and service architecture
- **User Experience**: Role-based interfaces with intuitive navigation flows

The architecture supports three distinct user roles (Doctor, Patient, Admin) while maintaining code reusability through shared components and services. The technology stack ensures cross-platform compatibility and modern development practices.
