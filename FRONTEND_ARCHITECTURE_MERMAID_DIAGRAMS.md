# ZenCare Frontend Architecture - Mermaid Component Diagram

## Component Diagram Code

Copy and paste this code into [Mermaid Live Editor](https://mermaid.live/) to visualize the architecture:

```mermaid
graph TB
    %% Application Entry Point
    App["`**ZenCare Mobile App**
    React Native + TypeScript`"]

    %% Main Architecture Layers
    subgraph PresentationLayer ["`**🎨 PRESENTATION LAYER**`"]
        Navigation["`**Navigation System**
        React Navigation v6
        • Stack Navigator
        • Drawer Navigator
        • Tab Navigator`"]

        subgraph Screens ["`**📱 SCREENS**`"]
            AuthScreens["`**Auth Screens**
            • Welcome
            • Login
            • SignUp Flow
            • Email Verification
            • Password Reset`"]

            PatientScreens["`**Patient Screens**
            • Home Dashboard
            • Doctor Search
            • Appointments
            • Medications
            • Chat`"]

            DoctorScreens["`**Doctor Screens**
            • Doctor Dashboard
            • Patient Management
            • Schedule Management
            • Consultations
            • Analytics`"]

            SharedScreens["`**Shared Screens**
            • Profile Management
            • Settings
            • Notifications
            • Calendar`"]
        end

        subgraph Components ["`**🧩 COMPONENTS**`"]
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
```

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
```

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
