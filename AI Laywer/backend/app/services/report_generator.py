import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    Flowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, HRFlowable
)

# ── Palette ──────────────────────────────────────────────────────────────────
BLACK   = colors.HexColor("#0a0a0a")
WHITE   = colors.white
GREY_50 = colors.HexColor("#fafafa")
GREY_100= colors.HexColor("#f4f4f5")
GREY_200= colors.HexColor("#e4e4e7")
GREY_400= colors.HexColor("#a1a1aa")
GREY_600= colors.HexColor("#52525b")
GREY_800= colors.HexColor("#27272a")

RISK_PALETTE = {
    "LOW":      {"fg": colors.HexColor("#166534"), "bg": colors.HexColor("#f0fdf4"), "bar": colors.HexColor("#22c55e")},
    "MEDIUM":   {"fg": colors.HexColor("#92400e"), "bg": colors.HexColor("#fffbeb"), "bar": colors.HexColor("#f59e0b")},
    "HIGH":     {"fg": colors.HexColor("#991b1b"), "bg": colors.HexColor("#fff5f5"), "bar": colors.HexColor("#ef4444")},
    "CRITICAL": {"fg": colors.HexColor("#7f1d1d"), "bg": colors.HexColor("#fff1f1"), "bar": colors.HexColor("#dc2626")},
}

W, H = A4  # 595 x 842 pt


# ── Custom Flowables ──────────────────────────────────────────────────────────

class CoverBlock(Flowable):
    """Full-width cover section drawn directly on canvas."""
    def __init__(self, filename, risk_level, risk_score, generated_at, width=None):
        Flowable.__init__(self)
        self.filename = filename
        self.risk_level = risk_level
        self.risk_score = risk_score
        self.generated_at = generated_at
        self.width = width or (W - 2 * inch)
        self.height = 2.6 * inch

    def draw(self):
        c = self.canv
        pal = RISK_PALETTE.get(self.risk_level, RISK_PALETTE["MEDIUM"])

        # Background panel
        c.setFillColor(BLACK)
        c.roundRect(0, 0, self.width, self.height, 6, fill=True, stroke=False)

        # Thin accent stripe (risk colour) on left edge
        c.setFillColor(pal["bar"])
        c.rect(0, 0, 4, self.height, fill=True, stroke=False)

        # Brand name — top right
        c.setFillColor(GREY_400)
        c.setFont("Helvetica", 8)
        c.drawRightString(self.width - 16, self.height - 18, "AI CONTRACT COPILOT")

        # Main heading
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(24, self.height - 52, "CONTRACT RISK ANALYSIS")

        # Filename (truncated)
        fname = self.filename or "Contract Document"
        if len(fname) > 60:
            fname = fname[:57] + "..."
        c.setFillColor(GREY_400)
        c.setFont("Helvetica", 10)
        c.drawString(24, self.height - 72, fname)

        # Divider
        c.setStrokeColor(GREY_600)
        c.setLineWidth(0.5)
        c.line(24, self.height - 86, self.width - 24, self.height - 86)

        # Risk badge
        badge_x = 24
        badge_y = 28
        badge_w = 110
        badge_h = 36
        c.setFillColor(pal["bar"])
        c.roundRect(badge_x, badge_y, badge_w, badge_h, 4, fill=True, stroke=False)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        label = f"{self.risk_level} RISK"
        lw = c.stringWidth(label, "Helvetica-Bold", 11)
        c.drawString(badge_x + (badge_w - lw) / 2, badge_y + 12, label)

        # Score
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 28)
        c.drawString(badge_x + badge_w + 20, badge_y + 6, f"{self.risk_score}")
        c.setFillColor(GREY_400)
        c.setFont("Helvetica", 14)
        c.drawString(badge_x + badge_w + 20 + c.stringWidth(str(self.risk_score), "Helvetica-Bold", 28) + 4, badge_y + 10, "/ 10")

        # Date
        c.setFillColor(GREY_400)
        c.setFont("Helvetica", 8)
        c.drawRightString(self.width - 16, badge_y + 14, self.generated_at)


class RiskBar(Flowable):
    """Thin horizontal risk progress bar."""
    def __init__(self, score, risk_level, width=None):
        Flowable.__init__(self)
        self.score = score
        self.risk_level = risk_level
        self.width = width or (W - 2 * inch)
        self.height = 28

    def draw(self):
        c = self.canv
        pal = RISK_PALETTE.get(self.risk_level, RISK_PALETTE["MEDIUM"])
        track_h = 6
        y = (self.height - track_h) / 2

        # Track
        c.setFillColor(GREY_200)
        c.roundRect(0, y, self.width, track_h, 3, fill=True, stroke=False)

        # Fill
        fill_w = max(12, (self.score / 10) * self.width)
        c.setFillColor(pal["bar"])
        c.roundRect(0, y, fill_w, track_h, 3, fill=True, stroke=False)

        # Score label
        c.setFillColor(GREY_600)
        c.setFont("Helvetica", 8)
        c.drawRightString(self.width, y - 4, f"Score: {self.score}/10")


