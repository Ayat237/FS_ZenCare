# ZenCare Admin Dashboard Requirements

## Overview

A modern web-based admin dashboard for ZenCare telemedicine platform to manage doctor verification and basic administration tasks.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Query (TanStack Query)

## Core Functionalities

### 1. Admin Authentication

- **Login Page**: Simple email/password form
- **Protected Routes**: Redirect unauthenticated users to login
- **JWT Token Management**: Store token in localStorage
- **Auto-logout**: On token expiration or invalid token

### 2. Dashboard

- **Welcome Screen**: Basic overview after login
- **Navigation Sidebar**: Links to main sections
- **Header**: Admin info and logout button

### 3. Doctor Management

- **Pending Doctors Page**: List of doctors awaiting verification
- **Doctor Verification**:
  - View doctor details (name, email, specialization, documents)
  - Approve or reject doctor applications
  - Add verification notes/comments

### 4. Basic UI Components

- **Layout**: Header + Sidebar + Content area
- **Forms**: Input fields, buttons, validation
- **Tables**: Display doctor lists with actions
- **Cards**: Information display containers
- **Loading States**: Spinners and skeleton screens

## API Integration

- **Base URL**: `http://localhost:4000`
- **Endpoints**:
  - `POST /admin/login` - Admin authentication
  - `GET /admin/doctors/pending` - Get pending doctors
  - `PATCH /admin/doctors/:id/verify` - Approve/reject doctor

## Authentication Flow

1. Admin enters credentials on login page
2. Frontend sends POST request to `/admin/login`
3. Backend returns JWT token on success
4. Token stored in localStorage
5. All subsequent requests include token in Authorization header
6. Protected routes check token validity

## Pages Structure

```
/login - Login form (public)
/ - Dashboard overview (protected)
/doctors/pending - Pending doctors list (protected)
```

## Design Requirements

- **Modern UI**: Clean, professional design
- **Responsive**: Works on desktop and mobile
- **Accessibility**: Proper labels, keyboard navigation
- **Loading States**: Show feedback during API calls
- **Error Handling**: Display user-friendly error messages

## Sample Admin Credentials

- **Email**: `zencare117@gmail.com`
- **Password**: `HealthMinistry!11zencare7`

## Key Features to Implement

1. Login form with validation
2. Protected routing system
3. Sidebar navigation
4. Pending doctors table
5. Doctor verification modal/form
6. Logout functionality
7. Error boundaries and loading states

## Optional Enhancements

- Search and filter doctors
- Pagination for large lists

## File Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── layout/       # Layout components
├── pages/            # Main page components
├── services/         # API services
├── types/            # TypeScript interfaces
├── utils/            # Helper functions
└── styles/           # CSS/Tailwind styles
```

This is a minimal but complete admin dashboard focused on the essential doctor verification workflow for the ZenCare platform.
