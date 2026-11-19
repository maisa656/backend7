const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    releaseYear: {
      type: Number,
      required: true,
      min: 1888,
      max: 3000
    },
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Director',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
