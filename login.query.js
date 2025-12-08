// Queries for authentication module

const SELECT_USER_BY_EMAIL = `
  SELECT userId, email, password, userName 
  FROM user 
  WHERE email = ? AND deletedAt IS NULL
`;

const SELECT_USER_BY_USERNAME = `
  SELECT userId, email, password, userName 
  FROM user 
  WHERE userName = ? AND deletedAt IS NULL
`;

module.exports = {
  SELECT_USER_BY_EMAIL,
  SELECT_USER_BY_USERNAME
};
