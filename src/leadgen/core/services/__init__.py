"""Client-agnostic application services.

Each service encapsulates one piece of domain logic (billing, search,
profile, team…) behind a narrow interface. Adapters (Telegram, web
API) call these services instead of reimplementing the same rules.
"""

from leadgen.core.services.billing_service import (
    BillingError,
    BillingService,
    QuotaCheck,
)
from leadgen.core.services.profile_service import ProfileService, ProfileUpdate
from leadgen.core.services.sinks import DeliverySink, NullSink, ProgressSink

__all__ = [
    "BillingError",
    "BillingService",
    "DeliverySink",
    "NullSink",
    "ProfileService",
    "ProfileUpdate",
    "ProgressSink",
    "QuotaCheck",
]
