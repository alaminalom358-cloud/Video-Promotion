import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { ToastContainer } from './components/common/ToastContainer';

// Public Components
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { HowItWorksPage } from './components/public/HowItWorksPage';
import { ContactPage } from './components/public/ContactPage';
import { LoginPage } from './components/public/LoginPage';
import { RegisterPage } from './components/public/RegisterPage';
import { PrivacyPolicyPage } from './components/public/PrivacyPolicyPage';
import { TermsPage } from './components/public/TermsPage';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminVendors } from './components/admin/AdminVendors';
import { AdminCampaigns } from './components/admin/AdminCampaigns';
import { AdminPoints } from './components/admin/AdminPoints';
import { AdminRedemptions } from './components/admin/AdminRedemptions';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminNotifications } from './components/admin/AdminNotifications';
import { AdminSettings } from './components/admin/AdminSettings';

// Vendor Components
import { VendorLayout } from './components/vendor/VendorLayout';
import { VendorOverview } from './components/vendor/VendorOverview';
import { SubmitCampaign } from './components/vendor/SubmitCampaign';
import { VendorMyCampaigns } from './components/vendor/VendorMyCampaigns';
import { VendorFeedbackReports } from './components/vendor/VendorFeedbackReports';
import { VendorProfile } from './components/vendor/VendorProfile';

// User Components
import { UserLayout } from './components/user/UserLayout';
import { UserOverview } from './components/user/UserOverview';
import { DiscoverCampaigns } from './components/user/DiscoverCampaigns';
import { CampaignDetailWatcher } from './components/user/CampaignDetailWatcher';
import { UserActivities } from './components/user/UserActivities';
import { UserMyPoints } from './components/user/UserMyPoints';
import { UserPointsHistory } from './components/user/UserPointsHistory';
import { UserRedeem } from './components/user/UserRedeem';
import { UserNotifications } from './components/user/UserNotifications';
import { UserProfile } from './components/user/UserProfile';

const MainRouter: React.FC = () => {
  const { role, publicPage, adminPage, vendorPage, userPage } = useApp();

  // Render Public Website
  if (role === 'public') {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B1021]">
        <RoleSwitcherBar />
        <PublicNavbar />
        <main className="flex-1">
          {publicPage === 'home' && <HomePage />}
          {publicPage === 'about' && <AboutPage />}
          {publicPage === 'how-it-works' && <HowItWorksPage />}
          {publicPage === 'contact' && <ContactPage />}
          {publicPage === 'login' && <LoginPage />}
          {publicPage === 'register' && <RegisterPage />}
          {publicPage === 'privacy' && <PrivacyPolicyPage />}
          {publicPage === 'terms' && <TermsPage />}
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Render Admin Dashboard
  if (role === 'admin') {
    return (
      <div className="min-h-screen bg-[#0B1021]">
        <RoleSwitcherBar />
        <AdminLayout>
          {adminPage === 'overview' && <AdminOverview />}
          {adminPage === 'users' && <AdminUsers />}
          {adminPage === 'vendors' && <AdminVendors />}
          {adminPage === 'pending-campaigns' && <AdminCampaigns forcedStatus="pending" />}
          {adminPage === 'approved-campaigns' && <AdminCampaigns forcedStatus="approved" />}
          {adminPage === 'active-campaigns' && <AdminCampaigns forcedStatus="active" />}
          {adminPage === 'rejected-campaigns' && <AdminCampaigns forcedStatus="rejected" />}
          {adminPage === 'expired-campaigns' && <AdminCampaigns forcedStatus="expired" />}
          {adminPage === 'points-management' && <AdminPoints />}
          {adminPage === 'redemptions' && <AdminRedemptions />}
          {adminPage === 'analytics' && <AdminAnalytics />}
          {adminPage === 'notifications' && <AdminNotifications />}
          {adminPage === 'settings' && <AdminSettings />}
        </AdminLayout>
      </div>
    );
  }

  // Render Vendor Dashboard
  if (role === 'vendor') {
    return (
      <div className="min-h-screen bg-[#0B1021]">
        <RoleSwitcherBar />
        <VendorLayout>
          {vendorPage === 'overview' && <VendorOverview />}
          {vendorPage === 'submit-campaign' && <SubmitCampaign />}
          {vendorPage === 'my-campaigns' && <VendorMyCampaigns forcedFilter="all" />}
          {vendorPage === 'pending-campaigns' && <VendorMyCampaigns forcedFilter="pending" />}
          {vendorPage === 'approved-campaigns' && <VendorMyCampaigns forcedFilter="active" />}
          {vendorPage === 'campaign-history' && <VendorMyCampaigns forcedFilter="expired" />}
          {vendorPage === 'feedback-reports' && <VendorFeedbackReports />}
          {vendorPage === 'profile' && <VendorOverview />}
        </VendorLayout>
      </div>
    );
  }

  // Render User Dashboard
  if (role === 'user') {
    return (
      <div className="min-h-screen bg-[#0B1021]">
        <RoleSwitcherBar />
        <UserLayout>
          {userPage === 'overview' && <UserOverview />}
          {userPage === 'discover' && <DiscoverCampaigns />}
          {userPage === 'campaign-detail' && <CampaignDetailWatcher />}
          {userPage === 'my-activities' && <UserActivities />}
          {userPage === 'my-points' && <UserMyPoints />}
          {userPage === 'points-history' && <UserPointsHistory />}
          {userPage === 'redeem' && <UserRedeem />}
          {userPage === 'notifications' && <UserNotifications />}
          {userPage === 'profile' && <UserProfile />}
        </UserLayout>
      </div>
    );
  }

  return null;
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
      <ToastContainer />
    </AppProvider>
  );
}
