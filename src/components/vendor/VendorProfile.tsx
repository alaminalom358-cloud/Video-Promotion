import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Mail, Wallet, Key, FileText, CheckCircle2, Copy } from 'lucide-react';

export const VendorProfile: React.FC = () => {
  const { currentVendor, showToast } = useApp();
  const [copiedKey, setCopiedKey] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard?.writeText('pk_live_promoview_99a8b7c6d5e4f3a2b1');
    setCopiedKey(true);
    showToast('API Key copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const invoices = [
    { id: 'INV-2026-089', date: '2026-10-24', amount: '1,500 pts', status: 'Paid', campaign: 'Lumin X Smartphone Review' },
    { id: 'INV-2026-061', date: '2026-09-12', amount: '2,000 pts', status: 'Paid', campaign: 'Leica Optic Workflow' },
    { id: 'INV-2026-034', date: '2026-08-01', amount: '3,500 pts', status: 'Paid', campaign: 'Summer Hardware Launch' }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Vendor Profile & Billing</h1>
        <p className="text-xs text-slate-400">Manage company information, API webhook credentials, and accounting invoices.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 border-2 border-purple-500/30 overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-lg shadow-md">
            <img src="/flower_avatar.jpg" alt="Vendor" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{currentVendor.companyName}</h2>
              <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Verified Advertiser
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Contact: {currentVendor.contactName} · {currentVendor.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Account ID:</span>
            <p className="font-mono text-white font-semibold mt-0.5">{currentVendor.id}</p>
          </div>
          <div>
            <span className="text-slate-400">মোট খরচ (Lifetime Spend):</span>
            <p className="font-mono text-emerald-400 font-semibold mt-0.5">{Math.round(currentVendor.totalSpent).toLocaleString()} পয়েন্ট</p>
          </div>
          <div>
            <span className="text-slate-400">Member Since:</span>
            <p className="font-mono text-slate-300 mt-0.5">{currentVendor.joinedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
