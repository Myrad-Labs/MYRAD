import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ContributorPage from './pages/ContributorPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HowToUsePage from './pages/HowToUsePage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import WhitepaperPage from './pages/Whitepaper';
import TeamsPage from './pages/TeamsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contribute" element={<ContributorPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/how-to-use" element={<HowToUsePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/whitepaper" element={<WhitepaperPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/team" element={<TeamsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;