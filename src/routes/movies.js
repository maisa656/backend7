const express = require('express');
const Movie = require('../models/movie');
const Director = require('../models/director');
const createRateLimiter = require('../middleware/createRateLimiter');
const requireDirector = require('../middleware/requireDirector');
const validateBody = require('../middleware/validate');
const { movieSchema, mongoIdSchema } = require('../validation/schemas');

const router = express.Router();

router.post(
  '/',
  createRateLimiter,
  requireDirector,
  validateBody(movieSchema),
  async (req, res, next) => {
    try {
      const movie = await Movie.create({
        ...req.validatedBody,
        director: req.director._id
      });
      req.director.movies.push(movie._id);
      await req.director.save();
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', async (req, res, next) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
  const filter = {};

  if (typeof req.query.genre === 'string' && req.query.genre.trim()) {
    filter.genre = req.query.genre.trim().toLowerCase();
  }

  if (req.query.year !== undefined) {
    const year = Number(req.query.year);
    if (!Number.isInteger(year) || year < 1888 || year > 3000) {
      return res.status(400).json({ error: 'year must be an integer between 1888 and 3000' });
    }
    filter.releaseYear = year;
  }

  try {
    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .populate('director', 'name')
        .sort({ releaseYear: -1, title: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Movie.countDocuments(filter)
    ]);

    res.json({
      data: movies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const parsedId = mongoIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'A valid movie ID is required' });
  }

  try {
    const movie = await Movie.findByIdAndDelete(parsedId.data);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    await Director.updateOne(
      { _id: movie.director },
      { $pull: { movies: movie._id } }
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
