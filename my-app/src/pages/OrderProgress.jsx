import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, SkipBack, SkipForward } from "lucide-react";

export default function OrderProcessing() {
  const { log_id } = useParams();
  const navigate = useNavigate();

  // Progress state (0-100)
  const [progress, setProgress] = useState(() => {
    // try to restore from localStorage so it's easier to demo
    try {
      const saved = localStorage.getItem(`order-progress-${log_id}`);
      return saved ? Number(saved) : 30;
    } catch (e) {
      return 30;
    }
  });

  const [status, setStatus] = useState("In Progress");
  // simple running flag (timer removed but some handlers still toggle it)
  const [running, setRunning] = useState(false);

  // (timer removed) simple simulated work time was removed per request

  // Real order details fetched from backend (populates sidebar and header)
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [saving, setSaving] = useState(false);
  const savedInitialRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(`order-progress-${log_id}`, String(progress));
  }, [progress, log_id]);

  // timer has been removed

  // Fetch order details by log_id when component mounts or log_id changes
  useEffect(() => {
    if (!log_id) return;
    let cancelled = false;
    setLoadingOrder(true);
    setOrderError(null);

    fetch(`http://localhost:5000/listing-request/${log_id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error loading order:", err);
        setOrderError(err.message || "Failed to load order");
      })
      .finally(() => {
        if (!cancelled) setLoadingOrder(false);
      });

    return () => {
      cancelled = true;
    };
  }, [log_id]);

  // timer formatting removed

  const setTo = (value) => setProgress(Math.max(0, Math.min(100, value)));

  const advance = (amt = 10) => setTo(progress + amt);
  const regress = (amt = 10) => setTo(progress - amt);

  const markComplete = () => {
    setTo(100);
    setStatus("Completed");
    setRunning(false);
    // persist completion to server
    saveProgress(100);
  };

  const reset = () => {
    setTo(0);
    setStatus("Not Started");
    // setElapsedSec removed
    setRunning(false);
  };

  // Save progress to the database
  const saveProgress = async (newProgress) => {
    // Debug the order object
    console.log("Order object:", order);
    
    // Get orderID from either nested order object or directly
      const orderID = order.order.orderID ? order.order.orderID : order.log_id || log_id;
    
    if (!orderID) {
      console.error("No order ID available in order object:", order);
      return;
    }

    setSaving(true);
    try {
      console.log(`Updating progress to ${newProgress}% for order ${orderID}`);
      const res = await fetch(`http://localhost:5000/orders/${orderID}/progress`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          progress: Math.min(100, Math.max(0, newProgress)),
          finished: newProgress === 100 ? 'yes' : 'no'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error("Failed to update progress");
      }

      console.log(`✅ Progress updated: ${newProgress}%`);
    } catch (err) {
      console.error("Failed to save progress:", err);
      alert("Could not save progress. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Automatic saving removed: progress is saved only when the user clicks "Save Progress"
  // (keep savedInitialRef in case it's used elsewhere)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start text-gray-800 p-6">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-black p-2 rounded-md"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-xl font-semibold">🚀 Order Processing</h2>
              <p className="text-sm text-gray-600">{order && order.title ? `${order.title} — Order #${log_id}` : `Order #${log_id || "—"} • Freelancer view`}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm ${status === "Completed" ? 'bg-green-100 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main progress area */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
                <div
                  className={`h-5 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
                <div>Progress: <strong>{progress}%</strong></div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {[0, 25, 50, 75, 100].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTo(m)}
                    className={`px-3 py-1 rounded-md text-sm border ${m === 100 ? 'border-green-500' : 'border-gray-200'} hover:bg-gray-100`}
                  >
                    {m}%
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => advance(10)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  <SkipForward size={16} /> Advance
                </button>

                <button onClick={() => regress(10)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                  <SkipBack size={16} /> Regress
                </button>

                {/* Save progress only when clicked - do not auto-save */}
                <button
                  onClick={() => saveProgress(progress)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>

                <button onClick={markComplete} className="ml-auto px-4 py-2 rounded-lg bg-green-800 text-white hover:bg-green-900">
                  Mark Complete
                </button>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Manual progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setTo(Number(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Notes & status updates</h4>
              <p className="text-sm text-gray-600">Use this area to keep quick notes for the client and track small updates. These are pseudo and stored only in the UI for the demo.</p>
              <textarea placeholder="Add a quick note..." className="w-full mt-3 p-2 border rounded-md text-sm" rows={3}></textarea>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-white">
              <h5 className="font-semibold">Order details</h5>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                {loadingOrder ? (
                  <div>Loading...</div>
                ) : orderError ? (
                  <div className="text-red-500">{orderError}</div>
                ) : order ? (
                  <>
                    <div><strong>Order ID:</strong> {order.order && order.order.orderID ? order.order.orderID : order.log_id || log_id}</div>
                    <div><strong>Title:</strong> {order.title || '—'}</div>
                    <div><strong>Freelancer:</strong> {order.freelancer_name || order.user_id || '—'}</div>
                    <div><strong>Client:</strong> {order.client_name || order.requested_by || '—'}</div>
                    <div><strong>Price:</strong> ${order.price || (order.order && order.order.price) || '—'}</div>
                    <div><strong>Due (days):</strong> {order.duration || (order.order && order.order.duration) || '—'}</div>
                  </>
                ) : (
                  <>
                    <div><strong>Order ID:</strong> {log_id || '—'}</div>
                    <div><strong>Client:</strong> Jane Doe</div>
                    <div><strong>Price:</strong> $120</div>
                    <div><strong>Due:</strong> 3 days</div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-white">
              <h5 className="font-semibold mb-2">Status</h5>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-md p-2 text-sm">
                <option>Not Started</option>
                <option>In Progress</option>
                <option>On Hold</option>
                <option>Needs Revision</option>
                <option>Completed</option>
              </select>
              <div className="mt-3 text-xs text-gray-500">Change status to keep the client informed.</div>
            </div>

            <div className="p-4 border rounded-lg bg-white">
              <h5 className="font-semibold mb-2">Quick actions</h5>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={async () => {
                      // prefer a real orderID if present
                      const ord = order && order.order ? order.order : null;
                      const orderID = ord && ord.orderID ? ord.orderID : null;

                      // fallback: if there is no real order, messaging isn't available yet
                      if (!orderID) {
                        alert('Messaging is available once an order has been created for this request.');
                        return;
                      }

                      const freelancer_id = (ord && ord.accepted_by) || (order && order.user_id) || '';
                      const client_id = (ord && ord.requested_by) || (order && order.requested_by) || '';

                      navigate({
                        pathname: '/messages',
                        search: `?order_id=${encodeURIComponent(orderID)}&freelancer_id=${encodeURIComponent(freelancer_id)}&client_id=${encodeURIComponent(client_id)}`,
                      });
                    }}
                    className="text-left px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100"
                  >
                    Message Client
                  </button>

                  <button onClick={reset} className="text-left px-3 py-2 rounded-md bg-red-50 hover:bg-red-100">Reset Progress</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
