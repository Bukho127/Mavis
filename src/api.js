const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://mavis-backend-za-bukho-20260929.azurewebsites.net"
).replace(/\/+$/, "");

export function resolveApiUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export function decodeUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function parseJson(response) {
  return response.json().catch(() => ({}));
}

function errorMessage(data, fallback) {
  return data?.message || data?.error || fallback;
}

async function request(endpoint, options = {}) {
  const { headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      errorMessage(data, "Something went wrong. Please try again."),
    );
  }

  return data;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Chat (streaming)                                                    */
/* ------------------------------------------------------------------ */

export async function streamMarketingChat(message, onChunkReceived) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
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
    buffer = lines.pop();

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

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

function normalizeUserProfileResponse(data) {
  return data.user || data.profile || data.data || data;
}

export async function fetchUserProfile(userId, token) {
  const data = await request(`/users/${userId}`, {
    headers: authHeader(token),
  });

  return normalizeUserProfileResponse(data);
}

export async function updateUserProfile(userId, token, updates) {
  const data = await request(`/users/${userId}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(updates),
  });

  return normalizeUserProfileResponse(data);
}

export async function deleteUserProfile(token) {
  return request("/users/me", {
    method: "DELETE",
    headers: authHeader(token),
  });
}

export async function getQuota(userId, token) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/quota`, {
    method: "GET",
    headers: authHeader(token),
  });

  const body = await parseJson(response);

  if (!response.ok) {
    throw new Error(errorMessage(body, "Failed to fetch quota"));
  }

  return body;
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export async function uploadUserAvatar({ token, file, method = "POST" }) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method,
    headers: authHeader(token),
    body: formData,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(errorMessage(data, "Avatar upload failed."));
  }

  return normalizeUserProfileResponse(data);
}

export async function deleteUserAvatar(token) {
  const data = await request("/users/me/avatar", {
    method: "DELETE",
    headers: authHeader(token),
  });

  return normalizeUserProfileResponse(data);
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export function uploadUserDocument({
  token,
  userId,
  file,
  documentType,
  onProgress,
}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const isCvUpload = documentType === "cv";
    const endpoint = isCvUpload ? "/users/me/cv" : "/documents";

    formData.append(isCvUpload ? "cv" : "file", file);
    if (!isCvUpload) {
      formData.append("userId", userId);
      formData.append("documentType", documentType);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${endpoint}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      // The server may return HTML (e.g. an error page), so parse safely
      let data = {};
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(errorMessage(data, "Document upload failed.")));
    };

    xhr.onerror = () => reject(new Error("Document upload failed."));
    xhr.send(formData);
  });
}

export async function deleteUserDocument(documentId, token) {
  return request(`/documents/${documentId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

/* ------------------------------------------------------------------ */
/* Job applications                                                    */
/* ------------------------------------------------------------------ */

function normalizeJobApplicationCollection(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.jobApplications)) return data.jobApplications;
  if (Array.isArray(data?.applications)) return data.applications;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeJobApplicationResponse(data) {
  return data?.jobApplication || data?.application || data?.data || data;
}

export async function fetchJobApplications(token) {
  const data = await request("/job-applications", {
    headers: authHeader(token),
  });

  return normalizeJobApplicationCollection(data);
}

export async function createJobApplication(token, application) {
  const data = await request("/job-applications", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(application),
  });

  return normalizeJobApplicationResponse(data);
}

export async function updateJobApplication(applicationId, token, updates) {
  const data = await request(`/job-applications/${applicationId}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(updates),
  });

  return normalizeJobApplicationResponse(data);
}

export async function deleteJobApplication(applicationId, token) {
  return request(`/job-applications/${applicationId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

export async function fetchAllInterviews(token) {
  return request("/interviews", {
    headers: authHeader(token),
  });
}

export async function getMyInterviews(token) {
  return request("/interviews", {
    headers: authHeader(token),
  });
}

export async function getInterviewById(interviewId, token) {
  return request(`/interviews/${interviewId}`, {
    headers: authHeader(token),
  });
}

export async function startInterview({
  token,
  jobTitle,
  jobDescription,
  persona,
}) {
  return request("/interviews", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ jobTitle, jobDescription, persona }),
  });
}

export async function endInterview(interviewId, token, transcript = []) {
  return request(`/interviews/${interviewId}/end`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify({ transcript }),
  });
}

export async function deleteInterview(interviewId, token) {
  return request(`/interviews/${interviewId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}