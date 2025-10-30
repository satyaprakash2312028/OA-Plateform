const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const assessmentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true,
    unique: true, // Assuming assessment titles should be unique
  },
  description: {
    type: String,
    trim: true,
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    index: true,
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        // Ensure end time is after start time
        return this.startTime < value;
      },
      message: 'End time must be after start time.'
    },
    index: true,
  },
  // Specific duration in minutes allowed per participant after they start
  durationMinutes: {
    type: Number,
    min: [30, 'Duration must be at least 1 minute'],
    required: [true, 'Duration is required'],
    validate: {
        validator: function(value){
            return value <= (this.endTime - this.startTime); 
        }
    }
  },
  maxTeamSize: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
    validate: { // Only require maxTeamSize > 1 if teams are allowed
      validator: function(value) {
        return value >= this.min && value <= this.max;
      }
    }
  }

}, { timestamps: true });

assessmentSchema.index({ status: 1, startTime: 1 });

const Assessment = model('Assessment', assessmentSchema);

module.exports = {Assessment}; // Or { Assessment }