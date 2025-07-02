# ZenCare Frontend Architecture Diagrams - For Graduation Project Book

This file contains simplified Mermaid diagrams designed to fit on individual pages in your graduation project documentation.

## Diagram 1: Overall System Architecture (Page 1)

```mermaid
graph TB
    subgraph "ZenCare Mobile Application"
        App["`**React Native App**
        TypeScript + Expo`"]
    end

    subgraph "Frontend Architecture Layers"
        UI["`**Presentation Layer**
        📱 Screens & Components`"]
        State["`**State Management**
        🗄️ Redux + Persistence`"]
        Service["`**Service Layer**
        🔗 API Integration`"]
        Utils["`**Utility Layer**
        🛠️ Types & Helpers`"]
    end

    subgraph "External Systems"
        Backend["`**Backend API**
        🌐 REST + WebSocket`"]
        Native["`**Native Services**
        📱 Camera, Storage, etc.`"]
    end

    App --> UI
    UI --> State
    UI --> Service
    Service --> Backend
    UI --> Utils
    UI --> Native
    State --> Service

    classDef appStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    classDef layerStyle fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    classDef externalStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class App appStyle
    class UI,State,Service,Utils layerStyle
    class Backend,Native externalStyle
```

## Diagram 2: Navigation Structure (Page 2)

```mermaid
graph TD
    Root["`**App Navigation**
    Stack Navigator`"]

    subgraph "Authentication Flow"
        Welcome["`**Welcome**`"]
        Login["`**Login**`"]
        SignUp["`**Registration**
        Multi-step Flow`"]
        Verify["`**Email Verification**`"]
    end

    subgraph "Patient Application"
        PatientDrawer["`**Patient Drawer**`"]
        PatientTabs["`**Main Tabs**
        Home | Doctors | Chat | Profile`"]
    end

    subgraph "Doctor Application"
        DoctorDrawer["`**Doctor Drawer**`"]
        DoctorTabs["`**Main Tabs**
        Dashboard | Patients | Schedule`"]
    end

    Root --> Welcome
    Root --> Login
    Root --> SignUp
    Root --> Verify
    Root --> PatientDrawer
    Root --> DoctorDrawer

    PatientDrawer --> PatientTabs
    DoctorDrawer --> DoctorTabs

    classDef authStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef patientStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef doctorStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class Welcome,Login,SignUp,Verify authStyle
    class PatientDrawer,PatientTabs patientStyle
    class DoctorDrawer,DoctorTabs doctorStyle
```

## Diagram 3: Component Architecture (Page 3)

```mermaid
graph TB
    subgraph "Screen Layer"
        AuthScreens["`**Auth Screens**
        Login, SignUp, Verify`"]
        PatientScreens["`**Patient Screens**
        Home, Doctors, Chat`"]
        DoctorScreens["`**Doctor Screens**
        Dashboard, Patients`"]
    end

    subgraph "Component Layer"
        UIComponents["`**UI Components**
        Buttons, Inputs, Modals`"]
        LayoutComponents["`**Layout Components**
        Headers, Navigation`"]
        DomainComponents["`**Domain Components**
        Doctor Cards, Appointments`"]
    end

    subgraph "Shared Components"
        AuthComponents["`**Auth Components**
        Forms, OTP Input`"]
        FeedbackComponents["`**Feedback Components**
        Loading, Error, Success`"]
    end

    AuthScreens --> AuthComponents
    AuthScreens --> UIComponents
    PatientScreens --> DomainComponents
    PatientScreens --> LayoutComponents
    DoctorScreens --> DomainComponents
    DoctorScreens --> LayoutComponents

    AuthComponents --> UIComponents
    DomainComponents --> UIComponents
    LayoutComponents --> UIComponents

    AuthScreens --> FeedbackComponents
    PatientScreens --> FeedbackComponents
    DoctorScreens --> FeedbackComponents

    classDef screenStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef componentStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef sharedStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class AuthScreens,PatientScreens,DoctorScreens screenStyle
    class UIComponents,LayoutComponents,DomainComponents componentStyle
    class AuthComponents,FeedbackComponents sharedStyle
```

## Diagram 4: State Management (Page 4)

```mermaid
graph TD
    subgraph "Redux Store"
        Store["`**Redux Store**
        Centralized State`"]
    end

    subgraph "State Slices"
        AuthSlice["`**Auth Slice**
        User, Token, Role`"]
        ChatSlice["`**Chat Slice**
        Messages, Conversations`"]
        AppSlice["`**App Slice**
        Settings, Notifications`"]
    end

    subgraph "Persistence Layer"
        AsyncStorage["`**AsyncStorage**
        Local Storage`"]
        Persistence["`**Redux Persist**
        State Hydration`"]
    end

    subgraph "Components"
        ReactComponents["`**React Components**
        UI Components`"]
    end

    Store --> AuthSlice
    Store --> ChatSlice
    Store --> AppSlice

    Store --> Persistence
    Persistence --> AsyncStorage

    ReactComponents --> Store
    Store --> ReactComponents

    classDef storeStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    classDef sliceStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef persistStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef componentStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class Store storeStyle
    class AuthSlice,ChatSlice,AppSlice sliceStyle
    class AsyncStorage,Persistence persistStyle
    class ReactComponents componentStyle
```

## Diagram 5: API Integration (Page 5)

