 // import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';
// import request from 'supertest';
// import jwt from 'jsonwebtoken';
// // 🔑 Importamos la instancia de Express
// import app from '../index.js';
// // 🔑 Importamos el modelo Asterium REAL para interactuar con la DB
// import { Asterium } from '../models/Asterium.js'; 
// import type { AsteriumAttrs } from '../models/Asterium.js'; 
// import { User } from '../models/User.js';


// // --- CONFIGURACIÓN DE BASE DE DATOS DE PRUEBA ---

// // IDs para las claves foráneas
// const JWT_SECRET = 'test-secret'; 
// const USER_ID = 10;
// const ADMIN_ID = 99;
// let AST_ID: number; // Guardará el ID de la fila base creada en la DB

// // Función para limpiar ambas tablas
// const cleanupDatabase = async () => {
//     // Es crucial truncar las tablas en orden inverso a la dependencia (Asterium depende de User)
//     // Usamos `cascade: true` para manejar las FKs y forzar la limpieza.
//     await Asterium.destroy({ where: {}, truncate: true, cascade: true });
//     await User.destroy({ where: {}, truncate: true, cascade: true });
// };

// // Genera un token JWT de prueba
// const generateToken = (userId: number, role: 'user' | 'admin') => {
//     return jwt.sign({ sub: userId.toString(), role: role }, JWT_SECRET, { expiresIn: '1h' });
// };

// // Datos base para crear una fila inicial en la DB
// const initialAsteriumData: AsteriumAttrs = {
//     // 💡 Usamos un ID alto (100) para evitar colisiones de Primary Key
//     id: 100, 
//     author_id: USER_ID,
//     title: 'Descubrimiento Inicial Publicado',
//     // 💡 CORRECCIÓN: Hacemos el slug dinámico para evitar colisiones de clave UNIQUE
//     // en caso de que TRUNCATE no resetee la tabla correctamente.
//     slug: `descubrimiento-inicial-publicado-${Date.now()}`,
//     content_md: 'Contenido de la fila base.',
//     status: 'published',
//     published_at: new Date(),
//     like_count: 5,
//     excerpt: null,
// };


// describe('Controladores de Asterium (Base de Datos Real)', () => {
    
//     beforeAll(() => {
//         // Establecer el secret de prueba para que los tokens sean válidos
//         process.env.JWT_SECRET = JWT_SECRET;
//     });

//     // 2. Limpieza y preparación de datos: Se ejecuta antes de cada prueba
//     beforeEach(async () => {
//         await cleanupDatabase(); // Limpia ambas tablas
        
//         // 🚨 PASO CRÍTICO 1: CREAR LOS USUARIOS DE PRUEBA NECESARIOS PARA LAS FKs
//         await User.create({ id: USER_ID, email: 'test@example.com', password: 'hashedpassword', role: 'user' } as any);
//         await User.create({ id: ADMIN_ID, email: 'admin@example.com', password: 'hashedpassword', role: 'admin' } as any);
        
//         // 🚨 PASO CRÍTICO 2: Creación de Asterium
//         // Se espera que la creación sea exitosa ahora que el ID y el SLUG son únicos.
//         const row = await Asterium.create(initialAsteriumData as any); 
//         AST_ID = row.id!; // Guardar el ID generado en la DB
//     });

//     // 3. Limpieza final
//     afterEach(async () => {
//         await cleanupDatabase();
//     });

//     // =================================================================
//     // listPublished (GET /asterium/published)
//     // =================================================================
//     describe('GET /asterium/published (listPublished)', () => {
//         it('Debería retornar 200 con la fila inicial publicada', async () => {
            
//             const response = await request(app).get('/asterium/published');

//             expect(response.statusCode).toBe(200);
            
//             // Verificamos que al menos se traiga el registro que acabamos de insertar (id: 100)
//             expect(response.body.length).toBeGreaterThanOrEqual(1);
//             expect(response.body.some((a: any) => a.id === AST_ID)).toBe(true);
//             expect(response.body.find((a: any) => a.id === AST_ID)?.title).toEqual('Descubrimiento Inicial Publicado');
            
//         });
//     });

// //     // =================================================================
// //     // createDiscovery (POST /asterium)
// //     // =================================================================
// //     describe('POST /asterium (createDiscovery)', () => {
// //         const userToken = generateToken(USER_ID, 'user');
// //         const postData = {
// //             title: 'Nuevo Descubrimiento Creado',
// //             content_md: 'Contenido Creado',
// //             status: 'draft',
// //         };

// //         it('Debería retornar 201 y crear el objeto en la DB', async () => {
// //             const initialCount = await Asterium.count();

// //             const response = await request(app)
// //                 .post('/asterium')
// //                 .set('Authorization', `Bearer ${userToken}`)
// //                 .send(postData);

// //             expect(response.statusCode).toBe(201);
            
// //             // Verificar en la base de datos real que se aumentó el contador
// //             const finalCount = await Asterium.count();
// //             expect(finalCount).toEqual(initialCount + 1);
// //         });

// //         it('No debería llamar a create si no hay token (Middleware 401)', async () => {
// //             const initialCount = await Asterium.count();

