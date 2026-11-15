import csv
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from backend.app.core.config import settings

def generate_pdf_report(
    title: str,
    report_type: str,
    date_start: str,
    date_end: str,
    metrics: Dict[str, Any],
    top_categories: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]],
    output_filename: str
) -> Path:
    """Generates an executive-grade PDF food waste report using ReportLab."""
    pdf_path = settings.REPORTS_DIR / output_filename
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom palette
    primary_color = colors.HexColor("#315B43")
    secondary_color = colors.HexColor("#78956A")
    dark_text = colors.HexColor("#202820")
    light_bg = colors.HexColor("#F7F8F5")
    border_color = colors.HexColor("#E5E9E2")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=primary_color,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#737C72"),
        spaceAfter=14
    )
    h2_style = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=dark_text,
        leading=13
    )
    meta_style = ParagraphStyle(
        "Meta",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        textColor=colors.HexColor("#737C72")
    )

    story = []

    # Header Banner
    story.append(Paragraph("FOODWISE AI — Institutional Intelligence Report", title_style))
    story.append(Paragraph(f"<b>Type:</b> {report_type} | <b>Period:</b> {date_start} to {date_end} | <b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=14))

    # Executive Summary
    story.append(Paragraph("Executive Summary", h2_style))
    avg_waste = metrics.get("average_waste_percentage", 0.0)
    total_plates = metrics.get("total_plates_analyzed", 0)
    summary_text = (
        f"During the auditing period of {date_start} to {date_end}, a total of <b>{total_plates} plate photographs</b> "
        f"were analyzed using YOLOv11 instance segmentation. The mean Food Waste Area Index across all sessions was "
        f"<b>{avg_waste:.1f}%</b> of usable plate surface area. This report synthesizes recorded food category distributions, "
        f"identifies core leftover sources, and presents targeted interventions in alignment with UN SDG 12.3 targets."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 10))

    # KPI Summary Table
    story.append(Paragraph("Key Performance Indicators (KPIs)", h2_style))
    kpi_data = [
        ["Total Plates Analyzed", f"{total_plates:,}"],
        ["Mean Food Waste Area Index", f"{avg_waste:.1f}%"],
        ["Top Leftover Category", str(metrics.get("most_frequently_wasted_food", "Cereals and Starches")).title()],
        ["Estimated Waste Reduction Trend", f"{metrics.get('waste_reduction_trend', -4.2):+.1f}% vs baseline"]
    ]
    t_kpi = Table(kpi_data, colWidths=[240, 290])
    t_kpi.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('TEXTCOLOR', (0, 0), (0, -1), dark_text),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
    ]))
    story.append(t_kpi)
    story.append(Spacer(1, 14))

    # Category Breakdown Table
    story.append(Paragraph("Food Category Analysis", h2_style))
    cat_rows = [["Food Category", "Audited Scans", "Avg Waste Index", "% Total Leftovers"]]
    for cat in top_categories[:6]:
        cat_rows.append([
            cat.get("category", "General"),
            str(cat.get("detection_count", 0)),
            f"{cat.get('average_waste_percentage', 0.0):.1f}%",
            f"{cat.get('percentage_of_total_detections', 0.0):.1f}%"
        ])
    t_cat = Table(cat_rows, colWidths=[180, 100, 120, 130])
    t_cat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_cat)
    story.append(Spacer(1, 14))

    # Key Recommendations
    if recommendations:
        story.append(Paragraph("Targeted Operational Recommendations", h2_style))
        for idx, rec in enumerate(recommendations[:3], 1):
            rec_p = Paragraph(f"<b>{idx}. [{rec.get('impact_priority', 'Medium')} Priority] {rec.get('title')}</b><br/>{rec.get('description')}<br/><i>Evidence: {rec.get('supporting_metric')}</i>", body_style)
            story.append(rec_p)
            story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))
    # Scientific Limitation Notice
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceAfter=8))
    disclaimer = (
        "<b>Scientific Methodology & Limitations:</b> Calculations reflect 2D pixel surface area coverage on plates "
        "(Ferreira et al., MDPI Applied Sciences 2025). The Food Waste Area Index measures visible plate coverage "
        "and does not directly quantify 3D volume or physical food mass in grams. SDG 12.3 indicator alignment is "
        "provisional based on institutional surface coverage monitoring."
    )
    story.append(Paragraph(disclaimer, meta_style))

    doc.build(story)
    return pdf_path

def generate_csv_report(
    logs: List[Dict[str, Any]],
    output_filename: str
) -> Path:
    """Exports raw detection logs to standard CSV format."""
    csv_path = settings.REPORTS_DIR / output_filename
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Detection ID", "Timestamp", "Image Filename", "Waste Area Index (%)",
            "Food Area (px)", "Plate Area (px)", "Garbage Area (px)", "Usable Area (px)",
            "Detected Classes", "Broad Categories", "Model Version", "Cafeteria ID"
        ])
        for log in logs:
            writer.writerow([
                log.get("id"),
                log.get("timestamp"),
                log.get("image_filename"),
                log.get("waste_percentage"),
                log.get("food_area"),
                log.get("plate_area"),
                log.get("garbage_area"),
                log.get("usable_plate_area"),
                ", ".join(log.get("detected_classes", []) if isinstance(log.get("detected_classes"), list) else [str(log.get("detected_classes"))]),
                ", ".join(log.get("categories", []) if isinstance(log.get("categories"), list) else [str(log.get("categories"))]),
                log.get("model_version"),
                log.get("cafeteria_id")
            ])
    return csv_path
