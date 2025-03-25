
-- Common queries for the ClassConnect application

-- Get all classes for a teacher
SELECT c.*, car.name as career_name
FROM classes c
JOIN careers car ON c.career_id = car.id
WHERE c.teacher_id = ?;

-- Get all classes for a student
SELECT c.*, car.name as career_name, u.name as teacher_name
FROM classes c
JOIN careers car ON c.career_id = car.id
JOIN users u ON c.teacher_id = u.id
JOIN class_enrollments e ON c.id = e.class_id
WHERE e.student_id = ?;

-- Get students enrolled in a class
SELECT u.*
FROM users u
JOIN class_enrollments e ON u.id = e.student_id
WHERE e.class_id = ? AND u.role = 'student'
ORDER BY u.name;

-- Search students not enrolled in a specific class (for adding students)
SELECT u.*
FROM users u
WHERE u.role = 'student'
AND u.id NOT IN (
  SELECT e.student_id 
  FROM class_enrollments e 
  WHERE e.class_id = ?
)
AND (u.name LIKE ? OR u.email LIKE ?);

-- Get all announcements for a class
SELECT a.*, u.name as created_by_name
FROM announcements a
JOIN users u ON a.created_by = u.id
WHERE a.class_id = ?
ORDER BY a.created_at DESC;

-- Get announcement with attachments
SELECT a.*, u.name as created_by_name, 
  GROUP_CONCAT(aa.id, ':::', aa.file_name, ':::', aa.file_path SEPARATOR '|||') as attachments
FROM announcements a
JOIN users u ON a.created_by = u.id
LEFT JOIN announcement_attachments aa ON a.id = aa.announcement_id
WHERE a.id = ?
GROUP BY a.id;

-- Get all topics for a class with materials and assignments count
SELECT t.*,
  (SELECT COUNT(*) FROM materials WHERE topic_id = t.id) as materials_count,
  (SELECT COUNT(*) FROM assignments WHERE topic_id = t.id) as assignments_count
FROM topics t
WHERE t.class_id = ?
ORDER BY t.order_index;

-- Get materials for a topic
SELECT m.*, u.name as created_by_name,
  GROUP_CONCAT(ma.id, ':::', ma.file_name, ':::', ma.file_path SEPARATOR '|||') as attachments
FROM materials m
JOIN users u ON m.created_by = u.id
LEFT JOIN material_attachments ma ON m.id = ma.material_id
WHERE m.topic_id = ?
GROUP BY m.id
ORDER BY m.created_at DESC;

-- Get assignments for a topic
SELECT a.*, u.name as created_by_name,
  GROUP_CONCAT(aa.id, ':::', aa.file_name, ':::', aa.file_path SEPARATOR '|||') as attachments
FROM assignments a
JOIN users u ON a.created_by = u.id
LEFT JOIN assignment_attachments aa ON a.id = aa.assignment_id
WHERE a.topic_id = ?
GROUP BY a.id
ORDER BY a.due_date;

-- Get pending assignments for a student (all classes)
SELECT a.*, c.name as class_name, t.name as topic_name,
  DATE_FORMAT(a.due_date, '%d/%m/%Y %H:%i') as formatted_due_date,
  CASE 
    WHEN a.due_date < NOW() THEN 'expired'
    WHEN s.id IS NOT NULL THEN 'submitted'
    ELSE 'pending'
  END as status
FROM assignments a
JOIN topics t ON a.topic_id = t.id
JOIN classes c ON t.class_id = c.id
JOIN class_enrollments e ON c.id = e.class_id
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
WHERE e.student_id = ?
AND (s.id IS NULL OR s.is_graded = 0)
ORDER BY a.due_date;

-- Get assignment submission with attachments
SELECT s.*, 
  GROUP_CONCAT(sa.id, ':::', sa.file_name, ':::', sa.file_path SEPARATOR '|||') as attachments
FROM assignment_submissions s
LEFT JOIN submission_attachments sa ON s.id = sa.submission_id
WHERE s.assignment_id = ? AND s.student_id = ?
GROUP BY s.id;

-- Get submissions pending grading for teacher
SELECT s.*, a.title as assignment_title, u.name as student_name, 
  t.name as topic_name, c.name as class_name
FROM assignment_submissions s
JOIN assignments a ON s.assignment_id = a.id
JOIN users u ON s.student_id = u.id
JOIN topics t ON a.topic_id = t.id
JOIN classes c ON t.class_id = c.id
WHERE c.teacher_id = ? AND s.is_graded = 0
ORDER BY s.submission_date;
