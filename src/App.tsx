import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import LandingLayout from "@/components/layouts/LandingLayout";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import CompleteProfileModal from "@/components/modals/CompleteProfileModal";
import CookieConsent from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const LANDING_ROUTES = ["/", "/auth"];
const ADMIN_ROUTES = ["/admin"];

// Route-level code splitting: reduces the initial JS payload in production.
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/Home"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const Profile = lazy(() => import("@/pages/Profile"));
const SocialFeed = lazy(() => import("@/pages/SocialFeed"));
const DemandsFeed = lazy(() => import("@/pages/DemandsFeed"));
const ServicePage = lazy(() => import("@/pages/ServicePage"));
const ServicesFeed = lazy(() => import("@/pages/ServicesFeed"));
const ProviderProfile = lazy(() => import("@/pages/ProviderProfile"));
const ClientProfile = lazy(() => import("@/pages/ClientProfile"));
const Messages = lazy(() => import("@/pages/Messages"));
const Admin = lazy(() => import("@/pages/Admin"));
const Invites = lazy(() => import("@/pages/Invites"));
const InvitePublic = lazy(() => import("@/pages/InvitePublic"));

function RouteLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
      Carregando...
    </div>
  );
}

function PlainLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function Router() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        <Route path="/"><Home /></Route>
        <Route path="/auth"><AuthPage /></Route>
        <Route path="/profile"><Profile /></Route>
        <Route path="/home"><SocialFeed /></Route>
        <Route path="/demands"><DemandsFeed /></Route>
        <Route path="/services/viewService"><ServicePage /></Route>
        <Route path="/services"><ServicesFeed /></Route>
        <Route path="/providers/:provider_id"><ProviderProfile /></Route>
        <Route path="/user/:user_id"><ClientProfile /></Route>
        <Route path="/messages/:userId?"><Messages /></Route>
        <Route path="/admin"><Admin /></Route>
        <Route path="/convites"><Invites /></Route>
        <Route path="/convite/:token"><InvitePublic /></Route>
        <Route path="/termos-de-uso"><NotFound /></Route>
        <Route><NotFound /></Route>
      </Switch>
    </Suspense>
  );
}
function AppContent() {
  const [location, navigate] = useLocation();
  const { isLoggedIn, isInitialized } = useAuth();

  const isInvitePublic = location.startsWith("/convite/");
  const isAdminRoute = ADMIN_ROUTES.includes(location);
  const isPublic = LANDING_ROUTES.includes(location) || isInvitePublic || isAdminRoute;
  const Layout = isInvitePublic
    ? (ApplicationLayout as any)
    : isAdminRoute
      ? (PlainLayout as any)
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
    <ErrorBoundary>
      <AppContent />
      <CompleteProfileModal />
      <CookieConsent />
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
