from aiogram.fsm.state import State, StatesGroup


class SearchStates(StatesGroup):
    waiting_niche = State()
    waiting_region = State()
    confirming = State()
