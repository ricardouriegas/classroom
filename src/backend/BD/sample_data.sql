
-- Sample data for development and testing

USE class_connect;

-- Insert default careers
INSERT INTO careers (id, name, description) VALUES
('car1', 'Ingeniería en Sistemas Computacionales', 'Carrera enfocada en el desarrollo de software y sistemas informáticos'),
('car2', 'Ingeniería Industrial', 'Carrera enfocada en la optimización de procesos industriales'),
('car3', 'Administración de Empresas', 'Carrera enfocada en la gestión y administración de organizaciones'),
('car4', 'Contaduría Pública', 'Carrera enfocada en la gestión financiera y contable'),
('car5', 'Psicología', 'Carrera enfocada en el estudio del comportamiento humano');

-- Insert demo teacher
INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES
('t-demo', 'Profesor Demo', 'teacher@example.com', '$2a$12$1234567890123456789012uQww1J2HHQi6.mU7KTcVEoqzXdFrSMS', 'teacher', 'https://i.pravatar.cc/150?img=11');

-- Insert demo student
INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES
('s-demo', 'Estudiante Demo', 'student@example.com', '$2a$12$1234567890123456789012uQww1J2HHQi6.mU7KTcVEoqzXdFrSMS', 'student', 'https://i.pravatar.cc/150?img=12');

-- Insert a demo class
INSERT INTO classes (id, name, description, class_code, career_id, semester, teacher_id) VALUES
('cls1', 'Programación Web', 'Curso de introducción a la programación web', 'WEB101', 'car1', '2023-B', 't-demo');

-- Enroll demo student in demo class
INSERT INTO class_enrollments (id, class_id, student_id) VALUES
('enr1', 'cls1', 's-demo');

-- Create sample topics for the class
INSERT INTO topics (id, class_id, name, description, order_index) VALUES
('top1', 'cls1', 'Introducción a HTML', 'Fundamentos del lenguaje de marcado HTML', 1),
('top2', 'cls1', 'CSS Básico', 'Introducción a las hojas de estilo en cascada', 2),
('top3', 'cls1', 'JavaScript Fundamental', 'Conceptos básicos de programación con JavaScript', 3);

-- Create a sample announcement
INSERT INTO announcements (id, class_id, title, content, created_by) VALUES
('ann1', 'cls1', 'Bienvenidos al curso', 'Bienvenidos al curso de Programación Web. En este curso aprenderemos los fundamentos de desarrollo web utilizando HTML, CSS y JavaScript.', 't-demo');

-- Create a sample material
INSERT INTO materials (id, topic_id, title, description, created_by) VALUES
('mat1', 'top1', 'Introducción a las etiquetas HTML', 'Material que cubre las etiquetas básicas de HTML y su uso', 't-demo');

-- Create a sample assignment
INSERT INTO assignments (id, topic_id, title, instructions, due_date, created_by) VALUES
('asg1', 'top1', 'Crear página personal', 'Utilizando HTML, crea una página personal que incluya información sobre ti, tus intereses y habilidades.', DATE_ADD(NOW(), INTERVAL 7 DAY), 't-demo');
