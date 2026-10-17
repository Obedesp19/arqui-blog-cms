# CampusForum — Backend

API del proyecto Plataforma Web de Blogs / CMS Ligero,
desarrollada con Django y Django REST Framework.

Implementa autenticación, autorización por roles, administración de artículos,
categorías, flujo editorial y comentarios con moderación previa.

## Tecnologías

- Python: entorno verificado con la versión 3.12.6.
- Django 5.0.2.
- Django REST Framework 3.14.0.
- MySQL.
- Autenticación mediante tokens con el esquema Bearer.

Las dependencias se encuentran en `requirements.txt`.

## Organización y arquitectura

El proyecto separa las responsabilidades de presentación, procesamiento
de solicitudes, reglas de negocio y persistencia.

| Responsabilidad | Ubicación |
| --- | --- |
| Presentación e interacción del usuario | Aplicación Angular en `../frontend/` |
| Rutas de la API | `CampusForum_API/urls.py` |
| Recepción de solicitudes y respuestas HTTP | `CampusForum_API/views/` |
| Validación y representación de datos | Serializadores de `CampusForum_API/` |
| Reglas de negocio | `CampusForum_API/services/` |
| Consultas y operaciones de persistencia | `CampusForum_API/repositories/` |
| Modelos persistentes | `CampusForum_API/models.py` |
| Autorización reutilizable | `CampusForum_API/permissions.py` y `roles.py` |

En la adaptación de MVC utilizada, Angular implementa la presentación,
las vistas de la API cumplen la función de controladores HTTP y los
modelos representan los datos persistentes.

Los servicios coordinan los casos de uso y los repositorios encapsulan
las consultas mediante el ORM de Django. Las plantillas de Angular
no acceden directamente a la base de datos.

## Instalación local

Los siguientes comandos corresponden a Windows con Git Bash.

Desde la carpeta `backend`:

```bash
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
```

Antes de aplicar migraciones:

1. Iniciar el servidor MySQL.
2. Crear la base de datos y un usuario con permisos para trabajar con ella.
3. Configurar la conexión según la sección `DATABASES` de
   `CampusForum_API/settings.py`.
4. Si esa configuración utiliza un archivo externo, preparar dicho archivo
   en la ubicación indicada por el proyecto.

Las credenciales de conexión son locales y no deben incluirse en esta documentación.

Aplicar las migraciones y crear los grupos del CMS:

```bash
python manage.py migrate
python manage.py setup_roles
python manage.py check
```

Iniciar la API:

```bash
python manage.py runserver
```

Dirección local habitual: http://127.0.0.1:8000.

El frontend se inicia por separado; consultar `../frontend/README.md`.

## Roles e inicialización administrativa

Los roles del CMS son:

- LECTOR.
- AUTOR.
- EDITOR.
- ADMINISTRADOR.

El registro público crea cuentas con rol LECTOR.
El cliente no puede elegir un rol privilegiado durante el registro.

Para preparar una cuenta administradora del CMS:

1. Registrar la cuenta desde la aplicación.
2. Usar su correo en el comando de preparación.
3. Revisar primero la simulación:

```bash
python manage.py prepare_cms_users --admin-email "administrador@example.com" --dry-run
```

Después de revisar el resultado, aplicar los cambios:

```bash
python manage.py prepare_cms_users --admin-email "administrador@example.com"
```

Sustituir el correo de ejemplo por el de la cuenta existente.

### Alcance del comando de preparación

`prepare_cms_users` procesa todas las cuentas existentes:

- Asigna ADMINISTRADOR a la cuenta seleccionada y a los superusuarios.
- Conserva los roles CMS válidos de las demás cuentas.
- Asigna LECTOR a las cuentas sin un rol CMS.
- Retira roles antiguos mediante el repositorio administrativo.
- Invalida los tokens de las cuentas modificadas.
- Rechaza cuentas con varios roles CMS para que se revisen manualmente.

El correo debe identificar una única cuenta activa.
Su `username` debe coincidir con el correo en minúsculas.

Este comando se utiliza para la preparación inicial o conversión de usuarios
antiguos. La administración habitual se realiza desde el panel de usuarios.

Una cuenta técnica de superusuario de Django se crea, cuando sea necesaria, con:

```bash
python manage.py createsuperuser
```

Las cuentas técnicas de superusuario se administran fuera del endpoint
de administración de usuarios del CMS.

## Autenticación

Las solicitudes protegidas utilizan:

```http
Authorization: Bearer <token>
```

El inicio de sesión recibe `username` y `password`.
En el flujo actual, `username` corresponde al correo en minúsculas.

Cerrar sesión invalida el token utilizado.
Los cambios administrativos de rol o estado invalidan los tokens
de la cuenta modificada.

## Endpoints principales

