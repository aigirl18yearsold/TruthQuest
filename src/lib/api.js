async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request to ${path} failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const fetchPost = (url) => postJSON("/api/fetch-post", { url }).then((d) => d.post);

export const runAnalysis = (post) => postJSON("/api/analyze", { post });

export const sendChatMessage = ({ post, analysis, history, message }) =>
  postJSON("/api/chat", { post, analysis, history, message });

export const getScorecard = ({ post, analysis, decision, history }) =>
  postJSON("/api/score", { post, analysis, decision, history });

/** Convert a browser File into the {name, mimeType, data(base64)} shape the API expects. */
export function fileToPart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1] || "";
      resolve({ name: file.name, mimeType: file.type || "application/octet-stream", data: base64 });
    };
    reader.onerror = () => reject(new Error(`Couldn't read file ${file.name}`));
    reader.readAsDataURL(file);
  });
}