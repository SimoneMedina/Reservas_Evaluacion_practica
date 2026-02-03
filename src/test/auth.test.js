const request = require('supertest');
const app = require('../server'); // desde src/test/ apunta a src/server.js
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('🔑 Pruebas de AUTH', () => {

    test('✅ Debería registrar un nuevo usuario correctamente', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testuser1@example.com',
                password: 'Test1234'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Usuario creado correctamente');

        const user = await User.findOne({ email: 'testuser1@example.com' });
        expect(user).not.toBeNull();
    });

    test('❌ No debería registrar un usuario con email duplicado', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testuser1@example.com',
                password: 'Test1234'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Ya existe el usuario');
    });

    test('✅ Debería iniciar sesión con credenciales correctas', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser1@example.com',
                password: 'Test1234'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test('❌ No debería iniciar sesión con contraseña incorrecta', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser1@example.com',
                password: 'WrongPass'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Credenciales inválidas');
    });

    test('❌ No debería iniciar sesión con usuario inexistente', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'noexiste@example.com',
                password: 'Test1234'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Credenciales inválidas');
    });

});
