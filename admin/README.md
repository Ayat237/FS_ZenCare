# 🏥 ZenCare Admin Dashboard

A modern, responsive admin dashboard for ZenCare Healthcare Management System built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **🔐 Admin Authentication** - Secure login with JWT tokens
- **👨‍⚕️ Doctor Management** - Review and verify pending doctor applications
- **📊 Dashboard Analytics** - Overview of system metrics and activities
- **📱 Responsive Design** - Works seamlessly on all devices
- **🎨 Modern UI** - Clean, professional healthcare-focused design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- ZenCare Backend running on `http://localhost:4000`

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   ```bash
   # .env file is already configured for local development
   VITE_API_BASE_URL=http://localhost:4000
   VITE_APP_NAME=ZenCare Admin
   VITE_ENVIRONMENT=development
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Open in Browser**
   ```
   http://localhost:3001
   ```

### Login Credentials

Use the admin credentials configured in your backend:

- **Email**: `zencare117@gmail.com`
- **Password**: `HealthMinistry!11zencare7`

## 🏗 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
├── pages/               # Page components
├── services/            # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 API Integration

The admin dashboard integrates with the following ZenCare backend endpoints:

### Authentication

- `POST /admin/login` - Admin login

### Doctor Management

- `GET /admin/pending-doctors` - Get pending doctor verifications
- `PATCH /admin/verify-doctor/{userId}` - Approve/reject doctor applications

## 🎨 Design System

### Colors

- **Primary**: `#0ea5e9` (Sky Blue)
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)

### Components

- **Buttons** - Primary, secondary, and danger variants
- **Cards** - Clean container components
- **Inputs** - Form inputs with validation
- **Layout** - Header, sidebar, and main content areas

## 🔒 Security Features

- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Secure API communication
- Input validation

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:

- **Desktop** (1024px+) - Full sidebar navigation
- **Tablet** (768px+) - Collapsible sidebar
- **Mobile** (320px+) - Drawer navigation

## 🧪 Testing

The admin dashboard can be tested with:

1. **Login Flow** - Use provided admin credentials
2. **Doctor Verification** - Review pending doctor applications
3. **Dashboard Metrics** - View system statistics
4. **Navigation** - Test all menu items and routing

## 🚀 Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Configure environment variables**

   ```bash
   VITE_API_BASE_URL=https://your-api-domain.com
   VITE_ENVIRONMENT=production
   ```

3. **Deploy the `dist` folder** to your hosting service

## 🤝 Integration with ZenCare Backend

This admin dashboard is designed to work seamlessly with the ZenCare backend. Ensure the backend is running and accessible at the configured API URL.

### Required Backend Endpoints:

- Admin authentication endpoints
- Doctor management endpoints
- Proper CORS configuration
- JWT token validation

## 📝 Notes

- The dashboard uses React Query for efficient data fetching and caching
- Zustand could be added for global state management if needed
- All API calls include proper error handling and loading states
- The UI is built with accessibility in mind

## 🔧 Troubleshooting

### Common Issues:

1. **Backend Connection Failed**

   - Check if backend is running on `http://localhost:4000`
   - Verify API endpoints are working
   - Check CORS configuration

2. **Login Not Working**

   - Verify admin user exists in backend
   - Check admin credentials are correct
   - Ensure `/admin/login` endpoint is functional

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript configuration
   - Verify all imports are correct

---

**Built with ❤️ for ZenCare Healthcare Management System**
