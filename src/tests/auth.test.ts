import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
// 🔑 Importamos la instancia de Express
import app from '../index.js';
// 🔑 Importamos el modelo Asterium REAL para interactuar con la DB
import { Asterium } from '../models/Asterium.js'; 
import type { AsteriumAttrs } from '../models/Asterium.js'; 


// --- CONFIGURACIÓN DE BASE DE DATOS DE PRUEBA ---

// Función para limpiar la tabla Asterium antes de cada prueba.
const cleanupAsteriumTable = async () => {
    // Usamos el modelo real para truncar la tabla (eliminar todas las filas)
    // Esto asegura que cada prueba se ejecute en un estado limpio.
    // NOTA: Se asume que el modelo Asterium ya está conectado a la base de datos de prueba
    await Asterium.destroy({ where: {}, truncate: true });
};


// --- DATOS DE PRUEBA Y AUTENTICACIÓN ---

const JWT_SECRET = 'test-secret'; // Se asume que este valor se usa en el middleware
const USER_ID = 10;
const ADMIN_ID = 99;
let AST_ID: number; // Guardará el ID de la fila base creada en la DB

// Genera un token JWT de prueba
const generateToken = (userId: number, role: 'user' | 'admin') => {
    // El 'sub' (subject) es el ID del usuario en el token
    return jwt.sign({ sub: userId.toString(), role: role }, JWT_SECRET, { expiresIn: '1h' });
};

// Datos base para crear una fila inicial en la DB
const initialAsteriumData: AsteriumAttrs = {  
    id: 1, // Puedes usar cualquier número, será sobrescrito por la DB si es autoincremental
    author_id: USER_ID,
    title: 'Descubrimiento Inicial Publicado',
    slug: 'descubrimiento-inicial-publicado',
    content_md: 'Contenido de la fila base.',
    status: 'published',
    published_at: new Date(),
    like_count: 5,
    excerpt: null,
};


