import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, X } from 'lucide-react';

export default function FreelancerFinance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user || user.role !== 'freelancer') {
        setError('Please log in as a freelancer');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/freelancer-finance/${user.id}`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || 'Failed to fetch finance data');
        setData(json);
      } catch (err) {
        console.error('Error fetching finance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="text-green-600" />
              Finance Overview
            </h1>
            {data?.summary && (
              <p className="text-gray-600 mt-2">
                Welcome back, {data.summary.freelancer_name}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black flex items-center gap-2"
          >
            <X size={18} /> Back
          </button>
        </div>

        {/* Summary Card */}
        {data?.summary && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-gray-500 text-sm">Total Earnings</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${Number(data.summary.total_payout).toFixed(2)}
                </p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Orders</h3>
                <p className="text-2xl font-bold">{data.summary.total_orders}</p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Last Payment</h3>
                <p className="text-2xl font-bold">
                  {data.summary.last_payment_date
                    ? new Date(data.summary.last_payment_date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.details.map((payment) => (
                  <tr key={payment.finID} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        Order #{payment.orderID}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.order_title || 'Untitled Order'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-green-600">
                        ${Number(payment.amount).toFixed(2)} {payment.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.paidAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {payment.progress}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}