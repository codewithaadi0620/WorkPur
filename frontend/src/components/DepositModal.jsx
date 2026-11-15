import React, { useState } from 'react';
import { paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { X, DollarSign, Wallet, ArrowDownCircle } from 'lucide-react';

export default function DepositModal({ isOpen, onClose, onSuccess }) {
  const { refreshUser } = useAuth();
  const [amount, setAmount] = useState(1000);
  const [description, setDescription] = useState('Simulated project funding deposit');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const presets = [500, 1000, 2500, 5000];

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error('Deposit amount must be greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      await paymentsApi.deposit({
        amount: parseFloat(amount),
        description,
      });
      toast.success(`Successfully deposited $${parseFloat(amount).toFixed(2)} into simulated wallet!`);
      await refreshUser?.();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Deposit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Add Simulated Funds</h3>
              <p className="text-xs text-slate-500">Test Escrow & Milestone Payments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDeposit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Preset Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    amount === preset
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Enter Custom Amount ($)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-800 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Note / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <ArrowDownCircle className="w-4 h-4" />
              {submitting ? 'Processing...' : `Deposit $${parseFloat(amount || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
