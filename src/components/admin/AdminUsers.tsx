import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAccount } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Search, Filter, ShieldAlert, Award, PlusCircle, MinusCircle, UserX, UserCheck, Flame, Trash2 } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, updateUserStatus, adjustUserPoints, deleteUser, t } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Point adjustment modal state
  const [adjustModalUser, setAdjustModalUser] = useState<UserAccount | null>(null);
  const [adjustAmountInput, setAdjustAmountInput] = useState<string>('500');
  const [adjustReason, setAdjustReason] = useState<string>('Discretionary loyalty bonus');
  const [isDebit, setIsDebit] = useState<boolean>(false);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  // User delete confirmation modal state
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const toEnglishDigits = (str: string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (match) => bengaliDigits.indexOf(match).toString());
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser || isAdjusting) return;
    const parsed = parseInt(adjustAmountInput, 10) || 0;
    if (parsed <= 0) return;
    const finalAmount = isDebit ? -Math.abs(parsed) : Math.abs(parsed);
    setIsAdjusting(true);
    try {
      await adjustUserPoints(adjustModalUser.id, finalAmount, adjustReason);
      setAdjustModalUser(null);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{t('admin_user_management', 'User Management')}</h1>
          <p className="text-xs text-slate-400">নিবন্ধিত ব্যবহারকারীদের তথ্য (Firebase Data), দেশ, পয়েন্ট ওয়ালেট ও ওয়াচ হিস্টোরি নিরীক্ষা করুন।</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses (সকল)</option>
            <option value="active">Active Only (সক্রিয়)</option>
            <option value="suspended">Suspended (স্থগিত)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">User (নাম ও ইমেইল)</th>
                <th className="py-3 px-4">Tier / Streak</th>
                <th className="py-3 px-4 text-right">Points Balance</th>
                <th className="py-3 px-4 text-right">Videos Watched</th>
                <th className="py-3 px-4">Country (দেশ)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-300 shadow-sm">
                          <img src="/flower_avatar.jpg" alt={u.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          <p className="text-[10px] text-slate-500 font-mono">যুক্ত: {u.joinedDate}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 text-[10px]">
                          {u.tier}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {u.points.toLocaleString()} pts
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-300 tabular-nums">
                      {u.totalVideosWatched}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {u.country}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAdjustModalUser(u)}
                          title="Manually adjust points"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors"
                        >
                          Adjust Points
                        </button>

                        {u.status === 'active' ? (
                          <button
                            onClick={() => updateUserStatus(u.id, 'suspended')}
                            title="Suspend user"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(u.id, 'active')}
                            title="Restore active user"
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete User Permanently from Firebase */}
                        <button
                          onClick={() => setUserToDelete(u)}
                          title="ফায়ারবেস থেকে স্থায়ীভাবে ডিলিট করুন (Delete permanently from Firebase)"
                          className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-900/40 hover:border-rose-500 bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Points Modal */}
      {adjustModalUser && (() => {
        const currentPoints = adjustModalUser.points || 0;
        const parsedInput = parseInt(adjustAmountInput, 10) || 0;
        const previewBalance = isDebit ? Math.max(0, currentPoints - parsedInput) : currentPoints + parsedInput;

        return (
          <Modal
            isOpen={true}
            onClose={() => !isAdjusting && setAdjustModalUser(null)}
            title={`Adjust Points: ${adjustModalUser.name}`}
            subtitle={`বর্তমান ব্যালেন্স: ${currentPoints.toLocaleString()} pts → ${!isDebit ? '+' : '-'}${parsedInput.toLocaleString()} pts = নতুন ওয়ালেট ব্যালেন্স: ${previewBalance.toLocaleString()} pts`}
          >
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsDebit(false)}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    !isDebit ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Credit Points (যোগ করুন)
                </button>
                <button
                  type="button"
                  onClick={() => setIsDebit(true)}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isDebit ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MinusCircle className="h-3.5 w-3.5" /> Debit Points (বিয়োগ করুন)
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Point Amount (পয়েন্ট সংখ্যা)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={adjustAmountInput}
                  onChange={(e) => {
                    const converted = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                    setAdjustAmountInput(converted);
                  }}
                  placeholder="500"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Reason / Audit Note (কারণ)</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white text-xs focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isAdjusting}
                  onClick={() => setAdjustModalUser(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting || parsedInput <= 0}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/30"
                >
                  {isAdjusting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>যোগ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>Apply Adjustment</span>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* Delete User from Firebase Confirmation Modal */}
      {userToDelete && (
        <Modal
          isOpen={true}
          onClose={() => !deleting && setUserToDelete(null)}
          title="ইউজার ডিলিট নিশ্চিতকরণ"
          subtitle="ফায়ারবেস ডেটাবেস থেকে ব্যবহারকারী স্থায়ীভাবে ডিলিট হবে"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{userToDelete.name}</p>
                  <p className="text-xs text-rose-300/80 font-mono">{userToDelete.email}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীকে <span className="font-semibold text-white">({userToDelete.name})</span> এবং তার সম্পর্কিত ওয়ালেট তথ্য ফায়ারবেস ডেটাবেস থেকে <span className="text-rose-400 font-bold">একবারে স্থায়ীভাবে ডিলিট</span> করতে চান? এই কাজ আর পুনরায় ফিরিয়ে আনা সম্ভব নয়।
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                <span>দেশ: {userToDelete.country || 'N/A'}</span>
                <span>পয়েন্ট: {userToDelete.points.toLocaleString()} pts</span>
                <span>যুক্ত: {userToDelete.joinedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteUser(userToDelete.id);
                  } finally {
                    setDeleting(false);
                    setUserToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-900/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{deleting ? 'ফায়ারবেস থেকে ডিলিট হচ্ছে...' : 'স্থায়ীভাবে ডিলিট করুন (Delete)'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
