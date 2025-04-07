-- Add feedback column to tbl_assignment_submissions if it doesn't exist
ALTER TABLE tbl_assignment_submissions
ADD COLUMN feedback TEXT DEFAULT NULL;
