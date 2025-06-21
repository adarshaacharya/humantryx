# Product Context

## Problem Statement

Current HR management systems are often complex, difficult to use, and lack modern features. They do not effectively leverage AI to enhance HR processes, leading to inefficiencies in employee management, attendance tracking, leave management, and payroll processing. Also company have to hire a lot of HR professionals to manage these tasks, which can be costly and time-consuming.

## User Needs

**Developers**

- Type-safe APIs for frontend and backend communication
- Modern dev tools and libraries for efficient development
- Comprehensive docs
- Clear project structure and conventions

**End Users (HR Managers, Employees)**

- Intuitive and user-friendly interface
- Efficient HR processes (employee management, attendance tracking, leave management, payroll processing)
- AI-powered features for automation and insights
- Secure and role-based access control
- Responsive design for accessibility on various devices
- Real-time data updates and notifications

## Solution Overview

The solution is a modern HR management system called "Humantryx" that leverages AI to automate and streamline HR processes. It provides a user-friendly interface for both HR managers and employees, ensuring efficient management of employee records, attendance, leave requests, and payroll processing.

- Server first architecture with Next.js and TRPC for type-safe APIs
- TypeScript for type safety and better developer experience
- Drizzle ORM with PostgreSQL for database interactions
- AI-powered features using OpenAI API for resume screening, sentiment analysis, and predictive analytics
- Role-based access control for secure user management
- Modern UI using Shadcn UI, Tailwind CSS, and motion/react for animations
- Secure auth using Better-auth

## User Workflows

# 🧠 humantryx – AI-Powered HRMS User Workflow Specification

---

## 1. Company Onboarding & Account Creation

### Actor:

- HR Manager / Company Admin

### Flow:

1. Visit humantryx signup page.
2. Input:
   - Company name
   - Work email (e.g., hr@company.com)
   - Password
3. Email verification sent to confirm domain.
4. On success:
   - Company HR workspace is created.
   - HR Manager assigned Admin role.
   - Optional: Upload company logo, HR docs, and preferences.

---

## 2. Authentication & Role-Based Access Control (RBAC)

### Actors:

- HR Manager
- Employees

### Authentication:

- Email & Password login
- Optional: SSO (Google, Microsoft)
- 2FA support

### Roles & Permissions:

| Role         | Permissions                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| HR Manager   | Full access: profiles, leave, payroll, hiring, analytics                     |
| Employee     | Self-service: view/edit info, apply leave, access payslip, chat with AI      |
| AI Assistant | Proxy access to handle HR queries and trigger workflows based on permissions |

---

## 3. Employee Onboarding Workflow

### Actors:

- HR Manager
- AI Assistant

### Flow:

1. HR clicks “Add New Employee”
2. Inputs:
   - Name, Email, Role, Start Date, Team
   - Upload offer letter/contract
3. AI triggers onboarding automation:
   - Welcome email to employee
   - Creates employee profile
   - Assigns onboarding checklist
   - Suggests training and schedules via calendar

---

## 4. Employee Self-Service Workflow

### Actor:

- Employee

### Dashboard Features:

- View/edit personal info
- Download documents (e.g., payslip, offer letter)
- Apply for leave
- Submit HR queries (chatbot)
- View policy updates and announcements
- AI-powered notifications (e.g., “2 unused PTO days remaining”)

---

## 5. Leave Application & Approval Workflow

### Actors:

- Employee
- HR Manager
- AI Assistant

### Flow:

1. Employee submits leave request (form/chat)
2. AI checks balance & policies
3. Manager notified → Approve/Reject
4. System:
   - Updates calendar
   - Notifies employee
   - Syncs with payroll

### Leave Policy Management:

- **Automatic Balance Initialization**: When HR creates new leave policies, employee balances are automatically initialized for all active employees
- **Smart Balance Updates**: When HR updates policy allowances, existing employee balances are automatically adjusted to reflect the changes
- **Intelligent Balance Tracking**: System tracks used, remaining, and carry-forward balances
- **Policy Flexibility**: Support for different leave types (annual, sick, casual, maternity, paternity, emergency)
- **Carry Forward Rules**: Configurable carry-forward policies with maximum limits
- **Real-time Synchronization**: All policy changes immediately reflect in employee accounts without manual intervention

---

## 6. HR Query Resolution via AI Assistant

### Actor:

- Employee

### Example Queries:

- “How many sick leaves do I have left?”
- “What’s the WFH policy?”
- “Show me April payslip”

### Flow:

1. AI fetches data from vector store (RAG)
2. Conversational reply
3. If uncertain, escalate to HR Manager

---

## 7. Payroll & Payslip Management

### Actors:

- HR Manager
- Employee

### Flow:

- HR uploads or syncs payroll
- System generates payslips monthly
- Employees notified via dashboard & email
- AI supports questions like:
  - “What is this tax deduction?”
  - “When is bonus credited?”

---

## 8. Analytics & Admin Panel (HR Manager Only)

### Features:

- Employee performance summaries
- Leave trend heatmaps
- Attrition monitoring
- AI-generated insights (e.g., “Marketing team shows higher leave rate”)

---

## Bonus AI Features

| Feature                         | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| 📥 Resume Parsing               | LLM auto-extracts structured data from resumes              |
| 🤖 Smart Hiring Recommendations | AI matches candidates to roles based on skills & experience |
| 💬 Feedback Sentiment Analysis  | AI detects tone/mood from employee surveys                  |
| 🗣️ Mock Interview Chatbot       | Candidates interact with AI to prep for real interviews     |

---

## Future Enhancements

- ✅ Integration with calendars (Google, Outlook)
- ✅ Voice assistant interface
- ✅ AI-driven attrition prediction
- ✅ Custom policy editor with LLM-assisted drafting

---
