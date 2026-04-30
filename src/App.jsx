import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import GuestOrLoginPrompt from '@/components/auth/GuestOrLoginPrompt';
import { base44 } from '@/api/base44Client';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Disorders from './pages/Disorders';
import DisorderDetail from './pages/DisorderDetail';
import RootCauses from './pages/RootCauses';
import SymptomSpectrum from './pages/SymptomSpectrum';
import Remedies from './pages/Remedies';
import Analytics from './pages/Analytics';
import Forum from './pages/Forum';
import ForumThread from './pages/ForumThread';
import Wellness from './pages/Wellness';
import WellnessProgress from './pages/WellnessProgress';
import WellnessCircles from './pages/WellnessCircles';
import Journal from './pages/Journal';
import SavedResources from './pages/SavedResources';
import UserProfilePage from './pages/UserProfilePage';
import Messages from './pages/Messages';
import AdminModeration from './pages/AdminModeration';
import AdminConsole from './pages/AdminConsole';
import SupportGroups from './pages/SupportGroups';
import GroupChat from './pages/GroupChat';
import CopingToolbox from './pages/CopingToolbox';
import SupportDirectory from './pages/SupportDirectory';
import ProfessionalProfile from './pages/ProfessionalProfile';
import Mindfulness from './pages/Mindfulness';
import UserDashboard from './pages/UserDashboard';
import Leaderboards from './pages/Leaderboards';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Resources from './pages/Resources';
import AffirmationGallery from './pages/AffirmationGallery';
import MoodInsights from './pages/MoodInsights';
import TermsOfService from './pages/TermsOfService';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  // Allow public legal pages without auth
  const path = window.location.pathname;
  if (path === '/privacy') return <PrivacyPolicy />;
  if (path === '/terms') return <TermsOfService />;

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading Lumina Mentis...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    const isGuest = sessionStorage.getItem('lumina_guest') === 'true';
    if (isGuest) {
      // Allow guests to proceed past auth errors
    } else if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      const navigateToSignup = () => base44.auth.redirectToLogin(window.location.href + '?signup=true');
      const navigateToGoogle = () => base44.auth.signInWithGoogle(window.location.href);
      return <GuestOrLoginPrompt onGuest={() => { sessionStorage.setItem('lumina_guest', 'true'); window.location.reload(); }} onLogin={navigateToLogin} onSignup={navigateToSignup} onGoogle={navigateToGoogle} />;
    }
  }

  // Show prompt to unauthenticated non-guest visitors on public app
  const isGuest = sessionStorage.getItem('lumina_guest') === 'true';
  if (!isAuthenticated && !isGuest) {
    const navigateToSignup = () => base44.auth.redirectToLogin(window.location.href + '?signup=true');
    const navigateToGoogle = () => base44.auth.signInWithGoogle(window.location.href);
    return <GuestOrLoginPrompt onGuest={() => { sessionStorage.setItem('lumina_guest', 'true'); window.location.reload(); }} onLogin={navigateToLogin} onSignup={navigateToSignup} onGoogle={navigateToGoogle} />;
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/disorders" element={<Disorders />} />
        <Route path="/disorders/:slug" element={<DisorderDetail />} />
        <Route path="/root-causes" element={<RootCauses />} />
        <Route path="/symptom-spectrum" element={<SymptomSpectrum />} />
        <Route path="/remedies" element={<Remedies />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:threadId" element={<ForumThread />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/wellness-progress" element={<WellnessProgress />} />
        <Route path="/wellness-circles" element={<WellnessCircles />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/saved" element={<SavedResources />} />
        <Route path="/profile/:email" element={<UserProfilePage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
        <Route path="/admin/console" element={<AdminConsole />} />
        <Route path="/groups" element={<SupportGroups />} />
        <Route path="/groups/:groupId" element={<GroupChat />} />
        <Route path="/toolbox" element={<CopingToolbox />} />
        <Route path="/directory" element={<SupportDirectory />} />
        <Route path="/professional/:email" element={<ProfessionalProfile />} />
        <Route path="/mindfulness" element={<Mindfulness />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/affirmations" element={<AffirmationGallery />} />
        <Route path="/insights" element={<MoodInsights />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App