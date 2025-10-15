# 🌌 ASTERIUM SERVER

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

> **Asterium** es una API REST desarrollada con **Node.js, Express, TypeScript y Sequelize**,  
> que permite gestionar *descubrimientos astronómicos* con autenticación, roles y carga de imágenes.

---

## 🚀 Descripción general

Asterium es una API moderna, escalable y documentada que permite:

- 🔐 **Registro y autenticación de usuarios** con roles (*admin* y *user*).  
- 🧩 **CRUD completo** de descubrimientos astronómicos.  
- ☁️ **Carga flexible de imágenes** (desde archivo o URL) con Cloudinary.  
- 🧠 **Validación robusta** de datos con Zod.  
- 🧱 **ORM Sequelize** conectado a MySQL.  
- 🛡️ **Middlewares personalizados** para autenticación, validación y seguridad.  
- 🧪 **Pruebas unitarias** con Jest y Supertest.  

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

| **Categoría** | **Tecnologías** |
|---------------|-----------------|
| 🧑‍💻 **Lenguaje** | TypeScript |
| 🚀 **Framework** | Express.js |
| 🧩 **ORM / DB** | Sequelize + MySQL |
| 🧠 **Validación** | Zod |
| 🛡️ **Seguridad** | Helmet · CORS · JWT |
| ☁️ **Imágenes** | Cloudinary + Multer |
| 🧪 **Testing** | Jest · Supertest |
| 📘 **Documentación** | Postman |

---

## 🗂️ Estructura del proyecto

```plaintext
src/
 ├── config/               # Configuración de Cloudinary
 ├── controllers/          # Lógica de negocio (Asterium, Auth, Users)
 ├── middlewares/          # Auth, roles, validaciones
 ├── models/               # Modelos Sequelize
 ├── routes/               # Definición de endpoints
 ├── schemas/              # Validaciones Zod
 ├── seeders/              # Datos iniciales
 ├── tests/                # Pruebas unitarias
 ├── db.ts                 # Conexión MySQL
 ├── app.ts                # Configuración Express
 └── index.ts              # Punto de entrada
⚙️ Instalación y ejecución local
1️⃣ Clonar el repositorio
bash
Copiar código
git clone https://github.com/Asterium360/Aster-Server.git
cd Aster-Server
2️⃣ Instalar dependencias
bash
Copiar código
npm install
3️⃣ Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto y define tus credenciales:

env
Copiar código
DB_NAME=asterium
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=tu_token_secreto
PORT=4000
4️⃣ Ejecutar el servidor
Modo desarrollo:

bash
Copiar código
npm run dev
Servidor corriendo en:
👉 http://localhost:4000

☁️ Cloudinary Integration
🔸 Imágenes gestionadas con Multer + CloudinaryStorage

🔸 Carpeta automática: Asterium_Discoveries

🔸 Se aceptan tanto archivos locales como URLs externas

ts
Copiar código
const image_url = req.file?.path || body.image_url || null;
Si el usuario pega un link desde una web externa, la API también lo guarda sin subir archivo.

🔐 Endpoints principales
🪐 Autenticación /auth
Método	Endpoint	Descripción	Auth
POST	/auth/register	Registrar usuario	❌
POST	/auth/login	Iniciar sesión (JWT)	❌
PUT	/auth/promote/:id	Promover usuario a admin	✅ Solo admin

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
checkRole.ts (middleware)	Control de permisos por rol

Ejecutar pruebas:

bash
Copiar código
npm test
📘 Documentación Postman
👉 [Ver colección en Postman](https://maryori-5224626.postman.co/workspace/Maryori%27s-Workspace~b4629cfb-3575-450f-84c7-237828081b35/collection/46421564-d0aae761-6651-474b-85ff-af970d5c081d?action=share&amp;creator=46421564)

Esta colección incluye todos los endpoints organizados por módulos, con ejemplos funcionales, tokens de prueba y respuestas esperadas.

Módulo	Endpoint	Método	Descripción
Usuarios (Auth)	/auth/register	POST	Registra un nuevo usuario
/auth/login	POST	Inicia sesión y devuelve un token JWT
/auth/promote/:id	PUT	Promueve un usuario normal a admin
Descubrimientos (Asterium)	/asterium	GET	Lista todos los descubrimientos
/asterium/:id	GET	Obtiene el detalle de un descubrimiento
/asterium	POST	Crea un nuevo descubrimiento
/asterium/:id	PUT	Actualiza un descubrimiento existente
/asterium/:id	DELETE	Elimina un descubrimiento

⚠️ Rutas protegidas requieren autenticación mediante token JWT:
Authorization: Bearer <tu_token>

💾 Importar la colección manualmente
1️⃣ Descarga el archivo Asterium_API.postman_collection.json
2️⃣ Abre Postman → pestaña Collections
3️⃣ Clic en Import → selecciona el archivo JSON
4️⃣ Verás todas las peticiones organizadas por módulos con ejemplos de uso

💡 Recomendado: ideal para equipos, asegura que todos trabajen con la misma versión documentada de la API.

👩‍💻 Equipo de desarrollo
Rol	Integrante
💻 Backend Developer	Anggy Pereira
💻 Backend Developer	Larysa Ambartsumian
💻 Backend Developer	Maryori Cruz
💻 Backend Developer	Michelle Gelves
💻 Backend Developer	Sofía Reyes

🧠 Notas finales
Proyecto realizado en Factoría F5 – Bootcamp FullStack & DevOps.
Diseñado aplicando buenas prácticas de arquitectura, seguridad y documentación profesional.

✨ “El universo es infinito y nuestra curiosidad también.”
By the Asterium Backend Team – 2025