
# ClassConnect Backend

Este directorio contiene todos los archivos relacionados con el backend de la aplicación ClassConnect.

## Estructura de directorios

- `BD/`: Archivos SQL para la creación y gestión de la base de datos
  - `schema.sql`: Estructura de la base de datos
  - `sample_data.sql`: Datos de ejemplo para desarrollo y pruebas
  - `queries.sql`: Consultas comunes utilizadas en la aplicación

## Implementación del Backend

Este es un espacio reservado para el código del backend. Dependiendo de la implementación elegida, aquí se almacenarán los siguientes archivos:

- Código fuente del servidor (Node.js, Python, PHP, etc.)
- Controladores y rutas de la API
- Servicios y utilidades
- Configuración del servidor
- Middleware (autenticación, validación, etc.)
- Modelos de datos
- Tests

## Configuración de la Base de Datos

Para configurar la base de datos, sigue estos pasos:

1. Crea una base de datos MySQL o MariaDB
2. Ejecuta el script `BD/schema.sql` para crear las tablas
3. (Opcional) Ejecuta `BD/sample_data.sql` para cargar datos de prueba

## API Endpoints

La API REST del backend expondrá los siguientes endpoints principales:

### Autenticación
- `POST /api/auth/login`: Inicio de sesión
- `POST /api/auth/register`: Registro de usuario

### Clases
- `GET /api/classes`: Obtener todas las clases del usuario
- `POST /api/classes`: Crear una nueva clase
- `GET /api/classes/:id`: Obtener detalles de una clase
- `PUT /api/classes/:id`: Actualizar una clase
- `DELETE /api/classes/:id`: Eliminar una clase

### Estudiantes
- `GET /api/classes/:id/students`: Obtener estudiantes de una clase
- `POST /api/classes/:id/students`: Agregar estudiante a una clase
- `DELETE /api/classes/:id/students/:studentId`: Eliminar estudiante de una clase
- `GET /api/students/search`: Buscar estudiantes (para agregar a clase)

### Temas
- `GET /api/classes/:id/topics`: Obtener todos los temas de una clase
- `POST /api/classes/:id/topics`: Crear un nuevo tema
- `PUT /api/topics/:id`: Actualizar un tema
- `DELETE /api/topics/:id`: Eliminar un tema

### Avisos
- `GET /api/classes/:id/announcements`: Obtener avisos de una clase
- `POST /api/classes/:id/announcements`: Crear un nuevo aviso
- `GET /api/announcements/:id`: Obtener detalle de un aviso

### Materiales
- `GET /api/topics/:id/materials`: Obtener materiales de un tema
- `POST /api/topics/:id/materials`: Crear un nuevo material
- `GET /api/materials/:id`: Obtener detalle de un material

### Tareas
- `GET /api/topics/:id/assignments`: Obtener tareas de un tema
- `POST /api/topics/:id/assignments`: Crear una nueva tarea
- `GET /api/assignments/:id`: Obtener detalle de una tarea
- `GET /api/students/assignments/pending`: Obtener tareas pendientes (estudiante)

### Entregas
- `POST /api/assignments/:id/submissions`: Enviar entrega de tarea
- `GET /api/assignments/:id/submissions/:studentId`: Obtener entrega de un estudiante
- `PUT /api/submissions/:id/grade`: Calificar una entrega
- `GET /api/teachers/submissions/pending`: Obtener entregas pendientes de calificar (profesor)
