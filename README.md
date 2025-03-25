
# ClassConnect - Sistema de Gestión Educativa Virtual

ClassConnect es un sistema integral de gestión educativa virtual que facilita la administración de clases, comunicación entre profesores y alumnos, y la gestión de materiales y tareas académicas, emulando las funcionalidades principales de Google Classroom.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **frontend/**: Aplicación React para profesores y alumnos
- **backend/**: API RESTful para servir la aplicación frontend

## Requisitos del Sistema

- Node.js 14.x o superior
- MySQL 8.0 o superior
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## Configuración del Proyecto

### Instalación General

1. Clone el repositorio:
```bash
git clone <URL-DEL-REPOSITORIO>
cd classconnect
```

## Frontend

La aplicación frontend está desarrollada con React, TypeScript y Tailwind CSS, proporcionando interfaces diferenciadas para profesores y alumnos.

### Características Frontend

- Interfaces específicas para profesores y alumnos
- Diseño responsivo compatible con dispositivos móviles y de escritorio
- Consumo de API RESTful del backend mediante peticiones HTTP

### Instalación y Ejecución del Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en http://localhost:8080

## Backend

El backend está implementado como una API RESTful que proporciona los datos necesarios para la aplicación frontend.

### Características Backend

- API RESTful para gestionar todos los recursos del sistema
- Sistema de autenticación con roles diferenciados (profesor/alumno)
- Base de datos MySQL para almacenamiento persistente
- Gestión de archivos para materiales y tareas

### Instalación y Ejecución del Backend

```bash
# Configurar la base de datos
# 1. Crear una base de datos MySQL
# 2. Ejecutar el script de creación de tablas:
mysql -u usuario -p nombre_base_datos < backend/BD/schema.sql
# 3. (Opcional) Cargar datos de ejemplo:
mysql -u usuario -p nombre_base_datos < backend/BD/sample_data.sql
```

La documentación detallada de la API está disponible en el archivo [backend/README.md](backend/README.md).

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE para más detalles.
