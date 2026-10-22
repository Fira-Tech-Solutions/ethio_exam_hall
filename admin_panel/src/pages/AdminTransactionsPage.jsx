import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await adminApi.getTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async (tx) => {
    const confirmed = window.confirm(`Verify and approve transaction ${tx.reference_code} for ETB ${tx.amount}? This will activate the candidate's subscription entitlement.`);
    if (!confirmed) return;

    setVerifyingId(tx.id);
    try {
      await adminApi.verifyTransaction(tx.id);
      alert(`Transaction ${tx.reference_code} verified and completed!`);
      await loadTransactions();
    } catch (err) {
      alert(err.message || 'Failed to verify transaction.');
    } finally {
      setVerifyingId(null);
    }
  };

  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalCompleted = completedTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalPending = pendingTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const filteredTransactions = transactions.filter(t => {
    const matchProvider =
      selectedProvider === 'ALL' ||
      t.provider === selectedProvider;

    const matchStatus =
      selectedStatus === 'ALL' ||
      t.status === selectedStatus;

    return matchProvider && matchStatus;
  });

  return (
    <div className="flex flex-col gap-space-lg p-gutter">
      
      {/* Title & Summary */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">payments</span>
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
              Financial Transactions Ledger
            </h1>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Live payment records processed through Ethiopian payment rails (Telebirr, CBE Birr, Chapa).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 text-right">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Settled Volume</span>
            <span className="font-mono text-headline-sm font-black text-secondary">
              ETB {totalCompleted.toFixed(2)}
            </span>
          </div>

          <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 text-right">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Pending Volume</span>
            <span className="font-mono text-headline-sm font-black text-amber-700">
              ETB {totalPending.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="font-bold text-primary text-xs uppercase tracking-wider">
          Ledger Filter Controls
        </span>

        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Payment Providers</option>
            <option value="telebirr">Telebirr Quick-Pay</option>
            <option value="cbe_birr">CBE Birr Connect</option>
            <option value="chapa">Chapa Gateway</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="completed">Completed (Settled)</option>
            <option value="pending">Pending Verification</option>
            <option value="failed">Failed / Cancelled</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/40 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Candidate Scholar</th>
                <th className="py-3 px-4">Plan & Provider Rail</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Phone / Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    Loading financial ledger...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-secondary">
                      {tx.reference_code}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-primary block leading-tight">{tx.candidate_name || 'Scholar'}</span>
                      <span className="text-[11px] text-on-surface-variant">{tx.candidate_email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-on-surface block leading-tight">{tx.plan_name}</span>
                      <span className="font-mono text-[10px] font-bold uppercase text-secondary bg-surface-container px-1.5 py-0.2 rounded mt-0.5 inline-block">
                        {tx.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {tx.currency} {parseFloat(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-on-surface-variant">
                      {tx.phone_or_account || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tx.status === 'completed'
                          ? 'bg-surface-container text-tertiary-fixed-dim'
                          : tx.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-error-container text-error'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tx.status === 'pending' && (
                          <button
                            onClick={() => handleVerify(tx)}
                            disabled={verifyingId === tx.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                            type="button"
                          >
                            {verifyingId === tx.id ? 'Verifying...' : 'Verify Bank Slip'}
                          </button>
                        )}
                        <span className="font-mono text-[11px] text-on-surface-variant">
                          {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
