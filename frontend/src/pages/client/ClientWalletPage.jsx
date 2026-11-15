import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import DepositModal from '../../components/DepositModal';
import { useAuth } from '../../context/AuthContext';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Layers
} from 'lucide-react';

export default function ClientWalletPage() {
  const { refreshUser } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getWallet();
      if (res.success) {
        setWalletData(res.data);
        refreshUser();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 text-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Loading wallet ledger...</p>
        </div>
      </div>
    );
  }

  const wallet = walletData?.wallet || {};
  const transactions = walletData?.transactions || [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-5xl overflow-y-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Simulated Wallet</h1>
            <p className="text-xs text-slate-500 mt-1">
              Simulated payment ledger ensuring ACID transactional integrity and escrow funding
            </p>
          </div>
          <button
            onClick={() => setDepositModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit Simulated Funds</span>
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Available Balance
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                ${parseFloat(wallet.available_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-300 pt-1">
                Liquid simulated funds ready to fund contract milestones into escrow
              </p>
            </div>
            <Wallet className="w-32 h-32 text-indigo-500/10 absolute -right-4 -bottom-4" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Reserved in Escrow
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                ${parseFloat(wallet.reserved_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 pt-1 flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4" /> Protected by PostgreSQL row-level locks
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Ledger Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Financial Transaction Ledger</h2>
          <p className="text-xs text-slate-500">Immutable chronological record of all wallet events</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No financial transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                            tx.transaction_type === 'DEPOSIT'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tx.transaction_type === 'ESCROW_FUND'
                              ? 'bg-blue-50 text-blue-700'
                              : tx.transaction_type === 'PAYMENT_RELEASE'
                              ? 'bg-violet-50 text-violet-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tx.transaction_type === 'DEPOSIT' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSuccess={fetchWallet}
      />
    </div>
  );
}
