## Project Overview

## General rule
- you are a code agent. always make changes without asking if the user wants you to make them. unless the user explicitly asks you not to make changes.

Application name : Human Loop
Human Loop is a HRMS - Human Resource Management System, a web application designed to streamline HR processes, including employee management, attendance tracking, leave management, and payroll processing. The system aims to enhance efficiency and accuracy in HR operations.
The twist is that its heavily powered by AI, which automates many HR tasks, such as resume screening, employee sentiment analysis, and predictive analytics for workforce planning.

## Key Features

- **User Authentication**: Secure login for employees and HR managers.
- **Role-Based Access Control**: Different access levels for employees and HR managers.
- **Employee Management**: Add, update, and manage employee records.
- **Attendance Tracking**: Monitor employee attendance and generate reports.
- **Leave Management**: Handle leave requests and approvals.
- **Payroll Processing**: Calculate salaries, deductions, and generate payslips.
- **AI-Powered Features**:
  - Resume Screening: Automatically screen resumes using AI algorithms.
  - Sentiment Analysis: Analyze employee feedback and sentiment.
  - Predictive Analytics: Forecast workforce needs and trends.

## Technologies Used

- **Package Manager**: pnpm
- **TypeScript**: For type safety and better developer experience
- **Frontend**: Next.js, Tailwind CSS, Shadcn UI, react query from TRPC for data fetching, and motion/react for animations, server components by default
- **Backend**: Next.js with TRPC
- **Validateion**: Zod for input validation
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for AI-powered features
- **Authentication**: Better-auth for user authentication and management
- **Deployment**: Vercel for frontend and backend hosting

## Folder structure

- the app is bootstrap with `create-t3-app`
- `src/server/api` contains all the server-side logic, including TRPC routers and database interactions
- `src/server/db` contains the database schema and Drizzle ORM configurations
- `src/app` contains the Next.js application structure, including pages, components, and styles
- `src/components` contains reusable React components
- `src/lib` contains utility functions, types, and configurations
- `src/styles` contains global styles and Tailwind CSS configurations
- `src/modules` contain all frontend modules and its corresponding components

## KEY ARCHITECTURAL PRINCIPLES

1. Frontend:

- Use React Server Components (RSC) by default
- Add 'use client' directive only for interactive components and using react query hooks from trpc
- Implement proper TypeScript types for all props and functions
- Reserve function declarations for utilities and helpers
- If the component is large, break it down into smaller components by creating a new file for each component
- Group similar modules together in a folder inside `src/modules/`
- Don't use extra colors unless necessary use the tailwind classname like primary, secondary defined in `src/styles/globals.css` for design and color consistency instead of using tailwind random color classes
- try to make components responsive but dont overdo it, use Tailwind's responsive utilities
- Use shadcn/ui components for consistent UI design
- Always use named exports except for page.tsx file but dont use barrel exports
- please don't over animate components animate only when necessary, use `motion/react` for animations and try to animate consistently
- for forms use react hook form, use `useForm` hook from `react-hook-form` and use `zodResolver` for validation

2. Data Layer:

- use drizzle ORM for database interactions
- Implement optimistic updates for better UX
- Use proper error handling in mutations
- Validate all inputs with Zod

3. Authentication & Security:

- Use better-auth for authentication
- RBAC (Role-Based Access Control) for different user roles
- Implement protected routes with middleware
- Use environment variables for sensitive data
- Verify user identity in all mutations
- Follow proper CORS policies

4. Performance:

- Leverage React Suspense boundaries
- Implement streaming where appropriate
- Use proper image optimization
- Follow proper caching strategies
- Implement proper loading states

5. Styling:

- Use Tailwind's utility-first approach
- Follow mobile-first responsive design
- Implement dark mode using next-themes
- Use shadcn/ui components consistently
- Use `motion/react` for animations and try to animate consistently

6. AI Integration:

- Use Vercel AI SDK
- Implement unified API for AI features
- Handle streaming responses properly

6. Backend:
- Use TRPC for API routes
- Implement proper error handling
- Use Zod for input validation
- Use proper logging and monitoring
- Implement rate limiting and throttling
- Use proper caching strategies using upstash 

## Some basic rules

- If you are installing package make sure to check if its already inside `package.json`
- coode should be self explanatory, use comments only when necessary
- use clear, descriptive names for variables, functions, classes, components.
- don't comment on simple or standard code; assume the reader knows language basics.

