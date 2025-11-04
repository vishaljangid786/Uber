# Users endpoint documentation

This document describes the `POST /users/register` endpoint implemented in this project.

> Note: The router for this endpoint is defined in `Backend/routes/user.routes.js` as `router.post('/register', ...)`.
> In the app this router is typically mounted at `/users`, giving the full path: `/users/register`.

## Purpose

Register a new user. The endpoint validates input, hashes the password, creates a user record, and returns a JWT token for authentication.

## HTTP

- Method: POST
- Path: /users/register
- Headers:
  - `Content-Type: application/json`

## Request body (JSON)

Required shape:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john@example.com",
  "password": "secret123"
}
```

Field rules and validation:

- `fullname.firstname` (required): string, minimum 3 characters.
- `fullname.lastname` (optional): string, minimum 3 characters if provided.
- `email` (required): must be a valid email address.
- `password` (required): string, minimum 6 characters.

Validation is performed using `express-validator` in `user.routes.js`.

## Behavior / Implementation details

- The controller (`Backend/controllers/user.controller.js`) validates the request, hashes the password using `bcrypt` (via `user.model.js`'s `hashPassword` static method), and calls the service to create the user.
- The Mongoose model (`user.model.js`) sets `password` with `select: false`, so the stored/returned user will not include the password field by default.
- After creation the controller calls `user.generateAuthToken()` (a model instance method) which signs a JWT using `process.env.JWT_SECRET` and returns the token.

## Responses and status codes

- 200 OK
  - Description: User created successfully.
  - Body: JSON with `user` (the newly created user object; password is not included) and `token` (JWT string).
  - Example:

```json
{
  "user": {
    "_id": "64b3f...",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  },
  "token": "eyJhbGciOiJI..."
}
```

- 400 Bad Request
  - Description: Input validation failed (missing/invalid fields).
  - Body: `{ "errors": [ { msg, param, location, value }, ... ] }` (format from `express-validator`).
  - Example:

```json
{
  "errors": [
    {
      "value": "jo",
      "msg": "Firstname must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

- 409 Conflict (likely)
  - Description: Email already in use. The Mongoose `unique` constraint will cause a duplicate-key error when trying to create a user with an existing email. The application should translate that into a 409 response with an explanatory message.
  - Example body:

```json
{ "error": "Email already registered" }
```

- 500 Internal Server Error
  - Description: Unexpected server error while creating the user (DB errors, missing config like JWT secret, etc.).
  - Body: `{ "error": "Server error" }` (or similar).

## Example curl

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john@example.com",
    "password": "secret123"
  }'
```

## Notes and recommendations

- Ensure `process.env.JWT_SECRET` is set in your environment (used by `user.generateAuthToken`).
- Passwords are hashed with bcrypt before storage; the raw password is never stored.
- Consider returning a 201 Created instead of 200 OK for resource creation (optional enhancement).
- Add explicit handling for duplicate email errors in the service/controller to return a 409 status and a clear message.

---

File: `Backend/README.md` — documentation for the `/users/register` endpoint.
