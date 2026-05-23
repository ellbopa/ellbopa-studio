"use client";

import { useEffect } from "react";

function visitorId() {
  const key = "ellbopa_visitor_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, next);
  return next;
}

export function ActivityTracker() {
  useEffect(() => {
    let alive = true;

    const send = async () => {
      try {
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: visitorId(),
            path: window.location.pathname,
            userAgent: window.navigator.userAgent
          })
        });
      } catch {
        // Tracking should never affect the page experience.
      }
    };

    void send();
    const interval = window.setInterval(() => {
      if (alive) void send();
    }, 60000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
