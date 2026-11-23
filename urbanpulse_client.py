"""
UrbanPulse Community Client SDK.

A lightweight, zero-boilerplate Python client library that other UrbanPulse backend
services and campus agents can import to interact with the Student Community Agent.

Usage example:
    from urbanpulse_client import UrbanPulseCommunityClient

    client = UrbanPulseCommunityClient(base_url="http://127.0.0.1:8000")
    
    # 1. Fetch student's home feed recommendations
    feed = client.get_recommendation_feed(student_id=1)
    print(feed["recommended_peers"])
    print(feed["recommended_communities"])
"""
from typing import Dict, Any, List, Optional
import httpx


class UrbanPulseCommunityClient:
    """
    Python client for communicating with the UrbanPulse Student Community & Connectivity Agent.
    """

    def __init__(self, base_url: str = "http://127.0.0.1:8000", timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.api_v1 = f"{self.base_url}/api/v1"
        self.timeout = timeout

    # --------------------------------------------------------------------------
    # Health & System
    # --------------------------------------------------------------------------
    def get_status(self) -> Dict[str, Any]:
        """Check agent health and status."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/status")
            res.raise_for_status()
            return res.json()

    # --------------------------------------------------------------------------
    # Student Profiles & Matching
    # --------------------------------------------------------------------------
    def register_student(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new student profile."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.post(f"{self.api_v1}/students/", json=student_data)
            res.raise_for_status()
            return res.json()

    def get_student(self, student_id: int) -> Dict[str, Any]:
        """Fetch a student profile by ID."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/students/{student_id}")
            res.raise_for_status()
            return res.json()

    def list_students(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """List all registered students."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/students/?skip={skip}&limit={limit}")
            res.raise_for_status()
            return res.json()

    def update_skills(self, student_id: int, skills: List[str]) -> Dict[str, Any]:
        """Update a student's skills list."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.put(f"{self.api_v1}/students/{student_id}/skills", json={"skills": skills})
            res.raise_for_status()
            return res.json()

    def update_interests(self, student_id: int, interests: List[str]) -> Dict[str, Any]:
        """Update a student's interests list."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.put(f"{self.api_v1}/students/{student_id}/interests", json={"interests": interests})
            res.raise_for_status()
            return res.json()

    def get_peer_matches(self, student_id: int, limit: int = 10) -> Dict[str, Any]:
        """Get ranked peer matches based on Jaccard similarity."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/students/{student_id}/matches?limit={limit}")
            res.raise_for_status()
            return res.json()

    # --------------------------------------------------------------------------
    # Study Groups & Communities
    # --------------------------------------------------------------------------
    def create_community(self, community_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new study group or community."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.post(f"{self.api_v1}/communities/", json=community_data)
            res.raise_for_status()
            return res.json()

    def get_community(self, community_id: int) -> Dict[str, Any]:
        """Fetch community details and full member roster."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/communities/{community_id}")
            res.raise_for_status()
            return res.json()

    def list_communities(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Browse and search communities."""
        params = {}
        if search:
            params["search"] = search
        if category:
            params["category"] = category
        if tag:
            params["tag"] = tag

        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/communities/", params=params)
            res.raise_for_status()
            return res.json()

    def join_community(self, community_id: int, student_id: int) -> Dict[str, Any]:
        """Enroll a student in a community."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.post(
                f"{self.api_v1}/communities/{community_id}/join",
                json={"student_id": student_id}
            )
            res.raise_for_status()
            return res.json()

    def get_student_communities(self, student_id: int) -> List[Dict[str, Any]]:
        """Get all communities joined by a student."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/students/{student_id}/communities")
            res.raise_for_status()
            return res.json()

    # --------------------------------------------------------------------------
    # Unified Recommendation Engine
    # --------------------------------------------------------------------------
    def get_recommendation_feed(
        self,
        student_id: int,
        peer_limit: int = 5,
        community_limit: int = 5
    ) -> Dict[str, Any]:
        """
        Unified student dashboard recommendation feed.
        Returns both top recommended peers and top recommended communities.
        """
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(
                f"{self.api_v1}/recommendations/feed/{student_id}",
                params={"peer_limit": peer_limit, "community_limit": community_limit}
            )
            res.raise_for_status()
            return res.json()

    # --------------------------------------------------------------------------
    # Workshops & Hackathon Opportunities
    # --------------------------------------------------------------------------
    def list_opportunities(
        self,
        search: Optional[str] = None,
        opportunity_type: Optional[str] = None,
        tag: Optional[str] = None,
        upcoming_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Browse hackathons, workshops, and opportunities."""
        params = {"upcoming_only": upcoming_only}
        if search:
            params["search"] = search
        if opportunity_type:
            params["opportunity_type"] = opportunity_type
        if tag:
            params["tag"] = tag

        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/opportunities/", params=params)
            res.raise_for_status()
            return res.json()

    def bookmark_opportunity(self, opportunity_id: int, student_id: int) -> Dict[str, Any]:
        """Save/bookmark an opportunity for a student."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.post(
                f"{self.api_v1}/opportunities/{opportunity_id}/bookmark",
                json={"student_id": student_id}
            )
            res.raise_for_status()
            return res.json()

    def get_student_bookmarks(self, student_id: int) -> List[Dict[str, Any]]:
        """Get all opportunities bookmarked by a student."""
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.api_v1}/students/{student_id}/bookmarks")
            res.raise_for_status()
            return res.json()


# Direct module execution test
if __name__ == "__main__":
    client = UrbanPulseCommunityClient()
    try:
        status = client.get_status()
        print("Connected to UrbanPulse Community Agent successfully!")
        print("Status:", status)
    except Exception as e:
        print("Agent is not running. Start with: uvicorn app.main:app --reload")
        print("Error details:", e)

