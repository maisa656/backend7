const test = require('node:test');
const assert = require('node:assert/strict');
const { directorSchema, movieSchema } = require('../src/validation/schemas');

test('director creation requires a non-empty name', () => {
  assert.equal(directorSchema.safeParse({ name: '  ' }).success, false);
  assert.equal(directorSchema.safeParse({ name: '  Ava DuVernay  ' }).data.name, 'Ava DuVernay');
});

test('movie creation requires a title, genre, and valid release year', () => {
  assert.equal(movieSchema.safeParse({ title: 'Film', genre: 'drama', releaseYear: 2020 }).success, true);
  assert.equal(movieSchema.safeParse({ title: '', genre: 'drama', releaseYear: 2020 }).success, false);
  assert.equal(movieSchema.safeParse({ title: 'Film', genre: 'drama', releaseYear: 1800 }).success, false);
});
