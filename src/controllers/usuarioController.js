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

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Error de validación', 
          detalles: error.details[0].message 
        });
      }

      const { nombre, email, password } = req.body;

      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const usuario = new Usuario({
        nombre,
        email,
        password: passwordHash,
        rol: 'cliente'
      });

      await usuario.save();

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

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Error de validación', 
          detalles: error.details[0].message 
        });
      }

      const { email, password } = req.body;

      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const validPassword = await bcrypt.compare(password, usuario.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

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

  // Funciones adicionales necesarias para las rutas de admin
  async getUsuarios(req, res) {
    try {
      const usuarios = await Usuario.find().select('-password');
      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }

  async getUsuarioById(req, res) {
    try {
      const usuario = await Usuario.findById(req.params.id).select('-password');
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  async updateUsuario(req, res) {
    try {
      const schema = Joi.object({
        nombre: Joi.string(),
        email: Joi.string().email(),
        rol: Joi.string().valid('admin', 'cliente')
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Error de validación', 
          detalles: error.details[0].message 
        });
      }

      const usuario = await Usuario.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).select('-password');

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }

  async deleteUsuario(req, res) {
    try {
      const usuario = await Usuario.findByIdAndDelete(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
}

export default new UsuarioController();