describe('Controladores de Asterium (Base de Datos Real)', () => {
    // 1. Configuración global: Se ejecuta una vez al inicio
    beforeAll(() => {
        // Establecer el secret de prueba para que los tokens sean válidos
        process.env.JWT_SECRET = JWT_SECRET;
        // NOTA: La conexión a la DB debe estar activa aquí
    });

    // 2. Limpieza y preparación de datos: Se ejecuta antes de cada prueba
    beforeEach(async () => {
        await cleanupAsteriumTable();
        
        // Crear una fila inicial en la DB para las pruebas de findByPk, update, delete
        // Usamos 'as any' porque Sequelize agrega automáticamente 'id'
        const row = await Asterium.create(initialAsteriumData as any); 
        AST_ID = row.id!; // Guardar el ID generado en la DB
    });

    // 3. Limpieza final (opcional, pero buena práctica)
    afterEach(async () => {
        await cleanupAsteriumTable();
    });

    // =================================================================
    // listPublished (GET /asterium/published)
    // =================================================================
    describe('GET /asterium/published (listPublished)', () => {
        it('Debería retornar 200 con la fila inicial publicada', async () => {
            
            const response = await request(app).get('/asterium/published');

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            expect(response.body[0].title).toEqual('Descubrimiento Inicial Publicado');
            expect(response.body[0].status).toEqual('published');
        });
    });

//     // =================================================================
//     // createDiscovery (POST /asterium)
//     // =================================================================
//     describe('POST /asterium (createDiscovery)', () => {
//         const userToken = generateToken(USER_ID, 'user');
//         const postData = {
//             title: 'Nuevo Descubrimiento Creado',
//             content_md: 'Contenido Creado',
//             status: 'draft',
//         };

//         it('Debería retornar 201 y crear el objeto en la DB', async () => {
//             const initialCount = await Asterium.count();

//             const response = await request(app)
//                 .post('/asterium')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(postData);

//             expect(response.statusCode).toBe(201);
//             expect(response.body.title).toEqual('Nuevo Descubrimiento Creado');
//             expect(response.body.author_id).toEqual(USER_ID);
            
//             // Verificar en la base de datos real que se aumentó el contador
//             const finalCount = await Asterium.count();
//             expect(finalCount).toEqual(initialCount + 1);
            
//             // Verificar que los datos son correctos en la DB
//             const createdRow = await Asterium.findByPk(response.body.id);
//             expect(createdRow).not.toBeNull();
//             expect(createdRow!.status).toEqual('draft');
//         });

//         it('No debería llamar a create si no hay token (Middleware 401)', async () => {
//             const initialCount = await Asterium.count();

//             const response = await request(app)
//                 .post('/asterium')
//                 .send(postData); 

//             expect(response.statusCode).toBe(401);
            
//             // Verificar que no se creó nada en la DB
//             const finalCount = await Asterium.count();
//             expect(finalCount).toEqual(initialCount);
//         });
//     });


//     // =================================================================
//     // updateDiscovery (PUT /asterium/:id)
//     // =================================================================
//     describe('PUT /asterium/:id (updateDiscovery)', () => {
//         const updateData = { title: 'Título Actualizado en DB', status: 'draft' };
        
//         it('Debería actualizar y retornar 200 si el usuario es el autor', async () => {
//             const userToken = generateToken(USER_ID, 'user');
            
//             const response = await request(app)
//                 .put(`/asterium/${AST_ID}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(updateData);

//             expect(response.statusCode).toBe(200);
//             expect(response.body.title).toEqual('Título Actualizado en DB');
            
//             // Verificar en la base de datos real
//             const updatedRow = await Asterium.findByPk(AST_ID);
//             expect(updatedRow!.title).toEqual('Título Actualizado en DB');
//             expect(updatedRow!.status).toEqual('draft');
//         });
        
//         it('Debería retornar 200 y actualizar si el usuario es administrador', async () => {
//             const adminToken = generateToken(ADMIN_ID, 'admin');
            
//             const response = await request(app)
//                 .put(`/asterium/${AST_ID}`)
//                 .set('Authorization', `Bearer ${adminToken}`)
//                 .send(updateData);

//             expect(response.statusCode).toBe(200);

//             // Verificar en la base de datos real
//             const updatedRow = await Asterium.findByPk(AST_ID);
//             expect(updatedRow!.title).toEqual('Título Actualizado en DB');
//         });

//         it('Debería retornar 403 si el usuario NO es autor NI administrador', async () => {
//             const nonAuthorToken = generateToken(999, 'user'); // Token de otro usuario (ID 999)
//             const initialTitle = (await Asterium.findByPk(AST_ID))!.title; // Título original

//             const response = await request(app)
//                 .put(`/asterium/${AST_ID}`)
//                 .set('Authorization', `Bearer ${nonAuthorToken}`)
//                 .send(updateData);

//             expect(response.statusCode).toBe(403);
            
//             // Verificar que la DB NO fue modificada
//             const finalRow = await Asterium.findByPk(AST_ID);
//             expect(finalRow!.title).toEqual(initialTitle);
//         });
//     });

//     // =================================================================
//     // deleteDiscovery (DELETE /asterium/:id)
//     // =================================================================
//     describe('DELETE /asterium/:id (deleteDiscovery)', () => {
        
//         it('Debería retornar 204 y eliminar si el usuario es el autor', async () => {
//             const userToken = generateToken(USER_ID, 'user');
            
//             const response = await request(app)
//                 .delete(`/asterium/${AST_ID}`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect(response.statusCode).toBe(204);
            
//             // Verificar en la base de datos real
//             const deletedRow = await Asterium.findByPk(AST_ID);
//             expect(deletedRow).toBeNull();
//         });
        
//         it('Debería retornar 403 si el usuario NO es autor NI administrador', async () => {
//             const nonAuthorToken = generateToken(999, 'user'); 
            
//             const response = await request(app)
//                 .delete(`/asterium/${AST_ID}`)
//                 .set('Authorization', `Bearer ${nonAuthorToken}`);

//             expect(response.statusCode).toBe(403);

//             // Verificar que la fila NO fue eliminada
//             const existingRow = await Asterium.findByPk(AST_ID);
//             expect(existingRow).not.toBeNull();
//         });
//     });

});
