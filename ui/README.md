# POS System Frontend

This is the frontend for the Point of Sale (POS) system, built with Next.js and Tailwind CSS.

## Features

- User authentication (login/register)
- Protected routes
- Dashboard with navigation
- Products, categories, and sales management
- Responsive design

## Project Structure

```
src/
├── app/                  # App router pages
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── layout.js         # Root layout
│   └── page.js           # Home page (redirects to login/dashboard)
├── components/           # Reusable components
│   ├── auth/             # Authentication components
│   ├── layouts/          # Layout components
│   └── ui/               # UI components
├── context/              # React context providers
│   └── AuthContext.js    # Authentication context
└── services/             # API services
    └── api.js            # API client and services
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The frontend uses JWT-based authentication with the backend API. The authentication flow is as follows:

1. User logs in with username and password
2. Backend validates credentials and returns a JWT token
3. Frontend stores the token in localStorage
4. Token is included in subsequent API requests
5. Protected routes check for valid authentication

## API Communication

The frontend communicates with the backend API using Axios. The API client is configured to:

- Add authentication headers to requests
- Handle common error responses
- Redirect to login on authentication failures

## Components

### Authentication Components

- `LoginForm`: Handles user login
- `RegisterForm`: Handles user registration
- `ProtectedRoute`: Protects routes from unauthenticated access

### Layout Components

- `AuthLayout`: Layout for authentication pages
- `DashboardLayout`: Layout for dashboard pages
- `Navbar`: Navigation bar for authenticated users

### UI Components

- `Button`: Reusable button component
- `Input`: Form input component
- `Card`: Card container component
- `ToastProvider`: Toast notification provider

## Context Providers

- `AuthProvider`: Manages authentication state and provides auth-related functions

## Development

To add new features or modify existing ones:

1. Create or modify components in the appropriate directories
2. Update pages in the `app` directory
3. Add new API services in the `services` directory as needed
4. Test changes locally before deploying
