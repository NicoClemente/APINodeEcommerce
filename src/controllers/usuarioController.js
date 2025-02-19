import Usuario from '../models/usuario.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

class UsuarioController {
  async registro(req, res) {
    try {
      const schema = Joi.object({
        nombre: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      });

      // Validar datos
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Error de validación', 
          detalles: error.details[0].message 
        });
      }

      const { nombre, email, password } = req.body;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Hashear password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Crear usuario
      const usuario = new Usuario({
        nombre,
        email,
        password: passwordHash,
        rol: 'cliente'
      });

      await usuario.save();

      // Crear token
      const token = jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async login(req, res) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      });

      // Validar datos
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Error de validación', 
          detalles: error.details[0].message 
        });
      }

      const { email, password } = req.body;

      // Buscar usuario
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar password
      const validPassword = await bcrypt.compare(password, usuario.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Crear token
      const token = jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
}

export default new UsuarioController();