// In-memory event store
const events = [];

/**
 * Find an event by ID
 */
const findEventById = (id) => {
  return events.find((event) => event.id === id);
};

/**
 * Add a new event
 */
const addEvent = (event) => {
  events.push(event);
  return event;
};

/**
 * Update an existing event
 */
const updateEvent = (id, updatedData) => {
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return null;
  events[index] = { ...events[index], ...updatedData };
  return events[index];
};

/**
 * Delete an event by ID
 */
const deleteEvent = (id) => {
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return null;
  const deleted = events.splice(index, 1);
  return deleted[0];
};

/**
 * Get all events
 */
const getAllEvents = () => {
  return events;
};

/**
 * Clear all events (for testing)
 */
const clearEvents = () => {
  events.length = 0;
};

module.exports = {
  events,
  findEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  clearEvents,
};
