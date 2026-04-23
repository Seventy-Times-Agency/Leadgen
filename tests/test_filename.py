from __future__ import annotations

# ``_safe_filename`` moved to the Telegram adapter when the delivery path
# was split into a client-agnostic sink. The function is identical; we
# just import it from its new home.
from leadgen.adapters.telegram.sinks import _safe_filename


def test_safe_filename_replaces_disallowed_characters() -> None:
    assert _safe_filename("leads:moscow/clinics?.xlsx") == "leads_moscow_clinics_.xlsx"


def test_safe_filename_replaces_spaces() -> None:
    assert _safe_filename("leads moscow april.xlsx") == "leads_moscow_april.xlsx"
