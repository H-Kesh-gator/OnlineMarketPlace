from fastapi.testclient import TestClient
from app import core

client = TestClient(core.app)

def test_health():
    assert client.get("/health").json() == {"status": "ok"}

def test_matching_order(monkeypatch):
    class FakeEncoder:
        def encode(self, texts, normalize_embeddings=True):
            mapping = {"Python developer": [1., 0.]}
            return [mapping.get(t, [1., 0.] if "Python" in t else [0., 1.]) for t in texts]
    monkeypatch.setattr(core, "encoder", lambda: FakeEncoder())
    jobs = [
        {"id": "1", "title": "Design", "description": "Figma", "skills": []},
        {"id": "2", "title": "Python", "description": "Backend", "skills": ["Python"]},
    ]
    response = client.post("/match", json={"profile": "Python developer", "jobs": jobs})
    assert response.status_code == 200
    assert response.json()["matches"][0]["job"]["id"] == "2"

def test_resume_text_upload():
    response = client.post("/resume/upload", files={"file": ("cv.txt", b"Python and React", "text/plain")})
    assert response.status_code == 200
    assert "React" in response.json()["resume_text"]

def test_reject_unsupported_file():
    response = client.post("/resume/upload", files={"file": ("cv.png", b"image", "image/png")})
    assert response.status_code == 415

def test_proposal_requires_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = client.post("/proposal", json={
        "profile": "Python developer",
        "job": {"id": "1", "title": "API", "description": "Build an API"}
    })
    assert response.status_code == 503

def test_chunk_overlap():
    result = core.chunks(["a" * 1200])
    assert len(result) == 2
    assert result[1]["start"] == 750
