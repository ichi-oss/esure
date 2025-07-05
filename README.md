# Insurance Policy Management System

A comprehensive fake insurance application built with Next.js, featuring role-based access control, policy management, and automated PDF certificate generation.

## Features

### 🔒 Admin Portal

- Full system access and control
- Create and manage Sub-Admin accounts
- View all users and policies
- User activation/deactivation
- System-wide analytics

### 🔐 Sub-Admin Portal

- Create user accounts and insurance policies
- Comprehensive vehicle information forms
- Automated user account creation
- Email notifications with PDF certificates
- Policy management dashboard

### 📱 User Portal

- View personal insurance policy details
- Complete vehicle information display
- Policy status and expiration tracking
- Detailed vehicle specifications
- MOT, tax, and safety information

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, ShadCN UI Components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Email**: Nodemailer with SMTP
- **PDF Generation**: jsPDF
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- SMTP email service (Gmail, etc.)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd policy-gen
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/insurance-app
   JWT_SECRET=your-super-secret-jwt-key-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Create the initial admin user**

   Make a POST request to: `http://localhost:3000/api/setup`

   This will create an admin user with:

   - Email: `admin@insurance.com`
   - Password: `admin123`

## Usage

### Initial Setup

1. Visit `http://localhost:3000`
2. Login with the admin credentials
3. Create sub-admin accounts from the admin dashboard
4. Sub-admins can then create user policies

### User Roles

#### Admin

- **Email**: admin@insurance.com
- **Password**: admin123
- **Access**: Full system control

#### Sub-Admin

- Created by admin users
- Can create and manage user policies
- Access to policy creation forms

#### Users

- Created automatically when sub-admins create policies
- Receive email with login credentials and PDF certificate
- Can view their policy and vehicle details

### Policy Creation Flow

1. **Sub-admin** fills out comprehensive policy form including:

   - Customer personal information
   - Vehicle specifications
   - Engine and fuel data
   - MOT and tax information
   - Safety ratings
   - Policy pricing and duration

2. **System automatically**:

   - Creates user account
   - Generates policy with unique number
   - Creates PDF certificate
   - Sends confirmation email with PDF attachment
   - Provides login credentials to user

3. **User receives**:
   - Email with policy details
   - PDF certificate attachment
   - Login credentials for portal access

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Admin Routes

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/[id]` - Update user status

### Sub-Admin Routes

- `GET /api/sub-admin/policies` - List created policies
- `POST /api/sub-admin/policies` - Create new policy

### User Routes

- `GET /api/user/profile` - Get user profile and policy

### Setup

- `POST /api/setup` - Create initial admin user

## Database Schema

### User Model

```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'sub-admin', 'user'],
  address: String,
  dateOfBirth: Date,
  vehicleRegistration: String,
  lastFourDigits: String,
  createdBy: ObjectId,
  isActive: Boolean
}
```

### Policy Model

```javascript
{
  userId: ObjectId,
  policyNumber: String (auto-generated),
  price: Number,
  status: ['active', 'expired', 'cancelled'],
  startDate: Date,
  endDate: Date,
  vehicleInfo: {
    // Comprehensive vehicle data
    make, model, colour, year,
    engine specs, fuel consumption,
    MOT data, tax information,
    safety ratings, dimensions
  },
  createdBy: ObjectId
}
```

## Email Configuration

The system uses SMTP for sending emails. Configure your email provider:

### Gmail Setup

1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `SMTP_PASS`

### Email Features

- HTML formatted emails
- PDF certificate attachments
- User login credentials
- Policy details summary

## PDF Certificate

The system generates comprehensive PDF certificates including:

- Customer information
- Policy details
- Complete vehicle specifications
- Engine and fuel data
- Safety ratings
- MOT and tax information

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- Environment variable protection

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── admin/          # Admin portal pages
│   ├── sub-admin/      # Sub-admin portal pages
│   ├── user/           # User portal pages
│   └── api/            # API routes
├── components/         # React components
│   └── ui/            # ShadCN UI components
└── lib/               # Utilities and configurations
    ├── models/        # MongoDB models
    ├── auth.ts        # Authentication utilities
    ├── email.ts       # Email functionality
    ├── mongodb.ts     # Database connection
    └── utils.ts       # General utilities
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for demonstration purposes only.

## Support

For questions or issues, please create an issue in the repository.

---

**Note**: This is a demonstration application for educational purposes. Do not use in production without proper security auditing and compliance verification.
