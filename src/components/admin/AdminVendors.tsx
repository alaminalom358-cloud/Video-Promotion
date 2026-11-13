import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { 
  Search, 
  Building2, 
  Phone, 
  Check, 
  X, 
  Clock, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck,
  Trash2
} from 'lucide-react';

export const AdminVendors: React.FC = () => {
  const { 
    vendors, 
    updateVendorStatus, 
    deleteVendor,
    adminAdjustVendorPoints,
    vendorPointRequests,
    adminApproveVendorPointRequest,
    adminRejectVendorPointRequest 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'vendors' | 'requests'>('vendors');
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [grantPointsAmountInput, setGrantPointsAmountInput] = useState<string>('1000');
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<any | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<boolean>(false);

  const pendingRequestsCount = vendorPointRequests.filter((r) => r.status === 'pending').length;

  const toEnglishDigits = (str: string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (match) => bengaliDigits.indexOf(match).toString());
  };

  const filteredVendors = vendors.filter((v) =>
    v.companyName.toLowerCase().includes(search.toLowerCase()) ||
    v.contactName.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = vendorPointRequests.filter((r) =>
    r.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    r.vendorId.toLowerCase().includes(search.toLowerCase()) ||
    r.whatsappNumber.includes(search)
  );

  const handleGrantPoints = async (vendorId: string) => {
    const pts = parseInt(grantPointsAmountInput, 10);
    if (!pts || pts <= 0) return;
    await adminAdjustVendorPoints(vendorId, pts, 'add');
    setSelectedVendor(null);
  };

  const handleApproveRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await adminApproveVendorPointRequest(requestId);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await adminRejectVendorPointRequest(requestId);
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Vendor & Advertiser Management</h1>
          <p className="text-xs text-slate-400">Audit registered commercial entities, points balances, and WhatsApp point requests.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'vendors'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ভেন্ডোর তালিকা ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'requests'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>পয়েন্ট রিকোয়েস্ট</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'vendors' 
                ? "Search vendor by company, contact or email..." 
                : "Search point requests by vendor, ID or WhatsApp..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {activeTab === 'requests' ? (
        /* Point Requests Table */
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp পয়েন্ট সংগ্রহের আবেদন তালিকা</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                ভেন্ডোরদের পাঠানো পয়েন্টের আবেদন যাচাই করুন। &apos;অনুমোদন দিন&apos; বাটনে ক্লিক করলে পয়েন্ট ভেন্ডোরের ওয়ালেটে যোগ হবে।
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800">
              মোট আবেদন: {vendorPointRequests.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">ভেন্ডোর ও আইডি</th>
                  <th className="py-3 px-4 text-right">অনুরোধকৃত পয়েন্ট</th>
                  <th className="py-3 px-4">WhatsApp নম্বর</th>
                  <th className="py-3 px-4">আবেদনের সময়</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাডমিন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      এখনো কোনো ভেন্ডোর পয়েন্ট রিকোয়েস্ট পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const cleanPhone = req.whatsappNumber.replace(/[^0-9]/g, '');
                    const waUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(req.vendorName)},%20regarding%20your%20point%20request%20of%20${req.pointsRequested}%20points%20on%20PromoView.`;

                    return (
                      <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-purple-300">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{req.vendorName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">আইডি: {req.vendorId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums text-sm">
                          +{req.pointsRequested.toLocaleString()} <span className="text-[10px] text-slate-400">পয়েন্ট</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                              {req.whatsappNumber}
                            </span>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30"
                              title="WhatsApp এ সরাসরি চ্যাট করুন"
                            >
                              <Phone className="h-3 w-3" />
                              <span>চ্যাট</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(req.createdAt).toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {req.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
                              <Clock className="h-3 w-3" />
                              <span>অপেক্ষমাণ</span>
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
                              <Check className="h-3 w-3" />
                              <span>অনুমোদিত</span>
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
                              <X className="h-3 w-3" />
                              <span>বাতিলকৃত</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveRequest(req.id)}
                                disabled={processingRequestId === req.id}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>অনুমোদন দিন</span>
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                disabled={processingRequestId === req.id}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-transparent hover:border-rose-500/30 text-xs font-semibold cursor-pointer transition-colors"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : req.status === 'approved' ? (
                            <span className="text-emerald-400 font-medium text-[11px] flex items-center justify-end gap-1">
                              <ShieldCheck className="h-3.5 w-3.5" /> পয়েন্ট ওয়ালেটে যুক্ত হয়েছে
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">বাতিল করা হয়েছে</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Regular Vendors Table */
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Vendor Entity</th>
                  <th className="py-3 px-4">Contact Person (নাম ও ইমেইল)</th>
                  <th className="py-3 px-4">Country (দেশ)</th>
                  <th className="py-3 px-4 text-right">পয়েন্ট ব্যালেন্স</th>
                  <th className="py-3 px-4 text-right">মোট খরচ</th>
                  <th className="py-3 px-4 text-center">Campaigns</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-purple-300 overflow-hidden shadow-sm">
                          <img src="/flower_avatar.jpg" alt={v.companyName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{v.companyName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">ID: {v.id}</p>
                          <p className="text-[10px] text-slate-500 font-mono">যুক্ত: {v.joinedDate}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-200 font-semibold">{v.contactName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{v.email}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {v.country || 'United States'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {Math.round(v.balance).toLocaleString()} <span className="text-[10px] text-slate-400">pts</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-300 tabular-nums">
                      {Math.round(v.totalSpent).toLocaleString()} <span className="text-[10px] text-slate-500">pts</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs text-white">
                        {v.activeCampaignsCount} <span className="text-slate-500">/ {v.totalCampaignsCount}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedVendor(selectedVendor === v.id ? null : v.id)}
                          className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 transition-colors text-[11px] font-semibold"
                        >
                          + পয়েন্ট দিন
                        </button>
                        {v.status === 'verified' ? (
                          <button
                            onClick={() => updateVendorStatus(v.id, 'suspended')}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateVendorStatus(v.id, 'verified')}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                          >
                            Verify & Activate
                          </button>
                        )}
                        {/* Delete Vendor Permanently from Firebase */}
                        <button
                          onClick={() => setVendorToDelete(v)}
                          title="ফায়ারবেস থেকে স্থায়ীভাবে ডিলিট করুন (Delete permanently from Firebase)"
                          className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-900/40 hover:border-rose-500 bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {selectedVendor === v.id && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-purple-500/40 text-left space-y-2">
                          <p className="text-[11px] text-slate-300 font-semibold">ভেন্ডোরকে সরাসরি পয়েন্ট প্রদান করুন:</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={grantPointsAmountInput}
                              onChange={(e) => {
                                const converted = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                                setGrantPointsAmountInput(converted);
                              }}
                              placeholder="1000"
                              className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            />
                            <button
                              onClick={() => handleGrantPoints(v.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                            >
                              নিশ্চিত করুন
                            </button>
                            <button
                              onClick={() => setSelectedVendor(null)}
                              className="text-slate-400 hover:text-white text-[11px]"
                            >
                              বাতিল
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Vendor from Firebase Confirmation Modal */}
      {vendorToDelete && (
        <Modal
          isOpen={true}
          onClose={() => !deletingVendor && setVendorToDelete(null)}
          title="ভেন্ডোর ডিলিট নিশ্চিতকরণ"
          subtitle="ফায়ারবেস ডেটাবেস থেকে ভেন্ডোর স্থায়ীভাবে ডিলিট হবে"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{vendorToDelete.companyName}</p>
                  <p className="text-xs text-rose-300/80 font-mono">যোগাযোগ: {vendorToDelete.contactName} ({vendorToDelete.email})</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                আপনি কি নিশ্চিত যে আপনি এই ভেন্ডোরকে <span className="font-semibold text-white">({vendorToDelete.companyName})</span> ফায়ারবেস ডেটাবেস থেকে <span className="text-rose-400 font-bold">একবারে স্থায়ীভাবে ডিলিট</span> করতে চান? এই কাজ আর পুনরায় ফিরিয়ে আনা সম্ভব নয়।
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                <span>দেশ: {vendorToDelete.country || 'United States'}</span>
                <span>পয়েন্ট: {Math.round(vendorToDelete.balance).toLocaleString()} pts</span>
                <span>যুক্ত: {vendorToDelete.joinedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deletingVendor}
                onClick={() => setVendorToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                disabled={deletingVendor}
                onClick={async () => {
                  setDeletingVendor(true);
                  try {
                    await deleteVendor(vendorToDelete.id);
                  } finally {
                    setDeletingVendor(false);
                    setVendorToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-900/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{deletingVendor ? 'ফায়ারবেস থেকে ডিলিট হচ্ছে...' : 'স্থায়ীভাবে ডিলিট করুন (Delete)'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
