import { config } from 'dotenv';
config(); // Esto carga las variables del archivo .env en local

export const API_BASE = process.env.API_BASE;
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const MONGODB_URI = process.env.MONGODB_URI;