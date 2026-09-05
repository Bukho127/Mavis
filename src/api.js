
const API_BASE_URL = "http://localhost:3000";

export function decodeUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
}

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


export async function fetchAllInterviews(token) {
  return request("/interviews", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchUserProfile(userId, token) {
  return request(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function uploadUserDocument({ token, userId, file, documentType, onProgress }) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("documentType", documentType);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/documents`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || "{}");

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data.message || "Document upload failed."));
    };

    xhr.onerror = () => reject(new Error("Document upload failed."));
    xhr.send(formData);
  });
}

export async function deleteUserDocument(documentId, token) {
  return request(`/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// api.js — add these alongside your existing functions

export async function startInterview({ token, jobTitle, jobDescription, persona }) {
  const res = await fetch("/interviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jobTitle, jobDescription, persona }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to start interview");
  }

  return res.json();
}

export async function getMyInterviews(token) {
  const res = await fetch("/interviews", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to fetch interviews");
  }

  return res.json();
}

export async function getInterviewById(interviewId, token) {
  const res = await fetch(`/interviews/${interviewId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to fetch interview");
  }

  return res.json();
}

export async function endInterview(interviewId, token) {
  const res = await fetch(`/interviews/${interviewId}/end`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to end interview");
  }

  return res.json();
}

export async function deleteInterview(interviewId, token) {
  const res = await fetch(`/interviews/${interviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to delete interview");
  }

  return res.json();
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
