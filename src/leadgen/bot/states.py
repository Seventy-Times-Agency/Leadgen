from aiogram.fsm.state import State, StatesGroup


class OnboardingStates(StatesGroup):
    waiting_name = State()
    waiting_age = State()
    waiting_business_size = State()
    waiting_profession = State()
    waiting_home_region = State()
    waiting_niches = State()


class SearchStates(StatesGroup):
    waiting_niche = State()
    choosing_ai_niche = State()
    waiting_region = State()
    confirming = State()


class ProfileEditStates(StatesGroup):
    """Used when the user wants to update a specific profile field.

    The concrete field being edited is stored in FSM data under ``field``
    so a single handler can dispatch AI parsing for any of them.
    """

    editing = State()


class ProfileResetStates(StatesGroup):
    """Two-step reset: ask for confirmation before wiping the profile."""

    confirming = State()
