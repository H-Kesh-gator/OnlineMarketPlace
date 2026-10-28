const BASE = import.meta.env.VITE_AI_API_URL || "http://localhost:8001";

export async function aiRequest(path, payload, { signal } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Request failed (${response.status})`);
  return data;
}

export async function uploadResume(file) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${BASE}/resume/upload`, { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Resume upload failed");
  return data.resume_text;
}
