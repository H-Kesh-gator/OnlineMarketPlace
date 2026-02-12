import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function FreelancerClaimed() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await fetch('http://localhost:5000/requests-log');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          // Only show items that belong to the currently-logged freelancer
          const stored = localStorage.getItem('user');
          let currentFreelancerId = null;
          try {
            const parsed = stored ? JSON.parse(stored) : null;
            if (parsed && parsed.role === 'freelancer') currentFreelancerId = parsed.id || parsed.user_id || null;
          } catch (e) {
            currentFreelancerId = null;
          }

          if (currentFreelancerId) {
            const filtered = data.filter((row) => Number(row.rq_accepted_by) === Number(currentFreelancerId));
            setItems(filtered);
          } else {
            // Not a freelancer (or not logged in) — show empty list
            setItems([]);
          }
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching requests_log:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">📝 Claimed (requests_log)</h1>
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black flex items-center gap-2">
            <X size={18} /> Back
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">No claimed requests logged yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.rq_log_id} className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{it.rq_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{it.rq_description}</p>
                    <p className="text-xs text-gray-500 mt-2">Logged at: {it.rq_created_at ? new Date(it.rq_created_at).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="text-sm text-gray-700 text-right">
                    <div>💰 ${it.rq_price}</div>
                    <div>⏱ {it.rq_duration} days</div>
                    <div className="mt-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">Logged</div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  <div><strong>Request ID:</strong> {it.rq_requestID}</div>
                  <div><strong>Owner (client_id):</strong> {it.rq_requested_by}</div>
                  <div><strong>Accepted by (freelancer_id):</strong> {it.rq_accepted_by}</div>
                  <div className="mt-2"><strong>Skills:</strong> {it.rq_selectedSkills}</div>
                  <div className="mt-2"><strong>Tags:</strong> {it.rq_tags}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      Status: <span className={it.finished ? "text-green-600 font-medium" : "text-gray-600"}>
                        {it.finished ? "Finished" : "In Progress"}
                      </span>
                    </div>
                    {!it.finished && (
                      <button
                        onClick={async () => {
                          const user = JSON.parse(localStorage.getItem('user') || 'null');
                          if (!user || !user.id) return alert('Please log in first');
                          
                          try {
                            const res = await fetch('http://localhost:5000/requests-log/finish', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                rq_log_id: it.rq_log_id,
                                freelancer_id: user.id
                              })
                            });
                            
                            const data = await res.json();
                            if (res.ok) {
                              // Update UI locally
                              setItems(prev => prev.map(item => 
                                item.rq_log_id === it.rq_log_id 
                                  ? { ...item, finished: 1 }
                                  : item
                              ));
                              alert('Request marked as finished!');
                            } else {
                              alert(data.error || 'Failed to mark as finished');
                            }
                          } catch (err) {
                            console.error('Error marking as finished:', err);
                            alert('Network error');
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        Mark as Finished
                      </button>
                    )}
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
