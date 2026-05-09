export function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = localStorage.getItem("session_id");

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    localStorage.setItem("session_id", sessionId);
  }

  return sessionId;
}