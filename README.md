![Humantryx Logo](https://github.com/adarshaacharya/humantryx/blob/main/docs/banner.png?raw=true)

# 🏢 Humantryx • AI-Powered HRMS

[live url](https://humantryx.vercel.app) — [github](https://github.com/adarshacharya/humantryx)

> **Humantryx** is an AI-powered Human Resource Management System built with Next.js and modern technologies. It streamlines HR processes including employee management, attendance tracking, leave management, and payroll processing, all enhanced with intelligent automation.

## Demo

[![YOUTUBE DEMO](https://img.youtube.com/vi/xuPdJo9f9Xw/0.jpg)](https://youtu.be/xuPdJo9f9Xw?si=FLN8Hj-rkEzWGPt8)

## Stack

1. 🧱 **Core**: [Next.js 15](https://nextjs.org) + [React 19](https://react.dev) + [TypeScript 5.8](https://typescriptlang.org)
2. 🎨 **UI**: [Tailwind CSS](https://tailwindcss.com) + [Shadcn/UI](https://ui.shadcn.com) + [Motion/React](https://motion.dev)
3. 🔒 **Auth**: [Better-Auth](https://better-auth.com) + Role-based access control
4. 🗄️ **Database**: [PostgreSQL](https://postgresql.org) + [Drizzle ORM](https://orm.drizzle.team)
5. 🚀 **API**: [tRPC](https://trpc.io) + [React Query](https://tanstack.com/query)
6. 🧠 **AI**: [OpenAI API](https://openai.com) + [LangChain.js](https://js.langchain.com) + [Groq](https://groq.com)
7. 📊 **Vector DB**: [Pinecone](https://pinecone.io)
8. ⚡ **Caching**: [Upstash Redis](https://upstash.com)
9. 📝 **Forms**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
10. 📅 **Tables**: [TanStack Table](https://tanstack.com/table)
11. 🎯 **Authorization**: [CASL](https://casl.js.org) for permissions
12. 📧 **Email**: [resend](https://resend.com) + [react-email](https://react.email)
13. 📦 **Package Manager**: [pnpm](https://pnpm.io)

## Features

### 🔐 Authentication & Authorization

- **Secure Authentication**: Better-auth integration with session management
- **Role-Based Access Control**: Super Admin, HR Manager, and Employee roles
- **Permission-Based System**: Granular permissions using CASL
- **Protected Routes**: Middleware-based route protection

### 👥 Employee Management

- **Complete Employee Lifecycle**: Add, update, delete employee records
- **Invitation System**: Secure employee onboarding with email invitations
- **Profile Management**: Comprehensive employee profiles with documents
- **Organizational Structure**: Department and role management

### 📊 Attendance & Time Tracking

- **Real-time Tracking**: Clock in/out with location validation
- **Attendance Reports**: Detailed analytics and reporting
- **Leave Integration**: Seamless integration with leave management
- **Overtime Management**: Automatic overtime calculation

### 🏖️ Leave Management

- **Smart Leave Requests**: AI-powered natural language leave requests
- **Approval Workflows**: Multi-level approval processes
- **Leave Policies**: Configurable leave types and policies
- **Calendar Integration**: Visual leave calendar with team insights

### 💰 Payroll Processing

- **Automated Calculations**: Salary, deductions, and benefits calculation
- **Payslip Generation**: Professional payslip templates
- **Tax Management**: Compliance with tax regulations
- **Reporting**: Comprehensive payroll reports

### 🤖 AI-Powered Features

- **Resume Screening**: Automated candidate evaluation
- **Document Knowledge Base**: AI-driven document search and retrieval
- **Smart Leave Parsing**: Natural language for leave requests

### 📰 News & Communication

- **Company News**: Internal communication platform
- **Announcements**: Important updates and notifications
- **Team Collaboration**: Enhanced team communication tools

## Quick Start

1. Install [Git](https://git-scm.com), [Node.js](https://nodejs.org), [pnpm](https://pnpm.io).
2. Run:

   ```bash
   git clone https://github.com/your-org/humantryx.git
   cd humantryx
   pnpm install
   cp .env.example .env
   ```

3. Copy `.env.example` to `.env` and configure your environment variables.

4. Set up the database:

   ```bash
   pnpm db:migrate    # Apply database schema
   pnpm db:seed    # Seed with initial data (currently not implemented)
   ```

5. Run the development server:

   ```bash
   pnpm dev        # Start development server
   ```

6. Build for production:
   ```bash
   pnpm build      # Create production build
   pnpm start      # Start production server
   ```

### Commands

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `pnpm dev`        | Start local development       |
| `pnpm build`      | Create a production build     |
| `pnpm start`      | Start production server       |
| `pnpm lint`       | Run ESLint                    |
| `pnpm type-check` | Run TypeScript type checking  |
| `pnpm db:push`    | Apply database schema changes |
| `pnpm db:studio`  | Open Drizzle Studio           |
| `pnpm db:seed`    | Seed database with test data  |

## Deployment

### Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Configure database and external services
```

### Docker Deployment

```bash
# Build Docker image
docker build -t humantryx .

# Run with Docker Compose
docker-compose up -d
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

MIT © 2025 Humantryx Team

---

> Built with ❤️ by [Adarsha Acharya](https://adarsha.dev) using modern web technologies for the future of HR management.
