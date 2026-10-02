# PadosiPro — Design Document

## 1. Architecture

The solution is split into two applications:

```text
React Native / Expo Mobile App
            │
            │ HTTPS/HTTP JSON API
            ▼
Node.js + TypeScript + Express
            │
      ┌─────┴─────┐
      ▼           ▼
 PostgreSQL     Mailpit
   + Prisma     SMTP catcher
```

The mobile application owns navigation, form state, authentication state and presentation. The backend owns authentication, validation, OTP rules, profile persistence and task selection. PostgreSQL is the source of truth for application data.

## 2. Mobile Architecture

The mobile app uses Expo Router for screen navigation and a React context for authentication state.

Main screens:

- Register
- Verify Email
- Login
- Profile
- Task Selection
- Home

API calls are separated into small API modules for authentication, profile and tasks. Axios adds the JWT automatically to authenticated requests using an interceptor. The token is stored using Expo SecureStore rather than plain local storage.

## 3. Authentication Flow

A new user registers with email and password. The password is hashed with bcrypt before persistence. The backend creates a six-digit verification OTP and sends it through SMTP to Mailpit during local development.

After successful verification, `emailVerified` is set to `true`. Login checks this flag before issuing a JWT.

The JWT contains the user ID and has a configured expiry. Protected API requests send the token in the `Authorization: Bearer <token>` header. The backend middleware verifies the token and exposes the user ID to downstream controllers through the request context.

The mobile app restores a saved session after restart by loading the token from SecureStore and calling `/api/user/me` rather than trusting stale client-side user data.

## 4. OTP Design

OTP requirements are enforced server-side:

- Six digits
- Ten-minute expiry
- Single use
- Maximum five incorrect attempts
- Approximately 30-second resend cooldown
- Only a bcrypt hash is persisted

OTP verification always checks the latest unused verification OTP. A successful verification marks the OTP as used and the user's email as verified in a database transaction.

If a user registers but does not complete verification, a later registration attempt with the same unverified email can restart the verification process rather than permanently blocking the account. A verified account cannot be registered again.

## 5. Data Model

The core models are:

- `User` — account credentials and verification state
- `Profile` — name, mobile, address and optional business name
- `Otp` — hashed OTP, expiry, attempt count and used state
- `Category` — task grouping
- `Task` — task name and description
- `UserTask` — many-to-many relationship between users and selected tasks

The `UserTask` relation has a unique `(userId, taskId)` constraint to prevent duplicate selections.

## 6. Validation and Security

Validation is performed on the server using Zod. This prevents the mobile client from being the only enforcement point.

Examples include:

- Email format and normalization
- Minimum password length
- Password confirmation
- Six-digit OTP format
- Indian mobile number format
- Profile length constraints
- UUID validation for task IDs
- Maximum number of selected tasks

Passwords are never stored in plaintext. JWT authentication protects user-specific endpoints. Helmet is enabled on the Express application, and database access uses Prisma rather than constructing SQL strings manually.

## 7. Task Selection

The catalogue is seeded with 25 tasks across five categories. The mobile app retrieves the catalogue, groups tasks by category, supports search and allows multi-selection.

When the selection is confirmed, the backend validates every task ID against the database and replaces the user's previous selection inside a transaction. This keeps the persisted selection synchronized with what the user confirmed in the mobile app.

## 8. Error and State Handling

Network-backed screens provide explicit loading, empty and error states. The goal is to avoid dead ends when an API call fails or returns no data.

The mobile authentication guard also prevents authenticated users from returning to onboarding screens and redirects users with incomplete profiles to the profile screen.

## 9. Main Trade-offs

### Expo instead of native Android

Expo/React Native was selected because the assignment explicitly allows Expo and the required application is a relatively small cross-platform mobile flow. It also keeps the implementation in the same TypeScript ecosystem as the backend.

### PostgreSQL instead of SQLite

PostgreSQL was selected because it is explicitly preferred in the assignment and fits the relational data model for users, OTPs, categories, tasks and user-task relationships.

### Mailpit instead of an external email provider

Mailpit provides a deterministic local SMTP environment without requiring real credentials or sending test emails to real users. It also makes OTP testing easy during development.

### JWT + SecureStore

JWT keeps the backend stateless for authentication requests, while SecureStore provides protected local storage for the mobile token. The client still validates the session against `/api/user/me` after restart.

## 10. What Was Left Out

The implementation intentionally focuses on the assignment's first customer journey. It does not attempt to reproduce the full production PadosiPro service, Lifestyle Manager operations, production notifications, payments, chat, service execution, or other functionality outside the requested flow.

The production PadosiPro APIs are not used.

## 11. What I Would Do With Another Week

With another week, I would focus on:

1. Add a production email provider and deployment configuration.
2. Add API integration tests covering the complete registration-to-task-selection journey.
3. Add more comprehensive mobile component/screen tests.
4. Add centralized API error mapping and retry handling where appropriate.
5. Improve accessibility, keyboard handling and small-screen layout details.
6. Add CI checks for TypeScript, tests and build validation.
7. Add a production deployment with HTTPS and environment-specific configuration.
8. Improve observability with structured logs and error reporting.

## 12. Scope Summary

The design deliberately prioritizes the requirements that are directly exercised by the assignment: a working native mobile journey, secure authentication and OTP handling, server-side validation, persisted profile and task selection, meaningful tests, and reproducible local setup.