import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../../services/api';
import {
  Wallet,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FreelancerWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Withdraw modal state
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getWallet();
      if (res.success) {
        setWallet(res.data);
      }
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid positive withdrawal amount.');
      return;
    }
    if (amount > parseFloat(wallet?.available_balance || 0)) {
      toast.error('Insufficient available balance.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await paymentsApi.withdraw({
        amount,
        notes: 'Simulated payout withdrawal',
      });
      if (res.success) {
        toast.success(`Successfully simulated withdrawal of $${amount.toFixed(2)}!`);
        setIsWithdrawOpen(false);
        setWithdrawAmount('');
        fetchWallet();
      }
    } catch (err) {
      toast.error(err.message || 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const available = parseFloat(wallet?.available_balance || 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Freelancer Wallet & Earnings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track payments received via atomic PostgreSQL stored procedures and simulate payouts.
          </p>
        </div>

        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4" />
          Simulate Withdrawal
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
            Available Balance
          </p>
          <h2 className="text-3xl font-black mt-2 tracking-tight">
            ${available.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-indigo-300 mt-2">Ready for withdrawal simulation</p>
          <div className="absolute right-4 bottom-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Transactions
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">
              {wallet?.wallet_transactions?.length || 0}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Immutable ledger records
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ledger Integrity
            </p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span className="text-base font-bold text-slate-800">Verified ACID</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Protected by database constraints & row locks
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
          <p className="text-xs text-slate-500">
            Full record of all escrow releases, deposits, and simulated withdrawals.
          </p>
        </div>

        {wallet?.wallet_transactions?.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No transaction records found in this wallet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wallet?.wallet_transactions?.map((tx) => {
                  const isCredit = tx.type === 'PAYMENT_RELEASE' || tx.type === 'DEPOSIT';
                  let typeBadge = 'bg-slate-100 text-slate-700';
                  if (tx.type === 'PAYMENT_RELEASE') typeBadge = 'bg-emerald-50 text-emerald-700';
                  if (tx.type === 'WITHDRAWAL') typeBadge = 'bg-blue-50 text-blue-700';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {tx.id.substring(0, 10)}...
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeBadge}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={isCredit ? 'text-emerald-600' : 'text-slate-800'}>
                          {isCredit ? '+' : '-'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulated Withdrawal Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Simulate Payout Withdrawal</h3>
            <p className="text-xs text-slate-500 mt-1">
              Transfer funds from your available balance to your simulated external bank account.
            </p>

            <form onSubmit={handleWithdraw} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Withdrawal Amount ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    max={available}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Max available: ${available.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || available <= 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
