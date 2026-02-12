import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientReq() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClientRequests = async () => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      alert("⚠️ Please log in first.");
      navigate("/");
      return;
    }

    const user = JSON.parse(stored);
    const clientId = user.id || user.user_id;

    try {
      const res = await fetch(`http://localhost:5000/client-requests?client_id=${clientId}`);
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      } else {
        console.error("❌ Failed to fetch client requests:", data.error);
        setRequests([]);
      }
    } catch (err) {
      console.error("❌ Error fetching client requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow border-b border-gray-200 sticky top-0 z-50">
        <h2 className="text-xl font-semibold">📩 My Requests (Client)</h2>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black flex items-center gap-1">
          <X size={18} /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500">You have not created any requests yet.</p>
        ) : (
          <div className="space-y-5">
            {requests
              .filter((r) => !r.finished || r.finished === 'no')
              .map((r) => (
              <div key={r.log_id} className="border rounded-xl bg-white shadow-sm hover:shadow-md transition p-6">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{r.gig_title || `Listing #${r.listingID}`}</h3>
                    <p className="text-sm text-gray-600">👤 Freelancer: <span className="font-medium">{r.freelancer_name || `Freelancer #${r.freelancer_id}`}</span></p>
                    <p className="text-xs text-gray-500 mt-1">📧 {r.freelancer_email || "No email provided"}</p>
                  </div>
                  <span className="text-sm text-gray-500">💰 ${r.price} | ⏱ {r.duration} days</span>
                </div>

                <p className="text-gray-700 text-sm mb-4">{r.description || "No description available."}</p>

                <p className="text-xs text-gray-500 mb-2">📅 Requested At: {new Date(r.requested_at).toLocaleString()}</p>

                <div className="flex items-center gap-3">
                  {r.accepted_by == null ? (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">Pending</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Accepted</span>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={async () => {
                        // If not accepted yet, messaging isn't available
                        if (!r.accepted_by) {
                          alert("Cannot message until a freelancer accepts the request.");
                          return;
                        }

                        try {
                          const resp = await fetch(`http://localhost:5000/listing-request/${r.log_id}`);
                          const data = await resp.json();
                          if (!resp.ok) {
                            console.error('Failed to fetch listing request:', data.error || data);
                            alert('Unable to open messages (server error)');
                            return;
                          }

                          // server returns 'order' inside the listing request if an order exists
                          const order = data.order;
                          if (!order || !order.orderID) {
                            alert('Order not found yet. Messaging will be available once the order is created.');
                            return;
                          }

                          navigate({
                            pathname: '/messages',
                            search: `?order_id=${encodeURIComponent(order.orderID)}&freelancer_id=${encodeURIComponent(r.freelancer_id || r.user_id)}&client_id=${encodeURIComponent(r.client_id || r.requested_by)}`,
                          });
                        } catch (err) {
                          console.error('Error preparing messages:', err);
                          alert('Unexpected error preparing messages');
                        }
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Message
                    </button>

                    <button onClick={() => navigate('/client')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Back to Client</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
