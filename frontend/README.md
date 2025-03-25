
# ClassConnect Frontend

Aplicación frontend para el sistema de gestión educativa ClassConnect. Incluye interfaces diferenciadas para profesores y alumnos, permitiendo la gestión de clases, materiales, tareas y comunicación.

## Tecnologías Utilizadas

- **Framework:** React con TypeScript
- **Estilos:** Tailwind CSS con componentes de shadcn/ui
- **Enrutamiento:** React Router
- **Gestión de Estado:** React Context API
- **Peticiones HTTP:** TanStack Query (React Query)

## Características

### Interfaz para Profesores
- Creación y gestión de clases
- Administración de alumnos
- Publicación de avisos
- Organización de contenido por temas
- Asignación y calificación de tareas
- Compartir materiales didácticos

### Interfaz para Alumnos
- Visualización de clases inscritas
- Consulta de avisos
- Acceso a materiales de clase
- Gestión de tareas asignadas
- Entrega de trabajos

## Estructura de Directorios

```
frontend/
├── public/            # Archivos estáticos públicos
├── src/               # Código fuente
│   ├── components/    # Componentes reutilizables
│   ├── context/       # Contextos de React (auth, temas, etc.)
│   ├── hooks/         # Hooks personalizados
│   ├── lib/           # Utilidades y funciones auxiliares
│   ├── pages/         # Componentes de página
│   └── utils/         # Funciones de utilidad
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la compilación de producción
npm run preview
```

## Desarrollo

### Consideraciones para Profesores
Al desarrollar la interfaz para profesores, asegúrate de:
- Implementar todos los formularios necesarios para la creación y gestión de clases
- Crear interfaces intuitivas para la gestión de contenidos y evaluación
- Proporcionar herramientas para la comunicación efectiva con los alumnos

### Consideraciones para Alumnos
Al desarrollar la interfaz para alumnos, asegúrate de:
- Facilitar la navegación entre clases y contenidos
- Proporcionar vistas claras para tareas pendientes y entregas
- Implementar flujos sencillos para la entrega de trabajos

### Comunicación con el Backend
La aplicación frontend consumirá la API REST proporcionada por el backend. Para facilitar esto:
- Usa TanStack Query para manejar el estado de las peticiones
- Implementa funciones de utilidad para las llamadas a la API
- Maneja adecuadamente los errores y estados de carga

## Diseño Responsivo
La aplicación está diseñada para ser utilizada en diversos dispositivos. Asegúrate de probar y ajustar la interfaz para:
- Dispositivos móviles (pequeños)
- Tablets (medianos)
- Ordenadores de escritorio (grandes)

## Contribución
Para contribuir a este proyecto, por favor:
1. Crea una rama (`git checkout -b feature/nombre-caracteristica`)
2. Realiza tus cambios y haz commit (`git commit -m 'Añadir característica'`)
3. Sube tus cambios (`git push origin feature/nombre-caracteristica`)
4. Abre un Pull Request
