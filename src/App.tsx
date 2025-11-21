import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/AdminLayout";
import { SubdomainRouter } from "./components/SubdomainRouter";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { AdminCustomers } from "./pages/AdminCustomers";
import Trials from "./pages/Trials";
import { AdminPromos } from "./pages/AdminPromos";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminSettings } from "./pages/AdminSettings";
import { Calendar } from "./pages/Calendar";
import { Clients } from "./pages/Clients";
import { Requests } from "./pages/Requests";
import { Quotes } from "./pages/Quotes";
import { Jobs } from "./pages/Jobs";
import { Invoices } from "./pages/Invoices";
import { Expenses } from "./pages/Expenses";
import { Timesheets } from "./pages/Timesheets";
import { Tasks } from "./pages/Tasks";
import { Marketing } from "./pages/Marketing";
import { Automation } from "./pages/Automation";
import { Schedule } from "./pages/Schedule";
import { WebsiteBuilder } from "./pages/WebsiteBuilder";
import { WebsiteEditor } from "./pages/WebsiteEditor";
import { MySites } from "./pages/MySites";
import { Settings } from "./pages/Settings";
import ProfileSettings from "./pages/ProfileSettings";
import { Support } from "./pages/Support";
import { Pricing } from "./pages/Pricing";
import Inbox from "./pages/Inbox";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ResetPassword } from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import { Landing } from "./pages/Landing";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsAndConditions } from "./pages/TermsAndConditions";
import { RefundPolicy } from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";
import PublicWebsiteViewer from "./pages/PublicWebsiteViewer";
import { CheckoutSuccess } from "./pages/CheckoutSuccess";
import { Billing } from "./pages/Billing";
import BusinessPageSettings from "./pages/settings/business-page";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster />
      <Sonner />
      <SubdomainRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/preview/:websiteId" element={<ProtectedRoute><PublicWebsiteViewer /></ProtectedRoute>} />
          <Route path="/site/:slug" element={<PublicWebsiteViewer />} />
          <Route path="/site/:slug/:page" element={<PublicWebsiteViewer />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Layout><Clients /></Layout></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><Layout><Requests /></Layout></ProtectedRoute>} />
          <Route path="/quotes" element={<ProtectedRoute><Layout><Quotes /></Layout></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Layout><Jobs /></Layout></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Layout><Invoices /></Layout></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
          <Route path="/timesheets" element={<ProtectedRoute><Layout><Timesheets /></Layout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><Layout><Marketing /></Layout></ProtectedRoute>} />
          {/* Removed old /automation route */}
          <Route path="/schedule" element={<ProtectedRoute><Layout><Schedule /></Layout></ProtectedRoute>} />
          <Route path="/website-builder" element={<ProtectedRoute><Layout><WebsiteBuilder /></Layout></ProtectedRoute>} />
          <Route path="/website-builder/my-sites" element={<ProtectedRoute><Layout><MySites /></Layout></ProtectedRoute>} />
          <Route path="/website-builder/edit/:websiteId" element={<ProtectedRoute><Layout><WebsiteEditor /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/settings/profile" element={<ProtectedRoute><Layout><ProfileSettings /></Layout></ProtectedRoute>} />
          <Route path="/settings/business-page" element={<ProtectedRoute><Layout><BusinessPageSettings /></Layout></ProtectedRoute>} />
          <Route path="/settings/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Layout><Pricing /></Layout></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Layout><Support /></Layout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminLayout><Admin /></AdminLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute><AdminRoute><AdminLayout><AdminCustomers /></AdminLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/trials" element={<ProtectedRoute><AdminRoute><AdminLayout><Trials /></AdminLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/promos" element={<ProtectedRoute><AdminRoute><AdminLayout><AdminPromos /></AdminLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/automation" element={<ProtectedRoute><AdminRoute><AdminLayout><Automation /></AdminLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SubdomainRouter>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
