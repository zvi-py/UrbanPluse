"""
backend/test_gemini.py
Unit tests for Gemini AI Urban Intelligence synthesis router.
"""
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_gemini_status():
    res = client.get("/gemini/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "model" in data
    assert "cross_agent_synthesis" in data["supported_features"]


def test_gemini_briefing():
    res = client.get("/gemini/briefing")
    assert res.status_code == 200
    data = res.json()
    assert "briefing" in data
    assert len(data["briefing"]) > 50
    assert "Belagavi" in data["briefing"] or "transit" in data["briefing"].lower()


def test_gemini_chat_traffic_query():
    res = client.post("/gemini/chat", json={"message": "What is the traffic congestion like near Market Area and what is the detour?"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert "Traffic Intelligence" in data["citations"]
    assert "Khade Bazar" in data["response"] or "NH48" in data["response"] or "delay" in data["response"].lower()


def test_gemini_chat_events_query():
    res = client.post("/gemini/chat", json={"message": "What campus fests and gatherings are happening this weekend?"})
    assert res.status_code == 200
    data = res.json()
    assert "Event Intelligence" in data["citations"]
    assert "KLE" in data["response"] or "Festival" in data["response"] or "Hackathon" in data["response"]
