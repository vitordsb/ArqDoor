import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SocialFeed from "@/pages/SocialFeed";
import ClientProfile from "@/pages/ClientProfile";
import DemandsFeed from "@/pages/DemandsFeed";
import ProviderProfile from "@/pages/ProviderProfile";
import AuthPage from "@/pages/auth-page";
import Messages from "@/pages/Messages";
import ServicePage from "@/pages/ServicePage";
import LandingLayout from "@/components/layouts/LandingLayout";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import ServicesFeed from "@/pages/ServicesFeed.tsx";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import CompleteProfileModal from "@/components/modals/CompleteProfileModal";
import Invites from "@/pages/Invites";
import InvitePublic from "@/pages/InvitePublic";
import CookieConsent from "@/components/CookieConsent";

const LANDING_ROUTES = ["/", "/auth", "/admin"];

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/home" component={SocialFeed} />
      <Route path="/demands" component={DemandsFeed} />
      <Route path="/services/viewService" component={ServicePage} />
      <Route path="/services" component={ServicesFeed} />
      <Route path="/providers/:provider_id" component={ProviderProfile} />
      <Route path="/user/:user_id" component={ClientProfile} />
      <Route path="/messages/:userId?" component={Messages} />
      <Route path="/admin" component={Admin} />
      <Route path="/convites" component={Invites} />
      <Route path="/convite/:token" component={InvitePublic} />
      <Route path="/termos-de-uso" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
function AppContent() {
  const [location, navigate] = useLocation();
  const { isLoggedIn, isInitialized } = useAuth();

  const isInvitePublic = location.startsWith("/convite/");
  const isPublic = LANDING_ROUTES.includes(location) || isInvitePublic;
  const Layout = isInvitePublic
    ? (ApplicationLayout as any)
    : isPublic
      ? (LandingLayout as any)
      : (ApplicationLayout as any);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoggedIn && !isPublic) {
      navigate("/auth");
    }
  }, [isInitialized, isLoggedIn, isPublic, navigate]);

  useEffect(() => {
    sessionStorage.setItem("last_route", location);
  }, [location]);

  return (
    <Layout>
      <Router />
    </Layout>
  );
}
function App() {
  return (
    <>
      <AppContent />
      <CompleteProfileModal />
      <CookieConsent />
      <Toaster />
    </>
  );
}

export default App;
