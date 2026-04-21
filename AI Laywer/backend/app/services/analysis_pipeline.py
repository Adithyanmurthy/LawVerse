import json
import re
import time
from collections import Counter

from app.services.ai_provider import analyze_with_ai
from app.services.extraction import extract_text, split_clauses
from app.services.rules import classify_clause, risk_score_from_issues, run_deterministic_rules


def infer_contract_type(text: str) -> str:
    t = text.lower()
    if "non-disclosure" in t or "nda" in t:
        return "NDA"
    if "employment" in t:
        return "Employment Agreement"
    if "service" in t and "agreement" in t:
        return "Service Agreement"
    return "General Contract"


def infer_governing_law(text: str) -> str:
    """Extract governing law/jurisdiction from contract text"""
    # Try multiple patterns in order of specificity
    patterns = [
        # Most specific patterns first
        r'governed by (?:and construed in accordance with )?(?:the )?laws of (?:the )?([A-Za-z\s]+?)(?:\.|,|;|\n)',
        r'construed in accordance with (?:the )?laws of (?:the )?([A-Za-z\s]+?)(?:\.|,|;|\n)',
        r'subject to (?:the )?laws of (?:the )?([A-Za-z\s]+?)(?:\.|,|;|\n)',
        r'under (?:the )?laws of (?:the )?([A-Za-z\s]+?)(?:\.|,|;|\n)',
        # Less specific patterns
        r'laws of (?:the )?([A-Za-z\s]+?)(?:\.|,|;|\n)',
        r'jurisdiction of (?:the )?([A-Za-z\s]+?)(?:\.|,|;|\n)',
        # Catch "Cayman Islands" or similar specific jurisdictions
        r'(?:Cayman Islands|British Virgin Islands|Delaware|California|New York|Singapore|Hong Kong)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
        if match:
            if match.lastindex:  # Has capture group
                extracted = match.group(1).strip()
            else:  # Direct match (like "Cayman Islands")
                extracted = match.group(0).strip()
            
            # Clean up common artifacts
            extracted = extracted.replace('\n', ' ').strip()
            
            # Minimum length check - reject partial matches like "the"
            if len(extracted) > 3 and len(extracted) < 100:
                # Remove trailing "and" or "or" if present
                extracted = re.sub(r'\s+(and|or)$', '', extracted, flags=re.IGNORECASE)
                return extracted.strip()
    
    return ""


def infer_parties(text: str) -> list[str]:
    """Extract party names from contract"""
    parties = []
    
    # Try to find parties in common contract patterns
    patterns = [
        r'between\s+([A-Z][A-Za-z\s&,\.]+?)\s+(?:and|&)\s+([A-Z][A-Za-z\s&,\.]+?)(?:\s+\(|,|\.|$)',
        r'by and between\s+([A-Z][A-Za-z\s&,\.]+?)\s+(?:and|&)\s+([A-Z][A-Za-z\s&,\.]+?)(?:\s+\(|,|\.|$)',
        r'(?:Party A|First Party|Disclosing Party):\s*([A-Z][A-Za-z\s&,\.]+?)(?:\n|$)',
        r'(?:Party B|Second Party|Receiving Party):\s*([A-Z][A-Za-z\s&,\.]+?)(?:\n|$)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
        if match:
            if match.lastindex and match.lastindex >= 2:
                # Pattern with two parties
                party1 = match.group(1).strip()
                party2 = match.group(2).strip()
                if len(party1) > 2 and len(party2) > 2:
                    return [party1, party2]
            elif match.lastindex == 1:
                # Single party pattern
                party = match.group(1).strip()
                if len(party) > 2 and party not in parties:
                    parties.append(party)
    
    # Fallback: first 2 non-empty lines if no pattern matched
    if not parties:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return lines[:2] if lines else []
    
    return parties[:2]


async def analyze_contract_file(path: str) -> dict:
    started = time.perf_counter()
    text = extract_text(path)
    clauses = split_clauses(text)

    for clause in clauses:
        clause["tag"] = classify_clause(clause["text"])

    rule_issues = run_deterministic_rules(clauses)
    score, level, confidence = risk_score_from_issues(rule_issues)

    prompt_payload = {
        "contract_type_guess": infer_contract_type(text),
        "rule_issues": rule_issues,
        "clauses": clauses[:30],
    }
    ai = await analyze_with_ai(json.dumps(prompt_payload))
    ai_issues = ai.get("issues", []) if isinstance(ai, dict) else []
    merged_issues = rule_issues + [issue for issue in ai_issues if isinstance(issue, dict)]

    # Deduplicate issues by clause_id + tag (case-insensitive)
    # This prevents both rules engine and LLM from creating duplicate issues
    def deduplicate_issues(issues: list[dict]) -> list[dict]:
        seen: dict[str, dict] = {}
        for issue in issues:
            clause_id = issue.get("clause_id", "unknown")
            tag = issue.get("tag", "general").lower().replace("_", "").replace("-", "")
            key = f"{clause_id}_{tag}"
            
            if key not in seen:
                seen[key] = issue
            else:
                # If duplicate, keep the one with higher severity or better explanation
                existing = seen[key]
                severities = ["low", "medium", "high", "critical"]
                
                existing_sev = severities.index(existing.get("severity", "medium"))
                new_sev = severities.index(issue.get("severity", "medium"))
                
                # Keep the higher severity one, or the one with longer explanation
                if new_sev > existing_sev:
                    seen[key] = issue
                elif new_sev == existing_sev and len(issue.get("explanation", "")) > len(existing.get("explanation", "")):
                    seen[key] = issue
        
        return list(seen.values())
    
    deduped = deduplicate_issues(merged_issues)

    if deduped:
        score, level, confidence = risk_score_from_issues(deduped)
    
    # Apply severity floor based on overall risk level
    # If contract is CRITICAL/HIGH, no individual issue should be LOW
    # CRITICAL contracts should have mostly HIGH/CRITICAL issues
    severity_floor = None
    if level == "CRITICAL":
        severity_floor = "high"  # CRITICAL contracts: minimum HIGH severity
    elif level == "HIGH":
        severity_floor = "medium"  # HIGH contracts: minimum MEDIUM severity
    
    if severity_floor:
        severities = ["low", "medium", "high", "critical"]
        floor_index = severities.index(severity_floor)
        
        for issue in deduped:
            current_sev = issue.get("severity", "medium")
            current_index = severities.index(current_sev)
            if current_index < floor_index:
                issue["severity"] = severity_floor
            
            # Clean up suggested edits
            suggested_edit = issue.get("suggested_edit", "")
            
            # Remove "Replace with:" prefix
            if suggested_edit.startswith("Replace with: "):
                suggested_edit = suggested_edit[14:]
            elif suggested_edit.startswith('Replace with: "'):
                suggested_edit = suggested_edit[15:-1] if suggested_edit.endswith('"') else suggested_edit[15:]
            
            # Strip leading/trailing quotes (single or double)
            suggested_edit = suggested_edit.strip().strip('"\'').strip()
            
            issue["suggested_edit"] = suggested_edit

    tag_counts = Counter(c["tag"] for c in clauses)
    summary = ai.get("summary") if isinstance(ai, dict) else ""
    if not summary:
        summary = f"Processed {len(clauses)} clauses. Major categories: {', '.join(tag_counts.keys()) or 'general'}."

    processing_ms = int((time.perf_counter() - started) * 1000)
    return {
        "text": text,
        "clauses": clauses,
        "issues": deduped,
        "risk_score": score,
        "risk_level": level,
        "confidence": confidence,
        "summary": summary,
        "contract_type": ai.get("contract_type") or infer_contract_type(text),
        "parties": infer_parties(text),
        "governing_law": infer_governing_law(text),
        "provider_used": ai.get("_provider_used", "rules_only") if isinstance(ai, dict) else "rules_only",
        "processing_ms": processing_ms,
    }
