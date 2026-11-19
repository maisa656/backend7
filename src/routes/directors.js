const express = require('express');
const Director = require('../models/director');
const Movie = require('../models/movie');
const createRateLimiter = require('../middleware/createRateLimiter');
const validateBody = require('../middleware/validate');
const { directorSchema, mongoIdSchema } = require('../validation/schemas');

const router = express.Router();

router.post('/', createRateLimiter, validateBody(directorSchema), async (req, res, next) => {
  try {
    const director = await Director.create(req.validatedBody);
    res.status(201).json(director);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const [directors, total] = await Promise.all([
      Director.find().sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
      Director.countDocuments()
    ]);

    res.json({
      data: directors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const parsedId = mongoIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'A valid director ID is required' });
  }

  try {
    const director = await Director.findById(parsedId.data);
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }

    await Movie.deleteMany({ director: director._id });
    await director.deleteOne();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
