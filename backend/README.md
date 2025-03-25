
# ClassConnect Backend API

Este es el backend de ClassConnect, una plataforma educativa que permite a profesores y estudiantes gestionar clases virtuales, tareas, y materiales de estudio.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor
- **Express**: Framework web para Node.js
- **MySQL**: Base de datos relacional
- **JWT**: Autenticación basada en tokens
- **Bcrypt**: Encriptación de contraseñas
- **Multer**: Manejo de subida de archivos

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## Configuración

1. Clone el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd classconnect/backend
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

3. Configure las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   
   Luego edite el archivo `.env` con sus configuraciones:
   - `PORT`: Puerto para el servidor (por defecto: 3000)
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Configuración de la base de datos
   - `JWT_SECRET`: Clave secreta para firmar los tokens JWT
   - `JWT_EXPIRES_IN`: Tiempo de expiración de los tokens (por defecto: "1d" - un día)

4. Configure la base de datos:
   ```bash
   # Crear la base de datos y las tablas
   mysql -u <usuario> -p < src/backend/BD/schema.sql
   
   # Opcional: Cargar datos de ejemplo
   mysql -u <usuario> -p < src/backend/BD/sample_data.sql
   ```

## Ejecución

1. Para desarrollo (con recarga automática):
   ```bash
   npm run dev
   ```

2. Para producción:
   ```bash
   npm start
   ```

El servidor se iniciará en el puerto configurado (por defecto: 3000).

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración (base de datos, etc.)
│   ├── middleware/     # Middleware (autenticación, etc.)
│   ├── routes/         # Rutas de la API
│   ├── utils/          # Utilidades (subida de archivos, etc.)
│   └── server.js       # Punto de entrada del servidor
├── uploads/            # Directorio para archivos subidos
├── .env                # Variables de entorno (no incluido en control de versiones)
├── .env.example        # Ejemplo de variables de entorno
└── package.json        # Dependencias y scripts
```

## API Endpoints

### Autenticación
- `POST /api/auth/login`: Inicio de sesión
- `POST /api/auth/register`: Registro de usuario

### Clases
- `GET /api/classes`: Obtener todas las clases del usuario
- `POST /api/classes`: Crear una nueva clase
- `GET /api/classes/:id`: Obtener detalles de una clase

### Temas
- `GET /api/topics/class/:classId`: Obtener todos los temas de una clase
- `POST /api/topics`: Crear un nuevo tema

## Desarrollo

Para añadir nuevas funcionalidades o resolver problemas:

1. Cree una nueva rama para su característica:
   ```bash
   git checkout -b feature/nombre-caracteristica
   ```

2. Realice los cambios y haga commits:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   ```

3. Envíe los cambios a su repositorio:
   ```bash
   git push origin feature/nombre-caracteristica
   ```

4. Cree un Pull Request para revisar y fusionar los cambios.

## Notas para el desarrollo frontend

El backend expone una API RESTful que debe ser consumida por el frontend. Asegúrese de:

1. Configurar CORS correctamente si el frontend se ejecuta en un dominio o puerto diferente
2. Utilizar los tokens JWT para autenticar las solicitudes del frontend (en el encabezado `Authorization`)
3. Manejar adecuadamente los errores y respuestas del backend en el frontend

## Estructura de carpetas

Para una correcta organización del proyecto, asegúrese de que las carpetas estén estructuradas como se muestra a continuación:

```
proyecto-raíz/
├── backend/           # Esta carpeta (API Node.js/Express)
└── frontend/          # La aplicación frontend (React, Vue, etc.)
```
