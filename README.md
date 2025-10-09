# 🌌 Asterium Server
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3B82F6?style=flat&logo=zod&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat&logo=postman&logoColor=white)


API REST creada con **Node.js + Express + TypeScript + Sequelize** para gestionar descubrimientos astronómicos.  
Permite el registro y autenticación de usuarios, asignación de roles y manejo completo de descubrimientos (crear, editar, eliminar y listar).

---

## 🚀 Descripción general

Asterium es una API segura y escalable, desarrollada con enfoque **MVC**, que ofrece:

- 🔐 Autenticación JWT con control de acceso por **roles** (`admin` y `user`).
- 🧩 Validación de datos con **Zod**.
- 🧠 ORM **Sequelize** conectado a **MySQL**.
- 🛡️ Middlewares para autenticación, validación y seguridad (CORS, Helmet, Morgan).
- 🧱 Código modular y mantenible con **TypeScript**.

---

## 🧭 Roles y permisos

| Rol | Puede listar | Puede ver detalle | Puede crear | Puede editar | Puede eliminar |
|-----|---------------|------------------|--------------|---------------|----------------|
| 🧍‍♀️ Usuario | ✅ | ✅ | ❌ | ✅ (solo sus descubrimientos) | ❌ |
| 🛡️ Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🧩 Tecnologías utilizadas

| Categoría | Tecnología |
|------------|------------|
| Lenguaje | TypeScript |
| Framework | Express.js |
| ORM | Sequelize |
| Base de datos | MySQL |
| Validación | Zod |
| Seguridad | Helmet, CORS, JWT |
| Testing (opcional) | Jest |

---

## 📁 Estructura del proyecto

src/
├── controllers/ # Controladores (lógica de negocio)
│ ├── asterium.controller.ts
│ └── auth.controller.ts
│
├── middlewares/ # Middlewares reutilizables
│ ├── auth.ts
│ └── validate.ts
│
├── models/ # Modelos de Sequelize
│ ├── Asterium.ts
│ └── User.ts
│
├── routes/ # Definición de endpoints
│ ├── auth.routes.ts
│ └── asterium.routes.ts
│
├── schemas/ # Validaciones Zod
│ ├── auth.schema.ts
│ └── asterium.schema.ts
│
├── tests/ # Pruebas automáticas (opcional)
│ └── auth.test.ts
│
├── db.ts # Configuración de conexión a MySQL
├── index.ts # Punto de entrada del servidor
└── .env # Variables de entorno

---

## ⚙️ Instalación y ejecución local

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Asterium360/Aster-Server.git
cd Aster-Server

### 2️⃣ Instalar dependencias
npm install

### 3️⃣ Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto y define tus credenciales:

DB_NAME=asterium
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=tu_token_secreto
PORT=4000

### 4️⃣ Ejecutar el servidor
Modo desarrollo:
npm run dev

Modo producción:
npm start

Servidor corriendo en:
👉 http://localhost:4000

🔐 Endpoints principales

🔸 Autenticación /auth
Método	Endpoint	Descripción	Auth
POST	/auth/register	Registrar nuevo usuario	❌
POST	/auth/login	Iniciar sesión (devuelve token)	❌
PUT	/auth/promote/:id	Promover usuario a admin	✅ solo admin

🌠 Descubrimientos /asterium
| Método     | Endpoint        | Descripción                                | Auth                      |
| ---------- | --------------- | ------------------------------------------ | ------------------------- |
| **GET**    | `/asterium`     | Lista todos los descubrimientos publicados | ✅ solo usuarios logueados |
| **GET**    | `/asterium/:id` | Ver detalle de un descubrimiento           | ✅ solo usuarios logueados |
| **POST**   | `/asterium`     | Crear nuevo descubrimiento                 | ✅ solo admin              |
| **PUT**    | `/asterium/:id` | Editar un descubrimiento (autor o admin)   | ✅                         |
| **DELETE** | `/asterium/:id` | Eliminar descubrimiento (autor o admin)    | ✅                         |

🧪 Ejemplo de uso en Postman
Registro de usuario
POST → http://localhost:4000/auth/register
{
  "email": "usuario@mail.com",
  "username": "astroUser",
  "password": "12345678"
}
Respuesta:

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@mail.com",
    "username": "astroUser"
  }

📘 Documentación Postman

La colección completa de endpoints de Asterium API está disponible en Postman.
Puedes consultarla, probar las peticiones y revisar las respuestas directamente desde el siguiente enlace:

🔗 [Ver colección en Postman](https://maryori-5224626.postman.co/workspace/Maryori%27s-Workspace~b4629cfb-3575-450f-84c7-237828081b35/collection/46421564-d0aae761-6651-474b-85ff-af970d5c081d?action=share&amp;creator=46421564)



📄 Descripción general

Esta colección incluye todos los endpoints organizados por módulos, con ejemplos funcionales, tokens de prueba y respuestas esperadas.

Módulo	Endpoint	Método	Descripción
Usuarios (Auth)	/auth/register	POST	Registra un nuevo usuario.
	/auth/login	POST	Inicia sesión y devuelve un token JWT.
	/auth/promote/:id	PUT	Promueve un usuario normal a administrador.
Descubrimientos (Asterium)	/asterium	GET	Lista todos los descubrimientos.
	/asterium/:id	GET	Obtiene el detalle de un descubrimiento.
	/asterium	POST	Crea un nuevo descubrimiento.
	/asterium/:id	PUT	Actualiza un descubrimiento existente.
	/asterium/:id	DELETE	Elimina un descubrimiento.

🧠 Notas importantes:

Las rutas protegidas requieren autenticación mediante token JWT.

Authorization: Bearer <tu_token>


Algunas acciones (como crear o eliminar descubrimientos) están reservadas solo para administradores.

Todas las peticiones incluyen ejemplos de Body, Headers y respuestas esperadas.

### 💾 Opción alternativa: importar la colección desde archivo JSON

También puedes importar la colección manualmente si prefieres no usar el enlace público:

1️⃣ Descarga el archivo [`Asterium_API.postman_collection.json`](Asterium API.postman_collection.json) incluido en este repositorio.  
2️⃣ Abre Postman → pestaña **Collections**.  
3️⃣ Clic en **Import** → selecciona el archivo JSON.  
4️⃣ Verás todas las peticiones organizadas por módulos con sus descripciones y ejemplos.

🧠 **Recomendado:** Si trabajas en equipo, esta opción asegura que todos tengan exactamente la misma versión documentada de la API.


👩‍💻 Equipo de desarrollo
Rol	Integrante
💻 Backend Developer	Maryori Cruz
💻 Backend Developer	Anggy Pereira
💻 Backend Developer	Sofia 

🧠 Notas finales

Este proyecto forma parte del bootcamp Factoría F5 - FullStack & DevOps.

La API se diseñó con fines educativos, aplicando buenas prácticas de arquitectura, seguridad y documentación.

Próxima etapa: despliegue del backend en Render y conexión con el frontend de Asterium.

🪐 "El universo es infinito y nuestra curiosidad también."