"""
Cloudflare D1 Database Adapter
This module provides an interface to interact with Cloudflare D1 via HTTP API
"""
import httpx
from typing import Any, Optional
from app.core.config import settings


class CloudflareD1Client:
    """Client for interacting with Cloudflare D1 database via HTTP API"""
    
    def __init__(self):
        self.account_id = settings.cloudflare_account_id
        self.database_id = settings.cloudflare_d1_database_id
        self.api_token = settings.cloudflare_d1_api_token
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/d1/database/{self.database_id}"
    
    async def execute(self, sql: str, params: Optional[list] = None) -> dict[str, Any]:
        """
        Execute a SQL query on Cloudflare D1
        
        Args:
            sql: SQL query string
            params: Optional list of parameters for parameterized queries
            
        Returns:
            Response from Cloudflare D1 API
        """
        if not all([self.account_id, self.database_id, self.api_token]):
            raise ValueError("Cloudflare D1 credentials not configured")
        
        url = f"{self.base_url}/query"
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "sql": sql,
            "params": params or []
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
    
    async def query(self, sql: str, params: Optional[list] = None) -> list[dict]:
        """
        Execute a SELECT query and return results
        
        Args:
            sql: SELECT SQL query
            params: Optional query parameters
            
        Returns:
            List of result rows as dictionaries
        """
        result = await self.execute(sql, params)
        
        if result.get("success"):
            # Extract results from Cloudflare D1 response format
            results = result.get("result", [])
            if results and len(results) > 0:
                return results[0].get("results", [])
        
        return []
    
    async def execute_many(self, queries: list[tuple[str, Optional[list]]]) -> list[dict]:
        """
        Execute multiple queries in a batch
        
        Args:
            queries: List of (sql, params) tuples
            
        Returns:
            List of results for each query
        """
        if not all([self.account_id, self.database_id, self.api_token]):
            raise ValueError("Cloudflare D1 credentials not configured")
        
        url = f"{self.base_url}/query"
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        # Format queries for batch execution
        formatted_queries = [
            {"sql": sql, "params": params or []}
            for sql, params in queries
        ]
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url, 
                json=formatted_queries, 
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()


# Global D1 client instance
d1_client = CloudflareD1Client()
