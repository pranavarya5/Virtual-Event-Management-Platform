const { v4: uuidv4 } = require("uuid");
const {
  findEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
} = require("../data/events");
const { findUserById } = require("../data/users");
const { validateEvent } = require("../utils/validators");
const { sendRegistrationEmail } = require("../services/emailService");

/**
 * Create a new event
 * POST /events
 * Only organizers can create events
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, location, maxParticipants } = req.body;

    // Validate input
    const errors = validateEvent(title, description, date, time, location);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const newEvent = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      maxParticipants: maxParticipants || null,
      organizerId: req.user.id,
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEvent(newEvent);

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events
 * GET /events
 */
const getEvents = async (req, res, next) => {
  try {
    const events = getAllEvents();
    res.status(200).json({ events });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single event by ID
 * GET /events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an event
 * PUT /events/:id
 * Only the organizer who created the event can update it
 */
const updateEventById = async (req, res, next) => {
  try {
    const event = findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if the user is the organizer of this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. Only the event organizer can update this event.",
      });
    }

    const { title, description, date, time, location, maxParticipants } = req.body;

    const updatedData = {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(date && { date }),
      ...(time && { time }),
      ...(location && { location: location.trim() }),
      ...(maxParticipants !== undefined && { maxParticipants }),
      updatedAt: new Date().toISOString(),
    };

    const updatedEvent = updateEvent(req.params.id, updatedData);

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an event
 * DELETE /events/:id
 * Only the organizer who created the event can delete it
 */
const deleteEventById = async (req, res, next) => {
  try {
    const event = findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if the user is the organizer of this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. Only the event organizer can delete this event.",
      });
    }

    deleteEvent(req.params.id);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Register for an event
 * POST /events/:id/register
 * Any authenticated user can register
 */
const registerForEvent = async (req, res, next) => {
  try {
    const event = findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is already registered
    const alreadyRegistered = event.participants.find(
      (p) => p.userId === req.user.id
    );
    if (alreadyRegistered) {
      return res.status(409).json({
        error: "You are already registered for this event",
      });
    }

    // Check max participants
    if (
      event.maxParticipants &&
      event.participants.length >= event.maxParticipants
    ) {
      return res.status(400).json({
        error: "Event has reached maximum number of participants",
      });
    }

    // Add participant
    const participant = {
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      registeredAt: new Date().toISOString(),
    };

    event.participants.push(participant);

    // Send confirmation email asynchronously (don't block response)
    sendRegistrationEmail(req.user.email, req.user.name, event.title).catch(
      (err) => console.error("Email sending failed:", err.message)
    );

    res.status(200).json({
      message: "Successfully registered for the event",
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  registerForEvent,
};
