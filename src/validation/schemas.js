const { z } = require('zod');

const directorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required')
});

const movieSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  genre: z.string().trim().min(1, 'Genre is required'),
  releaseYear: z.coerce.number().int().min(1888).max(3000)
});

const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'A valid director ID is required');

module.exports = { directorSchema, movieSchema, mongoIdSchema };
