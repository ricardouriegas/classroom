CREATE DATABASE IF NOT EXISTS classroom;
USE classroom;

CREATE TABLE IF NOT EXISTS tbl_users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('teacher', 'student') NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_careers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_classes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  class_code VARCHAR(20) NOT NULL UNIQUE,
  career_id VARCHAR(36) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  teacher_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  FOREIGN KEY (career_id) REFERENCES tbl_careers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tbl_class_enrollments (
  id VARCHAR(36) PRIMARY KEY,
  class_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES tbl_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS tbl_announcements (
  id VARCHAR(36) PRIMARY KEY,
  class_id VARCHAR(36) NOT NULL,
  teacher_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES tbl_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_announcement_attachments (
  id VARCHAR(36) PRIMARY KEY,
  announcement_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcement_id) REFERENCES tbl_announcements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_topics (
  id VARCHAR(36) PRIMARY KEY,
  class_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES tbl_classes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_topic_order (class_id, order_index)
);

CREATE TABLE IF NOT EXISTS tbl_materials (
  id VARCHAR(36) PRIMARY KEY,
  topic_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES tbl_topics(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_material_attachments (
  id VARCHAR(36) PRIMARY KEY,
  material_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES tbl_materials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_assignments (
  id VARCHAR(36) PRIMARY KEY,
  topic_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES tbl_topics(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_assignment_attachments (
  id VARCHAR(36) PRIMARY KEY,
  assignment_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES tbl_assignments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_assignment_submissions (
  id VARCHAR(36) PRIMARY KEY,
  assignment_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  grade INT,
  is_graded BOOLEAN DEFAULT FALSE,
  feedback TEXT DEFAULT NULL,
  FOREIGN KEY (assignment_id) REFERENCES tbl_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_submission (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS tbl_submission_attachments (
  id VARCHAR(36) PRIMARY KEY,
  submission_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES tbl_assignment_submissions(id) ON DELETE CASCADE
);

-- Add class_id to tbl_assignments
ALTER TABLE tbl_assignments 
ADD COLUMN class_id VARCHAR(36) NOT NULL AFTER id,
ADD CONSTRAINT fk_assignments_class 
FOREIGN KEY (class_id) REFERENCES tbl_classes(id) ON DELETE CASCADE;

-- Rename instructions column to description in tbl_assignments
ALTER TABLE tbl_assignments 
CHANGE COLUMN instructions description TEXT NOT NULL;

-- Add feedback column to tbl_assignment_submissions if it doesn't exist
ALTER TABLE tbl_assignment_submissions
ADD COLUMN feedback TEXT DEFAULT NULL;