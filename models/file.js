import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  notify_type: String,
  notify_time: String,
  organization_id: String,
  workspace_id: String,
  file: {
    id: String,
    name: String,
    object_key: String,
    type: Number, // 5: route, 7: 3D mapping, etc.
  }
}, { timestamps: true });

export default mongoose.model("File", fileSchema);
