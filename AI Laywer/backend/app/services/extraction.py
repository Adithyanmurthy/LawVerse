import re
import shutil
import subprocess
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

try:
    import pdfplumber
except Exception:  # pragma: no cover
    pdfplumber = None

try:
    from pypdf import PdfReader
except Exception:  # pragma: no cover
    PdfReader = None

try:
    import pytesseract
    from PIL import Image
except Exception:  # pragma: no cover
    pytesseract = None
    Image = None


def extract_text_from_docx(path: str) -> str:
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    chunks: list[str] = []
    for paragraph in root.findall(".//w:p", ns):
        texts = [node.text or "" for node in paragraph.findall(".//w:t", ns)]
        line = "".join(texts).strip()
        if line:
            chunks.append(line)
    return "\n".join(chunks)


def extract_text(path: str) -> str:
    ext = Path(path).suffix.lower()
    if ext == ".docx":
        return extract_text_from_docx(path)
    if ext == ".txt":
        return Path(path).read_text(encoding="utf-8", errors="ignore")
    if ext == ".pdf":
        text = extract_text_from_pdf(path)
        return text
    return ""


def extract_text_from_pdf(path: str) -> str:
    # Strategy: native text extraction first (fast), OCR fallback for scans.
    text_chunks: list[str] = []

    if pdfplumber:
        try:
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        text_chunks.append(page_text)
        except Exception:
            pass

    if not text_chunks and PdfReader:
        try:
            reader = PdfReader(path)
            for page in reader.pages:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_chunks.append(page_text)
        except Exception:
            pass

    extracted = "\n\n".join(text_chunks).strip()
    if len(extracted) >= 80:
        return extracted

    ocr_text = ocr_pdf(path)
    return ocr_text if ocr_text.strip() else extracted


def ocr_pdf(path: str) -> str:
    if not pytesseract or not Image:
        return ""
    if not shutil.which("pdftoppm"):
        return ""

    tmp_dir = Path("tmp/pdfs")
    tmp_dir.mkdir(parents=True, exist_ok=True)
    stem = Path(path).stem
    out_prefix = tmp_dir / f"{stem}_ocr"

    try:
        subprocess.run(
            ["pdftoppm", "-png", path, str(out_prefix)],
            check=True,
            capture_output=True,
            text=True,
        )
    except Exception:
        return ""

    texts: list[str] = []
    for image_path in sorted(tmp_dir.glob(f"{out_prefix.name}-*.png")):
        try:
            with Image.open(image_path) as img:
                page_text = pytesseract.image_to_string(img) or ""
                if page_text.strip():
                    texts.append(page_text)
        except Exception:
            continue
        finally:
            try:
                image_path.unlink(missing_ok=True)
            except Exception:
                pass
    return "\n\n".join(texts).strip()


def split_clauses(text: str) -> list[dict]:
    """
    Split contract text into clauses using multiple strategies:
    1. Numbered sections (1., 2., 3. or 1.1, 1.2, etc.)
    2. Lettered sections (A., B., C. or (a), (b), (c))
    3. ALL CAPS HEADINGS
    4. Paragraph breaks as fallback
    """
    clauses = []
    
    # Strategy 1: Split by numbered sections (most common in contracts)
    # Matches: "1. HEADING", "1.1 Heading", "Section 1:", "Article 1."
    numbered_pattern = r'(?:^|\n)(?:(?:Section|Article|Clause)?\s*)?(\d+(?:\.\d+)?)[\.:\)]\s*([A-Z][^\n]*)'
    numbered_matches = list(re.finditer(numbered_pattern, text, re.MULTILINE))
    
    if len(numbered_matches) >= 2:
        # Found numbered sections - split by them
        for i, match in enumerate(numbered_matches):
            start = match.start()
            end = numbered_matches[i + 1].start() if i + 1 < len(numbered_matches) else len(text)
            clause_text = text[start:end].strip()
            
            if clause_text and len(clause_text) > 10:  # Ignore very short clauses
                clause_num = match.group(1)
                clause_title = match.group(2).strip()
                clauses.append({
                    "id": f"clause_{clause_num}",
                    "text": clause_text,
                    "title": clause_title
                })
        
        if clauses:
            return clauses[:120]  # Limit to 120 clauses
    
    # Strategy 2: Split by ALL CAPS HEADINGS (common in legal docs)
    caps_pattern = r'(?:^|\n)([A-Z][A-Z\s]{3,}[A-Z])\s*\n'
    caps_matches = list(re.finditer(caps_pattern, text, re.MULTILINE))
    
    if len(caps_matches) >= 2:
        for i, match in enumerate(caps_matches):
            start = match.start()
            end = caps_matches[i + 1].start() if i + 1 < len(caps_matches) else len(text)
            clause_text = text[start:end].strip()
            
            if clause_text and len(clause_text) > 10:
                heading = match.group(1).strip()
                clauses.append({
                    "id": f"clause_{i+1}",
                    "text": clause_text,
                    "title": heading
                })
        
        if clauses:
            return clauses[:120]
    
    # Strategy 3: Split by lettered sections
    letter_pattern = r'(?:^|\n)\(([a-z])\)\s*([^\n]+)'
    letter_matches = list(re.finditer(letter_pattern, text, re.MULTILINE))
    
    if len(letter_matches) >= 3:
        for i, match in enumerate(letter_matches):
            start = match.start()
            end = letter_matches[i + 1].start() if i + 1 < len(letter_matches) else len(text)
            clause_text = text[start:end].strip()
            
            if clause_text and len(clause_text) > 10:
                clauses.append({
                    "id": f"clause_{match.group(1)}",
                    "text": clause_text,
                    "title": match.group(2).strip()
                })
        
        if clauses:
            return clauses[:120]
    
    # Strategy 4: Fallback to paragraph breaks (original behavior)
    blocks = [b.strip() for b in re.split(r"\n{2,}", text) if b.strip()]
    if not blocks:
        blocks = [b.strip() for b in text.split("\n") if b.strip()]
    
    # Filter out very short blocks (likely not real clauses)
    blocks = [b for b in blocks if len(b) > 20]
    
    return [{"id": f"clause_{idx+1}", "text": block, "title": ""} for idx, block in enumerate(blocks[:120])]
