const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const testSchema = new Schema({
  // Link to the Problem document
  problem: {
    type: Schema.Types.ObjectId,
    ref: 'Problem', // References the 'Problem' model you defined
    required: [true, 'Test case must belong to a problem'],
    index: true // Helps find test cases for a specific problem faster
  },

  // Location of the input file in object storage (e.g., R2 bucket key)
  inputPath: {
    type: String,
    required: [true, 'Input file path is required'],
    trim: true
  },

  // Location of the expected output file in object storage
  outputPath: {
    type: String,
    required: [true, 'Output file path is required'],
    trim: true
  },

  // Flag to mark if this is a sample test case (visible to users)
  isSample: {
    type: Boolean,
    default: false, // Default to false (hidden test case)
    required: true
  }

}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

const Test = model('Test', testSchema);

module.exports = {Test}; // Export the model