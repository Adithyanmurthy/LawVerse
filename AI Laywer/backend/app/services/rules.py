from dataclasses import dataclass


@dataclass
class RuleHit:
    tag: str
    severity: str
    explanation: str
    suggested_edit: str


KEYWORD_RULES = [
    (
        "indemnify",
        "indemnification",
        "high",
        "This contract contains indemnification language that may require you to defend and pay for claims against the other party, even for issues outside your control. One-sided indemnity clauses can expose you to unlimited legal costs and damages.",
        'Replace with: "Each party shall indemnify the other party only for third-party claims directly resulting from such party\'s gross negligence or willful misconduct, up to the amount of fees paid under this Agreement in the twelve (12) months preceding the claim."'
    ),
    (
        "unlimited liability",
        "liability",
        "critical",
        "This contract has unlimited liability exposure, meaning you could be responsible for damages far exceeding the contract value. Industry standard is to cap liability at 1-2x annual fees. Without a cap, a single breach could bankrupt your business.",
        'Add: "IN NO EVENT SHALL EITHER PARTY\'S TOTAL LIABILITY EXCEED THE TOTAL FEES PAID OR PAYABLE UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM. This limitation shall not apply to breaches of confidentiality, intellectual property infringement, or gross negligence."'
    ),
    (
        "auto",  # Matches "auto-renew", "automatically renew", "automatic renewal"
        "renewal",
        "high",
        "This contract automatically renews without your explicit consent. Many businesses forget renewal dates and get locked into another term. You may be committed to another year of payments with no easy exit.",
        'Replace with: "This Agreement shall automatically renew for successive one (1) year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term."'
    ),
    (
        "compete",  # Matches "non-compete", "not compete", "shall not compete"
        "non_compete",
        "high",
        "This non-compete clause may prevent you from working in your field or industry. Overly broad non-competes are often unenforceable but still create legal risk and limit your career options. Courts typically require reasonable scope, geography, and duration.",
        'Replace with: "Receiving Party agrees not to engage in directly competing activities related to the specific subject matter of the disclosed Confidential Information for a period of one (1) year following termination of this Agreement, limited to the geographic area where such information is commercially exploited."'
    ),
    (
        "termination for convenience",
        "termination",
        "medium",
        "The other party can terminate this contract at any time without cause. This creates business uncertainty and means you could lose the relationship with minimal notice. You should negotiate for advance notice and payment for work completed.",
        'Replace with: "Either party may terminate this Agreement for convenience upon sixty (60) days\' prior written notice. Upon such termination, Client shall pay Provider for all work completed through the termination date, plus reasonable wind-down costs."'
    ),
    (
        "cayman islands",
        "jurisdiction",
        "high",
        "This contract specifies Cayman Islands as the governing jurisdiction. Litigating disputes in offshore jurisdictions is extremely expensive and difficult. You will face foreign legal systems, travel costs, and challenges enforcing judgments. Always negotiate for your home jurisdiction.",
        'This Agreement shall be governed by the laws of [YOUR HOME JURISDICTION]. Any disputes shall be resolved in the courts of [YOUR HOME CITY/STATE]. Replace the brackets with your country and city before sending to counterparty.'
    ),
    (
        "net 90",
        "payment",
        "medium",
        "This contract has Net-90 payment terms, meaning you wait 90 days to get paid after invoicing. This creates serious cash flow problems for most businesses. Industry standard is Net-30. You are essentially providing a 3-month interest-free loan, which can strain operations and working capital.",
        'Replace with: "Client shall pay all undisputed invoices within thirty (30) days of invoice date. Late payments shall accrue interest at 1.5% per month. Provider may suspend services if payment is more than fifteen (15) days overdue."'
    ),
    (
        "payment",
        "payment",
        "low",
        "This contract contains payment terms. Review carefully to ensure payment timing, late fees, and dispute resolution procedures are favorable.",
        'Ensure payment terms include: "Payment due within thirty (30) days of invoice date. Late payments accrue interest at 1.5% per month. Disputes must be raised within ten (10) days of invoice."'
    ),
    (
        "perpetual",
        "confidentiality",
        "high",  # Changed from high - perpetual is serious
        "This confidentiality obligation has no expiration date, meaning you must keep information secret forever. Standard NDAs use 3-5 year terms. Perpetual obligations are difficult to guarantee and create indefinite legal exposure.",
        'Replace with: "Confidentiality obligations shall expire three (3) years from the date of disclosure. Obligations do not apply to information that: (a) is or becomes publicly available through no fault of Receiving Party; (b) is independently developed; or (c) must be disclosed by law."'
    ),
    (
        "confidential",
        "confidentiality",
        "medium",
        "This contract contains confidentiality obligations. Ensure these obligations are mutual, time-bound, and include standard carve-outs for publicly available information and legally required disclosures.",
        'Add carve-outs: "Confidentiality obligations do not apply to information that: (a) is or becomes publicly available through no fault of Receiving Party; (b) was known prior to disclosure; (c) is independently developed; or (d) must be disclosed by law."'
    ),
    (
        "assignment",
        "assignment",
        "medium",
        "This contract allows the other party to assign or transfer the agreement to anyone without your consent. Your carefully negotiated deal could be transferred to a competitor, private equity firm, or unknown entity with different priorities.",
        'Replace with: "Neither party may assign this Agreement without the prior written consent of the other party, except that either party may assign to a successor in connection with a merger, acquisition, or sale of all or substantially all of its assets, provided written notice is given."'
    ),
    (
        "arbitration",
        "dispute",
        "medium",
        "This contract requires mandatory arbitration for all disputes. While arbitration can be faster than litigation, it limits your rights to appeal, discovery, and jury trial. Arbitration costs can also be high, and you may be required to split arbitrator fees.",
        'Replace with: "Any dispute shall be resolved through binding arbitration under the rules of the American Arbitration Association, with venue in [Your City]. Each party shall bear its own costs, and the prevailing party shall be entitled to recover reasonable attorneys\' fees. Either party may seek injunctive relief in court for breaches of confidentiality or intellectual property."'
    ),
    (
        "intellectual property",
        "ip",
        "critical",
        "This contract contains intellectual property assignment language that may transfer ownership of your work, inventions, or pre-existing IP to the other party. Broad IP clauses can give away valuable assets. You must clearly separate pre-existing IP from work product.",
        'Replace with: "Client shall own all work product created specifically for Client under this Agreement. Provider retains all rights to pre-existing materials, tools, and methodologies. Provider grants Client a perpetual, non-exclusive license to use Provider\'s pre-existing materials solely as incorporated in the deliverables."'
    ),
    (
        "warranty disclaimer",
        "warranty",
        "medium",
        "This contract disclaims all warranties, including implied warranties of merchantability and fitness for purpose. This means the other party makes no promises about quality or suitability. You have no recourse if deliverables are defective or don't meet your needs.",
        'Replace with: "Provider warrants that deliverables will be performed in a professional and workmanlike manner consistent with industry standards. Provider disclaims all other warranties, express or implied. Client\'s exclusive remedy for breach of warranty is re-performance of defective work within thirty (30) days of notice."'
    ),
]


