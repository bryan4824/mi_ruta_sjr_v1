import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: {
    type: String, // 👈 importante: ahora acepta tu UUID string
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  nombre: {
    type: String,
    required: false   // opcional
  },
  edad: {
    type: Number,
    required: false   // opcional
  },
  telefono: {
    type: String,
    required: false   // opcional
  },
  password: {
    type: String,
    required: true,
    trim: true
  }, photoPerfil: {
    type: String,
    required: false,
    trim: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role", // referencia a la colección Role
    required: true
  },
  photoPerfil: {
    type: String,
    required: false,
    trim: true
  }
  , isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String
  , vendedor_id: 
  {
    type: String,  // UUID del vendedor en FastAPI
    default: null,
    required: false
}
});

export default mongoose.model("User", userSchema);
