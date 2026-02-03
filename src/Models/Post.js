import mongoose from "mongoose";
import Taxonomy from "./Taxonomy";

const texonomySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    Taxonomy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Taxonomy'
    }],
    content: {
        type: String,

    }
});

export default mongoose.models.Post || mongoose.model('Post', texonomySchema);