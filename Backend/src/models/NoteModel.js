import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'user',    required: true },
    roadmapId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    subtopicId: { type: String, required: true },
    moduleId:   { type: String, required: true },
    content:    { type: String, default: '' },
}, { timestamps: true });

const NoteModel = mongoose.model('Note', noteSchema);
export default NoteModel;