import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/index";
import Onboarding from "./pages/onboarding";
import AboutPage from "./pages/about";
import HowPage from "./pages/how";
import PricingPage from "./pages/pricing";
import NsfwPage from "./pages/nsfw";
import ContactPage from "./pages/contact";
import TermsPage from "./pages/terms";
import Pricacypage from "./pages/privacy";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how" element={<HowPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/nsfw" element={<NsfwPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<Pricacypage />} />
      </Routes>
    </Router>
  );
}