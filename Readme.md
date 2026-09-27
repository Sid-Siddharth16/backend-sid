# VideoTube — Backend

REST API for **VideoTube**, a video-sharing app built for learning purposes. It handles user registration (with avatar/cover image uploads to Cloudinary), login, logout, and JWT access/refresh token rotation.

## Tech stack

- **Node.js** (ES modules) + **Express 5**
- **MongoDB** with **Mongoose 9**
- **JWT** (`jsonwebtoken`) for access & refresh tokens
- **bcrypt** for password hashing
- **Multer** for multipart file uploads
- **Cloudinary** for image/video storage
- `cookie-parser`, `cors`, `dotenv`
- Dev tools: `nodemon`, `prettier`

## Project structure

```
backends/
├── public/
│   └── temp/                 # Multer stores uploads here before they go to Cloudinary
└── src/
    ├── index.js              # Entry point: connects to MongoDB, starts the server
    ├── app.js                # Express app, middleware, and route mounting
    ├── constants.js          # DB_NAME ("videotube")
    ├── db/
    │   └── index.js          # Mongoose connection
    ├── controllers/
    │   └── user.controller.js
    ├── middlewares/
    │   ├── auth.middleware.js    # verifyJWT: protects routes
    │   └── multer.middleware.js  # disk storage for uploads
    ├── models/
    │   ├── user.model.js     # User schema, password hashing, token generation
    │   └── video.model.js    # Video schema (with aggregate pagination)
    ├── routes/
    │   └── user.routes.js
    └── utils/
        ├── ApiError.js       # Standard error class
        ├── ApiResponse.js    # Standard success response shape
        ├── asyncHandler.js   # Forwards async errors to Express
        └── cloudinary.js     # uploadOnCloudinary helper
```

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB instance (local or MongoDB Atlas)
- A Cloudinary account

### Installation

```bash
cd backends
npm install
```

### Environment variables

Create a `.env` file in `backends/`:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=<long-random-string>
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=<another-long-random-string>
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the server listens on (defaults to `8000`) |
| `MONGODB_URI` | MongoDB connection string, without the database name (the DB is always `videotube`) |
| `CORS_ORIGIN` | Frontend origin allowed to make credentialed requests |
| `ACCESS_TOKEN_SECRET` / `ACCESS_TOKEN_EXPIRY` | Secret and lifetime of the access token (e.g. `1d`, `15m`) |
| `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRY` | Secret and lifetime of the refresh token |
| `CLOUDINARY_*` | Cloudinary credentials used for uploads |

> Never commit `.env`. It is already listed in `.gitignore`.

### Run

```bash
npm run dev
```

The API will be available at `http://localhost:8000/api/v1`.

## API reference

Base URL: `/api/v1`

### Users — `/api/v1/users`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | — | Create a new user |
| `POST` | `/login` | — | Log in with email or username |
| `POST` | `/logout` | Access token | Log out and clear the stored refresh token |
| `POST` | `/refresh-token` | Refresh token | Issue a new access/refresh token pair |

#### `POST /users/register`

`multipart/form-data`

| Field | Type | Required |
| --- | --- | --- |
| `fullName` | text | yes |
| `email` | text | yes |
| `userName` | text | yes |
| `password` | text | yes |
| `avatar` | file | yes |
| `coverImage` | file | no |

Returns `201` with the created user (password and refresh token removed). Returns `409` if the email or username is already taken.

#### `POST /users/login`

```json
{ "email": "jane@example.com", "password": "secret123" }
```

or

```json
{ "userName": "jane", "password": "secret123" }
```

Sets `accessToken` and `refreshToken` as HTTP-only cookies and also returns them in the body:

```json
{
  "statusCode": 200,
  "data": { "user": { ... }, "accessToken": "...", "refreshToken": "..." },
  "message": "User Logged In Successfully",
  "success": true
}
```

#### `POST /users/logout`

Requires a valid access token, sent as the `accessToken` cookie or as an `Authorization: Bearer <token>` header. Clears both cookies.

#### `POST /users/refresh-token`

Reads the refresh token from the `refreshToken` cookie or from the JSON body `{ "refreshToken": "..." }`. Returns a new pair of tokens and updates the cookies.

### Response format

Successful responses use `ApiResponse`:

```json
{ "statusCode": 200, "data": {}, "message": "Success", "success": true }
```

Errors are thrown as `ApiError` with `statusCode`, `message`, `errors`, and `success: false`.

## Authentication flow

1. **Login.** The server signs a short-lived **access token** and a long-lived **refresh token**. The refresh token is saved on the user document.
2. **Authenticated requests.** `verifyJWT` reads the access token from the cookie or the `Authorization` header, verifies it, and attaches `req.user`.
3. **Refresh.** When the access token expires, the client calls `/refresh-token`. The server checks that the incoming token matches the one stored in the database, then issues a new pair.
4. **Logout.** The stored refresh token is removed and the cookies are cleared.

## Data models

**User:** `userName`, `email`, `fullName`, `avatar`, `coverImage`, `watchHistory` (refs `Video`), `password` (bcrypt-hashed), `refreshToken`, plus timestamps.

**Video:** `videoFile`, `thumbanail`, `title`, `description`, `duration`, `views`, `isPublished`, `owner` (ref `User`), `likes`, plus timestamps. Uses `mongoose-aggregate-paginate-v2`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the server with nodemon and load `.env` |

## Author

Siddharth
