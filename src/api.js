
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

export async function streamMarketingChat(message, onChunkReceived) {
  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
  });

  if (!response.ok) throw new Error("Network stream response failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Only process complete lines; keep any trailing partial line in the buffer
    const lines = buffer.split("\n");
    buffer = lines.pop(); // last element may be incomplete, hold it for next read

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const payload = line.slice(6).trim();
        if (!payload || payload === "[DONE]") continue;

        try {
          const parsed = JSON.parse(payload);
          if (parsed.text) {
            onChunkReceived(parsed.text);
          }
        } catch (e) {
          console.error("Failed to parse SSE chunk:", payload, e);
        }
      }
    }
  }
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