```mermaid
graph LR
    subgraph "Frontend Services"
        AuthService["`**Auth Service**
        Login, Register, Verify`"]
        ChatService["`**Chat Service**
        Messages, WebSocket`"]
        DoctorService["`**Doctor Service**
        Search, Booking`"]
        DrugService["`**Drug Service**
        Medications, Info`"]
    end

    subgraph "HTTP Layer"
        APIClient["`**API Client**
        Axios + Interceptors`"]
    end

    subgraph "Backend"
        AuthAPI["`**Auth Endpoints**
        /auth/*`"]
        DoctorAPI["`**Doctor Endpoints**
        /doctor/*`"]
        ChatAPI["`**Chat Endpoints**
        /chat/*`"]
        DrugAPI["`**Drug Endpoints**
        /drug/*`"]
    end

    AuthService --> APIClient
    ChatService --> APIClient
    DoctorService --> APIClient
    DrugService --> APIClient

    APIClient --> AuthAPI
    APIClient --> DoctorAPI
    APIClient --> ChatAPI
    APIClient --> DrugAPI

    classDef serviceStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef clientStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    classDef apiStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class AuthService,ChatService,DoctorService,DrugService serviceStyle
    class APIClient clientStyle
    class AuthAPI,DoctorAPI,ChatAPI,DrugAPI apiStyle
```

## Diagram 6: User Flow - Patient Journey (Page 6)

```mermaid
flowchart TD
    Start(["`**Patient Opens App**`"])

    Login{"`**Logged In?**`"}
    Welcome["`**Welcome Screen**`"]
    Auth["`**Login/Register**`"]
    Home["`**Patient Dashboard**`"]

    Search["`**Search Doctors**`"]
    DoctorProfile["`**Doctor Profile**`"]
    Book["`**Book Appointment**`"]

    Chat["`**Chat with Doctor**`"]
    VideoCall["`**Video Consultation**`"]
    Prescription["`**Receive Prescription**`"]

    Start --> Login
    Login -->|No| Welcome
    Login -->|Yes| Home
    Welcome --> Auth
    Auth --> Home

    Home --> Search
    Search --> DoctorProfile
    DoctorProfile --> Book

    Book --> Chat
    Chat --> VideoCall
    VideoCall --> Prescription

    classDef startStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:3px
    classDef processStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef endStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class Start,Login startStyle
    class Welcome,Auth,Home,Search,DoctorProfile,Book processStyle
    class Chat,VideoCall,Prescription endStyle
```

## Diagram 7: User Flow - Doctor Journey (Page 7)

```mermaid
flowchart TD
    Start(["`**Doctor Opens App**`"])

    Login{"`**Logged In?**`"}
    Register["`**Doctor Registration**`"]
    Verify["`**Admin Verification**`"]
    Dashboard["`**Doctor Dashboard**`"]

    Patients["`**View Patients**`"]
    Schedule["`**Manage Schedule**`"]
    Consult["`**Start Consultation**`"]

    Chat["`**Chat with Patient**`"]
    Diagnose["`**Diagnosis**`"]
    Prescribe["`**Write Prescription**`"]

    Start --> Login
    Login -->|No| Register
    Login -->|Yes| Dashboard
    Register --> Verify
    Verify --> Dashboard

    Dashboard --> Patients
    Dashboard --> Schedule
    Schedule --> Consult

    Consult --> Chat
    Chat --> Diagnose
    Diagnose --> Prescribe

    classDef startStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:3px
    classDef processStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef endStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class Start,Login startStyle
    class Register,Verify,Dashboard,Patients,Schedule,Consult processStyle
    class Chat,Diagnose,Prescribe endStyle
```

## Diagram 8: Data Flow Architecture (Page 8)

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Component
    participant Redux as Redux Store
    participant API as API Service
    participant Backend

    Note over User,Backend: Authentication Flow
    User->>UI: Login Action
    UI->>Redux: dispatch(loginUser)
    Redux->>API: authService.login()
    API->>Backend: POST /auth/login
    Backend-->>API: User + Token
    API-->>Redux: Update Auth State
    Redux-->>UI: State Change
    UI-->>User: Navigate to Dashboard

    Note over User,Backend: Data Fetching Flow
    User->>UI: Load Data
    UI->>API: service.getData()
    API->>Backend: GET /api/data
    Backend-->>API: Response Data
    API-->>UI: Return Data
    UI-->>User: Display Data
```

## Usage Instructions for Graduation Project Book

1. **Copy each diagram code separately** into Mermaid Live Editor
2. **Export as PNG or SVG** with high resolution for print quality
3. **Recommended settings**:

   - PNG: 300 DPI minimum
   - SVG: Vector format (best for scaling)
   - Size: Fit to page width in your document

4. **Suggested page layout**:

   - One diagram per page
   - Add diagram title and brief description
   - Include page numbers for cross-referencing

5. **Chapter organization**:
   - **Chapter X.1**: Overall Architecture (Diagram 1)
   - **Chapter X.2**: Navigation Structure (Diagram 2)
   - **Chapter X.3**: Component Architecture (Diagram 3)
   - **Chapter X.4**: State Management (Diagram 4)
   - **Chapter X.5**: API Integration (Diagram 5)
   - **Chapter X.6**: Patient User Flow (Diagram 6)
   - **Chapter X.7**: Doctor User Flow (Diagram 7)
   - **Chapter X.8**: Data Flow (Diagram 8)

Each diagram is optimized for:

- ✅ Single page display
- ✅ Clear, readable text
- ✅ Professional academic presentation
- ✅ Print-friendly colors
- ✅ Logical information density
