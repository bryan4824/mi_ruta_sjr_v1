// //mongodb+srv://santiagobryan:IIDIqlMokCVpwhDJ@cluster0.txn007q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// import 'dotenv/config'// carga las variables de entorno
// import mongoose from "mongoose"

// async function conectaDB() {
//     const uri = process.env.MONGODB_URL_DB
//     if (!uri) {// si la vairiable de entorno no esta definida
//         console.error("Falta la variable de entorno MONGODB_URI")
//         throw new Error("MONGODB_URI no está configurada")
//     }

//     try {
//         await mongoose.connect(uri, {
//             serverSelectionTimeoutMS: 30000,
//             socketTimeoutMS: 45000,
//             tls: true,
//             family: 4 // fuerza IPv4, evita problemas de DNS/IPv6 en algunas redes
//         })
//         console.log("Conexión a MongoDB establecida")
//     } catch (err) {
//         console.error("Error conectando a MongoDB:", err?.message || err)
//         // Muestra detalles útiles de Mongoose para diagnosticar selección de servidor/TLS
//         if (err?.reason) console.error("Detalle:", err.reason)
//         throw err
//     }
// }
// export default conectaDB;
