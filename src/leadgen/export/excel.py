from __future__ import annotations

from collections.abc import Iterable
from io import BytesIO
from typing import TYPE_CHECKING

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from openpyxl.utils import get_column_letter

if TYPE_CHECKING:
    from leadgen.db.models import Lead


COLUMNS: list[tuple[str, int]] = [
    ("Название", 40),
    ("Категория", 24),
    ("Телефон", 20),
    ("Сайт", 36),
    ("Адрес", 50),
    ("Рейтинг", 10),
    ("Отзывов", 10),
    ("Широта", 12),
    ("Долгота", 12),
    ("Источник", 16),
]


def build_excel(leads: Iterable[Lead]) -> bytes:
    """Render a list of leads into an XLSX file and return its bytes."""
    wb = Workbook()
    ws = wb.active
    assert ws is not None
    ws.title = "Leads"

    header_font = Font(bold=True)
    for col_idx, (title, width) in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=col_idx, value=title)
        cell.font = header_font
        cell.alignment = Alignment(horizontal="left")
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    for row_idx, lead in enumerate(leads, start=2):
        ws.cell(row=row_idx, column=1, value=lead.name)
        ws.cell(row=row_idx, column=2, value=lead.category)
        ws.cell(row=row_idx, column=3, value=lead.phone)
        ws.cell(row=row_idx, column=4, value=lead.website)
        ws.cell(row=row_idx, column=5, value=lead.address)
        ws.cell(row=row_idx, column=6, value=lead.rating)
        ws.cell(row=row_idx, column=7, value=lead.reviews_count)
        ws.cell(row=row_idx, column=8, value=lead.latitude)
        ws.cell(row=row_idx, column=9, value=lead.longitude)
        ws.cell(row=row_idx, column=10, value=lead.source)

    ws.freeze_panes = "A2"

    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()
