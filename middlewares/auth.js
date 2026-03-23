import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../config.js';
import User from '../models/modelUser.js'; // ajusta la ruta según tu proyecto


export async function verifyAdmin(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).send("No autenticado");
  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
    const user = await User.findById(decoded.id).populate('role');

    if (user.role.rol !== "admin") {
      return res.status(403).send("Acceso denegado");
    }

    req.user = user;
    next();

  } catch {
    return res.status(401).send("Token inválido");
  }
}

//refresh tokens, validaciones más estrictas y protección contra ataques de fuerza bruta.


