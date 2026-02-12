import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Search13() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q");

  // read current user from localStorage (may be null)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  })();

  const handleClaim = async (requestId) => {
    if (!user || user.role !== "freelancer") return alert("Only freelancers can claim requests");

    try {
      const res = await fetch("http://localhost:5000/client-find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, freelancer_id: user.id }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Failed to claim request");

      // update UI locally
      setResults((prev) => prev.map((r) => (r.request_id === requestId ? { ...r, accepted_by: user.id } : r)));
      alert("Request claimed successfully");
    } catch (err) {
      console.error("❌ Claim error:", err);
      alert("Network error claiming request");
    }
  };

  useEffect(() => {
    if (!query) {
      navigate("/");
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/search-requests13?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("❌ Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Search Results for "{query}"</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black"
          >
            ← Back
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No requests found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((request) => (
              <div
                key={request.request_id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{request.title}</h2>
                    <p className="text-gray-600">
                      Posted by {request.client_name || "Anonymous"}
                    </p>
                  </div>
                  <div className="text-xl font-semibold text-green-600">
                    ${request.price}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {request.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {request.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>⏱ Duration: {request.duration} days</div>
                  <div>📅 Posted {new Date(request.created_at).toLocaleDateString()}</div>
                </div>
                <div className="mt-4">
                  {!request.accepted_by && user?.role === "freelancer" ? (
                    <button
                      onClick={() => handleClaim(request.request_id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Claim Request
                    </button>
                  ) : request.accepted_by ? (
                    <div className="text-sm text-gray-600 mt-2">Claimed by freelancer #{request.accepted_by}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}