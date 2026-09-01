
const API_BASE_URL = "http://localhost:3000";


async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

/**
 * Log in an existing user
 * @param {{ email: string, password: string }} credentials
 */
export async function loginUser(credentials) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

/**
 * Register a new user
 * @param {{ full_name: string, email: string, password: string }} details
 */
export async function registerUser(details) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  });

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

/**
 * Redirect to Google OAuth flow
 */
export function loginWithGoogle() {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

/**
 * Log out the current user
 */
export function logoutUser() {
  localStorage.removeItem("token");
}

/**
 * Get the currently stored auth token
 */
export function getToken() {
  return localStorage.getItem("token");
}