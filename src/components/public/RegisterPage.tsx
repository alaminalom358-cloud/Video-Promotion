import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, ArrowRight, CheckCircle2, UserCheck, Briefcase, Eye, EyeOff } from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import { WORLD_COUNTRIES } from '../../data/countries';

export const RegisterPage: React.FC = () => {
  const { 
    setRole, 
    setUserPage, 
    setVendorPage, 
    setPublicPage, 
    showToast,
    handleFirebaseRegisterUser,
    handleFirebaseRegisterVendor,
    t
  } = useApp();

  const [accountType, setAccountType] = useState<'user' | 'vendor'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    country: '',
    password: '',
    confirmPassword: '',
    acceptTerms: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Please complete all required fields.', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    const normalizedRegEmail = formData.email.trim().toLowerCase();
    if (normalizedRegEmail === 'alaminalom358@gmail.com' || normalizedRegEmail === 'alom.outsourcing2020@gmail.com') {
      showToast(`This email address (${normalizedRegEmail}) is strictly reserved for Platform Administration. Public registration is not permitted.`, 'error');
      return;
    }

    setLoading(true);
    try {
      let ok = false;
      if (accountType === 'vendor') {
        ok = await handleFirebaseRegisterVendor(
          formData.company || `${formData.name} Media`,
          formData.name,
          formData.email,
          formData.password,
          formData.country || 'Unknown'
        );
      } else {
        ok = await handleFirebaseRegisterUser(
          formData.name,
          formData.email,
          formData.password,
          formData.country || 'Unknown'
        );
      }

      if (ok) {
        // Security: Clear registration form fields
        setFormData({
          name: '',
          email: '',
          company: '',
          country: '',
          password: '',
          confirmPassword: '',
          acceptTerms: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B1021] text-slate-100 min-h-screen py-16 flex items-center justify-center px-4 relative">
      <div className="absolute top-6 right-6">
        <LanguageSelector variant="compact" />
      </div>

      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Play className="h-5 w-5 fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('platform_name', 'Promoview')} {t('nav_register', 'Registration')}</h1>
          <p className="text-xs text-slate-400">{t('platform_tagline', 'Video Promotion & Reward Platform')}</p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType('user')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              accountType === 'user'
                ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <UserCheck className={`h-5 w-5 ${accountType === 'user' ? 'text-purple-400' : 'text-slate-400'}`} />
              {accountType === 'user' && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
            </div>
            <p className="text-sm font-bold text-white">{t('reg_watch_earn_title', 'Watch & Earn')}</p>
            <p className="text-[11px] text-slate-400 mt-1">{t('reg_watch_earn_desc', 'Get points & cash rewards for watching video premieres.')}</p>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('vendor')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              accountType === 'vendor'
                ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Briefcase className={`h-5 w-5 ${accountType === 'vendor' ? 'text-purple-400' : 'text-slate-400'}`} />
              {accountType === 'vendor' && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
            </div>
            <p className="text-sm font-bold text-white">{t('reg_promote_title', 'Promote Videos')}</p>
            <p className="text-[11px] text-slate-400 mt-1">{t('reg_promote_desc', 'Acquire guaranteed views and algorithmic boost for your media.')}</p>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t('reg_full_name', 'Full Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder=""
                  autoComplete="off"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t('reg_country', 'Country')}</label>
                <select
                  aria-label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="" className="bg-slate-950 text-slate-400" />
                  {WORLD_COUNTRIES.map((countryName) => (
                    <option key={countryName} value={countryName} className="bg-slate-950 text-white">
                      {countryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {accountType === 'vendor' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{t('reg_company_name', 'Company Name *')}</span>
                  <span className="text-[10px] text-slate-500 font-normal">ঐচ্ছিক (খালি রাখলে নামের সাথে Media যুক্ত হবে)</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  autoComplete="off"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">{t('reg_email_address', 'Email Address *')}</label>
              <input
                type="email"
                required
                placeholder=""
                autoComplete="off"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t('reg_password', 'Password *')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder=""
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t('reg_confirm_password', 'Confirm Password *')}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder=""
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1 accent-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-400">
                {t('reg_terms_agree', 'I agree to the Terms & Conditions and confirm I will comply with anti-fraud watch guidelines.')}
              </label>
            </div>

            <button
              type="submit"
              disabled={!formData.acceptTerms || loading}
              className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? t('loading', 'Loading...') : t('reg_complete_btn', 'Complete Registration')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          {t('reg_already_have_account', 'Already have an account?')}{' '}
          <button
            type="button"
            onClick={() => setPublicPage('login')}
            className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
          >
            {t('reg_sign_in_here', 'Sign In here')}
          </button>
        </p>
      </div>
    </div>
  );
};
