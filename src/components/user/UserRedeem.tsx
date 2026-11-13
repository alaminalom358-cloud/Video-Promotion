import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PayoutMethod } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AdBannerBox } from '../common/AdBannerBox';
import { 
  Wallet, 
  Phone, 
  Send, 
  CreditCard,
  MessageSquare,
  AlertCircle,
  Coins
} from 'lucide-react';

export const UserRedeem: React.FC = () => {
  const { currentUser, redemptions, submitRedemption, settings, showToast } = useApp();

  const minWithdrawalPoints = Math.max(1, settings.minimumRedemptionPoints ?? 5000);
  const isEligibleToWithdraw = (currentUser.points || 0) >= minWithdrawalPoints;

  // Maximum allowed points is strictly: (Balance - 50 points)
  const maxAllowedPoints = Math.max(0, (currentUser.points || 0) - 50);

  // Form states for the 5 requested boxes
  const [pointsAmount, setPointsAmount] = useState<number | ''>(() => {
    const maxPts = Math.max(0, (currentUser.points || 0) - 50);
    return maxPts > 0 ? Math.min(minWithdrawalPoints, maxPts) : '';
  });
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>('bkash');
  const [accountType, setAccountType] = useState<'personal' | 'agent'>('personal');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const myRedemptions = redemptions.filter((r) => r.userId === currentUser.id);

  // Conversion rate (1,000 pts = 120 BDT)
  const pointsToBdtRate = settings.pointsToBdtRate || 120;
  const currentPts = typeof pointsAmount === 'number' ? pointsAmount : 0;
  const calculatedBdt = Math.round((currentPts / 1000) * pointsToBdtRate);

  // Auto-restriction: User cannot enter more than (Balance - 50) points
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setPointsAmount('');
      return;
    }
    const entered = Math.max(0, parseInt(val, 10) || 0);
    if (entered > maxAllowedPoints) {
      // স্বয়ংক্রিয়ভাবে বাধা পড়বে এবং সর্বোচ্চ অনুমোদিত পয়েন্টে সেট হয়ে যাবে
      setPointsAmount(maxAllowedPoints);
      showToast(
        `ব্যালেন্সের চাইতে ৫০ পয়েন্ট কম হতে হবে! সর্বোচ্চ উত্তোলনযোগ্য: ${maxAllowedPoints.toLocaleString()} পয়েন্ট`,
        'error'
      );
    } else {
      setPointsAmount(entered);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEligibleToWithdraw) {
      showToast(
        `সর্বনিম্ন ${minWithdrawalPoints.toLocaleString()} পয়েন্ট না হওয়া পর্যন্ত উত্তোলন করা যাবে না। আপনার বর্তমান পয়েন্ট: ${(currentUser.points || 0).toLocaleString()}।`,
        'error'
      );
      return;
    }

    if (!pointsAmount || Number(pointsAmount) <= 0) {
      showToast('অনুগ্রহ করে উত্তোলনের পয়েন্টের পরিমাণ উল্লেখ করুন।', 'error');
      return;
    }

    const numPoints = Number(pointsAmount);

    if (numPoints > maxAllowedPoints) {
      showToast(
        `আপনি ব্যালেন্সের চেয়ে ৫০ পয়েন্ট কম (সর্বোচ্চ ${maxAllowedPoints.toLocaleString()} পয়েন্ট) উত্তোলন করতে পারবেন।`,
        'error'
      );
      setPointsAmount(maxAllowedPoints);
      return;
    }

    if (!mobileNumber || mobileNumber.trim().length < 11) {
      showToast('অনুগ্রহ করে সঠিক মোবাইল ব্যাংক একাউন্ট নম্বর দিন (যেমন: 01712345678)।', 'error');
      return;
    }

    if (!whatsappNumber || whatsappNumber.trim().length < 11) {
      showToast('অনুগ্রহ করে সঠিক WhatsApp নম্বর দিন (যেমন: 017xxxxxxxx)।', 'error');
      return;
    }
    if (whatsappNumber.trim().includes('12345678')) {
      showToast('নমুনা নম্বর ব্যবহারযোগ্য নহে! অনুগ্রহ করে আপনার নিজস্ব নতুন WhatsApp নম্বর দিন।', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = submitRedemption(
        selectedMethod,
        numPoints,
        mobileNumber.trim(),
        accountType,
        whatsappNumber.trim()
      );

      if (success) {
        showToast('উত্তোলনের আবেদন সফলভাবে অ্যাডমিনের নিকট জমা দেওয়া হয়েছে!', 'success');
        setMobileNumber('');
        setWhatsappNumber('');
        setPointsAmount(Math.max(0, (currentUser.points - numPoints) - 50));
      }
    } catch (err) {
      showToast('আবেদন জমা দেওয়ার সময় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">উত্তোলনের জন্য আবেদন</h1>
          <p className="text-xs text-slate-400">
            আপনার অর্জিত পয়েন্ট bKash, Nagad অথবা Rocket-এর মাধ্যমে উত্তোলনের জন্য আবেদন করুন।
          </p>
        </div>

        {/* Live Balance Pill (Screenshot 17 বাদ দেওয়া হয়েছে) */}
        <div className="p-3.5 rounded-2xl bg-purple-950/70 border border-purple-500/30 text-xs flex items-center gap-3">
          <Wallet className="h-5 w-5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Available Balance</span>
            <span className="font-mono text-white font-bold text-sm">{currentUser.points.toLocaleString()} pts</span>
          </div>
        </div>
      </div>

      {/* Box 1 Adsterra 468x60 Banner */}
      <AdBannerBox boxId="box-1" name="box 1" width={468} height={60} />

      {/* উত্তোলনের জন্য মূল বক্স (১. পয়েন্ট, ২. ড্রপডাউন, ৩. মোবাইল ব্যাংক নম্বর, ৪. WhatsApp No, ৫. Submit button) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-5 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Coins className="h-4 w-4 text-purple-400" />
            <span>উত্তোলনের তথ্য ফরম</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            সকল তথ্য দিয়ে সাবমিট বাটনে ক্লিক করলে তা সরাসরি অ্যাডমিনের নিকট চলে যাবে। (সর্বনিম্ন উত্তোলনযোগ্য ব্যালেন্স: <strong className="text-purple-300">{minWithdrawalPoints.toLocaleString()} pts</strong>)
          </p>
        </div>

        {!isEligibleToWithdraw && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-300">
                উত্তোলন বর্তমানে বন্ধ (Locked) রয়েছে
              </p>
              <p className="text-[11px] leading-relaxed">
                অ্যাডমিন নিয়ম অনুযায়ী সর্বনিম্ন <strong className="text-white">{minWithdrawalPoints.toLocaleString()} পয়েন্ট</strong> না হওয়া পর্যন্ত আপনি পয়েন্ট উত্তোলন করতে পারবেন না। আপনার বর্তমান ব্যালেন্স <strong className="text-white">{(currentUser.points || 0).toLocaleString()} পয়েন্ট</strong> (আরও <strong className="text-amber-300">{(minWithdrawalPoints - (currentUser.points || 0)).toLocaleString()} পয়েন্ট</strong> প্রয়োজন)।
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ১ নং বক্স: পয়েন্ট */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>১. পয়েন্ট *</span>
                {currentPts > 0 && (
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    = {calculatedBdt.toLocaleString()} ৳ (টাকা)
                  </span>
                )}
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                <input
                  type="number"
                  required
                  min={1}
                  max={maxAllowedPoints}
                  placeholder={maxAllowedPoints > 0 ? `সর্বোচ্চ ${maxAllowedPoints.toLocaleString()} পয়েন্ট` : 'ব্যালেন্স অপ্রতুল'}
                  value={pointsAmount}
                  onChange={handlePointsChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              {/* সর্বোচ্চ সীমা নির্দেশক বার্তা (ব্যালেন্স - ৫০ পয়েন্ট) */}
              <div className="flex items-center justify-between text-[10.5px] font-mono pt-0.5">
                <span className="text-purple-300 font-semibold">
                  সর্বোচ্চ উত্তোলনযোগ্য: <span className="text-emerald-400 font-bold">{maxAllowedPoints.toLocaleString()} pts</span>
                </span>
                <span className="text-slate-400 text-[10px]">
                  (ব্যালেন্স {currentUser.points.toLocaleString()} - ৫০ = {maxAllowedPoints.toLocaleString()} pts)
                </span>
              </div>

              {/* কুইক পয়েন্ট বাটন */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-mono">কুইক সিলেক্ট:</span>
                {[minWithdrawalPoints, minWithdrawalPoints * 2, minWithdrawalPoints * 5].map((pts) => {
                  const isOver = pts > maxAllowedPoints;
                  return (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => {
                        if (isOver) {
                          setPointsAmount(maxAllowedPoints);
                          showToast(
                            `ব্যালেন্সের চেয়ে ৫০ পয়েন্ট কম হতে হবে! সর্বোচ্চ ${maxAllowedPoints.toLocaleString()} পয়েন্ট বসানো হয়েছে।`,
                            'info'
                          );
                        } else {
                          setPointsAmount(pts);
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        pointsAmount === pts
                          ? 'bg-purple-600 text-white font-bold'
                          : isOver
                          ? 'bg-slate-900/60 text-slate-500 border border-slate-800'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={isOver ? `সর্বোচ্চ সীমা: ${maxAllowedPoints.toLocaleString()} pts` : ''}
                    >
                      {pts.toLocaleString()} pts
                    </button>
                  );
                })}
                {maxAllowedPoints > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPointsAmount(maxAllowedPoints)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60 cursor-pointer font-bold"
                  >
                    সর্বোচ্চ উত্তোলনযোগ্য ({maxAllowedPoints.toLocaleString()} pts)
                  </button>
                ) : (
                  <span className="text-[10px] text-rose-400 font-mono">
                    (ব্যালেন্সে ৫০ এর বেশি পয়েন্ট থাকতে হবে)
                  </span>
                )}
              </div>
            </div>

            {/* ২ নং বক্স: bKash, Nagad, Rocket ড্রপডাউন লিষ্ট */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                ২. পেমেন্ট মেথড (bKash, Nagad, Rocket) *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value as PayoutMethod)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer shadow-inner"
                >
                  <option value="bkash">bKash (বিকাশ)</option>
                  <option value="nagad">Nagad (নগদ)</option>
                  <option value="rocket">Rocket (রকেট)</option>
                </select>
              </div>

              {/* একাউন্ট টাইপ (Personal / Agent) */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-400">একাউন্ট ধরণ:</span>
                <button
                  type="button"
                  onClick={() => setAccountType('personal')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    accountType === 'personal'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Personal (ব্যক্তিগত)
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('agent')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    accountType === 'agent'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Agent (এজেন্ট)
                </button>
              </div>
            </div>

            {/* ৩ নং বক্স: মোবাইল ব্যংক এ্যকাউন্ট নাম্বর */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                ৩. মোবাইল ব্যংক এ্যকাউন্ট নাম্বর *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01712345678"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                নির্বাচিত মেথডের ({selectedMethod.toUpperCase()}) ১১ ডিজিটের সক্রিয় নম্বর লিখুন।
              </p>
            </div>

            {/* ৪ নং বক্স: WhatsApp No */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                ৪. WhatsApp No *
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01712345678"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                পেমেন্ট নিশ্চিতকরণ ও যোগাযোগের জন্য সক্রিয় হোয়াটসঅ্যাপ নম্বর দিন।
              </p>
            </div>
          </div>

          {/* ৫ নং: Submit button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>সাবমিট বাটনে ক্লিক করলে উত্তোলনের সব তথ্য স্বয়ংক্রিয়ভাবে অ্যাডমিন প্যানেলে জমা হবে।</span>
            </div>

            <button
              type="submit"
              disabled={
                !isEligibleToWithdraw ||
                isSubmitting ||
                maxAllowedPoints <= 0 ||
                !pointsAmount ||
                Number(pointsAmount) <= 0 ||
                Number(pointsAmount) > maxAllowedPoints
              }
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'জমা হচ্ছে...' : 'উত্তোলনের আবেদন জমা দিন (Submit)'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Redemption Request History Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">আমার উত্তোলনের হিস্ট্রি (Withdrawal History)</h2>
            <p className="text-xs text-slate-400">অ্যাডমিন কর্তৃক অনুমোদনের স্ট্যাটাস ও তথ্য ট্র্যাক করুন।</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{myRedemptions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Mobile / Account</th>
                <th className="py-3 px-4">WhatsApp No</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">টাকা (BDT)</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reference / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {myRedemptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    এখনো কোনো উত্তোলনের আবেদন জমা দেননি।
                  </td>
                </tr>
              ) : (
                myRedemptions.map((red) => (
                  <tr key={red.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-purple-400 font-medium">{red.id}</td>
                    <td className="py-3 px-4 font-bold uppercase text-white font-mono">{red.method}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {red.payoutAddress} {red.accountType && <span className="text-[10px] text-slate-500">({red.accountType})</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {red.whatsappNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400 font-bold tabular-nums">
                      -{red.pointsUsed.toLocaleString()} pts
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold tabular-nums">
                      {red.cashValueBdt || Math.round((red.pointsUsed / 1000) * pointsToBdtRate)} ৳
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {red.requestedAt}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={red.status} />
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">
                      {red.transactionRef ? (
                        <span className="text-emerald-400">TrxID: {red.transactionRef}</span>
                      ) : red.rejectionReason ? (
                        <span className="text-rose-400">{red.rejectionReason}</span>
                      ) : (
                        <span className="text-slate-500">Pending Review</span>
                      )}
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
