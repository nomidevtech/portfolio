export function normalizeUsername(value) {
  return value?.toString().trim() || "";
}

export function validateUsername(username, label = "Username") {
  if (!username) return `${label} is required`;
  if (username.length < 3) return `${label} must be at least 3 characters`;
  if (username.length > 32) return `${label} must be 32 characters or less`;
  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    return `${label} can only contain letters, numbers, and underscores`;
  }
  return null;
}

export function validateAdminPassword(password, label = "Password") {
  if (!password) return `${label} is required`;
  if (password.length < 6) return `${label} must be at least 6 characters`;
  if (password.length > 128) return `${label} must be 128 characters or less`;
  return null;
}

export function validateOptionalAdminPassword(password, label = "Password") {
  if (!password) return null;
  if (password.length < 6) return `${label} must be at least 6 characters`;
  if (password.length > 128) return `${label} must be 128 characters or less`;
  return null;
}

export function validateOptionalPassword(password, label = "Password") {
  if (!password) return null;
  if (password.length > 128) return `${label} must be 128 characters or less`;
  return null;
}

export function validateEmail(email) {
  if (!email) return null;

  if (email.length > 254) {
    return "Email too long";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
}
