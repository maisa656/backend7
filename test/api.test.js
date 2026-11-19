const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const Director = require('../src/models/director');
const Movie = require('../src/models/movie');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('movie creation requires a director header', async () => {
  const response = await fetch(`${baseUrl}/movies`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Film', genre: 'drama', releaseYear: 2020 })
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /x-director-id/);
});

test('director creation rejects invalid input', async () => {
  const response = await fetch(`${baseUrl}/directors`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '  ' })
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'Validation failed');
});

test('movie listing applies filters and pagination', async () => {
  const originalFind = Movie.find;
  const originalCountDocuments = Movie.countDocuments;
  let capturedFilter;
  let capturedSkip;
  let capturedLimit;
  let capturedCountFilter;

  Movie.find = (filter) => {
    capturedFilter = filter;
    const query = {
      populate() { return this; },
      sort() { return this; },
      skip(value) {
        capturedSkip = value;
        return this;
      },
      limit(value) {
        capturedLimit = value;
        return Promise.resolve([]);
      }
    };
    return query;
  };
  Movie.countDocuments = async (filter) => {
    capturedCountFilter = filter;
    return 11;
  };

  try {
    const response = await fetch(
      `${baseUrl}/movies?genre=Comedy&year=2020&page=2&limit=5`
    );
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(capturedFilter, { genre: 'comedy', releaseYear: 2020 });
    assert.deepEqual(capturedCountFilter, capturedFilter);
    assert.equal(capturedSkip, 5);
    assert.equal(capturedLimit, 5);
    assert.deepEqual(result.pagination, {
      page: 2,
      limit: 5,
      total: 11,
      totalPages: 3
    });
  } finally {
    Movie.find = originalFind;
    Movie.countDocuments = originalCountDocuments;
  }
});

test('movie deletion removes the movie reference from its director', async () => {
  const originalFindByIdAndDelete = Movie.findByIdAndDelete;
  const originalUpdateOne = Director.updateOne;
  let capturedDirectorId;
  let capturedUpdate;
  const movieId = '507f1f77bcf86cd799439011';
  const directorId = '507f191e810c19729de860ea';

  Movie.findByIdAndDelete = async () => ({ _id: movieId, director: directorId });
  Director.updateOne = async (filter, update) => {
    capturedDirectorId = filter._id;
    capturedUpdate = update;
  };

  try {
    const response = await fetch(`${baseUrl}/movies/${movieId}`, { method: 'DELETE' });

    assert.equal(response.status, 204);
    assert.equal(capturedDirectorId, directorId);
    assert.deepEqual(capturedUpdate, { $pull: { movies: movieId } });
  } finally {
    Movie.findByIdAndDelete = originalFindByIdAndDelete;
    Director.updateOne = originalUpdateOne;
  }
});

test('director deletion removes all movies before deleting the director', async () => {
  const originalFindById = Director.findById;
  const originalDeleteMany = Movie.deleteMany;
  let capturedMovieFilter;
  let directorDeleted = false;
  const directorId = '507f191e810c19729de860ea';

  Director.findById = async () => ({
    _id: directorId,
    deleteOne: async () => {
      directorDeleted = true;
    }
  });
  Movie.deleteMany = async (filter) => {
    capturedMovieFilter = filter;
  };

  try {
    const response = await fetch(`${baseUrl}/directors/${directorId}`, { method: 'DELETE' });

    assert.equal(response.status, 204);
    assert.deepEqual(capturedMovieFilter, { director: directorId });
    assert.equal(directorDeleted, true);
  } finally {
    Director.findById = originalFindById;
    Movie.deleteMany = originalDeleteMany;
  }
});
