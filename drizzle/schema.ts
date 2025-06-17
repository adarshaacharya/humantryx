import { pgTable, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const applicationStatus = pgEnum("application_status", ['applied', 'shortlisted', 'interviewed', 'hired', 'rejected'])
export const attendanceStatus = pgEnum("attendance_status", ['clocked_in', 'clocked_out', 'break_start', 'break_end'])
export const department = pgEnum("department", ['engineering', 'product', 'system_administration', 'business_analysis', 'founder_office', 'human_resources'])
export const employeeDesignation = pgEnum("employee_designation", ['software_engineer', 'product_manager', 'designer', 'data_scientist', 'quality_assurance', 'devops_engineer', 'system_administrator', 'business_analyst', 'project_manager', 'hr', 'founder'])
export const employeeStatus = pgEnum("employee_status", ['active', 'invited', 'terminated', 'resigned', 'on_leave'])
export const invitationRole = pgEnum("invitation_role", ['admin', 'member', 'guest'])
export const invitationStatus = pgEnum("invitation_status", ['pending', 'accepted', 'rejected', 'canceled'])
export const jobLocationType = pgEnum("job_location_type", ['remote', 'onsite', 'hybrid'])
export const jobStatus = pgEnum("job_status", ['open', 'closed', 'draft'])
export const leaveStatus = pgEnum("leave_status", ['pending', 'approved', 'rejected', 'cancelled'])
export const leaveType = pgEnum("leave_type", ['annual', 'sick', 'casual', 'maternity', 'paternity', 'emergency'])
export const orgMemberRole = pgEnum("org_member_role", ['owner', 'admin', 'member'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'paid', 'cancelled'])
export const userRole = pgEnum("user_role", ['super_admin', 'user'])



