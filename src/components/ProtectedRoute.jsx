import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { clearSession, isSessionValid, refreshSession } from "../utils/auth";

// Route guard with 20-minute idle session.
// - Session refreshed on user activity (click/scroll/move/keydown/touch)
// - Auto-logout when session expired
export default function ProtectedRoute({ children }) {
  const lastRefreshRef = useRef(0);
  const [, forceTick] = useState(0);

  // Re-check session periodically (so user gets kicked out even if they stay on a page).
  useEffect(() => {
    const id = setInterval(() => forceTick((x) => x + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const valid = isSessionValid();

  useEffect(() => {
    if (!valid) return;

    const onActivity = () => {
      const now = Date.now();
      // throttle refresh to once every 30s max
      if (now - lastRefreshRef.current < 30_000) return;
      lastRefreshRef.current = now;
      refreshSession();
    };

    const events = [
      "click",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "touchmove",
    ];

    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, onActivity));
  }, [valid]);

  if (!valid) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  return children;
}
