"""In-process per-user rate limiter.

Single-instance sliding-window counter: tracks the timestamps of recent
actions and rejects new ones once a user exceeds the budget within the
window. Lives in memory — fine for a single bot process, and the
migration to a multi-instance deployment will swap this module for a
Redis-backed equivalent without touching call sites.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque


class RateLimiter:
    def __init__(self, max_actions: int, window_sec: float) -> None:
        self.max_actions = max_actions
        self.window_sec = window_sec
        self._events: dict[int, deque[float]] = defaultdict(deque)

    def check_and_record(self, user_id: int) -> bool:
        """Try to record a new action. Returns True if allowed, False if rate-limited."""
        now = time.monotonic()
        cutoff = now - self.window_sec
        events = self._events[user_id]
        while events and events[0] < cutoff:
            events.popleft()
        if len(events) >= self.max_actions:
            return False
        events.append(now)
        return True

    def retry_after(self, user_id: int) -> float:
        """Seconds until the oldest event falls out of the window (best-effort)."""
        events = self._events.get(user_id)
        if not events or len(events) < self.max_actions:
            return 0.0
        return max(0.0, events[0] + self.window_sec - time.monotonic())


# Default limiters tuned for a chat UI: searches are expensive, all other
# actions just need to stop rapid-fire spam.
search_limiter = RateLimiter(max_actions=5, window_sec=60.0)
action_limiter = RateLimiter(max_actions=30, window_sec=60.0)
