import { organizationRouter } from "@/server/api/routers/organization";
import { adminRouter } from "@/server/api/routers/admin";
import { employeeRouter } from "@/server/api/routers/employee";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { invitationRouter } from "./routers/invitation";
import { attachmentsRouter } from "./routers/attachments";
import { leaveRouter } from "./routers/leave";
import { attendanceRouter } from "./routers/attendance";
import { payrollRouter } from "./routers/payroll";
import { dashboardRouter } from "./routers/dashboard";
import { newsRouter } from "./routers/news";
import { aiRouter } from "./routers/ai";
import { recruitmentRouter } from "./routers/recruitment";
import { documentsRouter } from "./routers/documents";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  admin: adminRouter,
  employee: employeeRouter,
  invitation: invitationRouter,
  attachment: attachmentsRouter,
  leave: leaveRouter,
  attendance: attendanceRouter,
  payroll: payrollRouter,
  dashboard: dashboardRouter,
  news: newsRouter,
  ai: aiRouter,
  recruitment: recruitmentRouter,
  documents: documentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
