## Project Overview

## General rule

You are a senior engineer with deep experience building production-grade AI agents, automations, and workflow systems. Every task you execute must follow this procedure without exception:

1.Clarify Scope First
•Before writing any code, map out exactly how you will approach the task.
•Confirm your interpretation of the objective.
•Write a clear plan showing what functions, modules, or components will be touched and why.
•Do not begin implementation until this is done and reasoned through.

2.Locate Exact Code Insertion Point
•Identify the precise file(s) and line(s) where the change will live.
•Never make sweeping edits across unrelated files.
•If multiple files are needed, justify each inclusion explicitly.
•Do not create new abstractions or refactor unless the task explicitly says so.

3.Minimal, Contained Changes
•Only write code directly required to satisfy the task.
•Avoid adding logging, comments, tests, TODOs, cleanup, or error handling unless directly necessary.
•No speculative changes or “while we’re here” edits.
•All logic should be isolated to not break existing flows.

4.Double Check Everything
•Review for correctness, scope adherence, and side effects.
•Ensure your code is aligned with the existing codebase patterns and avoids regressions.
•Explicitly verify whether anything downstream will be impacted.

5.Deliver Clearly
•Summarize what was changed and why.
•List every file modified and what was done in each.
•If there are any assumptions or risks, flag them for review.

Reminder: You are not a co-pilot, assistant, or brainstorm partner. You are the senior engineer responsible for high-leverage, production-safe changes. Do not improvise. Do not over-engineer. Do not deviate

# Application name : Humantryx

Humantryx is a HRMS - Human Resource Management System, a web application designed to streamline HR processes, including employee management, attendance tracking, leave management, and payroll processing. The system aims to enhance efficiency and accuracy in HR operations.
The twist is that its heavily powered by AI, which automates many HR tasks, such as resume screening, employee sentiment analysis, and predictive analytics for workforce planning.

## Key Features

- **User Authentication**: Secure login for employees and HR managers.
- **Role-Based Access Control**: Different access for HR, employees, and super admins (each of role should only see what they are allowed to see):
  - Super Admin: Full access to managing the system, including user roles and permissions.
  - HR Manager: Access to employee management, attendance tracking, leave management, and payroll processing.
  - Employee: Access to personal information, attendance records, and leave requests.
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
- **Backend**: Next.js with TRPC, upstash for caching
- **Validateion**: Zod for input validation
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for AI-powered features with langchain js and pinecone db for vector storage
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
- `memorybank` contains all the docs for the project, including architecture, design decisions, and other relevant information

## KEY ARCHITECTURAL PRINCIPLES

1. Frontend:

- Use React Server Components (RSC) by default
- Add 'use client' directive only for interactive components and using react query hooks from trpc
- If the component is large, break it down into smaller components by creating a new file for each component
- Group similar modules together in a folder inside `src/modules/`, for example, all employee related components should be inside `src/modules/employee/`, and related schemas, constants, and types should be inside `src/modules/employee/` as well
- Don't use extra colors unless necessary use the tailwind classname like primary, secondary defined in `src/styles/globals.css` for design and color consistency instead of using tailwind random color classes
- try to make components responsive but dont overdo it, use Tailwind's responsive utilities
- Use shadcn/ui components for consistent UI design
- Always use named exports except for page.tsx file but dont use barrel exports
- please don't over animate components animate only when necessary, use `motion/react` for animations , but don't animate unless necessary
- for forms use react hook form, use `useForm` hook from `react-hook-form` and use `zodResolver` for validation with shadcn forms : https://ui.shadcn.com/docs/components/form
- Don't create custom types unless its necessary, try to infer types for backend data types we are using trpc so its already typed response
- avoid useEffect as much as you can , for data fetching directly use trpc with react query hooks, try to `use suspense` for better UX, use skeleton components for loading states
- avoid using too much try catch blocks, use proper error handling in mutations and queries
- while fetching trpc data don't destructure useQuery results eg : { data, isLoading } = useQuery() instead use `const employeeManagementQuery = useQuery()` and then access employeeManagementQuery.data and employeeManagementQuery.isLoading
- if there is any constants or non-stateful data move it out of component
- always use shadcn data-table with tanstack react table for table instead of creating new one the data-table is inside `components/ui/data-table`

2. Data Layer:

- use drizzle ORM for database interactions
- Please check : https://orm.drizzle.team/llms-full.txt for cursor rules
- Implement optimistic updates for better UX
- Use proper error handling in mutations
- Validate all inputs with Zod

3. Authentication & Authorization:

- Use better-auth for authentication
- Implement protected routes with middleware
- Use environment variables for sensitive data
- Use role-based access control (RBAC) for authorization using `casl` library which is setup already
- Rbac is done on basis of the employee desination setup in employee schema
- For role based access control use `src/lib/ability.ts` file to define abilities and use `useAbility` hook to check if user has permission to perform certain action
- In backend routes instead of check HR or founder or other employee designation, use casl middleware setup instead of doing if checks

4. Performance:

- Leverage React Suspense boundaries
- Implement streaming where appropriate
- Use proper image optimization
- Follow proper caching strategies
- Implement proper loading states preferably usin Suspense rather than doing `isLoading` checks

5. Styling:

- Use Tailwind's utility-first approach
- Follow mobile-first responsive design
- Implement dark mode using next-themes
- Use shadcn/ui components consistently
- Use `motion/react` for animations and try to animate consistently
- `lucide-react` for icons

6. AI Integration:

- Use Vercel AI SDK and langchain for AI features
- Use OpenAI API for embeddings while using Groq for llm features
- Use Pinecone DB for vector storage

Embeddings : https://js.langchain.com/docs/integrations/text_embedding/
Vector store : https://js.langchain.com/docs/integrations/vectorstores/

6. Backend:

- first rule please avoid unnecessary comments
- Use TRPC for API routes
- Implement proper error handling
- Use Zod for input validation
- Use proper logging and monitoring
- Implement rate limiting and throttling
- Use proper data caching strategies using @upstash/redis
- If certain code are resuaable create service files inside `src/server/services/` and use them in your routers

## Some basic rules

- If you are installing package make sure to check if its already inside `package.json`
- coode should be self explanatory, use comments only when necessary, dont use comments all over unless its complex logic
- use clear, descriptive names for variables, functions, classes, components.
- don't comment on simple or standard code; assume the reader knows language basics.
- dont use direct params instead use objects to pass params, for example instead of `function createEmployee(name: string, age: number)` use `function createEmployee({ name, age }: { name: string; age: number })`
- please move utils or helper functions into separate file don't pollute the component file with too many functions

1. Typescript :

- Implement proper TypeScript types for all props and functions and avoid `any`, but please dont try to create custom types unless necessary, try to infer types from backend data types or infer zod schema
- Use type unless interface is necessary, prefer type over interface unless you need to extend it or use it in a class
- try to extend or pick type instead of creating new one, use zod inference instead of creating new type, for example if you are using `Employee` type in frontend and backend, use `z.infer<typeof employeeSchema>` instead of creating new type
- please share type between frontend and backend , so that we can have type safety across the application, for example if you are using `Employee` type in frontend and backend, please import it from `src/server/db/schema.ts` or `src/server/db/types.ts` instead of creating new one

## Important Links

TRPC Revalidate query : https://trpc.io/docs/client/react/useUtils
Better auth organization : https://www.better-auth.com/docs/plugins/organization

## Features

1. Role based authorization
2. Permission based access control
3. Employee management

- Add (invite same logic as in home page make sure to reuse that component), update, delete employee
- View employee details
- cancel invite of employee
- filter / search / paginate
