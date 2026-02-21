/**
 * Validate registration input
 */
const validateRegistration = (name, email, password, role) => {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    }
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  const validRoles = ["organizer", "attendee"];
  if (role && !validRoles.includes(role)) {
    errors.push("Role must be either 'organizer' or 'attendee'");
  }

  return errors;
};

/**
 * Validate event input
 */
const validateEvent = (title, description, date, time, location) => {
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    errors.push("Description is required");
  }

  if (!date || typeof date !== "string") {
    errors.push("Date is required");
  }

  if (!time || typeof time !== "string") {
    errors.push("Time is required");
  }

  if (!location || typeof location !== "string" || location.trim().length === 0) {
    errors.push("Location is required");
  }

  return errors;
};

module.exports = {
  validateRegistration,
  validateEvent,
};
