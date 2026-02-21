// In-memory user store
const users = [];

/**
 * Find a user by email
 */
const findUserByEmail = (email) => {
  return users.find((user) => user.email === email);
};

/**
 * Find a user by ID
 */
const findUserById = (id) => {
  return users.find((user) => user.id === id);
};

/**
 * Add a new user
 */
const addUser = (user) => {
  users.push(user);
  return user;
};

/**
 * Get all users
 */
const getAllUsers = () => {
  return users;
};

/**
 * Clear all users (for testing)
 */
const clearUsers = () => {
  users.length = 0;
};

module.exports = {
  users,
  findUserByEmail,
  findUserById,
  addUser,
  getAllUsers,
  clearUsers,
};
