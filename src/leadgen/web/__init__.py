"""Lightweight HTTP surface: /health for Railway probes and /metrics for Prometheus."""

from leadgen.web.health import create_app, start_health_server

__all__ = ["create_app", "start_health_server"]
