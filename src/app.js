const express = require('express');
const directorsRouter = require('./routes/directors');
const moviesRouter = require('./routes/movies');

const app = express();

app.use(express.json());
app.use('/directors', directorsRouter);
app.use('/movies', moviesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
