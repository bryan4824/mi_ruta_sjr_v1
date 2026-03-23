import mongoose from "mongoose";

const vendedorSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  vendedor_id: {
    type: String,      // UUID de FastAPI
    required: true,
    unique: true
  },
  nombre_local: {
    type: String,
    required: true
  },
  telefono: {
    type: String
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Vendedor", vendedorSchema);