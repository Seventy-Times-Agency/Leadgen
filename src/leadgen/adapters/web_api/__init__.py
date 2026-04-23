"""FastAPI surface for the web frontend (Vercel-hosted Next.js).

Today it covers health + metrics + search start/list/status. Future
commits will add magic-link auth, SSE progress streaming, and the
per-user endpoints the web dashboard needs.
"""

from leadgen.adapters.web_api.app import create_app

__all__ = ["create_app"]
