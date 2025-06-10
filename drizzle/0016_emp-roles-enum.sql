
-- Now alter the column type using explicit casting
ALTER TABLE "employees" ALTER COLUMN "designation" SET DATA TYPE employee_designation USING (designation::employee_designation);