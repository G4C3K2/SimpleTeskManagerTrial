import mongoose, { Mongoose } from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'PAUSED', 'PROBLEM', 'DONE'],
        default: 'TODO'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups'
    },
    assignees: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('tasks', TaskSchema);