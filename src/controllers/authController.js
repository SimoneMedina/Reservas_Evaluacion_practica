const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mensajes y configuraciones como constantes
const ERROR_USER_EXISTS = 'Ya existe el usuario';
const ERROR_INVALID_CREDENTIALS = 'Credenciales inválidas';
const ERROR_INTERNAL = 'Error interno del servidor';
const JWT_EXPIRES_IN = '1h';

/**
 * Registro de nuevo usuario
 */
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica si el usuario ya existe
        const exists = await User.findOne({ email }).exec();
        if (exists) {
            return res.status(400).json({ error: ERROR_USER_EXISTS });
        }

        // Cifra la contraseña
        const hash = await bcrypt.hash(password, 10);

        // Crea el usuario
        const user = new User({
            email,
            password: hash
        });

        await user.save();

        res.status(201).json({ message: 'Usuario creado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: ERROR_INTERNAL });
    }
};

/**
 * Inicio de sesión
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Busca al usuario
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(400).json({ error: ERROR_INVALID_CREDENTIALS });
        }

        // Compara la contraseña
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: ERROR_INVALID_CREDENTIALS });
        }

        // Genera token JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: ERROR_INTERNAL });
    }
};
