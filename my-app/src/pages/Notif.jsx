import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Notif() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch all gigs requested from clients (pending only)
  const fetchRequestedGigs = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("⚠️ Please log in first.");
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUser);
    const freelancerId = user.id || user.user_id;

    try {
      console.log("📡 Fetching freelancer requests for ID:", freelancerId);
      const res = await fetch(
        `http://localhost:5000/freelancer-requests?freelancer_id=${freelancerId}`
      );
      const data = await res.json();

      console.log("📥 Received data:", data);

      if (res.ok) {
        // ✅ Filter pending requests only
        const filtered = data.filter((req) => req.accepted_by === null);
        setRequests(filtered);
      } else {
        console.error("❌ Failed to fetch:", data.error);
        setRequests([]);
      }
    } catch (err) {
      console.error("❌ Error fetching requested gigs:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestedGigs();
  }, []);

  // ✅ Accept a request
  const handleAccept = async (listingID, client_id, log_id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const freelancer_id = user.id || user.user_id;

    try {
      const res = await fetch("http://localhost:5000/accept-listing-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_id,
          freelancer_id
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Request accepted successfully!");
        // Remove accepted request from current list
        setRequests((prev) => prev.filter((req) => req.log_id !== log_id));
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error("❌ Error accepting request:", err);
      alert("Server error while accepting request.");
    }
  };

  // ✅ Reject a request
  const handleReject = async (log_id) => {
    try {
      const res = await fetch("http://localhost:5000/reject-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_id }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("🚫 Request rejected.");
        // remove by log_id
        setRequests((prev) => prev.filter((req) => req.log_id !== log_id));
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error("❌ Error rejecting request:", err);
      alert("Server error while rejecting request.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* ===== Top Bar ===== */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow border-b border-gray-200 sticky top-0 z-50">
        <h2 className="text-xl font-semibold">🔔 Pending Gig Requests</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-black flex items-center gap-1"
        >
          <X size={18} /> Back
        </button>
      </div>

      {/* ===== Requests Section ===== */}
      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500">
            No pending gig requests right now.
          </p>
        ) : (
          <div className="space-y-5">
            {requests.map((req) => (
              <div
                key={req.log_id}
                className="border rounded-xl bg-white shadow-sm hover:shadow-md transition p-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {req.gig_title || `Listing #${req.listingID}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      👤 Requested by:{" "}
                      <span className="font-medium">
                        {req.client_name || `Client #${req.client_id}`}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📧 {req.client_email || "No email provided"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    💰 ${req.price} | ⏱ {req.duration} days
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-4">
                  {req.description || "No description available."}
                </p>

                <p className="text-xs text-gray-500 mb-2">
                  📅 Requested At: {new Date(req.requested_at).toLocaleString()}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(req.listingID, req.client_id, req.log_id)}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.log_id)}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
