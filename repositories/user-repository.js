import crypto from 'node:crypto'
import DBLocal from 'db-local'
import bcrypt from 'bcrypt'
import User from '../models/modelUser.js'
import Role from '../models/modelRol.js'
import { SALT_ROUNDS } from '../config.js'
import use from 'react';

export class UserRepository {

  static async create({ username, email, password, verificationToken }) {
    Validation.username(username);
    Validation.email(email);
    Validation.password(password);

    // 3. Asegurar que el usuario no exista
    const user = await User.findOne({ username });
    if (user) {
      throw new Error("username already exists");
    }
    // 3. Buscar o crear rol 'normal'
    //db.roles.getIndexes()
    //db.roles.dropIndex("name_1")
    let role = await Role.findOne({ rol: "normal" });
    if (!role) {
      role = await Role.create({
        rol: "normal",
        descripcion: "Usuario estándar sin privilegios administrativos"
      });
    }

    // 4. Crear ID y encriptar contraseña
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);


    // 5. Guardar usuario correctamente
    await User.create({
      _id: id,
      username,
      email,
      nombre: null,
      edad: null,
      telefono: null,
      password: hashedPassword,
      verificationToken,
      role: role._id
    });
    return id;
  }

  static async login({ username, password}) {
    Validation.username(username);
    Validation.password(password);


    //6. Esperar la búsqueda
     const user = await User.findOne({ username }).populate('role');
    if (!user) throw new Error("username does not exist");

    if (!user.isVerified) throw new Error("Debes verificar tu correo antes de iniciar sesión");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("password is invalid");

    //7. Eliminar el campo password antes de devolver
    const { password: _, ...publicUser } = user.toObject();
    return publicUser;
  }

  //8. Mostrar todos los usuarios
  static async mostrarContactos() {
    try {
      const users = await User.find().populate("role");// busca todos los docuemto en la collection como users y rol
      return users;
    } catch (error) {
      throw new Error('Erro to get users')
    }

  }
  static async editarContacto({ id, username, email }) {
    try {
      const user = await User.findByIdAndUpdate(id, { username, email });
      return user;
    } catch (error) {
      throw new Error('Erro to get users')
    }
  }
  static async buscarPorId(id) {
    try {
      const users = await User.findById(id).populate("role");// busca todos los docuemto en la collection como users y rol
      return users;
    } catch (error) {
      throw new Error('Erro to get users')
    }

  }
  static async eliminarContacto(id) {
    const respuestaMongo = await User.findByIdAndDelete(id)
    return respuestaMongo
  }

  static async buscarContacto(username) {
    const filtro = String(username || ""); // Garantiza que sea string

    const user = await User.find({
      $or: [
        { username: { $regex: filtro, $options: "i" } }
      ]
    });

    return user;
  }
}


class Validation {
  static username(username) {
    //1. validar el username y password
    if (typeof username != 'string') {
      throw new Error("user name must be a string");
    }
    if (username.length < 3) {
      throw new Error("user name must be at least 3 characters long");
    }
  }
  static email(email) {
    // 1. Debe ser un string
    if (typeof email !== "string") {
      throw new Error("email must be a string");
    }

    // 2. No debe estar vacío
    if (email.trim().length === 0) {
      throw new Error("email cannot be empty");
    }

    // 3. Validar formato correcto (expresión regular)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("invalid email format");
    }

    // 4. (Opcional) Limitar longitud
    if (email.length > 100) {
      throw new Error("email must not exceed 100 characters");
    }
  }

  static password(password) {
    if (typeof password != 'string') {
      throw new Error("password must be a string");
    }
    if (password.length < 6) {
      throw new Error("pasword must be at least 6 characters long");
    }
  }

  static isVerifie(isVerified) {
    if (isVerified == false) {
      throw new Error("Still you're not verified")
    }
  }
}

