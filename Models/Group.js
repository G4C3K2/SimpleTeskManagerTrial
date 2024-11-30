import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        }],
        tasks: [{
            type: mongoose.Schema.Types.ObjectId,
            red: "tasks",
        }] 
    }
);

export default mongoose.model('groups', GroupSchema);