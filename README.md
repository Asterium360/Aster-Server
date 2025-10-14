🌌 Asterium Server

API REST creada con Node.js + Express + TypeScript + Sequelize + MySQL
para gestionar descubrimientos astronómicos y usuarios con roles.

Permite el registro y autenticación JWT, la creación, edición y eliminación de descubrimientos,
y el almacenamiento de imágenes en Cloudinary.

🚀 Descripción general

Asterium es una API modular, segura y escalable con arquitectura MVC.
Cuenta con validaciones sólidas, autenticación por roles y control de permisos granular.

Características principales:

🔐 Autenticación JWT (login, registro, roles y protección de rutas)

🧠 Validaciones Zod para inputs seguros

🪐 Cloudinary para carga y almacenamiento de imágenes

💾 Sequelize + MySQL como ORM y base de datos

🛡️ Middlewares personalizados: auth, roles y validaciones

🧩 TypeScript para tipado estático y mantenibilidad

🧪 Tests automáticos con Jest y Supertest

🧭 Roles y permisos
Rol	Puede listar	Puede ver detalle	Puede crear	Puede editar propio	Puede eliminar propio
🧍‍♀️ Usuario (logueado)	✅	✅	✅	✅	✅
🛡️ Admin	✅	✅	✅	✅ (todos)	✅ (todos)

Solo los usuarios autenticados pueden crear, editar o eliminar descubrimientos.

Los admins pueden hacerlo con cualquier descubrimiento.

Los usuarios normales solo pueden gestionar los suyos.

🧩 Tecnologías utilizadas
Categoría	Tecnología
Lenguaje	TypeScript
Framework	Express.js
ORM	Sequelize
Base de datos	MySQL
Validación	Zod
Seguridad	Helmet, CORS, JWT
Almacenamiento de imágenes	Cloudinary + Multer
Testing	Jest, Supertest
Documentación	Postman
🗂️ Estructura del proyecto
src/
 ├── config/
 │   └── cloudinary.ts          # Configuración de Cloudinary
 ├── controllers/               # Controladores (lógica de negocio)
 │   ├── asterium.controller.ts
 │   ├── auth.controller.ts
 │   └── user.controller.ts
 ├── middlewares/               # Middlewares reutilizables
 │   ├── auth.ts
 │   ├── checkRole.ts
 │   ├── validate.ts
 │   └── uploadImage.ts
 ├── models/                    # Modelos Sequelize
 │   ├── Asterium.ts
 │   ├── User.ts
 │   ├── Role.ts
 │   └── ContactMessage.ts
 ├── routes/                    # Definición de endpoints
 │   ├── auth.routes.ts
 │   ├── asterium.routes.ts
 │   └── user.routes.ts
 ├── schemas/                   # Validaciones con Zod
 │   ├── auth.schema.ts
 │   └── asterium.schema.ts
 ├── tests/                     # Pruebas automáticas
 │   ├── auth.test.ts
 │   └── asterium.test.ts
 ├── seeders/                   # Datos iniciales
 │   └── AsteriumSeeders.ts
 ├── db.ts                      # Configuración Sequelize + MySQL
 ├── app.ts                     # Configuración Express
 ├── index.ts                   # Punto de entrada
 └── .env                       # Variables de entorno

⚙️ Instalación y ejecución local
1️⃣ Clonar el repositorio
git clone https://github.com/Asterium360/Aster-Server.git
cd Aster-Server

2️⃣ Instalar dependencias
npm install

3️⃣ Configurar variables de entorno

Crea un archivo .env en la raíz con:

PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=asterium
DB_USER=root
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_token_secreto

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_nombre
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret

4️⃣ Ejecutar el servidor

Modo desarrollo:

npm run dev


Modo producción:

npm start


Servidor activo en:
👉 http://localhost:4000

☁️ Integración con Cloudinary

El backend usa Multer + CloudinaryStorage para subir imágenes automáticamente.

Las imágenes se almacenan en la carpeta:
Asterium_Discoveries
(Cloudinary la crea automáticamente si no existe)

En el modelo Asterium, el campo image_url almacena el enlace público.

🔹 Si el usuario pega un enlace externo, también se acepta (sin subir archivo).

🔐 Endpoints principales
🔸 Autenticación /auth
Método	Endpoint	Descripción	Auth
POST	/auth/register	Registrar nuevo usuario	❌
POST	/auth/login	Iniciar sesión (devuelve token)	❌
PUT	/auth/promote/:id	Promover usuario a admin	✅ solo admin
🌠 Descubrimientos /asterium
Método	Endpoint	Descripción	Auth
GET	/asterium	Lista todos los descubrimientos publicados	✅ logueados
GET	/asterium/:id	Ver detalle de un descubrimiento	✅ logueados
POST	/asterium	Crear nuevo descubrimiento	✅ user/admin
PUT	/asterium/:id	Editar (autor o admin)	✅ user/admin
DELETE	/asterium/:id	Eliminar (autor o admin)	✅ user/admin
🧪 Testing

Se realizaron pruebas con Jest + Supertest:

Archivo	Descripción
auth.test.ts	Verifica registro, login y JWT
asterium.test.ts	CRUD completo de descubrimientos
middlewares/auth.ts	Valida autenticación
middlewares/checkRole.ts	Controla acceso por roles

Ejecutar:

npm test

🧬 Modelo de base de datos (dbdiagram.io)
Table users {
  id int [pk, increment]
  email varchar(191) [unique, not null]
  username varchar(50) [unique, not null]
  password_hash varchar(100) [not null]
  role_id int
  display_name varchar(100)
  is_active boolean [default: true]
  created_at datetime
  updated_at datetime
}

Table roles {
  id int [pk, increment]
  name varchar(50) [unique, not null]
}

Table asteriums {
  id int [pk, increment]
  author_id int [not null]
  title varchar(255) [not null]
  excerpt text
  content_md text [not null]
  status varchar(20) [default: 'draft']
  image_url varchar(500)
  like_count int [default: 0]
  published_at datetime
  created_at datetime
  updated_at datetime
}

Table contact_messages {
  id int [pk, increment]
  user_id int [not null]
  name varchar(120) [not null]
  email varchar(191) [not null]
  subject varchar(200)
  message text [not null]
  status varchar(20) [default: 'new']
  created_at datetime
  updated_at datetime
}

Ref: users.role_id > roles.id
Ref: asteriums.author_id > users.id
Ref: contact_messages.user_id > users.id

📘 Documentación Postman

Colección oficial:
👉 Ver colección en Postman

Incluye ejemplos de:

Login, registro y promoción de roles

CRUD completo de descubrimientos

Subida de imágenes con Cloudinary

Autenticación JWT con variable global {{token}}

👩‍💻 Equipo de desarrollo
Rol	Integrante
💻 Backend Developer	Maryori Cruz
💻 Backend Developer	Anggy Pereira
💻 Backend Developer	Sofía
🧠 Notas finales

Proyecto desarrollado en Factoría F5 - Bootcamp FullStack & DevOps.
La API aplica buenas prácticas de arquitectura limpia, seguridad y documentación profesional.

🪐 "El universo es infinito… y nuestra curiosidad también."