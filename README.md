# Virtual Event Management Platform

A backend system for a virtual event management platform built with **Node.js** and **Express.js**. It supports user registration, event scheduling, and participant management using in-memory data structures.

---

## Features

- **User Authentication** – Register and login with bcrypt password hashing and JWT session management.
- **Role-Based Access** – Distinguishes between `organizer` and `attendee` roles.
- **Event CRUD** – Organizers can create, read, update, and delete events.
- **Participant Registration** – Authenticated users can register for events.
- **Email Notifications** – Sends confirmation email on event registration (async via Nodemailer).
- **RESTful API** – Clean endpoints following REST conventions.
- **Comprehensive Tests** – Full test suite using Jest and Supertest.

---

## Tech Stack

- Node.js
- Express.js
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- nodemailer (email notifications)
- uuid (unique ID generation)
- Jest + Supertest (testing)

---

## Project Structure

```
Virtual EventManagementPlatform/
├── package.json
├── .env
├── .gitignore
├── src/
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server entry point
│   ├── config/
│   │   └── config.js           # Environment configuration
│   ├── controllers/
│   │   ├── authController.js   # Register & login logic
│   │   └── eventController.js  # Event CRUD & registration
│   ├── data/
│   │   ├── users.js            # In-memory user store
│   │   └── events.js           # In-memory event store
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT auth & role authorization
│   │   └── errorHandler.js     # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   └── eventRoutes.js      # Event endpoints
│   ├── services/
│   │   └── emailService.js     # Email notification service
│   └── utils/
│       └── validators.js       # Input validation helpers
└── tests/
    └── app.test.js             # Test suite
```

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Virtual\ EventManagementPlatform

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root (a sample is included):

```env
PORT=3000
JWT_SECRET=super_secret_key_for_jwt_signing_2024
JWT_EXPIRES_IN=24h
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=test@ethereal.email
EMAIL_PASS=testpassword
```

### Running the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server runs at `http://localhost:3000`.

### Running Tests

```bash
npm run test
```

---

## API Endpoints

### Authentication

| Method | Endpoint     | Description         | Auth Required |
| ------ | ------------ | ------------------- | ------------- |
| POST   | `/register`  | Register a new user | No            |
| POST   | `/login`     | Login user          | No            |

### Events

| Method | Endpoint                 | Description              | Auth Required | Role       |
| ------ | ------------------------ | ------------------------ | ------------- | ---------- |
| GET    | `/events`                | List all events          | Yes           | Any        |
| GET    | `/events/:id`            | Get event details        | Yes           | Any        |
| POST   | `/events`                | Create a new event       | Yes           | Organizer  |
| PUT    | `/events/:id`            | Update an event          | Yes           | Organizer* |
| DELETE | `/events/:id`            | Delete an event          | Yes           | Organizer* |
| POST   | `/events/:id/register`   | Register for an event    | Yes           | Any        |

*Only the organizer who created the event can update or delete it.

---

## Request & Response Examples

### Register

```bash
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass",
  "role": "organizer"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "organizer"
  },
  "token": "jwt-token"
}
```

### Login

```bash
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass"
}
```

### Create Event

```bash
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Conference 2026",
  "description": "Annual tech conference",
  "date": "2026-06-15",
  "time": "09:00",
  "location": "Virtual Room A",
  "maxParticipants": 100
}
```

### Register for Event

```bash
POST /events/:id/register
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Successfully registered for the event",
  "event": {
    "id": "event-uuid",
    "title": "Tech Conference 2026",
    "date": "2026-06-15",
    "time": "09:00"
  }
}
```

---

## Data Models

### User
| Field      | Type   | Description                        |
| ---------- | ------ | ---------------------------------- |
| id         | UUID   | Unique identifier                  |
| name       | String | Full name                          |
| email      | String | Email address (unique)             |
| password   | String | Bcrypt hashed password             |
| role       | String | `organizer` or `attendee`          |
| createdAt  | String | ISO timestamp                      |

### Event
| Field           | Type   | Description                     |
| --------------- | ------ | ------------------------------- |
| id              | UUID   | Unique identifier               |
| title           | String | Event title                     |
| description     | String | Event description               |
| date            | String | Event date                      |
| time            | String | Event time                      |
| location        | String | Event location                  |
| maxParticipants | Number | Max allowed participants (null = unlimited) |
| organizerId     | UUID   | ID of the creating organizer    |
| participants    | Array  | List of registered participants |
| createdAt       | String | ISO timestamp                   |
| updatedAt       | String | ISO timestamp                   |

---

## License

ISC
