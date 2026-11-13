import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-[#0B1021] text-slate-100 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms & Conditions</h1>
          <p className="text-xs text-slate-400">
            Last Revised: November 2026 · Governing Law: State of California, United States
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Platform Eligibility & Permitted Use</h2>
            <p>
              By accessing Promoview, you warrant that you are at least 18 years of age (or 13 with parental consent). 
              Each physical individual is permitted strictly one active account. Multi-accounting, device emulators, 
              headless automated scripts, VPN proxy spoofing, or virtual machine farms are strictly prohibited and result in permanent balance forfeiture.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Advertiser & Vendor Content Standards</h2>
            <p>
              Vendors submitting campaigns must possess valid rights or promotional authority over the linked media. 
              Submissions containing hate speech, deceptive financial scams, malware, illegal substances, or infringing copyright 
              will be summarily rejected without refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Watch Verification & Anti-Farming Standards</h2>
            <p>
              Points are credited purely for verified human engagement. Video playback in minimized windows, muted background tabs, 
              or automated auto-clicker extensions does not satisfy compliance requirements. Promoview reserves the right to withhold reward credits for sessions failing verification audits.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Points Exchange, Valuation & Expiration</h2>
            <p>
              Points hold no statutory cash value until successfully processed through an approved redemption gateway (such as bKash, Nagad, or Rocket). 
              The standard conversion rate is pegged to platform MFS exchange rates, subject to administrative policy updates. 
              Accounts dormant for greater than 365 consecutive days may have unused points expired.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
            <p>
              Promoview acts as a technology intermediary between content creators and viewers. 
              In no event shall Promoview be held liable for third-party video content, external platform policy changes (YouTube, TikTok, Vimeo), 
              or payment gateway delays beyond our direct control.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
