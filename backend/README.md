
# ClassConnect Backend

El backend de ClassConnect proporciona una API RESTful para la gestión de las funcionalidades del sistema educativo.

## Tecnologías Utilizadas

- **Base de Datos:** MySQL
- **Lenguaje/Framework:** [A definir - Node.js/Express, PHP/Laravel, Python/FastAPI, etc.]

## Estructura de Directorios

- `BD/`: Archivos SQL para la creación y gestión de la base de datos MySQL
  - `schema.sql`: Estructura de la base de datos
  - `sample_data.sql`: Datos de ejemplo para desarrollo y pruebas
  - `queries.sql`: Consultas comunes utilizadas en la aplicación

## Configuración de la Base de Datos

Para configurar la base de datos, sigue estos pasos:

1. Crea una base de datos MySQL
2. Ejecuta el script `BD/schema.sql` para crear las tablas
3. (Opcional) Ejecuta `BD/sample_data.sql` para cargar datos de prueba

```bash
# Reemplaza 'usuario', 'contraseña' y 'nombre_base_datos' con tus credenciales
mysql -u usuario -p nombre_base_datos < BD/schema.sql
mysql -u usuario -p nombre_base_datos < BD/sample_data.sql
```

## API Endpoints

La API REST del backend expone los siguientes endpoints principales:

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

## Instalación y Ejecución

Instrucciones para instalar y ejecutar el backend (dependerá de la tecnología seleccionada):

```bash
# Ejemplo para Node.js/Express
npm install
npm run dev

# Ejemplo para PHP/Laravel
composer install
php artisan serve

# Ejemplo para Python/FastAPI
pip install -r requirements.txt
uvicorn main:app --reload
```

## Desarrollo

Para implementar el backend, selecciona una de las siguientes tecnologías:

- Node.js con Express
- Python con FastAPI/Flask/Django
- PHP con Laravel/Slim
- Java con Spring Boot
- Otro framework similar

### Implementación de la API RESTful

Al implementar la API, asegúrate de seguir estas prácticas:

1. Utiliza los métodos HTTP apropiados (GET, POST, PUT, DELETE)
2. Devuelve los códigos de estado HTTP correctos
3. Implementa validación de datos de entrada
4. Documenta los endpoints con sus parámetros y respuestas
5. Implementa autenticación y autorización por roles
6. Utiliza el formato JSON para las respuestas
7. Implementa manejo de errores consistente
