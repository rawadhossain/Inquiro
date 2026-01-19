# Inquiro - AI-Powered Survey Platform

> A modern, feature-rich survey platform with AI-powered survey generation, real-time analytics, and comprehensive response management.

## 🌟 Features

### Core Survey Features

- **Survey Creation & Management**: Create, edit, and manage surveys with multiple question types
- **AI-Powered Survey Generation**: Generate professional surveys automatically using OpenAI GPT-4o-mini
- **Question Types Support**:
    - Text input
    - Multiple choice
    - Radio buttons
    - Checkboxes
    - Rating scales
    - Date picker
    - Email validation
    - Number input

### Advanced Capabilities

- **Public & Private Surveys**: Control survey visibility and access
- **Anonymous Responses**: Allow anonymous participation for sensitive topics
- **Real-time Analytics**: View response statistics and survey performance
- **Response Management**: Track, view, and analyze survey responses
- **User Role Management**: Creator and Respondent roles with appropriate permissions

### User Experience

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Theme switching support
- **Email Verification**: Secure user registration with email verification
- **Password Reset**: Complete password recovery workflow

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon library
- **Framer Motion** - Animations and transitions

### Backend & Database

- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migrations
- **Better Auth** - Authentication and session management
- **Resend** - Email delivery service

### AI & Analytics

- **OpenAI API** - AI survey generation (GPT-4o-mini)
- **Vercel AI SDK** - AI integration toolkit

### Development Tools

- **Bun** - Fast JavaScript runtime and package manager
- **React Query (TanStack)** - Data fetching and state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- OpenAI API key (for AI features)
- Resend API key (for emails)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/inquiro.git
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/surveyer"

# Authentication
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# OpenAI (for AI survey generation)
OPENAI_API_KEY="your-openai-api-key"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
bun run db:generate

# Run database migrations
bun run db:migrate

# (Optional) Open Prisma Studio to view your database
bun run db:studio
```

### 5. Start Development Server

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
fe-surveyer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Authenticated app routes
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── surveys/        # Survey management
│   │   │   └── responses/      # Response management
│   │   ├── (auth)/             # Authentication routes
│   │   ├── api/                # API routes
│   │   └── survey/             # Public survey taking
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auth/               # Authentication forms
│   │   └── landing/            # Landing page components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   │   ├── dal/                # Data access layer
│   │   └── email-templates/    # Email templates
│   └── types/                  # TypeScript definitions
├── prisma/                     # Database schema and migrations
└── public/                     # Static assets
```

## 🔧 Available Scripts

```bash
# Development
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint

# Database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run database migrations
bun run db:push      # Push schema changes to database
bun run db:studio    # Open Prisma Studio
```

## 🎯 Usage Guide

### Creating Your First Survey

1. **Sign Up/Sign In**: Create an account or sign in to get started
2. **Dashboard**: Access your dashboard to view survey overview
3. **Create Survey**: Click "Create Survey" and choose:
    - Manual creation with custom questions
    - AI-assisted generation with topic and requirements
4. **Configure Questions**: Add various question types and configure options
5. **Publish**: Make your survey live and shareable

### AI Survey Generation

1. Click "AI Assistant" when creating a survey
2. Provide:
    - Survey topic
    - Number of questions (1-20)
    - Target audience
    - Additional context (optional)
3. Review and customize the generated questions
4. Publish your AI-generated survey

### Managing Responses

1. **View Analytics**: Real-time response statistics and trends
2. **Response Details**: Individual response analysis
3. **Export Data**: Download responses for further analysis
4. **Anonymous Tracking**: Support for anonymous submissions

## 🔐 Authentication & Security

- **Secure Registration**: Email verification required
- **Password Security**: Bcrypt hashing with salt
- **Session Management**: Secure session handling with Better Auth
- **Role-based Access**: Creator and Respondent permissions
- **CSRF Protection**: Built-in protection against cross-site attacks

## 🌐 API Endpoints

### Surveys

- `GET /api/surveys` - List surveys
- `POST /api/surveys` - Create survey
- `GET /api/surveys/[id]` - Get survey details
- `PUT /api/surveys/[id]` - Update survey
- `DELETE /api/surveys/[id]` - Delete survey
- `POST /api/surveys/[id]/publish` - Publish survey

### Responses

- `GET /api/responses/survey/[surveyId]` - Get survey responses
- `POST /api/responses/submit` - Submit response
- `GET /api/responses/[id]` - Get specific response

### AI Generation

- `POST /api/ai/generate-survey` - Generate survey with AI

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/fe-surveyer/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://prisma.io/) for excellent database tooling
- [OpenAI](https://openai.com/) for AI capabilities
- [Vercel](https://vercel.com/) for hosting and AI SDK
