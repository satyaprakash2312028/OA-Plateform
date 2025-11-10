const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const teamSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    unique: true
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessment:{
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  }
}, { timestamps: true }); // Adds createdAt, updatedAt


const Team = model('Team', teamSchema);

module.exports = {Team}; // Or { Team }