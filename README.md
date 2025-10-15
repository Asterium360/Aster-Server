# 🌌 ASTERIUM SERVER

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

> **Asterium** es una API REST con **Node.js, Express, TypeScript y Sequelize**  
> para gestionar *descubrimientos astronómicos* con autenticación, roles y carga de imágenes.

---

## 🧭 Índice
- [Descripción general](#-descripción-general)
- [Roles y permisos](#-roles-y-permisos)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Integración con Cloudinary](#-integración-con-cloudinary)
- [Endpoints principales](#-endpoints-principales)
- [Modelo de base de datos](#-modelo-de-base-de-datos)
- [Testing](#-testing)
- [Documentación Postman](#-documentación-postman)
- [Autenticación](#-autenticación)
- [Equipo de desarrollo](#-equipo-de-desarrollo)
- [Notas finales](#-notas-finales)

---

## 🚀 Descripción general
- 🔐 **Usuarios con roles** (*admin* y *user*).
- 🧩 **CRUD** de descubrimientos astronómicos.
- ☁️ **Imágenes** por archivo o URL (Cloudinary).
- 🧠 **Validación** de datos con Zod.
- 🧱 **ORM Sequelize** + **MySQL**.
- 🛡️ **Middlewares** de auth, validación y seguridad.
- 🧪 **Pruebas** con Jest y Supertest.

---

## 🛡️ Roles y permisos

| Rol         | Listar | Ver detalle | Crear | Editar | Eliminar |
|-------------|:------:|:-----------:|:-----:|:------:|:--------:|
| 🧍‍♀️ Usuario | ✅     | ✅          | ✅    | ✅ *(solo propios)* | ✅ *(solo propios)* |
| 🛡️ Admin    | ✅     | ✅          | ✅    | ✅ *(todos)*        | ✅ *(todos)*        |

> 🔐 Solo usuarios autenticados pueden crear, editar o eliminar sus propios descubrimientos.  
> Los **admins** tienen control total sobre todos los registros.

---

## ⚙️ Tecnologías utilizadas

| Categoría        | Tecnologías                                 |
|------------------|---------------------------------------------|
| 🧑‍💻 Lenguaje    | TypeScript                                  |
| 🚀 Framework     | Express.js                                   |
| 🧩 ORM / DB      | Sequelize + MySQL                            |
| 🧠 Validación    | Zod                                          |
| 🛡️ Seguridad     | Helmet · CORS · JWT                          |
| ☁️ Imágenes       | Cloudinary + Multer                          |
| 🧪 Testing       | Jest · Supertest                             |
| 📘 Documentación | Postman                                      |

---

## 🗂️ Estructura del proyecto
```txt
src/
 ├─ config/               # Configuración (p.ej. Cloudinary)
 ├─ controllers/          # Lógica de negocio (Asterium, Auth, Users)
 ├─ middlewares/          # Auth, roles, validaciones
 ├─ models/               # Modelos Sequelize
 ├─ routes/               # Endpoints
 ├─ schemas/              # Validaciones Zod
 ├─ seeders/              # Datos iniciales
 ├─ tests/                # Pruebas unitarias
 ├─ db.ts                 # Conexión MySQL
 ├─ app.ts                # Configuración Express
 └─ index.ts              # Punto de entrada
⚙️ Instalación y ejecución
1️⃣ Clonar el repositorio
bash
Copiar código
git clone https://github.com/Asterium360/Aster-Server.git
cd Aster-Server
2️⃣ Instalar dependencias
bash
Copiar código
npm install
3️⃣ Variables de entorno
Crea un archivo .env en la raíz:

ini
Copiar código
DB_NAME=asterium
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=3306

JWT_SECRET=tu_token_secreto
PORT=4000
4️⃣ Ejecutar el servidor (desarrollo)
bash
Copiar código
npm run dev
Servidor disponible en 👉 http://localhost:4000

☁️ Integración con Cloudinary
🔸 Multer + CloudinaryStorage

🔸 Carpeta automática: Asterium_Discoveries

🔸 Se aceptan archivos locales y URLs externas

ts
Copiar código
const image_url = req.file?.path || body.image_url || null;
Si el usuario pega un link desde una web externa, la API también lo guarda sin subir archivo.

🔐 Endpoints principales
🪐 Autenticación – /auth
Método	Endpoint	Descripción	Auth
POST	/auth/register	Registrar usuario	❌
POST	/auth/login	Iniciar sesión (JWT)	❌
PUT	/auth/promote/:id	Promover usuario a admin	✅ Solo admin

🌠 Descubrimientos – /asterium
Método	Endpoint	Descripción	Auth
GET	/asterium	Lista de descubrimientos	✅ Logueados
GET	/asterium/:id	Ver detalle	✅ Logueados
POST	/asterium	Crear nuevo descubrimiento	✅ user/admin
PUT	/asterium/:id	Editar (propio) o admin	✅ user/admin
DELETE	/asterium/:id	Eliminar (propio) o admin	✅ user/admin

🧬 Modelo de base de datos
📊 Diagrama en dbdiagram.io
👉 Ver diagrama: https://dbdiagram.io/d/Asterium-Diagram-68e794d8d2b621e4220a55d0

dbml
Copiar código
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
🧪 Testing
Archivo	Propósito
auth.test.ts	Registro, login y JWT
asterium.test.ts	CRUD de descubrimientos
auth.ts	Middleware de autenticación
checkRole.ts	Middleware de control de roles

Ejecutar pruebas

bash
Copiar código
npm run test

📘 Documentación Postman
👉 Ver colección en Postman:
https://maryori-5224626.postman.co/workspace/Maryori%27s-Workspace~b4629cfb-3575-450f-84c7-237828081b35/collection/46421564-d0aae761-6651-474b-85ff-af970d5c081d?action=share&creator=46421564

Incluye todos los endpoints por módulos, ejemplos, tokens de prueba y respuestas.

🔑 Autenticación
Las rutas protegidas requieren token JWT:

makefile
Copiar código
Authorization: Bearer <tu_token>
👩‍💻 Equipo de desarrollo
Rol	Integrante
💻 Scrum Master	Anggy Pereira
💻 Backend Dev	Maryori Cruz
💻 Backend Dev	Sofía Reyes

🧠 Notas finales
Proyecto realizado en Factoría F5 – Bootcamp FullStack & DevOps.
Diseñado con buenas prácticas de arquitectura, seguridad y documentación.

✨ “El universo es infinito y nuestra curiosidad también.”
By the Asterium Backend Team – 2025