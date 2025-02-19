import Usuario from '../models/usuario.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

class UsuarioController {
  async registro(req, res) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      nombre: Joi.string().required(),
      rol: Joi.string().valid('admin', 'cliente').default('cliente')
    });

    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password, nombre, rol } = req.body;

      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const usuario = new Usuario({
        email,
        password: passwordHash,
        nombre,
        rol
      });

      await usuario.save();
      res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }

  async login(req, res) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
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
      res.status(500).json({ error: 'Error en login' });
    }
  }

  async getUsuarios(req, res) {
    try {
      const usuarios = await Usuario.find().select('-password');
      res.json(usuarios);
    } catch (error) {
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
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  async updateUsuario(req, res) {
    try {
      const { nombre, email, rol } = req.body;
      const usuario = await Usuario.findByIdAndUpdate(
        req.params.id,
        { nombre, email, rol },
        { new: true }
      ).select('-password');

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
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
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
}

export default new UsuarioController();