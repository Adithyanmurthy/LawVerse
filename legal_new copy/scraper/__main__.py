"""Run the scraper agent as a module: python -m scraper"""
import asyncio
from .agent import run_agent, show_status
import sys

if "--status" in sys.argv:
    show_status()
elif "--export" in sys.argv:
    from .agent import init_db, export_to_corpus
    init_db()
    export_to_corpus()
else:
    asyncio.run(run_agent())
