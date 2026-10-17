# CampusForum — Frontend

Aplicación Angular del CMS CampusForum, desarrollada para el proyecto
Plataforma Web de Blogs / CMS Ligero de Arquitectura de Software.

## Tecnologías

- Angular 20 y Angular Material.
- TypeScript y RxJS.
- Bootstrap.
- Marked y DOMPurify para renderizar Markdown y HTML básico sanitizado.

Entorno utilizado durante las verificaciones:

- Node.js 22.23.3.
- npm 10.9.9.
- Angular CLI 20.3.13.

## Instalación y ejecución local

Desde la carpeta `frontend`:

```bash
npm ci
npm start
```

Abrir http://localhost:4200.

El backend debe estar ejecutándose por separado. La dirección de la API
se configura en los archivos de entorno de Angular, dentro de
`src/environments/`.

## Funcionalidades

- Registro de cuentas con rol inicial LECTOR.
- Inicio y cierre de sesión.
- Navegación y acciones según los roles LECTOR, AUTOR, EDITOR y ADMINISTRADOR.
- Consulta pública de artículos publicados y comentarios aprobados.
- Espacio de trabajo para crear, editar y eliminar artículos según los permisos.
- Asignación de categorías y etiquetas.
- Escritura en Markdown y HTML básico con vista previa sanitizada.
- Flujo editorial: borrador, pendiente de revisión, publicado y archivado.
- Envío de comentarios sujetos a moderación previa.
- Administración de categorías y moderación para editores y administradores.
- Administración de usuarios exclusiva para administradores.
- Listados paginados de artículos con extractos.

## Rutas principales

| Ruta | Uso |
| --- | --- |
| `/posts` | Artículos publicados |
| `/posts/:id` | Detalle público de un artículo publicado |
| `/login` | Inicio de sesión |
| `/registro` | Registro de cuentas |
| `/workspace/posts` | Espacio de trabajo de artículos |
| `/workspace/posts/:id` | Detalle privado de un artículo |
| `/posts/form` | Crear un borrador |
| `/posts/form/:id` | Editar un borrador |
| `/categories` | Administración de categorías |
| `/workspace/comments` | Moderación de comentarios |

Las rutas privadas requieren una sesión válida y los permisos correspondientes.
El backend verifica los permisos en cada operación.

## Organización

- `src/app/screens/`: pantallas y plantillas.
- `src/app/components/`: componentes reutilizables.
- `src/app/services/`: comunicación con la API y servicios de la aplicación.
- `src/app/guards/`: controles de acceso a rutas.
- `src/app/interceptors/`: tratamiento de solicitudes HTTP.
- `src/app/models/`: modelos de autenticación.
- `src/app/shared/`: interfaces e importaciones compartidas.

La presentación se implementa en Angular. Las reglas de negocio y el acceso
a la base de datos corresponden al backend.

## Compilación

Desarrollo:

```bash
npm run build -- --configuration development
```

Producción:

```bash
npm run build
```

La salida se genera en `dist/campusforum-frontend/`.

La compilación de producción fue verificada. Actualmente emite advertencias
por el tamaño inicial de la aplicación y los estilos de la pantalla de inicio.
Los presupuestos se ajustaron al tamaño actual; la reducción de peso sigue pendiente.

## Verificación

Se realizaron pruebas manuales de autenticación, permisos por rol,
artículos, categorías, flujo editorial, comentarios y moderación.

El proyecto incluye el comando `npm test` para ejecutar las pruebas
configuradas con Karma. Estas instrucciones no implican que exista una
suite automatizada completa para todos los requisitos.

## Pendientes

- Mejorar el diseño visual.
- Reducir el peso de la carga inicial y revisar los estilos.
- Consolidar pruebas automatizadas de regresión.