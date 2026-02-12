import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function ClientFinder() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaimed = async () => {
      const stored = localStorage.getItem("user");
      if (!stored) {
        alert("Please log in first");
        navigate("/");
        return;
      }

      const user = JSON.parse(stored);
      const clientId = user.id || user.user_id;

      try {
        // fetch listing_requests_log entries for this client
        const resLog = await fetch(`http://localhost:5000/client-requests?client_id=${clientId}`);
        const logData = resLog.ok ? await resLog.json() : [];

        // fetch requests table entries for this client
        const resReq = await fetch(`http://localhost:5000/requests?user_id=${clientId}`);
        const reqData = resReq.ok ? await resReq.json() : [];

        // filter accepted entries
        const acceptedFromLog = Array.isArray(logData)
          ? logData.filter((r) => r.accepted_by != null).map((r) => ({
              id: r.log_id,
              source: "log",
              title: r.gig_title || `Listing #${r.listingID}`,
              description: r.description,
              price: r.price,
              duration: r.duration,
              accepted_by: r.accepted_by,
              freelancer_name: r.freelancer_name,
              freelancer_email: r.freelancer_email,
              requested_at: r.requested_at,
            }))
          : [];

        const acceptedFromReq = Array.isArray(reqData)
          ? reqData.filter((r) => r.accepted_by != null).map((r) => ({
              id: `req-${r.request_id}`,
              source: "requests",
              title: r.title,
              description: r.description,
              price: r.price_range || r.price || 0,
              duration: r.duration,
              accepted_by: r.accepted_by,
              confirmed: r.confirmed,
              freelancer_name: null,
              freelancer_email: null,
              requested_at: r.created_at,
              request_id: r.request_id,
            }))
          : [];

        // combine and sort by requested_at descending
        const combined = [...acceptedFromLog, ...acceptedFromReq].sort((a, b) => {
          const da = new Date(a.requested_at || 0).getTime();
          const db = new Date(b.requested_at || 0).getTime();
          return db - da;
        });

        setItems(combined);
      } catch (err) {
        console.error("Error fetching claimed requests:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimed();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">📥 Claimed Requests</h1>
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black flex items-center gap-2">
            <X size={18} /> Back
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">No claimed requests found.</p>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{it.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{it.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Requested at: {it.requested_at ? new Date(it.requested_at).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="text-sm text-gray-700 text-right">
                    <div>💰 ${it.price}</div>
                    <div>⏱ {it.duration} days</div>
                    <div className="mt-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">Claimed</div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  {it.freelancer_name ? (
                    <>
                      <div><strong>Freelancer:</strong> {it.freelancer_name}</div>
                      <div className="text-xs text-gray-500">{it.freelancer_email}</div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">Freelancer ID: {it.accepted_by}</div>
                  )}
                </div>
                {/* Client actions: accept/reject only for requests sourced from `requests` table */}
                {it.source === 'requests' && (
                  <div className="mt-4 flex gap-2">
                    {it.confirmed ? (
                      <div className="text-sm text-green-700">You have confirmed this freelancer.</div>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            const stored = localStorage.getItem('user');
                            if (!stored) return alert('Please log in');
                            const user = JSON.parse(stored);
                            try {
                              const res = await fetch('http://localhost:5000/client-confirm', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ request_id: it.request_id || it.id.replace('req-', ''), client_id: user.id }),
                              });
                              const data = await res.json();
                              if (!res.ok) return alert(data.error || 'Failed to confirm');
                              // update UI
                              setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, confirmed: user.id } : p));
                              alert('Freelancer confirmed.');
                            } catch (err) {
                              console.error('Error confirming:', err);
                              alert('Network error confirming');
                            }
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md"
                        >
                          Accept
                        </button>

                        <button
                          onClick={async () => {
                            const stored = localStorage.getItem('user');
                            if (!stored) return alert('Please log in');
                            const user = JSON.parse(stored);
                            try {
                              const res = await fetch('http://localhost:5000/client-reject', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ request_id: it.request_id || it.id.replace('req-', ''), client_id: user.id }),
                              });
                              const data = await res.json();
                              if (!res.ok) return alert(data.error || 'Failed to reject');
                              // update UI: remove or mark as cleared
                              setItems((prev) => prev.filter((p) => p.id !== it.id));
                              alert('Freelancer rejected and claim cleared.');
                            } catch (err) {
                              console.error('Error rejecting:', err);
                              alert('Network error rejecting');
                            }
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded-md"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
