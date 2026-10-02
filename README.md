# PadosiPro — Full-Stack Developer Assignment

A native React Native (Expo) mobile app and Node.js/TypeScript backend implementing the first-time customer journey for PadosiPro: registration, email verification, login, profile completion, task selection, and a simple home screen.

This implementation follows the assignment requirement to build the mobile screens natively rather than embedding the PadosiPro website. The backend runs locally with Docker Compose, PostgreSQL, and Mailpit.

## Features

### Authentication
- Email/password registration
- Password hashing with bcrypt
- Email verification using a 6-digit OTP
- OTP validity: 10 minutes
- OTP is single-use
- Maximum 5 incorrect OTP attempts
- 30-second OTP resend cooldown
- OTP hashes are stored rather than plaintext OTP values
- Login restricted to verified users
- JWT authentication with expiry
- Persistent mobile login using Expo SecureStore
- Logout
- Re-registration support for accounts that were created but never verified

### Profile
- Name
- Indian mobile number in `+91XXXXXXXXXX` format
- Address
- Business Name (optional)

### Task catalogue
- 25 seeded tasks
- 5 categories
- Search by task name or description
- Tasks grouped by category
- Multi-select task selection
- Persisted user task selection

### Mobile UX
- Native React Native/Expo screens
- Inline form validation
- OTP countdown/resend state
- Loading states
- Error states
- Empty states
- Pull-to-refresh on Home
- Persistent login after app restart

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo SDK 57 |
| Mobile routing | Expo Router |
| Mobile HTTP | Axios |
| Mobile secure storage | Expo SecureStore |
| Backend | Node.js + TypeScript + Express |
| Validation | Zod |
| Authentication | JWT + bcryptjs |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| PostgreSQL adapter | `@prisma/adapter-pg` |
| Email | Nodemailer |
| Local email catcher | Mailpit |
| Security middleware | Helmet |
| Testing | Vitest |
| Containerization | Docker Compose |

## Project Structure

```text
padosipro-assignment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── mobile/
│   ├── src/
│   │   ├── app/
│   │   ├── api/
│   │   ├── context/
│   │   ├── types/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── README.md
└── DESIGN.md
```

## Prerequisites

Install:

- Node.js 22+
- npm
- Docker and Docker Compose
- Expo Go for physical-device development, or an Android emulator

For the final APK, Android installation does not require Expo Go.

## Backend Setup

From the backend directory:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

The local `.env` uses PostgreSQL on host port `5433` because port `5432` may already be occupied by a PostgreSQL installation on the development machine.

Example:

```env
PORT=5000
DATABASE_URL="postgresql://padosipro:padosipro@localhost:5433/padosipro?schema=public"
JWT_SECRET="change-this-development-secret"
JWT_EXPIRES_IN="7d"
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="PadosiPro <no-reply@padosipro.local>"
```

### Start the backend stack

```bash
docker compose up --build
```

The Compose stack contains:

| Service | Purpose | Host address |
|---|---|---|
| backend | Express API | `http://localhost:5000` |
| postgres | PostgreSQL database | `localhost:5433` |
| mailpit | Local SMTP + inbox UI | `localhost:1025` / `http://localhost:8025` |

Inside Docker, the backend connects to PostgreSQL using the service name `postgres` and port `5432`.

### Health check

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "PadosiPro API is running"
}
```

### Mailpit

Open the Mailpit web UI at:

```text
http://localhost:8025
```

Registration verification emails appear here during local development.

### Database seed

The project includes a Prisma seed containing 25 tasks across 5 categories. If the database needs to be seeded manually, use the Prisma seed command configured in `package.json`.

## Backend API

### Public endpoints

```text
GET  /health
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-otp
POST /api/auth/login
GET  /api/tasks
GET  /api/tasks/categories
```

### Authenticated endpoints

Send the JWT as:

```text
Authorization: Bearer <token>
```

Authenticated routes include:

```text
GET /api/user/me
GET /api/profile
PUT /api/profile
GET /api/tasks/selected
PUT /api/tasks/selected
```

The backend extracts the user ID from the verified JWT. The mobile client does not send a user ID separately for authenticated operations.

## Mobile Setup

From the mobile directory:

```bash
npm install
npx expo start
```

For development on a physical phone, the phone and development machine must be able to reach the backend over the same local network.

The current development API base URL is configured in:

```text
mobile/src/api/client.ts
```

Example development value:

```ts
const API_URL = "http://<DEVELOPMENT-MACHINE-IP>:5000";
```

Do not use `localhost` in the mobile app when testing from a physical phone; `localhost` would refer to the phone itself.

## Mobile User Flow

```text
Register
   ↓
Verify Email OTP
   ↓
Login
   ↓
First-login Profile
   ↓
Task Selection
   ↓
Home
   ↓
Logout / Persistent Login
```

For a returning verified user with a completed profile:

```text
Login
  ↓
Home
```

The authentication context restores the saved JWT from Expo SecureStore and calls `/api/user/me` to restore the current user state.

## Testing

The backend contains automated tests covering the risky authentication and validation logic.

Current test coverage includes:

- OTP generation
- OTP creation and expiry
- OTP resend cooldown
- OTP expiry handling
- OTP attempt limits
- Login with unknown user
- Login for unverified user
- Incorrect password
- Successful login
- Profile completion state in login response
- Profile validation
- Task selection validation

Current backend test result:

```text
19/19 tests passing
```

Run the tests with:

```bash
npm test
```

Run TypeScript checking with:

```bash
npx tsc --noEmit
```

## Android APK Build

The final submission includes an Android APK. For an Expo project, the APK can be produced using the configured Expo/EAS Android build workflow.

Before producing the final APK, make sure the mobile app's API URL points to a backend address that the review environment can actually reach. A private LAN address such as `10.x.x.x` or `192.168.x.x` is suitable for local development but is not a portable reviewer endpoint.

The APK should be tested on a clean Android installation before submission.

## Environment Variables and Secrets

`.env` files containing real secrets must not be committed.

The repository includes `.env.example` with development placeholders. The assignment requires test data only and no real personal information.

## Local Test Flow

A complete manual test should cover:

1. Register a new test account.
2. Open Mailpit and retrieve the OTP.
3. Verify the email.
4. Login.
5. Complete the profile.
6. Search and select tasks.
7. Confirm task selection.
8. Verify selected tasks on Home.
9. Restart the app and confirm the session persists.
10. Logout.
11. Login again and confirm a completed profile goes directly to Home.
12. Create an unverified account and verify that registering the same email again can restart verification, subject to the resend cooldown.

## Design Reference

The mobile screens were implemented natively using the provided PadosiPro application as a visual reference. The production PadosiPro APIs are not called by this project.

See [DESIGN.md](DESIGN.md) for architecture, security decisions, trade-offs, assumptions, and future improvements.

## Assignment Scope

The implementation focuses on the first customer journey requested in the assignment rather than attempting to reproduce a complete production PadosiPro application.

The assignment explicitly values a smaller scope implemented correctly over partially implemented extra features.