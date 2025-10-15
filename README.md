# 🌌 ASTERIUM SERVER

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

> **Asterium** es una API REST desarrollada con **Node.js, Express, TypeScript y Sequelize**,  
> que permite gestionar *descubrimientos astronómicos* con roles, autenticación y subida de imágenes.

---

## 🚀 Descripción general

Asterium es una API segura, modular y escalable con arquitectura **MVC**, validación de datos con **Zod**,  
autenticación JWT y manejo de imágenes en **Cloudinary**.

🧩 Diseñada para proyectos colaborativos y despliegues en la nube,  
con una base sólida para integración con frontend (React, Vue o Next.js).

---

## 🧭 Roles y permisos

| **Rol** | Puede listar | Puede ver detalle | Puede crear | Puede editar | Puede eliminar |
|:--------|:--------------:|:------------------:|:-------------:|:---------------:|:----------------:|
| 🧍‍♀️ **Usuario** | ✅ | ✅ | ✅ | ✅ *(solo sus descubrimientos)* | ✅ *(solo sus descubrimientos)* |
| 🛡️ **Admin** | ✅ | ✅ | ✅ | ✅ *(todos)* | ✅ *(todos)* |

> 🔐 Solo los **usuarios autenticados** pueden crear, editar o eliminar **sus propios descubrimientos**.  
> Los administradores tienen **control total** sobre todos los registros.


---

## ⚙️ Tecnologías utilizadas

| Categoría | Tecnologías |
|------------|--------------|
| **Lenguaje** | TypeScript |
| **Framework** | Express.js |
| **ORM / DB** | Sequelize + MySQL |
| **Validación** | Zod |
| **Seguridad** | Helmet · CORS · JWT |
| **Imágenes** | Cloudinary + Multer |
| **Testing** | Jest · Supertest |
| **Documentación** | Postman |

---

## 🗂️ Estructura del proyecto

```plaintext
src/
 ├── config/               # Cloudinary setup
 ├── controllers/          # Lógica de negocio
 ├── middlewares/          # Auth, roles, validaciones
 ├── models/               # Sequelize models
 ├── routes/               # Endpoints principales
 ├── schemas/              # Validaciones Zod
 ├── seeders/              # Datos iniciales
 ├── tests/                # Pruebas automáticas
 ├── db.ts                 # Conexión MySQL
 ├── app.ts                # Configuración Express
 └── index.ts              # Punto de entrada
☁️ Cloudinary Integration
🔸 Imágenes gestionadas con Multer + CloudinaryStorage
🔸 Carpeta automática: Asterium_Discoveries
🔸 Se aceptan tanto archivos como URLs externas

ts
Copiar código
const image_url = req.file?.path || body.image_url || null;
Si el usuario pega un link (por ejemplo, desde una web externa),
la API también lo guarda sin subir archivo.

🔐 Endpoints principales
🪐 Autenticación /auth
Método	Endpoint	Descripción	Auth
POST	/auth/register	Registrar usuario	❌
POST	/auth/login	Iniciar sesión (JWT)	❌
PUT	/auth/promote/:id	Promover a admin	✅ Solo admin

🌠 Descubrimientos /asterium
Método	Endpoint	Descripción	Auth
GET	/asterium	Lista descubrimientos publicados	✅ Logueados
GET	/asterium/:id	Ver detalle de un descubrimiento	✅ Logueados
POST	/asterium	Crear nuevo descubrimiento	✅ user/admin
PUT	/asterium/:id	Editar propio o admin	✅ user/admin
DELETE	/asterium/:id	Eliminar propio o admin	✅ user/admin

🧬 Modelo de base de datos
Diagrama generado con dbdiagram.io

sql
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
auth.test.ts	Pruebas de registro, login y JWT
asterium.test.ts	CRUD de descubrimientos
auth.ts (middleware)	Verifica autenticación
checkRole.ts	Control de permisos por rol

bash
Copiar código
npm test
📘 Documentación Postman
🪐 Colección completa →
👉 Ver en Postman

Incluye:

Ejemplos de login / registro / JWT

CRUD de descubrimientos

Subida de imágenes

Variables de entorno ({{token}})

👩‍💻 Equipo de desarrollo
Rol	Integrante
💻 Backend Developer	Anggy Pereira
💻 Backend Developer	Maryori Cruz
💻 Backend Developer	Michelle Perez
💻 Backend Developer	Sofía Reyes
💻 Backend Developer	Larysa Ambartsumian

🧠 Notas finales
Proyecto realizado en Factoría F5 – Bootcamp FullStack & DevOps.
Diseñado con buenas prácticas de arquitectura, seguridad y documentación profesional.

“El universo es infinito… y nuestra curiosidad también.”

✨ By the Asterium Backend Team – 2025