// //             const response = await request(app)
// //                 .post('/asterium')
// //                 .send(postData); 

// //             expect(response.statusCode).toBe(401);
            
// //             // Verificar que no se creó nada en la DB
// //             const finalCount = await Asterium.count();
// //             expect(finalCount).toEqual(initialCount);
// //         });
// //     });


// //     // =================================================================
// //     // updateDiscovery (PUT /asterium/:id)
// //     // =================================================================
// //     describe('PUT /asterium/:id (updateDiscovery)', () => {
// //         const updateData = { title: 'Título Actualizado en DB', status: 'draft' };
        
// //         it('Debería actualizar y retornar 200 si el usuario es el autor', async () => {
// //             const userToken = generateToken(USER_ID, 'user');
            
// //             const response = await request(app)
// //                 .put(`/asterium/${AST_ID}`)
// //                 .set('Authorization', `Bearer ${userToken}`)
// //                 .send(updateData);

// //             expect(response.statusCode).toBe(200);
            
// //             // Verificar en la base de datos real
// //             const updatedRow = await Asterium.findByPk(AST_ID);
// //             expect(updatedRow!.title).toEqual('Título Actualizado en DB');
// //         });
        
// //         it('Debería retornar 403 si el usuario NO es autor NI administrador', async () => {
// //             const nonAuthorToken = generateToken(500, 'user'); // Usuario 500 no existe ni es admin
            
// //             const initialTitle = (await Asterium.findByPk(AST_ID))!.title; // Título original

// //             const response = await request(app)
// //                 .put(`/asterium/${AST_ID}`)
// //                 .set('Authorization', `Bearer ${nonAuthorToken}`)
// //                 .send(updateData);

// //             expect(response.statusCode).toBe(403);
            
// //             // Verificar que la DB NO fue modificada
// //             const finalRow = await Asterium.findByPk(AST_ID);
// //             expect(finalRow!.title).toEqual(initialTitle);
// //         });
// //     });

// //     // =================================================================
// //     // deleteDiscovery (DELETE /asterium/:id)
// //     // =================================================================
// //     describe('DELETE /asterium/:id (deleteDiscovery)', () => {
        
// //         it('Debería retornar 204 y eliminar si el usuario es el autor', async () => {
// //             const userToken = generateToken(USER_ID, 'user');
            
// //             const response = await request(app)
// //                 .delete(`/asterium/${AST_ID}`)
// //                 .set('Authorization', `Bearer ${userToken}`);

// //             expect(response.statusCode).toBe(204);
            
// //             // Verificar en la base de datos real
// //             const deletedRow = await Asterium.findByPk(AST_ID);
// //             expect(deletedRow).toBeNull();
// //         });
// //     });
//  });


// // src/tests/asterium.e2e.test.ts
// import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
// import request from 'supertest';
// import jwt from 'jsonwebtoken';

// import app from '../app.js';
// import { sequelize } from '../db.js';
// import { Asterium } from '../models/Asterium.js';
// import type { AsteriumAttrs } from '../models/Asterium.js';
// import { User } from '../models/User.js';

// // --- CONFIG ---
// const JWT_SECRET = 'test-secret';
// const USER_ID = 10;
// const ADMIN_ID = 99;
// let AST_ID: number;

// // Limpieza segura (MySQL): destroy en orden hija -> padre (sin truncate/cascade)
// const cleanupDatabase = async () => {
//   await Asterium.destroy({ where: {} });
//   await User.destroy({ where: {} });
// };

// // Si quieres resetear autoincrementos, usa esta variante:
// /*
// const cleanupDatabase = async () => {
//   await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
//   await Asterium.truncate();
//   await User.truncate();
//   await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
// };
// */
// const generateToken = (userId: number, role: 'user' | 'admin') => {
//   const secret = process.env.JWT_SECRET || 'test-secret';
//   // Incluimos varios aliases por si tu middleware usa uno u otro
//   const payload = {
//     sub: String(userId),
//     id: userId,
//     userId,
//     role,
//   };
//   return jwt.sign(payload, secret, { expiresIn: '1h' });
// };

// const initialAsteriumData: AsteriumAttrs = {
//   id: 100,
//   author_id: USER_ID,
//   title: 'Descubrimiento Inicial Publicado',
//   slug: `descubrimiento-inicial-publicado-${Date.now()}`,
//   content_md: 'Contenido de la fila base.',
//   status: 'published',
//   published_at: new Date(),
//   like_count: 5,
//   excerpt: null,
// };

// describe('Controladores de Asterium (Base de Datos Real)', () => {
//   beforeAll(async () => {
//   process.env.JWT_SECRET = JWT_SECRET; // o el que uses
//   await sequelize.authenticate();
//   await sequelize.sync({ force: true });
// });


//   afterAll(async () => {
//     await sequelize.close();
//   });

//   beforeEach(async () => {
//     await cleanupDatabase();

// await User.create({
//   id: USER_ID,
//   username: 'user_test',
//   email: 'test@example.com',
//   password_hash: 'test-hash', // cualquier string válido si no hay validación extra
//   role: 'user',
// } as any);

