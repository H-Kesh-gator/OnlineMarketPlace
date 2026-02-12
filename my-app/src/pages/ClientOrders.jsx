import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClientOrders = async () => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      alert("⚠️ Please log in first.");
      navigate("/");
      return;
    }

    const user = JSON.parse(stored);
    const clientId = user.id || user.user_id;

    try {
      const res = await fetch(`http://localhost:5000/client-orders?client_id=${clientId}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        console.error("❌ Failed to fetch client orders:", data.error);
        setOrders([]);
      }
    } catch (err) {
      console.error("❌ Error fetching client orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow border-b border-gray-200 sticky top-0 z-50">
        <h2 className="text-xl font-semibold">📦 My Orders</h2>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black flex items-center gap-1">
          <X size={18} /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => (
              <div key={o.orderID} className="border rounded-xl bg-white shadow-sm hover:shadow-md transition p-6">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{o.gig_title || `Listing #${o.listingID}`}</h3>
                    <p className="text-sm text-gray-600">👤 Freelancer: <span className="font-medium">{o.freelancer_name || `Freelancer #${o.accepted_by}`}</span></p>
                    <p className="text-xs text-gray-500 mt-1">📧 {o.freelancer_email || "No email provided"}</p>
                  </div>
                  <span className="text-sm text-gray-500">💰 ${o.gig_price} | ⏱ {o.duration} days</span>
                </div>

                <p className="text-gray-700 text-sm mb-4">{o.gig_description || "No description available."}</p>

                <p className="text-xs text-gray-500 mb-2">📅 Created At: {new Date(o.createdAt).toLocaleString()}</p>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 bg-green-500"
                      style={{ width: `${Math.min(Math.max(Number(o.progress || 0), 0), 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-600 mt-1">{Math.min(Math.max(Number(o.progress || 0), 0), 100)}% complete</div>
                </div>

                <div className="flex gap-3 mt-4">
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!o.orderID) {
                          alert("No order id available for messaging yet.");
                          return;
                        }
                        navigate({
                          pathname: "/messages",
                          search: `?order_id=${encodeURIComponent(o.orderID)}&freelancer_id=${encodeURIComponent(o.accepted_by)}&client_id=${encodeURIComponent(o.requested_by)}`,
                        });
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Message
                    </button>
                    {/* Show Leave Review when order is complete */}
                    {Number(o.progress || 0) >= 100 && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate({
                            pathname: '/review',
                            search: `?orderID=${encodeURIComponent(o.orderID)}&freelancerID=${encodeURIComponent(o.accepted_by)}`,
                          });
                        }}
                        className="bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Leave Review
                      </button>
                    )}
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
