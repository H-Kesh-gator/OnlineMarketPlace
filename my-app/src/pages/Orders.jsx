import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("⚠️ Please log in first.");
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUser);
    const freelancerId = user.id || user.user_id;

    try {
      const res = await fetch(`http://localhost:5000/freelancer-orders?freelancer_id=${freelancerId}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        console.error("❌ Failed to fetch orders:", data.error);
        setOrders([]);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow border-b border-gray-200 sticky top-0 z-50">
        <h2 className="text-xl font-semibold">📦 Your Orders</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-black flex items-center gap-1"
        >
          <X size={18} /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No accepted orders yet.</p>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => (
              <div
                key={o.log_id}
                onClick={() => navigate(`/order-progress/${o.log_id}`)}
                className="border rounded-xl bg-white shadow-sm hover:shadow-md transition p-6 cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{o.gig_title || `Listing #${o.listingID}`}</h3>
                    <p className="text-sm text-gray-600">👤 Client: <span className="font-medium">{o.client_name || `Client #${o.client_id}`}</span></p>
                    <p className="text-xs text-gray-500 mt-1">📧 {o.client_email || "No email provided"}</p>
                  </div>
                  <span className="text-sm text-gray-500">💰 ${o.price} | ⏱ {o.duration} days</span>
                </div>

                <p className="text-gray-700 text-sm mb-4">{o.description || "No description available."}</p>

                <p className="text-xs text-gray-500 mb-2">📅 Accepted At: {new Date(o.requested_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
