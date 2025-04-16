import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  notify_type: String,
  notify_time: String,
  organization_id: String,
  workspace_id: String,
  file: {
    object_key: String,
    file_type: String,
    size: Number
  }
}, { timestamps: true });

export default mongoose.model("File", fileSchema);
