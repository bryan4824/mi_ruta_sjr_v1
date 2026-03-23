import mongoose from 'mongoose';

const conectaDB = async () => {
  try {
    const uri = process.env.MONGODB_URL_DB;
    if (!uri) {
      throw new Error('MONGODB_URL_DB no está definida en el archivo .env');
    }

    await mongoose.connect(uri /*, { dbName: 'MiRutaSJR' } si la URI no tiene base */);

    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.error(error);
    throw error;
  }
};

export default conectaDB; // <-- ESTA LÍNEA DEBE ESTAR DESCOMENTADA
// import 'dotenv/config'; // carga las variables de entorno
// import mongoose from "mongoose";

// async function conectaDB() {
//   const uri = process.env.MONGODB_URL_DB;

//   if (!uri) {
//     console.error("Falta la variable de entorno MONGODB_URI_LOCAL");
//     throw new Error("MONGODB_URI_LOCAL no está configurada");
//   }

//   try {
//     await mongoose.connect(uri, {
//       // serverSelectionTimeoutMS: 30000,
//       // socketTimeoutMS: 45000,
//       // family: 4, // Forzar IPv4 (opcional)
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000, // espera máxima para seleccionar servidor
//       socketTimeoutMS: 45000,          // tiempo máximo de socket
//       family: 4,                        // fuerza IPv4
//       tls: false                        // Desactivar TLS para MongoDB local
//     });

//     console.log("Conexión a MongoDB Atlas establecida");
//   } catch (err) {
//     console.error("Error conectando a MongoDB:", err?.message || err);
//     if (err?.reason) console.error("Detalle:", err.reason);
//     throw err;
//   }
// }

// export default conectaDB;

