import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RedemptionRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { CreditCard, CheckCircle2, XCircle, Search, Filter, AlertCircle, DollarSign, Wallet, Check, Clock } from 'lucide-react';

export const AdminRedemptions: React.FC = () => {
  const { redemptions, processRedemption, settings } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [rejectingItem, setRejectingItem] = useState<RedemptionRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Account verification failed or anti-cheat check triggered.');

  const [payingItem, setPayingItem] = useState<RedemptionRequest | null>(null);
  const [payoutTrxRef, setPayoutTrxRef] = useState(`MFS${Date.now().toString().slice(-8)}`);

  const pointsToBdtRate = settings.pointsToBdtRate || 120;

  const filteredRedemptions = redemptions.filter((r) => {
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = r.userName.toLowerCase().includes(search.toLowerCase()) ||
                          r.payoutAddress.toLowerCase().includes(search.toLowerCase()) ||
                          r.id.toLowerCase().includes(search.toLowerCase()) ||
                          r.method.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = redemptions.filter((r) => r.status === 'pending').length;
  const approvedCount = redemptions.filter((r) => r.status === 'approved').length;
  const paidCount = redemptions.filter((r) => r.status === 'paid' || r.status === 'completed').length;

  const pendingBdt = redemptions
    .filter((r) => r.status === 'pending' || r.status === 'approved')
    .reduce((sum, r) => sum + (r.cashValueBdt || Math.round((r.pointsUsed / 1000) * pointsToBdtRate)), 0);

  const paidBdt = redemptions
    .filter((r) => r.status === 'paid' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.cashValueBdt || Math.round((r.pointsUsed / 1000) * pointsToBdtRate)), 0);

  const handleApprove = (item: RedemptionRequest) => {
    processRedemption(item.id, 'approve');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;
    processRedemption(rejectingItem.id, 'reject', { rejectionReason: rejectReason });
    setRejectingItem(null);
  };

  const handleMarkPaidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingItem) return;
    processRedemption(payingItem.id, 'paid', { transactionRef: payoutTrxRef });
    setPayingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Redemption Requests & Payout Queue</h1>
          <p className="text-xs text-slate-400">
            Admin disbursement control for bKash, Nagad, and Rocket mobile transactions.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Pending & Approved Payouts</p>
          <p className="text-2xl font-bold text-amber-400 font-mono">{pendingBdt.toLocaleString()} BDT</p>
          <p className="text-[11px] text-slate-500 font-mono">
            {pendingCount} pending review · {approvedCount} approved for payment
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Total Settled Disbursements</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{paidBdt.toLocaleString()} BDT</p>
          <p className="text-[11px] text-slate-500 font-mono">{paidCount} transactions marked as Paid</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Average MFS Fulfillment</p>
          <p className="text-2xl font-bold text-purple-400 font-mono">1.2 Hours</p>
          <p className="text-[11px] text-slate-500">Fast bKash / Nagad API turnaround</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by user, mobile number, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
          {(['all', 'pending', 'approved', 'paid', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded text-xs capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === s ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Mobile Account</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRedemptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No redemption requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRedemptions.map((r) => {
                  const bdtAmount = r.cashValueBdt || Math.round((r.pointsUsed / 1000) * pointsToBdtRate);
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-purple-400 font-medium">{r.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{r.userName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{r.userEmail}</p>
                      </td>
                      <td className="py-3 px-4 uppercase text-[11px] font-mono font-bold text-white">
                        {r.method}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div>{r.payoutAddress} {r.accountType && <span className="text-[10px] text-slate-500">({r.accountType})</span>}</div>
                        {r.whatsappNumber && (
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                            WA: {r.whatsappNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 tabular-nums">
                        -{r.pointsUsed.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums text-sm">
                        {bdtAmount} ৳
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {r.requestedAt}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
                        {r.transactionRef && (
                          <span className="block text-[10px] text-emerald-400 font-mono mt-0.5">
                            Trx: {r.transactionRef}
                          </span>
                        )}
                        {r.rejectionReason && (
                          <span className="block text-[10px] text-rose-400 font-mono mt-0.5 max-w-xs truncate">
                            {r.rejectionReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(r)}
                                className="px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setPayingItem(r);
                                  setPayoutTrxRef(`BK${Date.now().toString().slice(-8)}`);
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => setRejectingItem(r)}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {r.status === 'approved' && (
                            <>
                              <button
                                onClick={() => {
                                  setPayingItem(r);
                                  setPayoutTrxRef(`BK${Date.now().toString().slice(-8)}`);
                                }}
                                className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => setRejectingItem(r)}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(r.status === 'paid' || r.status === 'completed') && (
                            <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                              <Check className="h-3 w-3" /> Disbursed
                            </span>
                          )}

                          {r.status === 'rejected' && (
                            <span className="text-[11px] text-rose-400 font-mono">
                              Refunded
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingItem && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingItem(null)}
          title={`Reject Redemption Request: ${rejectingItem.id}`}
          subtitle={`Amount: ${rejectingItem.cashValueBdt || Math.round((rejectingItem.pointsUsed / 1000) * pointsToBdtRate)} BDT (${rejectingItem.pointsUsed.toLocaleString()} pts) for ${rejectingItem.userName}`}
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300">
              Note: Rejecting this request will automatically refund {rejectingItem.pointsUsed.toLocaleString()} points back to the user's spendable wallet.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Reason for Denial *</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
              >
                Confirm Rejection & Refund Points
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mark Paid Modal */}
      {payingItem && (
        <Modal
          isOpen={true}
          onClose={() => setPayingItem(null)}
          title={`Mark Payout as PAID: ${payingItem.id}`}
          subtitle={`Disbursing ${payingItem.cashValueBdt || Math.round((payingItem.pointsUsed / 1000) * pointsToBdtRate)} BDT to ${payingItem.payoutAddress} via ${payingItem.method.toUpperCase()}`}
        >
          <form onSubmit={handleMarkPaidSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
              Provide the official transaction reference (TrxID) from your bKash / Nagad / Rocket merchant/personal wallet.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Transaction Reference ID (TrxID) *</label>
              <input
                type="text"
                required
                value={payoutTrxRef}
                onChange={(e) => setPayoutTrxRef(e.target.value)}
                placeholder="e.g. BK9X19284A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingItem(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer"
              >
                Confirm & Mark as Paid
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
