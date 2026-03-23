import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  rol: {
    type: String,
    required: true, // ojo: es 'required', no 'require'
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  }
});

export default mongoose.model("Role", roleSchema);
