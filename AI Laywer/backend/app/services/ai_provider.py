import json
import os

import httpx
from groq import Groq

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover
    genai = None

from app.core.config import settings

ANALYSIS_SYSTEM_PROMPT = """
You are a legal contract analysis expert. You will receive contract clauses that have been flagged by rules.

For EACH flagged issue, you MUST provide:

1. SPECIFIC explanation (3-4 sentences):
   - Quote the EXACT problematic wording from the clause
   - Explain EXACTLY what is wrong with THIS specific contract
   - Compare to industry standards with concrete numbers/timeframes
   - State the real-world consequences for the user
   
2. READY-TO-PASTE suggested edit:
   - Provide complete legal wording that can be copied directly into the contract
   - Use proper legal formatting and terminology
   - Make it specific to the issue, not generic advice
   - NEVER use bracket placeholders like [insert X] or [Your Y]
   - NEVER suggest specific jurisdictions like "California" or "London" - use neutral placeholders like [YOUR HOME JURISDICTION]
   - If something needs customization, use phrases like "the non-drafting party's preferred jurisdiction" or "negotiated based on business needs"
   
3. Confidence level:
   - "high" if the issue is clearly problematic and rule-based
   - "medium" if it requires interpretation or context
   - "low" if it's borderline or depends on business context

CRITICAL RULES:
- Always reference the actual clause text
- Never give generic advice like "should be time-bound" - instead say "This clause has no expiration date. Standard NDAs use 3-5 years."
- Never use bracket placeholders - use descriptive text instead
- NEVER suggest specific cities, states, or countries as examples (no "California", "London", "New York", etc.)
- Keep explanations focused and avoid repetition

Respond ONLY in valid JSON format:
{
  "issues": [
    {
      "clause_id": "clause_X",
      "tag": "confidentiality",
      "severity": "high",
      "explanation": "Specific detailed explanation referencing actual text...",
      "suggested_edit": "Complete ready-to-paste legal wording without any bracket placeholders...",
      "confidence": "high"
    }
  ],
  "summary": "Brief overall assessment",
  "contract_type": "NDA/Service Agreement/etc"
}
""".strip()

groq_client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None
gemini_model = None
if settings.gemini_api_key and genai:
    genai.configure(api_key=settings.gemini_api_key)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")


async def call_groq(prompt: str, system: str = ANALYSIS_SYSTEM_PROMPT) -> str:
    if not groq_client:
        raise RuntimeError("Groq key missing")
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1200,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content or "{}"


async def call_gemini(prompt: str, system: str = ANALYSIS_SYSTEM_PROMPT) -> str:
    if not gemini_model:
        raise RuntimeError("Gemini key missing")
    full_prompt = f"{system}\n\nUser request:\n{prompt}\n\nRespond with JSON only."
    response = gemini_model.generate_content(
        full_prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.1,
            max_output_tokens=1200,
            response_mime_type="application/json",
        ),
    )
    return response.text or "{}"


async def call_cloudflare(prompt: str, system: str = ANALYSIS_SYSTEM_PROMPT) -> str:
    if not settings.cf_account_id or not settings.cf_api_token:
        raise RuntimeError("Cloudflare credentials missing")
    url = f"https://api.cloudflare.com/client/v4/accounts/{settings.cf_account_id}/ai/run/@cf/meta/llama-3.1-8b-instruct"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={"Authorization": f"Bearer {settings.cf_api_token}"},
            json={
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
                "max_tokens": 1200,
                "temperature": 0.1,
            },
            timeout=30.0,
        )
    response.raise_for_status()
    data = response.json()
    return data["result"]["response"]


def _mock_result(prompt: str) -> dict:
    return {
        "contract_type": "General Service Agreement",
        "summary": "Automatic local fallback summary because API keys are not configured.",
        "overall_risk": "MEDIUM",
        "issues": [],
        "_provider_used": "mock",
        "_note": "Set GROQ/GEMINI/CF keys in .env to enable live provider analysis.",
        "_prompt_length": len(prompt),
    }


async def analyze_with_ai(prompt: str) -> dict:
    providers = [("Groq", call_groq), ("Gemini", call_gemini), ("Cloudflare", call_cloudflare)]
    last_error: Exception | None = None
    for name, fn in providers:
        try:
            raw = await fn(prompt)
            clean = raw.strip()
            if clean.startswith("```"):
                clean = clean.strip("`")
                clean = clean.replace("json", "", 1).strip()
            parsed = json.loads(clean)
            parsed["_provider_used"] = name
            return parsed
        except Exception as exc:
            last_error = exc
            continue
    result = _mock_result(prompt)
    if last_error:
        result["_fallback_error"] = str(last_error)
    return result
