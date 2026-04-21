"""
Glaw Platform — Unified Billing & Pricing
==========================================
Single billing system for the combined platform.
Uses Razorpay (already configured in AI Lawyer project).
"""

# ── PRICING STRUCTURE ──

PLANS = {
    "free": {
        "name": "Free",
        "price_monthly": 0,
        "price_yearly": 0,
        "currency": "INR",
        "features": {
            # LCET Features
            "searches_per_day": 5,
            "timeline_access": True,
            "smi_calculations": 3,  # per day
            "case_library_browse": True,
            "case_full_text": False,  # only snippets
            "alerts": 1,  # max 1 concept alert
            "export_pdf": False,
            # Contract Features
            "contract_analyses": 2,  # lifetime
            "contract_report_pdf": False,
        },
        "description": "Get started with basic legal research",
    },
    "pro": {
        "name": "Professional",
        "price_monthly": 499,  # ₹499/month
        "price_yearly": 4999,  # ₹4,999/year (save ₹989)
        "currency": "INR",
        "razorpay_plan_id_monthly": None,  # Set after creating in Razorpay dashboard
        "razorpay_plan_id_yearly": None,
        "features": {
            # LCET Features
            "searches_per_day": 100,
            "timeline_access": True,
            "smi_calculations": 50,  # per day
            "case_library_browse": True,
            "case_full_text": True,
            "alerts": 10,
            "export_pdf": True,
            # Contract Features
            "contract_analyses": 25,  # per month
            "contract_report_pdf": True,
        },
        "description": "For practicing lawyers and legal researchers",
    },
    "firm": {
        "name": "Law Firm",
        "price_monthly": 2999,  # ₹2,999/month
        "price_yearly": 29999,  # ₹29,999/year (save ₹5,989)
        "currency": "INR",
        "razorpay_plan_id_monthly": None,
        "razorpay_plan_id_yearly": None,
        "features": {
            # LCET Features
            "searches_per_day": -1,  # unlimited
            "timeline_access": True,
            "smi_calculations": -1,  # unlimited
            "case_library_browse": True,
            "case_full_text": True,
            "alerts": -1,  # unlimited
            "export_pdf": True,
            # Contract Features
            "contract_analyses": 200,  # per month
            "contract_report_pdf": True,
            # Firm extras
            "team_members": 5,
            "api_access": True,
            "priority_support": True,
        },
        "description": "For law firms and legal teams",
    },
}


# ── FEATURE ACCESS MATRIX ──
# What each tier gets (for display on pricing page)

PRICING_DISPLAY = [
    {
        "category": "Legal Research",
        "features": [
            {"name": "Semantic Search", "free": "5/day", "pro": "100/day", "firm": "Unlimited"},
            {"name": "Concept Timeline", "free": "✓", "pro": "✓", "firm": "✓"},
            {"name": "SMI Analysis", "free": "3/day", "pro": "50/day", "firm": "Unlimited"},
            {"name": "Case Library (Browse)", "free": "✓", "pro": "✓", "firm": "✓"},
            {"name": "Case Full Text", "free": "✗", "pro": "✓", "firm": "✓"},
            {"name": "Drift Alerts", "free": "1 alert", "pro": "10 alerts", "firm": "Unlimited"},
            {"name": "PDF Export", "free": "✗", "pro": "✓", "firm": "✓"},
        ],
    },
    {
        "category": "Contract Analysis",
        "features": [
            {"name": "AI Contract Review", "free": "2 total", "pro": "25/month", "firm": "200/month"},
            {"name": "Risk Scoring", "free": "✓", "pro": "✓", "firm": "✓"},
            {"name": "Clause Detection", "free": "✓", "pro": "✓", "firm": "✓"},
            {"name": "Suggested Edits", "free": "✗", "pro": "✓", "firm": "✓"},
            {"name": "PDF Report Download", "free": "✗", "pro": "✓", "firm": "✓"},
        ],
    },
    {
        "category": "Platform",
        "features": [
            {"name": "Team Members", "free": "1", "pro": "1", "firm": "5"},
            {"name": "API Access", "free": "✗", "pro": "✗", "firm": "✓"},
            {"name": "Priority Support", "free": "✗", "pro": "Email", "firm": "✓ Priority"},
        ],
    },
]
