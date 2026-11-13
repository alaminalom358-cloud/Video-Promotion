import React from 'react';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#0B1021] text-slate-100 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Compliance & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400">
            Last Updated: November 2026 · Effective Date: January 1, 2025 · Compliant with GDPR & CCPA
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              Promoview collects necessary account identification information (email, username, payout account details) 
              as well as technical watch telemetry. To prevent fraudulent bot traffic and assure advertisers of genuine audience attention, 
              we evaluate client-side active browser focus, viewport presence, and device screen metrics during rewarded video playback.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Anti-Cheat Telemetry & Biometrics</h2>
            <p>
              We do NOT record user webcams, audio feeds, or unrelated browser histories. 
              Anti-cheat telemetry is strictly isolated to the Promoview player iframe: tracking whether the player window remains visible 
              and active on the user's display, and verifying random user interaction challenges.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Payout & Financial Data</h2>
            <p>
              Payout details (such as PayPal email addresses, crypto TRC20/ERC20 public addresses, or gift card delivery emails) 
              are encrypted via AES-256 and only transmitted to authorized payout processors. 
              We never sell or distribute your financial identifiers to third-party ad networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Cookies & Local Storage</h2>
            <p>
              Promoview utilizes functional cookies to maintain persistent user authentication sessions and record progress counters. 
              Third-party tracking cookies are kept to an absolute minimum.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. User Rights & Account Erasure</h2>
            <p>
              Under GDPR and CCPA regulations, you hold the legal right to inspect, correct, export, or permanently delete your account data. 
              To submit an erasure request, contact our Data Protection Officer at <span className="text-purple-300 font-mono">privacy@promoview.io</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