class SectionLabel(Flowable):
    """Uppercase section label with left accent bar."""
    def __init__(self, text, width=None):
        Flowable.__init__(self)
        self.text = text
        self.width = width or (W - 2 * inch)
        self.height = 22

    def draw(self):
        c = self.canv
        c.setFillColor(BLACK)
        c.rect(0, 2, 3, self.height - 4, fill=True, stroke=False)
        c.setFillColor(GREY_800)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(12, 6, self.text.upper())


class IssueBadge(Flowable):
    """Coloured tag pill for issue type."""
    def __init__(self, text, width=80, height=18):
        Flowable.__init__(self)
        self.text = text
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        c.setFillColor(GREY_100)
        c.roundRect(0, 0, self.width, self.height, 4, fill=True, stroke=False)
        c.setStrokeColor(GREY_200)
        c.setLineWidth(0.5)
        c.roundRect(0, 0, self.width, self.height, 4, fill=False, stroke=True)
        c.setFillColor(GREY_800)
        c.setFont("Helvetica-Bold", 7.5)
        tw = c.stringWidth(self.text, "Helvetica-Bold", 7.5)
        c.drawString((self.width - tw) / 2, 5, self.text)


# ── Page decorations (header/footer on every page) ────────────────────────────

def _page_chrome(canvas_obj, doc, risk_level, total_issues):
    canvas_obj.saveState()
    page = canvas_obj.getPageNumber()

    # Top rule
    canvas_obj.setStrokeColor(GREY_200)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(inch, H - 0.55 * inch, W - inch, H - 0.55 * inch)

    # Header: brand left, page info right
    canvas_obj.setFont("Helvetica-Bold", 8)
    canvas_obj.setFillColor(BLACK)
    canvas_obj.drawString(inch, H - 0.42 * inch, "AI CONTRACT COPILOT")

    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(GREY_400)
    canvas_obj.drawRightString(W - inch, H - 0.42 * inch, f"Contract Risk Analysis  ·  Page {page}")

    # Bottom rule
    canvas_obj.setStrokeColor(GREY_200)
    canvas_obj.line(inch, 0.55 * inch, W - inch, 0.55 * inch)

    # Footer: disclaimer left, risk badge right
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.setFillColor(GREY_400)
    canvas_obj.drawString(inch, 0.38 * inch, "For informational purposes only. Not legal advice.")

    pal = RISK_PALETTE.get(risk_level, RISK_PALETTE["MEDIUM"])
    bw, bh = 72, 14
    bx = W - inch - bw
    by = 0.30 * inch
    canvas_obj.setFillColor(pal["bar"])
    canvas_obj.roundRect(bx, by, bw, bh, 3, fill=True, stroke=False)
    canvas_obj.setFillColor(WHITE)
    canvas_obj.setFont("Helvetica-Bold", 7)
    label = f"{risk_level} RISK"
    lw = canvas_obj.stringWidth(label, "Helvetica-Bold", 7)
    canvas_obj.drawString(bx + (bw - lw) / 2, by + 4, label)

    canvas_obj.restoreState()


# ── Style helpers ─────────────────────────────────────────────────────────────

def _styles():
    def ps(name, **kw):
        base = kw.pop("parent", None)
        s = ParagraphStyle(name=name, **kw)
        return s

    return {
        "meta_label": ps("MetaLabel", fontSize=7.5, textColor=GREY_400,
                         fontName="Helvetica-Bold", spaceAfter=2, leading=10),
        "meta_value": ps("MetaValue", fontSize=9.5, textColor=GREY_800,
                         fontName="Helvetica", spaceAfter=0, leading=13),
        "section_body": ps("SectionBody", fontSize=9.5, textColor=GREY_800,
                           fontName="Helvetica", leading=15, spaceAfter=4),
        "issue_num": ps("IssueNum", fontSize=8, textColor=GREY_400,
                        fontName="Helvetica-Bold", leading=11),
        "issue_expl": ps("IssueExpl", fontSize=9.5, textColor=GREY_800,
                         fontName="Helvetica", leading=15, spaceAfter=4),
        "suggest_text": ps("SuggestText", fontSize=9, textColor=colors.HexColor("#1e3a5f"),
                           fontName="Helvetica", leading=14, spaceAfter=0,
                           leftIndent=8, rightIndent=8),
        "suggest_label": ps("SuggestLabel", fontSize=7.5, textColor=GREY_400,
                            fontName="Helvetica-Bold", leading=10, spaceAfter=3,
                            leftIndent=8),
        "table_header": ps("TableHeader", fontSize=8, textColor=WHITE,
                           fontName="Helvetica-Bold", alignment=1, leading=10),
        "table_cell": ps("TableCell", fontSize=8.5, textColor=GREY_800,
                         fontName="Helvetica", leading=12),
        "disclaimer": ps("Disclaimer", fontSize=7.5, textColor=GREY_400,
                         fontName="Helvetica", alignment=1, leading=11),
    }


