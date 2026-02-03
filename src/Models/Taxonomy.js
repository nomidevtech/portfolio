import mongoose, { Schema } from "mongoose";

const texonomySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
});

export default mongoose.models.Taxonomy || mongoose.model('Taxonomy', texonomySchema);