import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// messages page: reads query params ?order_id=&freelancer_id=&client_id=
export default function MessagesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const order_id = params.get("order_id");
  const freelancer_id = params.get("freelancer_id");
  const client_id = params.get("client_id");

  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order_id || !freelancer_id || !client_id) {
      setError("order_id, freelancer_id and client_id are required in the URL");
      setLoading(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        // check if a message_logs record exists for this order
        const res = await fetch(`http://localhost:5000/message-logs?order_id=${order_id}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();

        let record = null;
        if (Array.isArray(data) && data.length > 0) {
          record = data[0];
        } else {
          // initialize file + db row
          const initRes = await fetch(`http://localhost:5000/init-message-file`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id, freelancer_id, client_id }),
          });
          if (!initRes.ok) throw new Error(`Server returned ${initRes.status}`);
          const initData = await initRes.json();
          record = { msg_id: initData.msg_id, file_path: initData.file_path };
        }

        setLog(record);

        if (record && record.msg_id) {
          const mres = await fetch(`http://localhost:5000/messages/${record.msg_id}`);
          if (mres.ok) {
            const mdata = await mres.json();
            setMessages(mdata || []);
          }
        }
      } catch (err) {
        console.error("Messages init error:", err);
        setError(err.message || "Failed to initialize messages");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [order_id, freelancer_id, client_id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!log || !log.msg_id) return;
    setSending(true);
    try {
      // Determine the current logged-in user (if any) and set sender/receiver accordingly
      let currentUserId = null;
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          currentUserId = String(parsed.id || parsed.user_id || parsed.userId || parsed.userId);
        }
      } catch (e) {
        // ignore parse errors and fallback to freelancer_id
      }

      const sender_id = currentUserId || String(freelancer_id);
      const receiver_id = sender_id === String(freelancer_id) ? String(client_id) : String(freelancer_id);

      // optimistic UI - use computed sender/receiver
      setMessages((m) => [...m, { sender_id, receiver_id, message: newMessage }]);

      const res = await fetch(`http://localhost:5000/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id, freelancer_id, client_id, sender_id, receiver_id, message: newMessage }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      // refresh from server
      const mres = await fetch(`http://localhost:5000/messages/${log.msg_id}`);
      if (mres.ok) {
        const mdata = await mres.json();
        setMessages(mdata || []);
      }

      setNewMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600">Back</button>
          <h3 className="text-lg font-semibold">Messages</h3>
          <div />
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading messages…</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto mb-4 space-y-2">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">No messages yet.</div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`p-2 rounded ${m.sender_id === String(freelancer_id) ? 'bg-green-50 self-end' : 'bg-gray-100'}`}>
                    <div className="text-xs text-gray-500 mb-1">{m.sender_id}</div>
                    <div className="text-sm text-gray-800">{m.message}</div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button disabled={sending} onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
