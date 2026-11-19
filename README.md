# Movies and Directors API

Express, MongoDB, and Mongoose REST API. Copy `.env.example` to `.env`, set
`MONGODB_URI`, then run `npm install` and `npm start`.

## Endpoints

- `POST /directors` — create a director: `{ "name": "Ava DuVernay" }`
- `GET /directors?page=1&limit=10` — paginated directors
- `DELETE /directors/:id` — delete a director and their movies
- `POST /movies` — create a movie with `{ "title": "Selma", "genre": "drama", "releaseYear": 2014 }`.
  Include the director ID in the `x-director-id` request header.
- `GET /movies?genre=comedy&year=2020&page=1&limit=10` — filter and paginate movies
- `DELETE /movies/:id` — delete a movie and remove it from its director's `movies` array

Creation endpoints are limited to 20 requests per 15 minutes per client IP.
Pagination defaults to 10 records per page and is capped at 100.
