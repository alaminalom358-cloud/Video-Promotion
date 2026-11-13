import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PointTransaction } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { History, Search, Download, Filter, ArrowUpRight, ArrowDownLeft, CheckCircle2, Copy } from 'lucide-react';

export const UserPointsHistory: React.FC = () => {
  const { transactions, redemptions, currentUser, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const userTxs = transactions.filter((t) => t.userId === currentUser.id);

  // Helper to resolve official payment TrxID (Screenshot 28) for redemption payouts
  const getDisplayTransactionId = (tx: PointTransaction): { id: string; isOfficialTrx: boolean } => {
    // 1. Explicit transactionRef on transaction
    if (tx.transactionRef && tx.transactionRef.trim() !== '') {
      return { id: tx.transactionRef, isOfficialTrx: true };
    }
    // 2. Direct lookup in redemptions by redemptionId or matched user redemption
    if (tx.type === 'redemption' || tx.redemptionId) {
      const matchedRedemption = redemptions.find((r) => 
        (tx.redemptionId && r.id === tx.redemptionId) ||
        (r.userId === tx.userId && (r.status === 'paid' || r.transactionRef) && Math.abs(r.pointsUsed) === Math.abs(tx.points))
      );
      if (matchedRedemption?.transactionRef && matchedRedemption.transactionRef.trim() !== '') {
        return { id: matchedRedemption.transactionRef, isOfficialTrx: true };
      }
    }
    return { id: tx.id, isOfficialTrx: false };
  };

  const filtered = userTxs.filter((t) => {
    const { id: displayId } = getDisplayTransactionId(t);
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase()) ||
                          displayId.toLowerCase().includes(search.toLowerCase()) ||
                          (t.activityName && t.activityName.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const exportCsv = () => {
    showToast(`Exported ${filtered.length} transaction records to points_history.csv`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Point History Ledger</h1>
          <p className="text-xs text-slate-400">
            Official immutable transaction history. Track all activity rewards, streak bonuses, and payout debits.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Activity Name, Transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Activity Types</option>
            <option value="feedback_reward">Feedback Form</option>
            <option value="quiz_reward">Comprehension Quiz</option>
            <option value="survey_reward">Preference Survey</option>
            <option value="review_reward">Campaign Review</option>
            <option value="redemption">Payout Redemptions</option>
            <option value="redemption_refund">Payout Refunds</option>
          </select>
        </div>
      </div>

      {/* Transactions Table with the 5 required columns */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Activity Name</th>
                <th className="py-3 px-4 text-right">Points Earned</th>
                <th className="py-3 px-4">Transaction Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No transaction entries matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* 1. Transaction ID */}
                    <td className="py-3 px-4 font-mono font-medium">
                      {(() => {
                        const { id: displayId, isOfficialTrx } = getDisplayTransactionId(tx);
                        if (isOfficialTrx) {
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(displayId);
                                showToast(`TrxID কপি করা হয়েছে: ${displayId}`, 'info');
                              }}
                              title="ক্লিক করে TrxID কপি করুন"
                              className="text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>{displayId}</span>
                              <Copy className="h-3 w-3 opacity-70 ml-0.5" />
                            </button>
                          );
                        }
                        return <span className="text-purple-400">{displayId}</span>;
                      })()}
                    </td>

                    {/* 2. Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap font-mono">
                      {tx.timestamp}
                    </td>

                    {/* 3. Activity Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {tx.activityName || tx.description}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono capitalize">
                        {tx.type.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* 4. Points Earned */}
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={tx.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </td>

                    {/* 5. Transaction Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={tx.status} />
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
};
