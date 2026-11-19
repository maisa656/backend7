const Director = require('../models/director');
const { mongoIdSchema } = require('../validation/schemas');

async function requireDirector(req, res, next) {
  const parsedId = mongoIdSchema.safeParse(req.get('x-director-id'));

  if (!parsedId.success) {
    return res.status(400).json({
      error: 'The x-director-id header is required and must be a valid director ID'
    });
  }

  try {
    const director = await Director.findById(parsedId.data);
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }

    req.director = director;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireDirector;