def classify_clause(text: str) -> str:
    t = text.lower()
    for kw, tag, _sev, _exp, _edit in KEYWORD_RULES:
        if kw in t:
            return tag
    return "general"


def run_deterministic_rules(clauses: list[dict]) -> list[dict]:
    hits: list[dict] = []
    for clause in clauses:
        text = clause["text"].lower()
        for kw, tag, sev, explanation, suggested_edit in KEYWORD_RULES:
            if kw in text:
                # Rule-based detections get high confidence
                # Critical/high severity = high confidence
                # Medium/low severity = medium confidence
                confidence = "high" if sev in ["critical", "high"] else "medium"
                
                hits.append(
                    {
                        "clause_id": clause["id"],
                        "tag": tag,
                        "severity": sev,
                        "explanation": explanation,
                        "suggested_edit": suggested_edit,
                        "confidence": confidence,
                    }
                )
                break
    return hits


def risk_score_from_issues(issues: list[dict]) -> tuple[int, str, float]:
    if not issues:
        return 1, "LOW", 0.9
    
    # More aggressive weighting for severity
    weights = {"low": 1.5, "medium": 3, "high": 5, "critical": 7}
    total = sum(weights.get(issue.get("severity", "medium"), 3) for issue in issues)
    
    # Calculate base score
    base_score = total / max(1, len(issues))
    
    # Apply multiplier based on number of issues (more issues = exponentially higher)
    issue_count = len(issues)
    if issue_count >= 7:
        issue_multiplier = 2.0
    elif issue_count >= 5:
        issue_multiplier = 1.7
    elif issue_count >= 3:
        issue_multiplier = 1.4
    else:
        issue_multiplier = 1.2
    
    score = min(10, max(1, round(base_score * issue_multiplier)))
    
    # Ensure critical issues always push to HIGH or CRITICAL
    critical_count = sum(1 for i in issues if i.get("severity") == "critical")
    high_count = sum(1 for i in issues if i.get("severity") == "high")
    
    if critical_count >= 2 or (critical_count >= 1 and high_count >= 2):
        score = max(score, 9)  # Force CRITICAL
    elif critical_count >= 1 or high_count >= 3:
        score = max(score, 8)  # Force HIGH
    
    # More aggressive level thresholds
    if score <= 2:
        level = "LOW"
    elif score <= 5:
        level = "MEDIUM"
    elif score <= 7:
        level = "HIGH"
    else:
        level = "CRITICAL"
    
    # Vary confidence based on severity mix
    high_severity_count = sum(1 for i in issues if i.get("severity") in ["high", "critical"])
    confidence = min(0.95, 0.60 + (high_severity_count * 0.08))
    
    return score, level, confidence
