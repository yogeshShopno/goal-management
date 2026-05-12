# Goal Dashboard Backend

Structured Node.js/Express backend with MongoDB, JWT authentication, roles and permissions.

## Folder Structure

```
src/
  config/
  controllers/
  middlewares/
  models/
  routes/
  utils/
```

## Setup

1. Copy `.env.example` to `.env`
2. Set real values for `MONGO_URI` and `JWT_SECRET`
3. Install dependencies:
   - `npm install`
4. Run in development:
   - `npm run dev`

## Auth & RBAC APIs

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (Bearer token required)
- `GET /api/v1/users` (manager/admin with `view_users`)
- `PATCH /api/v1/users/:id/role` (admin with `manage_users`)

## Health

- `GET /health`