# ── Main generator ────────────────────────────────────────────────────────────

def generate_pdf_report(contract, analysis) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
    )

    st = _styles()
    story = []
    issues = analysis.issues or []
    risk_level = analysis.risk_level or "MEDIUM"
    pal = RISK_PALETTE.get(risk_level, RISK_PALETTE["MEDIUM"])
    content_w = W - 2 * inch

    generated_at = datetime.utcnow().strftime("%B %d, %Y  ·  %H:%M UTC")

    # ── 1. Cover block ────────────────────────────────────────────────────────
    story.append(CoverBlock(
        filename=contract.filename,
        risk_level=risk_level,
        risk_score=analysis.risk_score,
        generated_at=generated_at,
        width=content_w,
    ))
    story.append(Spacer(1, 0.22 * inch))

    # ── 2. Risk bar ───────────────────────────────────────────────────────────
    story.append(RiskBar(analysis.risk_score, risk_level, width=content_w))
    story.append(Spacer(1, 0.28 * inch))

    # ── 3. Metadata row ───────────────────────────────────────────────────────
    parties_raw = analysis.parties or []
    parties_str = ", ".join(parties_raw) if isinstance(parties_raw, list) else str(parties_raw)
    confidence_str = f"{round((analysis.confidence or 0) * 100)}%" if analysis.confidence else "—"
    processing_str = f"{round((analysis.processing_ms or 0) / 1000, 1)}s" if analysis.processing_ms else "—"

    meta_items = [
        ("CONTRACT TYPE",   analysis.contract_type or "—"),
        ("GOVERNING LAW",   analysis.governing_law or "—"),
        ("PARTIES",         parties_str or "—"),
        ("ISSUES FOUND",    str(len(issues))),
        ("CONFIDENCE",      confidence_str),
        ("PROCESSED IN",    processing_str),
    ]

    meta_cells = []
    for label, value in meta_items:
        meta_cells.append([
            Paragraph(label, st["meta_label"]),
            Paragraph(value, st["meta_value"]),
        ])

    # 3 columns of 2 rows each
    col_w = content_w / 3 - 4
    meta_rows = [meta_cells[i:i+3] for i in range(0, len(meta_cells), 3)]
    flat_rows = []
    for row in meta_rows:
        label_row = [cell[0] for cell in row]
        value_row = [cell[1] for cell in row]
        flat_rows.append(label_row)
        flat_rows.append(value_row)

    meta_table = Table(flat_rows, colWidths=[col_w, col_w, col_w])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GREY_50),
        ("BOX",        (0, 0), (-1, -1), 0.5, GREY_200),
        ("INNERGRID",  (0, 0), (-1, -1), 0.5, GREY_200),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.32 * inch))

    # ── 4. Executive Summary ──────────────────────────────────────────────────
    story.append(SectionLabel("Executive Summary", width=content_w))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(analysis.summary or "No summary available.", st["section_body"]))
    story.append(Spacer(1, 0.32 * inch))

    # ── 5. Issues Summary Table ───────────────────────────────────────────────
    if issues:
        story.append(SectionLabel(f"Issues Overview  ({len(issues)} found)", width=content_w))
        story.append(Spacer(1, 0.1 * inch))

        tbl_header = [
            Paragraph("#",           st["table_header"]),
            Paragraph("Issue Type",  st["table_header"]),
            Paragraph("Clause",      st["table_header"]),
            Paragraph("Severity",    st["table_header"]),
        ]
        tbl_rows = [tbl_header]
        for i, issue in enumerate(issues, 1):
            tag = issue.get("tag", "")
            if tag.lower() in ("ip", "intellectual_property"):
                display_tag = "IP"
            else:
                display_tag = tag.replace("_", " ").title()

            sev = issue.get("severity", "medium").upper()
            sev_pal = RISK_PALETTE.get(sev, RISK_PALETTE["MEDIUM"])

            tbl_rows.append([
                Paragraph(str(i), st["table_cell"]),
                Paragraph(display_tag, st["table_cell"]),
                Paragraph(issue.get("clause_id", "—"), st["table_cell"]),
                Paragraph(sev, ParagraphStyle(
                    name=f"Sev{i}", fontSize=8, fontName="Helvetica-Bold",
                    textColor=sev_pal["fg"], leading=12,
                )),
            ])

        col_widths = [0.35 * inch, 2.4 * inch, 1.5 * inch, 1.0 * inch]
        summary_tbl = Table(tbl_rows, colWidths=col_widths, repeatRows=1)
        summary_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  BLACK),
            ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
            ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, 0),  8),
            ("ALIGN",         (0, 0), (-1, 0),  "CENTER"),
            ("BACKGROUND",    (0, 1), (-1, -1), WHITE),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, GREY_50]),
            ("GRID",          (0, 0), (-1, -1), 0.4, GREY_200),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(summary_tbl)
        story.append(Spacer(1, 0.36 * inch))

    # ── 6. Detailed Issues ────────────────────────────────────────────────────
    if issues:
        story.append(SectionLabel("Detailed Issue Analysis", width=content_w))
        story.append(Spacer(1, 0.14 * inch))

        for i, issue in enumerate(issues, 1):
            tag = issue.get("tag", "")
            if tag.lower() in ("ip", "intellectual_property"):
                display_tag = "IP"
            else:
                display_tag = tag.replace("_", " ").title()

            clause_id = issue.get("clause_id", "")
            explanation = issue.get("explanation", "No explanation provided.")
            suggestion = issue.get("suggested_edit", "No suggestion provided.")
            sev = issue.get("severity", "medium").upper()
            sev_pal = RISK_PALETTE.get(sev, RISK_PALETTE["MEDIUM"])

            # Issue header row: number + tag + clause + severity
            header_data = [[
                Paragraph(f"<b>#{i}</b>", ParagraphStyle(
                    name=f"IH{i}", fontSize=9, fontName="Helvetica-Bold",
                    textColor=GREY_400, leading=12)),
                Paragraph(f"<b>{display_tag}</b>", ParagraphStyle(
                    name=f"IT{i}", fontSize=9.5, fontName="Helvetica-Bold",
                    textColor=GREY_800, leading=12)),
                Paragraph(clause_id, ParagraphStyle(
                    name=f"IC{i}", fontSize=8.5, fontName="Helvetica",
                    textColor=GREY_400, leading=12)),
                Paragraph(sev, ParagraphStyle(
                    name=f"IS{i}", fontSize=8, fontName="Helvetica-Bold",
                    textColor=sev_pal["fg"], leading=12, alignment=2)),
            ]]
            hdr_tbl = Table(header_data, colWidths=[0.35*inch, 2.5*inch, 1.8*inch, 0.6*inch])
            hdr_tbl.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), GREY_100),
                ("TOPPADDING",    (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING",   (0, 0), (-1, -1), 10),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
                ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
                ("LINEBELOW",     (0, 0), (-1, -1), 0.5, GREY_200),
            ]))
            story.append(hdr_tbl)

            # Explanation
            body_data = [[Paragraph(explanation, st["issue_expl"])]]
            body_tbl = Table(body_data, colWidths=[content_w])
            body_tbl.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), WHITE),
                ("TOPPADDING",    (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING",   (0, 0), (-1, -1), 10),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
                ("BOX",           (0, 0), (-1, -1), 0.4, GREY_200),
            ]))
            story.append(body_tbl)

            # Suggested edit
            suggest_data = [
                [Paragraph("RECOMMENDED LANGUAGE", st["suggest_label"])],
                [Paragraph(suggestion, st["suggest_text"])],
            ]
            suggest_tbl = Table(suggest_data, colWidths=[content_w])
            suggest_tbl.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#f0f7ff")),
                ("TOPPADDING",    (0, 0), (0, 0),   8),
                ("BOTTOMPADDING", (0, 0), (0, 0),   4),
                ("TOPPADDING",    (0, 1), (0, 1),   0),
                ("BOTTOMPADDING", (0, 1), (0, 1),   10),
                ("LEFTPADDING",   (0, 0), (-1, -1), 0),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
                ("LINERIGHT",     (0, 0), (0, -1),  3, colors.HexColor("#3b82f6")),
                ("BOX",           (0, 0), (-1, -1), 0.4, GREY_200),
            ]))
            story.append(suggest_tbl)
            story.append(Spacer(1, 0.22 * inch))

    # ── 7. Disclaimer ─────────────────────────────────────────────────────────
    story.append(HRFlowable(width=content_w, thickness=0.5, color=GREY_200))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(
        "This report is generated by AI Contract Copilot for informational purposes only and does not constitute "
        "legal advice. Always consult a qualified attorney before acting on this analysis. "
        "AI Contract Copilot accepts no liability for decisions made based on this report.",
        st["disclaimer"]
    ))

    # ── Build ─────────────────────────────────────────────────────────────────
    def chrome(canvas_obj, doc):
        _page_chrome(canvas_obj, doc, risk_level, len(issues))

    doc.build(story, onFirstPage=chrome, onLaterPages=chrome)
    return buffer.getvalue()
