-- This script inserts a new student
INSERT INTO tbl_users (id, name, email, password_hash, role, avatar_url)
VALUES (
  'student',
  'New student',
  'nose@nose.com',
  '$2a$12$8e5nXHLFkYk5dwcFs/mbsOZirgsO9ehACCWFETu6X3j/gODzZ5xa.', -- hash for 'nose123'
  'student',
  ''
);

-- This script inserts a new teacher
INSERT INTO tbl_users (id, name, email, password_hash, role, avatar_url)
VALUES (
  'profe',
  'New teacher',
  'profe@nose.com',
  '$2a$12$8e5nXHLFkYk5dwcFs/mbsOZirgsO9ehACCWFETu6X3j/gODzZ5xa.', -- hash for 'nose123'
  'teacher',
  ''
);