Las rutas de esta tabla son relativas a la base de la API.

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/users/` | Registrar una cuenta LECTOR |
| POST | `/token/` | Iniciar sesión |
| GET | `/me/` | Consultar la cuenta autenticada |
| POST | `/logout/` | Cerrar sesión |
| GET | `/posts/` | Listar artículos publicados |
| POST | `/posts/` | Crear un borrador |
| GET | `/posts/:id/` | Consultar un artículo publicado |
| PATCH / PUT | `/posts/:id/` | Editar un borrador autorizado |
| DELETE | `/posts/:id/` | Eliminar un artículo autorizado |
| GET | `/workspace/posts/` | Listar artículos accesibles al usuario |
| GET | `/workspace/posts/:id/` | Consultar un artículo en el espacio de trabajo |
| POST | `/workspace/posts/:id/transition/` | Ejecutar una acción editorial |
| GET | `/categories/` | Listar categorías activas |
| POST | `/categories/` | Crear una categoría |
| GET | `/categories/:id/` | Consultar una categoría activa |
| PATCH | `/categories/:id/` | Actualizar una categoría |
| GET | `/workspace/categories/` | Listar categorías activas e inactivas |
| GET | `/workspace/categories/:id/` | Consultar una categoría para administración |
| GET | `/posts/:id/comments/` | Listar comentarios aprobados |
| POST | `/posts/:id/comments/` | Enviar un comentario a moderación |
| GET | `/workspace/comments/` | Consultar la cola de moderación |
| POST | `/workspace/comments/:id/moderate/` | Aprobar o rechazar un comentario |
| GET | `/admin/users/` | Listar usuarios |
| PATCH | `/admin/users/:id/` | Modificar el rol o estado de otra cuenta |

`:id` representa un identificador numérico.

## Permisos principales

- Un visitante puede consultar artículos publicados, categorías activas
  y comentarios aprobados de artículos publicados.
- Un usuario activo con rol CMS puede enviar comentarios a moderación.
- Un AUTOR puede crear artículos y consultar sus propios artículos privados.
  Solo puede editar y eliminar sus propios borradores.
- Un EDITOR o ADMINISTRADOR puede consultar todos los artículos del espacio
  de trabajo, editar borradores y eliminar artículos.
- Un EDITOR o ADMINISTRADOR administra categorías y modera comentarios.
- Solo un ADMINISTRADOR administra usuarios.

La edición de usuarios no permite modificar la propia cuenta desde ese endpoint
ni modificar cuentas técnicas de superusuario.

## Artículos y categorías

La creación y edición de artículos acepta:

- `title`.
- `content`.
- `categoria_id`.
- `etiquetas`.

El servidor asigna el autor y crea el artículo como BORRADOR.
Los cambios de estado requieren el endpoint editorial.

Las etiquetas se separan con comas. Al guardar, se normalizan los espacios,
se eliminan elementos vacíos y se descartan duplicados sin distinguir
mayúsculas y minúsculas.

Solo se pueden asignar categorías activas.
Un artículo que ya tiene una categoría inactiva puede conservarla o quitarla.

Desactivar una categoría conserva sus relaciones con los artículos.

El contenido Markdown/HTML se almacena como texto fuente.
La aplicación Angular sanitiza el HTML generado antes de mostrarlo.

## Flujo editorial

| Acción | Estado inicial | Estado final | Quién puede ejecutarla |
| --- | --- | --- | --- |
| `ENVIAR_REVISION` | BORRADOR | PENDIENTE_REVISION | Autor propietario, editor o administrador |
| `DEVOLVER` | PENDIENTE_REVISION | BORRADOR | Editor o administrador |
| `PUBLICAR` | PENDIENTE_REVISION | PUBLICADO | Editor o administrador |
| `ARCHIVAR` | PUBLICADO | ARCHIVADO | Editor o administrador |
| `RECUPERAR` | ARCHIVADO | BORRADOR | Editor o administrador |

Ejemplo de cuerpo para una transición:

```json
{
  "action": "ENVIAR_REVISION"
}
```

Los artículos privados no se muestran mediante las rutas públicas,
aunque quien consulta sea editor o administrador.

## Comentarios y moderación

Los comentarios:

- Solo pueden enviarse a artículos publicados.
- Admiten contenido de hasta 2000 caracteres.
- Se crean con estado PENDIENTE y autor asignado por el servidor.
- Se muestran públicamente después de ser aprobados.
- Se aprueban o rechazan por un editor o administrador.
- Registran quién realizó la moderación y cuándo.
- No admiten una segunda decisión una vez moderados.

El endpoint de moderación recibe:

```json
{
  "action": "APROBAR"
}
```

También acepta `RECHAZAR`.

La cola administrativa admite el filtro `estado` con los valores
PENDIENTE, APROBADO, RECHAZADO o TODOS.

Archivar un artículo conserva sus comentarios, pero deja de exponerlos
y de aceptar comentarios nuevos. No se pueden aprobar comentarios
mientras el artículo no esté publicado.

## Paginación y consultas

Los listados paginados responden con:

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

La página se indica mediante `?page=2`.

- Artículos: 10 elementos por página.
- Categorías, usuarios y moderación de comentarios: 20 elementos por página.

Los listados de artículos entregan `excerpt` en lugar del contenido completo.
El detalle entrega `content`.

El extracto utiliza hasta 180 caracteres y añade puntos suspensivos
cuando hay contenido adicional. Su origen se obtiene mediante una
expresión de base de datos, sin cargar el contenido completo en el listado.

Las consultas de artículos cargan conjuntamente el autor y la categoría
para evitar consultas adicionales por cada resultado.
El orden es descendente por fecha de creación e identificador.

## Comprobaciones

Desde `backend`, con el entorno virtual activo:

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py showmigrations CampusForum_API
```

Durante el desarrollo se ejecutaron verificaciones de:

- Autenticación y autorización.
- Administración de usuarios.
- Artículos y categorías.
- Transiciones editoriales.
- Comentarios y moderación.
- Paginación, extractos y consultas relacionadas.

Las verificaciones temporales de integración utilizaban transacciones
con reversión de datos y se retiraron después de ejecutarlas.
No constituyen una suite de regresión conservada en el repositorio.

## Alcance de ejecución

Estas instrucciones describen el entorno local de desarrollo.
El despliegue de producción requiere una configuración específica
del servidor, la base de datos y la aplicación.