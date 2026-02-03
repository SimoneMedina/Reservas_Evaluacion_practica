const request = require('supertest');
const app = require('../server'); // desde src/test/ apunta a src/server.js
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let token;
let userId;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    // Crear usuario de prueba y token
    const user = new User({
        email: 'reservas@test.com',
        password: await bcrypt.hash('Test1234', 10)
    });
    await user.save();
    userId = user._id;

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await Reservation.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('📅 Pruebas CRUD de Reservas', () => {

    test('✅ Debería crear una nueva reserva', async () => {
        const response = await request(app)
            .post('/api/reservations')
            .send({
                date: '2026-02-05',
                time: '18:00',
                guestName: 'Juan Perez'
            });

        expect(response.status).toBe(201);
        expect(response.body.guestName).toBe('Juan Perez');

        const resDB = await Reservation.findById(response.body._id);
        expect(resDB).not.toBeNull();
    });

    test('✅ Debería listar reservas', async () => {
        const response = await request(app)
            .get('/api/reservations');

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    test('✅ Debería actualizar una reserva', async () => {
        const reservation = await Reservation.findOne({ guestName: 'Juan Perez' });

        const response = await request(app)
            .put(`/api/reservations/${reservation._id}`)
            .send({ time: '19:00' });

        expect(response.status).toBe(200);
        expect(response.body.time).toBe('19:00');
    });

    test('✅ Debería eliminar una reserva', async () => {
        const reservation = await Reservation.findOne({ guestName: 'Juan Perez' });

        const response = await request(app)
            .delete(`/api/reservations/${reservation._id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Reserva eliminada correctamente');

        const resDB = await Reservation.findById(reservation._id);
        expect(resDB).toBeNull();
    });

});