// await User.create({
//   id: ADMIN_ID,
//   username: 'admin_test',
//   email: 'admin@example.com',
//   password_hash: 'test-hash',
//   role: 'admin',
// } as any);

//     const row = await Asterium.create(initialAsteriumData as any);
//     AST_ID = row.id!;
//   });

//   afterEach(async () => {
//     await cleanupDatabase();
//   });

//   describe('GET /asterium (listPublished)', () => {
//   it('Debería retornar 200 con la fila inicial publicada', async () => {
//     const token = generateToken(USER_ID, 'user'); // usuario logueado

//     const res = await request(app)
//       .get('/asterium')                              // ruta correcta según tu router
//       .set('Authorization', `Bearer ${token}`);      // <-- IMPORTANTE

//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//     expect(res.body.length).toBeGreaterThanOrEqual(1);
//     expect(res.body.some((a: any) => a.id === AST_ID)).toBe(true);
//     expect(res.body.find((a: any) => a.id === AST_ID)?.title)
//       .toEqual('Descubrimiento Inicial Publicado');
//   });
// });

//   // Ejemplos para cuando desbloquees más endpoints:
//   /*
//   describe('POST /asterium', () => {
//     it('201 crea en DB', async () => {
//       const token = generateToken(USER_ID, 'user');
//       const payload = { title: 'Nuevo', content_md: '...', status: 'draft' };
//       const before = await Asterium.count();

//       const res = await request(app).post('/asterium').set('Authorization', `Bearer ${token}`).send(payload);
//       expect(res.status).toBe(201);

//       const after = await Asterium.count();
//       expect(after).toBe(before + 1);
//     });
//   });
//   */
// });
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { requireAuth, requireAdmin, type AuthTokenPayload } from '../middlewares/auth.js';

// Helpers comunes para los tests
const makeReq = (authHeader?: string, user?: Partial<AuthTokenPayload>) =>
  ({ headers: authHeader ? { authorization: authHeader } : {}, user } as any);

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

// Secret para firmar tokens en estos tests
const JWT_SECRET = process.env.JWT_SECRET || 'pon_un_secreto_fuerte';

describe('Middlewares: auth', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    next.mockReset();
  });

  describe('requireAuth', () => {
    it('401 si no hay token (sin Authorization o sin "Bearer ")', () => {
      const req = makeReq(); // sin header
      const res = makeRes();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('401 si jwt.verify lanza error', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('boom');
      });

      const req = makeReq('Bearer whatever');
      const res = makeRes();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('401 si decoded es string', () => {
      jest.spyOn(jwt, 'verify').mockReturnValue('solo-string' as any);

      const req = makeReq('Bearer t');
      const res = makeRes();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(next).not.toHaveBeenCalled();
    });

    describe('401 si payload inválido (todas las variantes)', () => {
      const cases: Array<[string, any]> = [
        ['payload null/undefined', null],
        ['sub no es string', { sub: 123, role: 'user' }],
        ['sub vacío', { sub: '', role: 'user' }],
        ['role inválido', { sub: '42', role: 'moderator' }],
      ];

      it.each(cases)('%s', (_title, badPayload) => {
        jest.spyOn(jwt, 'verify').mockReturnValue(badPayload as any);

        const req = makeReq('Bearer t');
        const res = makeRes();

        requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    it('OK: guarda req.user y llama next', () => {
      const payload: AuthTokenPayload = {
        sub: '123',
        role: 'user',
        iat: 0,
        exp: 0,
      };
      jest.spyOn(jwt, 'verify').mockReturnValue(payload as any);

      const req = makeReq('Bearer good');
      const res = makeRes();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toEqual(payload);
    });

    it('OK con token REAL firmado', () => {
      // Asegura que usamos verify real (por si se mockeó arriba)
      if (jest.isMockFunction((jwt as any).verify)) {
        (jwt as any).verify.mockRestore();
      }

      process.env.JWT_SECRET = JWT_SECRET;

      const token = jwt.sign(
        { sub: '10', role: 'admin' } as any,
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const req = makeReq(`Bearer ${token}`);
      const res = makeRes();
      const n = jest.fn();

      requireAuth(req, res, n);

      expect(res.status).not.toHaveBeenCalled();
      expect(n).toHaveBeenCalledTimes(1);
      expect(req.user?.sub).toBe('10');
      expect(req.user?.role).toBe('admin');
    });
  });

  describe('requireAdmin', () => {
    it('401 si no hay req.user', () => {
      const req = makeReq('Bearer x'); // pero sin user
      const res = makeRes();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No auth' });
      expect(next).not.toHaveBeenCalled();
    });

    it('403 si user.role !== admin', () => {
      const req = makeReq('Bearer x', { sub: '1', role: 'user' } as any);
      const res = makeRes();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Sin permisos' });
      expect(next).not.toHaveBeenCalled();
    });

    it('OK si role === admin', () => {
      const req = makeReq('Bearer x', { sub: '1', role: 'admin' } as any);
      const res = makeRes();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
