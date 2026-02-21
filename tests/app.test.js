const request = require("supertest");
const app = require("../src/app");
const { clearUsers } = require("../src/data/users");
const { clearEvents } = require("../src/data/events");

// Clear stores before each test suite
beforeEach(() => {
  clearUsers();
  clearEvents();
});

// ─── Helper functions ───────────────────────────────────────────────────────

const registerUser = async (overrides = {}) => {
  const userData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "attendee",
    ...overrides,
  };
  const res = await request(app).post("/register").send(userData);
  return res;
};

const registerOrganizer = async (overrides = {}) => {
  return registerUser({
    name: "Organizer",
    email: "organizer@example.com",
    role: "organizer",
    ...overrides,
  });
};

const createEvent = async (token, overrides = {}) => {
  const eventData = {
    title: "Test Event",
    description: "A test event description",
    date: "2026-03-15",
    time: "10:00",
    location: "Virtual Room 1",
    ...overrides,
  };
  const res = await request(app)
    .post("/events")
    .set("Authorization", `Bearer ${token}`)
    .send(eventData);
  return res;
};

// ─── AUTH TESTS ─────────────────────────────────────────────────────────────

describe("User Authentication", () => {
  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const res = await registerUser();
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("User registered successfully");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.name).toBe("Test User");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.user.role).toBe("attendee");
      expect(res.body).toHaveProperty("token");
    });

    it("should register an organizer successfully", async () => {
      const res = await registerOrganizer();
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("organizer");
    });

    it("should default role to attendee if not provided", async () => {
      const res = await request(app).post("/register").send({
        name: "Default Role",
        email: "default@example.com",
        password: "password123",
      });
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("attendee");
    });

    it("should return 409 if email already exists", async () => {
      await registerUser();
      const res = await registerUser();
      expect(res.status).toBe(409);
      expect(res.body.error).toBe("User with this email already exists");
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app).post("/register").send({
        email: "test@example.com",
        password: "password123",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toContain("Name is required");
    });

    it("should return 400 if email is invalid", async () => {
      const res = await request(app).post("/register").send({
        name: "Test",
        email: "invalid-email",
        password: "password123",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toContain("Invalid email format");
    });

    it("should return 400 if password is too short", async () => {
      const res = await request(app).post("/register").send({
        name: "Test",
        email: "test@example.com",
        password: "123",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toContain("Password must be at least 6 characters");
    });

    it("should return 400 for invalid role", async () => {
      const res = await request(app).post("/register").send({
        name: "Test",
        email: "test@example.com",
        password: "password123",
        role: "admin",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toContain(
        "Role must be either 'organizer' or 'attendee'"
      );
    });
  });

  describe("POST /login", () => {
    it("should login an existing user successfully", async () => {
      await registerUser();
      const res = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should return 401 for wrong password", async () => {
      await registerUser();
      const res = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid email or password");
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid email or password");
    });

    it("should return 400 if email or password is missing", async () => {
      const res = await request(app).post("/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password are required");
    });
  });
});

// ─── EVENT MANAGEMENT TESTS ─────────────────────────────────────────────────

describe("Event Management", () => {
  let organizerToken;
  let attendeeToken;

  beforeEach(async () => {
    const orgRes = await registerOrganizer();
    organizerToken = orgRes.body.token;

    const attRes = await registerUser({
      email: "attendee@example.com",
      name: "Attendee",
    });
    attendeeToken = attRes.body.token;
  });

  describe("POST /events", () => {
    it("should create an event as organizer", async () => {
      const res = await createEvent(organizerToken);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Event created successfully");
      expect(res.body.event).toHaveProperty("id");
      expect(res.body.event.title).toBe("Test Event");
      expect(res.body.event.participants).toEqual([]);
    });

    it("should return 403 for attendee trying to create event", async () => {
      const res = await createEvent(attendeeToken);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe(
        "Access denied. Insufficient permissions."
      );
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/events").send({
        title: "Test Event",
        description: "Description",
        date: "2026-03-15",
        time: "10:00",
        location: "Virtual",
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({ title: "Only Title" });
      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("GET /events", () => {
    it("should get all events", async () => {
      await createEvent(organizerToken);
      await createEvent(organizerToken, { title: "Second Event" });

      const res = await request(app)
        .get("/events")
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(2);
    });

    it("should return empty array when no events exist", async () => {
      const res = await request(app)
        .get("/events")
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.events).toEqual([]);
    });
  });

  describe("GET /events/:id", () => {
    it("should get a single event by ID", async () => {
      const createRes = await createEvent(organizerToken);
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .get(`/events/${eventId}`)
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.event.id).toBe(eventId);
    });

    it("should return 404 for non-existent event", async () => {
      const res = await request(app)
        .get("/events/non-existent-id")
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Event not found");
    });
  });

  describe("PUT /events/:id", () => {
    it("should update an event as the organizer", async () => {
      const createRes = await createEvent(organizerToken);
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .put(`/events/${eventId}`)
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({ title: "Updated Event Title" });
      expect(res.status).toBe(200);
      expect(res.body.event.title).toBe("Updated Event Title");
    });

    it("should return 403 when non-owner organizer updates event", async () => {
      const createRes = await createEvent(organizerToken);
      const eventId = createRes.body.event.id;

      // Register another organizer
      const otherOrg = await registerOrganizer({
        email: "other-org@example.com",
        name: "Other Org",
      });

      const res = await request(app)
        .put(`/events/${eventId}`)
        .set("Authorization", `Bearer ${otherOrg.body.token}`)
        .send({ title: "Hacked Title" });
      expect(res.status).toBe(403);
    });

    it("should return 403 for attendee trying to update", async () => {
      const createRes = await createEvent(organizerToken);
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .put(`/events/${eventId}`)
        .set("Authorization", `Bearer ${attendeeToken}`)
        .send({ title: "Hacked" });
      expect(res.status).toBe(403);
    });

    it("should return 404 for updating non-existent event", async () => {
      const res = await request(app)
        .put("/events/non-existent-id")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({ title: "Updated" });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /events/:id", () => {
    it("should delete an event as the organizer", async () => {
      const createRes = await createEvent(organizerToken);
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .delete(`/events/${eventId}`)
        .set("Authorization", `Bearer ${organizerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event deleted successfully");

      // Verify deletion
      const getRes = await request(app)
        .get(`/events/${eventId}`)
        .set("Authorization", `Bearer ${organizerToken}`);
      expect(getRes.status).toBe(404);
    });

    it("should return 403 for attendee trying to delete", async () => {
      const createRes = await createEvent(organizerToken);
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .delete(`/events/${eventId}`)
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(403);
    });

    it("should return 404 for deleting non-existent event", async () => {
      const res = await request(app)
        .delete("/events/non-existent-id")
        .set("Authorization", `Bearer ${organizerToken}`);
      expect(res.status).toBe(404);
    });
  });
});

// ─── PARTICIPANT MANAGEMENT TESTS ───────────────────────────────────────────

describe("Participant Management", () => {
  let organizerToken;
  let attendeeToken;
  let eventId;

  beforeEach(async () => {
    const orgRes = await registerOrganizer();
    organizerToken = orgRes.body.token;

    const attRes = await registerUser({
      email: "attendee@example.com",
      name: "Attendee",
    });
    attendeeToken = attRes.body.token;

    const eventRes = await createEvent(organizerToken);
    eventId = eventRes.body.event.id;
  });

  describe("POST /events/:id/register", () => {
    it("should register an attendee for an event", async () => {
      const res = await request(app)
        .post(`/events/${eventId}/register`)
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Successfully registered for the event"
      );
      expect(res.body.event.id).toBe(eventId);
    });

    it("should allow an organizer to register for an event", async () => {
      // Create a different organizer to register for the event
      const otherOrg = await registerOrganizer({
        email: "other-org@example.com",
        name: "Other Organizer",
      });

      const res = await request(app)
        .post(`/events/${eventId}/register`)
        .set("Authorization", `Bearer ${otherOrg.body.token}`);
      expect(res.status).toBe(200);
    });

    it("should return 409 if already registered", async () => {
      await request(app)
        .post(`/events/${eventId}/register`)
        .set("Authorization", `Bearer ${attendeeToken}`);

      const res = await request(app)
        .post(`/events/${eventId}/register`)
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(409);
      expect(res.body.error).toBe(
        "You are already registered for this event"
      );
    });

    it("should return 404 for non-existent event", async () => {
      const res = await request(app)
        .post("/events/non-existent-id/register")
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Event not found");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).post(`/events/${eventId}/register`);
      expect(res.status).toBe(401);
    });

    it("should return 400 when event is full", async () => {
      // Create event with max 1 participant
      const limitedEventRes = await createEvent(organizerToken, {
        title: "Limited Event",
        maxParticipants: 1,
      });
      const limitedEventId = limitedEventRes.body.event.id;

      // First registration
      await request(app)
        .post(`/events/${limitedEventId}/register`)
        .set("Authorization", `Bearer ${attendeeToken}`);

      // Second registration (different user)
      const secondUser = await registerUser({
        email: "second@example.com",
        name: "Second User",
      });

      const res = await request(app)
        .post(`/events/${limitedEventId}/register`)
        .set("Authorization", `Bearer ${secondUser.body.token}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Event has reached maximum number of participants"
      );
    });

    it("should add participant to event participant list", async () => {
      await request(app)
        .post(`/events/${eventId}/register`)
        .set("Authorization", `Bearer ${attendeeToken}`);

      const res = await request(app)
        .get(`/events/${eventId}`)
        .set("Authorization", `Bearer ${attendeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.event.participants.length).toBe(1);
      expect(res.body.event.participants[0].name).toBe("Attendee");
    });
  });
});

// ─── MIDDLEWARE TESTS ───────────────────────────────────────────────────────

describe("Middleware & Edge Cases", () => {
  it("should return 401 with invalid token", async () => {
    const res = await request(app)
      .get("/events")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });

  it("should return 401 without Bearer prefix", async () => {
    const res = await request(app)
      .get("/events")
      .set("Authorization", "some-token");
    expect(res.status).toBe(401);
  });

  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });

  it("should return health check on root", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Virtual Event Management Platform API");
  });
});
