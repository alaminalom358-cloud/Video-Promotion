import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorPage } from '../../types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Film, 
  Clock, 
  CheckCircle, 
  History, 
  MessageSquareQuote, 
  User, 
  Menu, 
  X, 
  Wallet, 
  ChevronRight, 
  LogOut,
  Building2,
  ArrowUpRight,
  Phone
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';

interface VendorLayoutProps {
  children: React.ReactNode;
}

export const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const { 
    vendorPage, 
    setVendorPage, 
    setRole, 
    setPublicPage, 
    currentVendor, 
    showToast, 
    handleFirebaseLogout, 
    setLoginRoleTab, 
    collectVendorPoints,
    requestVendorPoints,
    t 
  } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState<string>('1000');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('+8801712345678');
  const [isSubmittingPoints, setIsSubmittingPoints] = useState(false);

  // Bengali numerals to English numerals conversion
  const toEnglishDigits = (str: string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (match) => bengaliDigits.indexOf(match).toString());
  };

  const handleDepositAmountChange = (raw: string) => {
    const converted = toEnglishDigits(raw);
    const cleaned = converted.replace(/[^0-9]/g, '');
    setDepositAmountInput(cleaned);
  };

  const currentNumericAmount = parseInt(depositAmountInput, 10) || 0;

  const navItems: { id: VendorPage; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('vendor_overview', 'Vendor Dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'submit-campaign', label: t('vendor_submit_campaign', 'Submit New Campaign'), icon: <PlusCircle className="h-4 w-4 text-purple-400" /> },
    { id: 'my-campaigns', label: t('vendor_my_campaigns', 'My Campaigns'), icon: <Film className="h-4 w-4" /> },
    { id: 'pending-campaigns', label: t('vendor_pending_campaigns', 'Pending Campaigns'), icon: <Clock className="h-4 w-4" /> },
    { id: 'approved-campaigns', label: t('vendor_approved_campaigns', 'Approved Campaigns'), icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'campaign-history', label: t('vendor_campaign_history', 'Campaign History'), icon: <History className="h-4 w-4" /> },
    { id: 'feedback-reports', label: t('vendor_feedback_reports', 'Feedback Reports'), icon: <MessageSquareQuote className="h-4 w-4" /> }
  ];

  // Check if WhatsApp number is the sample/example number or invalid
  const cleanWhatsapp = whatsappNumber.trim().replace(/\s+/g, '');
  const isSampleWhatsapp = cleanWhatsapp === '+8801712345678' || 
                           cleanWhatsapp === '01712345678' || 
                           cleanWhatsapp === '8801712345678' || 
                           cleanWhatsapp.includes('12345678');
  const isValidNewWhatsapp = !isSampleWhatsapp && cleanWhatsapp.length >= 10;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentNumericAmount <= 0) {
      showToast('অনুগ্রহ করে কি-বোর্ড দিয়ে সঠিক পয়েন্ট লিখুন (যেমনঃ 4975)।', 'error');
      return;
    }
    if (isSampleWhatsapp) {
      showToast('বক্সে থাকা নমুনা নম্বর (+8801712345678) ব্যবহারযোগ্য নহে! পয়েন্ট সংগ্রহ করতে আপনার নিজস্ব নতুন WhatsApp নম্বর দিন।', 'error');
      return;
    }
    if (!cleanWhatsapp || cleanWhatsapp.length < 10) {
      showToast('অনুগ্রহ করে আপনার সঠিক নতুন WhatsApp নম্বর প্রদান করুন (যেমনঃ 017xxxxxxxx বা +8801xxxxxxxxx)।', 'error');
      return;
    }

    setIsSubmittingPoints(true);
    try {
      const success = await requestVendorPoints(currentNumericAmount, whatsappNumber.trim());
      if (success) {
        setDepositModalOpen(false);
      }
    } finally {
      setIsSubmittingPoints(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1021] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-400" />
          <span className="font-bold text-sm text-white">Vendor Portal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle variant="compact" />
          <LanguageSelector variant="compact" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-300"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Brand */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight">{currentVendor.companyName.slice(0, 15)}...</p>
                <p className="text-[10px] text-purple-400 font-mono">VERIFIED ADVERTISER</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Wallet Balance Widget */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">পয়েন্ট ব্যালেন্স</span>
              <Wallet className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums flex items-baseline gap-1.5">
              <span>{Math.round(currentVendor.balance || 0).toLocaleString()}</span>
              <span className="text-xs font-sans font-medium text-purple-300">পয়েন্ট</span>
            </p>
            <button
              onClick={() => setDepositModalOpen(true)}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-purple-600/90 hover:bg-purple-600 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>পয়েন্ট সংগ্রহ করুন</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Campaign Operations
            </p>
            {navItems.map((item) => {
              const isActive = vendorPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setVendorPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/90 text-white font-semibold shadow-sm shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Profile */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-300 text-xs shadow-sm">
              <img src="/flower_avatar.jpg" alt="Vendor" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{currentVendor.contactName}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentVendor.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              setLoginRoleTab('vendor');
              await handleFirebaseLogout('login');
              setRole('public');
              setPublicPage('login');
            }}
            title="Sign out of Vendor Portal"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-[33px] z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Vendor</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-purple-400 font-medium capitalize">
              {vendorPage.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle variant="compact" />
            <LanguageSelector variant="compact" />
            <button
              onClick={() => setVendorPage('submit-campaign')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('vendor_new_campaign_btn', 'New Campaign')}</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-8 space-y-6 flex-1 bg-[#0B1021]">
          {children}
        </main>
      </div>

      {/* Collect Points from Admin Modal */}
      {depositModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setDepositModalOpen(false)}
          title="অ্যাডমিনের নিকট থেকে পয়েন্ট সংগ্রহ করুন"
          subtitle="বিজ্ঞাপন ও ভিডিও ক্যাম্পেইন পরিচালনার জন্য অ্যাডমিনের নিকট থেকে পয়েন্ট সংগ্রহ বা ওয়ালেটে যোগ করুন।"
        >
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>পয়েন্টের পরিমাণ নির্বাচন করুন</span>
                <span className="text-purple-400 font-mono font-normal text-[11px]">পয়েন্ট প্যাকেজ</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setDepositAmountInput(String(amt))}
                    className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                      currentNumericAmount === amt
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">অথবা ইচ্ছামতো পয়েন্টের পরিমাণ লিখুন</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={depositAmountInput}
                  onChange={(e) => handleDepositAmountChange(e.target.value)}
                  placeholder="উদাঃ 4975"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 font-mono tracking-wide"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-purple-400 font-medium">পয়েন্ট</span>
              </div>
            </div>

            {/* Calculations & Instructions */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>বর্তমান ব্যালেন্স:</span>
                <span className="font-mono text-white font-bold">{Math.round(currentVendor.balance || 0).toLocaleString()} পয়েন্ট</span>
              </div>
              <div className="flex justify-between items-center text-purple-300">
                <span>অ্যাডমিন হতে সংগৃহীত পয়েন্ট:</span>
                <span className="font-mono text-emerald-400 font-bold">+{currentNumericAmount.toLocaleString()} পয়েন্ট</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-white font-semibold">
                <span>সংগ্রহের পর মোট ব্যালেন্স:</span>
                <span className="font-mono text-emerald-400 font-extrabold text-sm">
                  {(Math.round(currentVendor.balance || 0) + currentNumericAmount).toLocaleString()} পয়েন্ট
                </span>
              </div>
            </div>

            {/* WhatsApp নম্বর ইনপুট বক্স */}
            <div className={`space-y-2 p-3.5 rounded-xl border transition-colors ${
              isSampleWhatsapp 
                ? 'bg-amber-950/20 border-amber-500/40' 
                : isValidNewWhatsapp
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-500/40'
            }`}>
              <label className="text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp নম্বর দিন *
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">অ্যাডমিনের কাছে মেসেজ যাবে</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  inputMode="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(toEnglishDigits(e.target.value))}
                  placeholder="যেমনঃ +8801712345678 বা 01712345678"
                  className={`w-full px-3.5 py-2.5 pr-16 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none font-mono tracking-wide placeholder-slate-600 transition-colors ${
                    isSampleWhatsapp 
                      ? 'border-amber-500/70 focus:border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                      : isValidNewWhatsapp
                        ? 'border-emerald-500/70 focus:border-emerald-400'
                        : 'border-rose-500/70 focus:border-rose-400'
                  }`}
                />
                {whatsappNumber && (
                  <button
                    type="button"
                    onClick={() => setWhatsappNumber('')}
                    title="নম্বরটি মুছে নতুন নম্বর লিখুন"
                    className="absolute right-2 top-2 px-2 py-1 text-[10px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    মুছুন
                  </button>
                )}
              </div>

              {/* স্ট্যাটাস ও ব্যবহারযোগ্যতা সতর্কতা */}
              {isSampleWhatsapp ? (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
                  <span className="text-base shrink-0">⚠️</span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-amber-300">নমুনা নম্বর — ব্যবহারযোগ্য নহে</p>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      বক্সে থাকা <code className="px-1 py-0.2 rounded bg-amber-950/60 font-mono text-amber-300 font-bold">+8801712345678</code> একটি ডেমো/নমুনা নম্বর। নতুন সক্রিয় WhatsApp নম্বর না দিলে এই নম্বর ব্যবহার করে পয়েন্ট রিকোয়েস্ট জমা দেওয়া যাবে না।
                    </p>
                  </div>
                </div>
              ) : isValidNewWhatsapp ? (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>নতুন সচল WhatsApp নম্বর গৃহীত হয়েছে: <strong className="font-mono text-emerald-300">{whatsappNumber}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>অনুগ্রহ করে আপনার সঠিক ১১ ডিজিটের নতুন WhatsApp নম্বর লিখুন (যেমনঃ 017xxxxxxxx)।</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                📩 <strong>মেসেজ প্রক্রিয়া:</strong> &apos;পয়েন্ট সংগ্রহ নিশ্চিত করুন&apos; বাটনে ক্লিক করলে অ্যাডমিনের নিকট আপনার সংগৃহীত পয়েন্টের পরিমাণ ({currentNumericAmount.toLocaleString()} পয়েন্ট), WhatsApp নম্বর ({isSampleWhatsapp ? '(নতুন নম্বর দিন)' : whatsappNumber}) এবং ভেন্ডোর আইডি ({currentVendor.id}) সরাসরি চলে যাবে। অ্যাডমিন অনুমতি দিলে আপনার ব্যালেন্সে পয়েন্ট যোগ হবে।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed">
              💡 <strong>পয়েন্ট সিস্টেমের নিয়ম:</strong> প্রথমবারের জন্য সংগৃহীত পয়েন্ট আপনার প্রাথমিক ব্যালেন্স হিসেবে জমা হবে। পরবর্তী প্রতিবার পয়েন্ট সংগ্রহ করলে তা পূর্ববর্তী ব্যালেন্সের সাথে যোগ হবে। নতুন ক্যাম্পেইন সেভ করার সময় ৩য় বক্সের নির্ধারিত পয়েন্ট সরাসরি ব্যালেন্স থেকে কর্তন হবে।
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmittingPoints}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingPoints ? 'সংগ্রহ হচ্ছে...' : 'পয়েন্ট সংগ্রহ নিশ্চিত করুন'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
