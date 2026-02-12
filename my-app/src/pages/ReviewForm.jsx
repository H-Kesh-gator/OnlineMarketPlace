import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReviewForm() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderID = params.get('orderID');
  const freelancerID = params.get('freelancerID');

  const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = stored ? JSON.parse(stored) : null;
  const clientID = user ? (user.id || user.user_id) : null;

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!orderID || !freelancerID || !clientID) {
      alert('Missing order, freelancer, or client info.');
      return;
    }
    if (!stars || stars < 1 || stars > 5) {
      alert('Please provide a star rating between 1 and 5.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/create-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: Number(orderID),
          clientID: Number(clientID),
          freelancerID: Number(freelancerID),
          stars: Number(stars),
          comment: comment || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to submit review:', data);
        alert(data.error || 'Failed to submit review');
        return;
      }

      alert('Thanks — your review was submitted.');
      navigate('/client-orders');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Unexpected error submitting review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Leave a review</h2>
        <div className="mb-4 text-sm text-gray-600">Order ID: {orderID} — Freelancer ID: {freelancerID}</div>

        <label className="block mb-2 text-sm font-medium">Stars</label>
        <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="border p-2 rounded mb-4 w-28">
          {[5,4,3,2,1].map((s) => (
            <option key={s} value={s}>{s} ⭐</option>
          ))}
        </select>

        <label className="block mb-2 text-sm font-medium">Comment (optional)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={6} className="w-full border rounded p-2 mb-4" />

        <div className="flex items-center gap-3">
          <button onClick={submit} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded">
            {saving ? 'Saving...' : 'Submit Review'}
          </button>
          <button onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
