import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
// 🔑 Importamos la instancia de Express
import app from '../index.js';
// 🔑 Importamos el modelo Asterium REAL para interactuar con la DB
import { Asterium } from '../models/Asterium.js'; 
import type { AsteriumAttrs } from '../models/Asterium.js'; 
import { User } from '../models/User.js';


// --- CONFIGURACIÓN DE BASE DE DATOS DE PRUEBA ---

// IDs para las claves foráneas
const JWT_SECRET = 'test-secret'; 
const USER_ID = 10;
const ADMIN_ID = 99;
let AST_ID: number; // Guardará el ID de la fila base creada en la DB

// Función para limpiar ambas tablas
const cleanupDatabase = async () => {
    // Es crucial truncar las tablas en orden inverso a la dependencia (Asterium depende de User)
    // Usamos `cascade: true` para manejar las FKs y forzar la limpieza.
    await Asterium.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
};

// Genera un token JWT de prueba
const generateToken = (userId: number, role: 'user' | 'admin') => {
    return jwt.sign({ sub: userId.toString(), role: role }, JWT_SECRET, { expiresIn: '1h' });
};

// Datos base para crear una fila inicial en la DB
const initialAsteriumData: AsteriumAttrs = {
    // 💡 Usamos un ID alto (100) para evitar colisiones de Primary Key
    id: 100, 
    author_id: USER_ID,
    title: 'Descubrimiento Inicial Publicado',
    // 💡 CORRECCIÓN: Hacemos el slug dinámico para evitar colisiones de clave UNIQUE
    // en caso de que TRUNCATE no resetee la tabla correctamente.
    slug: `descubrimiento-inicial-publicado-${Date.now()}`,
    content_md: 'Contenido de la fila base.',
    status: 'published',
    published_at: new Date(),
    like_count: 5,
    excerpt: null,
};


describe('Controladores de Asterium (Base de Datos Real)', () => {
    
    beforeAll(() => {
        // Establecer el secret de prueba para que los tokens sean válidos
        process.env.JWT_SECRET = JWT_SECRET;
    });

    // 2. Limpieza y preparación de datos: Se ejecuta antes de cada prueba
    beforeEach(async () => {
        await cleanupDatabase(); // Limpia ambas tablas
        
        // 🚨 PASO CRÍTICO 1: CREAR LOS USUARIOS DE PRUEBA NECESARIOS PARA LAS FKs
        await User.create({ id: USER_ID, email: 'test@example.com', password: 'hashedpassword', role: 'user' } as any);
        await User.create({ id: ADMIN_ID, email: 'admin@example.com', password: 'hashedpassword', role: 'admin' } as any);
        
        // 🚨 PASO CRÍTICO 2: Creación de Asterium
        // Se espera que la creación sea exitosa ahora que el ID y el SLUG son únicos.
        const row = await Asterium.create(initialAsteriumData as any); 
        AST_ID = row.id!; // Guardar el ID generado en la DB
    });

    // 3. Limpieza final
    afterEach(async () => {
        await cleanupDatabase();
    });

    // =================================================================
    // listPublished (GET /asterium/published)
    // =================================================================
    describe('GET /asterium/published (listPublished)', () => {
        it('Debería retornar 200 con la fila inicial publicada', async () => {
            
            const response = await request(app).get('/asterium/published');

            expect(response.statusCode).toBe(200);
            
            // Verificamos que al menos se traiga el registro que acabamos de insertar (id: 100)
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            expect(response.body.some((a: any) => a.id === AST_ID)).toBe(true);
            expect(response.body.find((a: any) => a.id === AST_ID)?.title).toEqual('Descubrimiento Inicial Publicado');
            
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
            
//             // Verificar en la base de datos real que se aumentó el contador
//             const finalCount = await Asterium.count();
//             expect(finalCount).toEqual(initialCount + 1);
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
            
//             // Verificar en la base de datos real
//             const updatedRow = await Asterium.findByPk(AST_ID);
//             expect(updatedRow!.title).toEqual('Título Actualizado en DB');
//         });
        
//         it('Debería retornar 403 si el usuario NO es autor NI administrador', async () => {
//             const nonAuthorToken = generateToken(500, 'user'); // Usuario 500 no existe ni es admin
            
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
//     });
 });
