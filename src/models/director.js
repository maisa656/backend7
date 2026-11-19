const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    movies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Director', directorSchema);
