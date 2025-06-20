import {
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees";
import { timestamps } from "./columns";

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "clocked_in",
  "clocked_out",
  "break_start",
  "break_end",
]);

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  breakStartTime: timestamp("break_start_time"),
  breakEndTime: timestamp("break_end_time"),
  totalWorkingMinutes: integer("total_working_minutes").default(0),
  totalBreakMinutes: integer("total_break_minutes").default(0),
  status: attendanceStatusEnum("status").notNull().default("clocked_out"),
  notes: text("notes"),
  locationClockIn: text("location_clock_in"), // For future GPS tracking
  locationClockOut: text("location_clock_out"), // For future GPS tracking
  ...timestamps,
});

// Relations
export const attendanceRecordsRelations = relations(
  attendanceRecords,
  ({ one }) => ({
    employee: one(employees, {
      fields: [attendanceRecords.employeeId],
      references: [employees.id],
    }),
  }),
);

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type CreateAttendanceRecord = typeof attendanceRecords.$inferInsert;
