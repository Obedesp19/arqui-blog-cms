# CampusForum — CMS ligero

Proyecto de Arquitectura de Software para gestionar un blog con múltiples
redactores, revisión editorial y comentarios sujetos a moderación previa.

Utiliza Angular para la presentación y una API Django REST Framework
con servicios y repositorios para separar las reglas de negocio
del acceso a la base de datos.

## Requisitos funcionales implementados

| Requisito | Funcionalidad |
| --- | --- |
| RF1 | Autenticación y autorización por roles: administrador, editor, autor y lector |
| RF2 | Creación, edición y eliminación de artículos con Markdown/HTML básico sanitizado, etiquetas y categorías |
| RF3 | Estados: borrador, pendiente de revisión, publicado y archivado |
| RF4 | Comentarios en artículos publicados con moderación previa |
| RF5 | Listados paginados con extractos y vistas individuales con consultas relacionadas |

## Arquitectura MVC + Repository

| Elemento | Implementación |
| --- | --- |
| Modelo | Modelos Django y reglas de negocio coordinadas por servicios |
| Vista de presentación | Componentes y plantillas Angular |
| Controlador HTTP | Vistas de la API Django REST Framework |
| Repository | Clases que encapsulan las consultas y operaciones del ORM |

Los serializadores validan las entradas y representan las respuestas.
Los servicios coordinan los casos de uso y verifican las reglas de negocio.
Las plantillas del frontend no realizan consultas a la base de datos.

## Organización

- `backend/`: API, modelos, servicios, repositorios y migraciones.
- `frontend/`: aplicación Angular, pantallas y componentes.

## Instalación y ejecución

Consultar las instrucciones de cada aplicación:

- [Backend](backend/README.md).
- [Frontend](frontend/README.md).

Para el funcionamiento local deben ejecutarse ambos servidores.

Direcciones habituales:

- Frontend: http://localhost:4200.
- Backend: http://127.0.0.1:8000.

## Flujo principal

1. El usuario registra una cuenta con rol LECTOR.
2. Un administrador asigna roles adicionales según las responsabilidades.
3. Un autor crea un borrador y lo envía a revisión.
4. Un editor o administrador lo devuelve para correcciones o lo publica.
5. Los visitantes consultan los artículos publicados.
6. Los usuarios autenticados envían comentarios.
7. Un editor o administrador aprueba o rechaza los comentarios.
8. Los artículos publicados pueden archivarse y recuperarse como borradores.

## Verificación realizada

Durante el desarrollo se comprobaron los permisos por rol, la persistencia
de datos, el flujo editorial, la moderación, la paginación y las consultas
relacionadas.

Las compilaciones de Angular en desarrollo y producción finalizaron
correctamente. La compilación de producción conserva advertencias
de tamaño documentadas en la guía del frontend.

Los scripts temporales de verificación del backend se retiraron después
de ejecutarlos. Queda pendiente consolidar una suite automatizada
de regresión.

## Pendientes conocidos

- Mejorar el diseño visual.
- Reducir el peso de la carga inicial y revisar los estilos.
- Consolidar pruebas automatizadas de regresión.
- Preparar y verificar una configuración de despliegue si se requiere.

Las instrucciones actuales corresponden a la ejecución local.