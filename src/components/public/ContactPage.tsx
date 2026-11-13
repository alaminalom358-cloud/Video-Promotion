import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, MessageSquare, MapPin, Send, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'advertiser',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been received! Our support desk will reply within 4 hours.', 'success');
  };

  const faqs = [
    {
      q: 'How does Promoview prevent bot farms and automated scripts?',
      a: 'We implement multi-layered biometric behavior validation: active tab focus monitors, canvas fingerprinting, irregular mouse/touch movement validation, and post-watch verification questions.'
    },
    {
      q: 'Which video platforms are supported for promotion?',
      a: 'We support YouTube (standard videos & Shorts), TikTok, Vimeo, Instagram Reels, and X (Twitter) video posts.'
    },
    {
      q: 'What is the minimum payout threshold for viewers?',
      a: 'Users can withdraw rewards starting at 5,000 points via bKash, Nagad, or Rocket.'
    },
    {
      q: 'How long does vendor campaign approval take?',
      a: 'Our compliance desk audits submissions 24/7. Standard review turnaround is under 30 minutes to verify video content guidelines.'
    }
  ];

  return (
    <div className="bg-[#0B1021] text-slate-100 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Get in Touch</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">We’re Here to Help</h1>
          <p className="text-sm text-slate-300">
            Have questions about launching a campaign, partnership opportunities, or viewer payouts? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Dispatched</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Thank you, {formData.name}. Ticket #{Math.floor(100000 + Math.random() * 900000)} has been generated. 
                  Our account representative will reply to <span className="text-purple-300">{formData.email}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', category: 'advertiser', subject: '', message: '' });
                  }}
                  className="px-5 py-2 text-xs font-semibold text-purple-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Diana Prince"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="diana@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Inquiry Department</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="advertiser">Brand & Advertiser Sales</option>
                    <option value="creator">Creator & Vendor Support</option>
                    <option value="payouts">User Payouts & Points Inquiry</option>
                    <option value="press">Partnership & Media</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Scaling 500k video campaign across YouTube Shorts"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your goals, expected volumes, or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Info & Locations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Global Headquarters</h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">San Francisco, USA</p>
                    <p className="text-slate-400">548 Market St, Suite 9200, San Francisco, CA 94104</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">London, United Kingdom</p>
                    <p className="text-slate-400">100 Bishopsgate, London EC2N 4AG</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Email Desk</p>
                    <p className="text-slate-400">support@promoview.io</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
              <h4 className="text-sm font-bold text-purple-300">Fast-Track Enterprise Desk</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Planning campaigns with over 1,000,000 points monthly volume? 
                Email <span className="text-white font-mono">enterprise@promoview.io</span> for custom SLA, dedicated rep, and invoice billing.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6 pt-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Frequently Asked Questions</span>
            <h2 className="text-2xl font-bold text-white">Everything You Need to Know</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
