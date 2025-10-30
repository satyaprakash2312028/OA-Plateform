const { Schema, model } = require("mongoose");
const problemSchema = new Schema(
    {
        problemId: {
            type: Number,
            required: [true, 'Problem ID is required'],
            unique: true, // Ensures no two problems have the same ID
            index: true   // Creates a database index for fast lookups by problemId
        },
        name: {
            type: String,
            required: true,
        },
        timelimit: {
            type: Number,
            required: true,
            min: [0.25],
            max: [12]
        },
        memorylimit: {
            type: Number,
            required: true,
            min: [64],
            max: [1024],
        },
        htmlDescription: {
            type: String,
            required: true
        },
        isPrivate: {
            type: Boolean,
            required: true,
            default: true
        },
        interactor: {
            type: String,
            required: false,
            default: null
        },
        checker: {
            type: String,
            required: false,
            default: null
        },
        assessment: {
            type: Schema.Types.ObjectId,
            ref: "Assessment",
            required: false
        }
    },
    {timestamps: true}
);

const Problem = model("Problem", problemSchema);
module.exports = {Problem};