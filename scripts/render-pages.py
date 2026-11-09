"""Regenerate the supplied page images with MuPDF's standard PDF fonts.

Optional asset-maintenance dependency: PyMuPDF==1.26.6.
The committed PNG files mean ordinary app builds do not need Python.
"""
from pathlib import Path
import fitz

root = Path(__file__).resolve().parents[1]
with fitz.open(root / 'public/documents/master-agreement.pdf') as document:
    for index, page in enumerate(document, start=1):
        # 180 DPI preserves Letter geometry and gives readable desktop previews.
        image = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5), alpha=False)
        image.save(root / f'public/documents/agreement-{index}.png')
