import request from 'supertest';
import jwt from 'jsonwebtoken';
// 🔑 Importación de la app ajustada para tu estructura de carpetas
import app from './../index.js'; 
import { Asterium } from '../models/Asterium.js'; 
// 🔑 CORRECCIÓN: Usar 'import type' para que sea compatible con verbatimModuleSyntax
import type { AsteriumAttrs } from '../models/Asterium.js'; 


// --- CONFIGURACIÓN DE MOCKS ---

// 1. Mockeamos el modelo Asterium para que no toque la DB real.
jest.mock('../../models/Asterium.js', () => {
    // Definimos el mock para los métodos estáticos
    const mockAsterium = {
        findAll: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
    };
    // Aseguramos que la exportación del módulo respeta la estructura ESM
    return { Asterium: mockAsterium };
});

// 2. Definimos el tipo del mock para tipado estricto
const AsteriumMock = Asterium as unknown as jest.Mocked<{
    findAll: jest.Mock;
    create: jest.Mock;
    findByPk: jest.Mock;
}>;

// --- DATOS DE PRUEBA Y AUTENTICACIÓN ---

const JWT_SECRET = 'test-secret'; // Se asume que este valor se usa en el middleware
const USER_ID = 10;
const ADMIN_ID = 99;
const AST_ID = 50;

// Genera un token JWT de prueba
const generateToken = (userId: number, role: 'user' | 'admin') => {
    // El 'sub' (subject) es el ID del usuario en el token
    return jwt.sign({ sub: userId.toString(), role: role }, JWT_SECRET, { expiresIn: '1h' });
};

// Datos base de una fila de Asterium
const mockAsteriumRow: AsteriumAttrs = {
    id: AST_ID,
    author_id: USER_ID,
    title: 'Mi Gran Descubrimiento',
    slug: 'mi-gran-descubrimiento',
    content_md: 'Contenido',
    status: 'published',
    published_at: new Date(),
    like_count: 5,
    created_at: new Date(),
    updated_at: new Date(),
    excerpt: null
};

// Objeto mock que simula una instancia de Sequelize con sus métodos
const mockAsteriumInstance = {
    ...mockAsteriumRow,
    // Simulamos los métodos de instancia para update/delete
    save: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
};

describe('Controladores de Asterium', () => {
    beforeAll(() => {
        // Establecer el secret de prueba para que los tokens sean válidos
        process.env.JWT_SECRET = JWT_SECRET;
    });

    afterEach(() => {
        // Limpiar mocks después de cada prueba
        jest.clearAllMocks();
    });

    // =================================================================
    // listPublished (GET /asterium/published)
    // =================================================================
    describe('GET /asterium/published (listPublished)', () => {
        it('Debería retornar 200 con la lista de publicaciones', async () => {
            const mockRows = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }];
            AsteriumMock.findAll.mockResolvedValue(mockRows as any);

            const response = await request(app).get('/asterium/published');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockRows);
            
            // Verifica los parámetros de consulta a Sequelize
            expect(AsteriumMock.findAll).toHaveBeenCalledWith({
                where: { status: 'published' },
                order: [['published_at', 'DESC']],
                limit: 20,
            });
        });
    });

    // =================================================================
    // createDiscovery (POST /asterium)
    // =================================================================
    describe('POST /asterium (createDiscovery)', () => {
        const userToken = generateToken(USER_ID, 'user');
        const postData = {
            title: 'Nuevo Descubrimiento',
            content_md: 'Contenido',
            status: 'draft',
        };

        it('Debería retornar 201 y el objeto creado en éxito', async () => {
            // Mockear la creación exitosa con un ID generado
            AsteriumMock.create.mockResolvedValue({ id: 100, ...postData } as any);

            const response = await request(app)
                .post('/asterium')
                .set('Authorization', `Bearer ${userToken}`)
                .send(postData);

            expect(response.statusCode).toBe(201);
            expect(AsteriumMock.create).toHaveBeenCalledTimes(1);
            
            // Verificar que el author_id proviene del token (req.user!.sub)
            expect(AsteriumMock.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    author_id: USER_ID.toString(), // req.user!.sub es un string
                    status: 'draft',
                    published_at: null, 
                })
            );
        });

        it('No debería llamar a create si no hay token (Middleware 401)', async () => {
            const response = await request(app)
                .post('/asterium')
                .send(postData); 

            expect(response.statusCode).toBe(401);
            expect(AsteriumMock.create).not.toHaveBeenCalled();
        });
    });


    // =================================================================
    // updateDiscovery (PUT /asterium/:id)
    // =================================================================
    describe('PUT /asterium/:id (updateDiscovery)', () => {
        const updateData = { title: 'Título Actualizado', status: 'published' };
        
        it('Debería actualizar y retornar 200 si el usuario es el autor', async () => {
            const userToken = generateToken(USER_ID, 'user');
            
            // Simular que el autor_id (10) de la fila coincide con el ID del token (10)
            AsteriumMock.findByPk.mockResolvedValue(mockAsteriumInstance as any); 
            
            const response = await request(app)
                .put(`/asterium/${AST_ID}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.statusCode).toBe(200);
            
            // Verificar que se llamó al método save de la instancia
            expect(mockAsteriumInstance.save).toHaveBeenCalledTimes(1);
        });
        
        it('Debería actualizar si el usuario es administrador, aunque no sea el autor', async () => {
            const adminToken = generateToken(ADMIN_ID, 'admin');
            
            // Simular que el autor_id es DIFERENTE al del token, pero el rol es admin
            const otherUserInstance = { ...mockAsteriumInstance, author_id: 1000 }; 
            AsteriumMock.findByPk.mockResolvedValue(otherUserInstance as any); 

            const response = await request(app)
                .put(`/asterium/${AST_ID}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.statusCode).toBe(200);
            expect(otherUserInstance.save).toHaveBeenCalledTimes(1);
        });

        it('Debería retornar 403 si el usuario NO es autor NI administrador', async () => {
            const nonAuthorToken = generateToken(999, 'user'); // Token de otro usuario (ID 999)
            
            // Simular la fila del autor original (ID 10)
            AsteriumMock.findByPk.mockResolvedValue(mockAsteriumInstance as any); 

            const response = await request(app)
                .put(`/asterium/${AST_ID}`)
                .set('Authorization', `Bearer ${nonAuthorToken}`)
                .send(updateData);

            expect(response.statusCode).toBe(403);
            expect(mockAsteriumInstance.save).not.toHaveBeenCalled();
        });
    });

    // =================================================================
    // deleteDiscovery (DELETE /asterium/:id)
    // =================================================================
    describe('DELETE /asterium/:id (deleteDiscovery)', () => {
        
        it('Debería retornar 204 y eliminar si el usuario es el autor', async () => {
            const userToken = generateToken(USER_ID, 'user');
            AsteriumMock.findByPk.mockResolvedValue(mockAsteriumInstance as any);
            
            const response = await request(app)
                .delete(`/asterium/${AST_ID}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(204);
            expect(mockAsteriumInstance.destroy).toHaveBeenCalledTimes(1); 
        });
        
        it('Debería retornar 403 si el usuario NO es autor NI administrador', async () => {
            const nonAuthorToken = generateToken(999, 'user'); 
            AsteriumMock.findByPk.mockResolvedValue(mockAsteriumInstance as any); 

            const response = await request(app)
                .delete(`/asterium/${AST_ID}`)
                .set('Authorization', `Bearer ${nonAuthorToken}`);

            expect(response.statusCode).toBe(403);
            expect(mockAsteriumInstance.destroy).not.toHaveBeenCalled();
        });
    });

});