const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  registerForEvent,
} = require("../controllers/eventController");

// GET /events - Get all events (authenticated users)
router.get("/", authenticate, getEvents);

// GET /events/:id - Get a single event (authenticated users)
router.get("/:id", authenticate, getEventById);

// POST /events - Create event (organizers only)
router.post("/", authenticate, authorize("organizer"), createEvent);

// PUT /events/:id - Update event (organizers only)
router.put("/:id", authenticate, authorize("organizer"), updateEventById);

// DELETE /events/:id - Delete event (organizers only)
router.delete("/:id", authenticate, authorize("organizer"), deleteEventById);

// POST /events/:id/register - Register for event (any authenticated user)
router.post("/:id/register", authenticate, registerForEvent);

module.exports = router;
