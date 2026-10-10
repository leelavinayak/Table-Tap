import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Difference from './components/Difference';
import PartnerNetwork from './components/PartnerNetwork';
import LiveSimulation from './components/LiveSimulation';
import Benefits from './components/Benefits';
import PreOrderReserve from './components/PreOrderReserve';
import PilotCta from './components/PilotCta';
import Footer from './components/Footer';
import PricingPage from './components/PricingPage';
import AddRestaurantPage from './components/AddRestaurantPage';
import PaymentPage from './components/PaymentPage';
import SupportPage from './components/SupportPage';

function getRoute() {
  const h = window.location.hash || '';
  if (h.startsWith('#/pricing')) return 'pricing';
  if (h.startsWith('#/add-restaurant')) return 'add-restaurant';
  if (h.startsWith('#/payment')) return 'payment';
  if (h.startsWith('#/support') || h.startsWith('#/contact')) return 'support';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash || '';
      const r = getRoute();
      setRoute(r);
      if (h.startsWith('#/')) {
        // page route -> top
        window.scrollTo({ top: 0 });
      } else if (h.startsWith('#') && h.length > 1) {
        // section anchor on home -> smooth scroll to it
        const id = h.slice(1);
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {route === 'pricing' ? (
          <PricingPage />
        ) : route === 'add-restaurant' ? (
          <AddRestaurantPage />
        ) : route === 'payment' ? (
          <PaymentPage />
        ) : route === 'support' ? (
          <SupportPage />
        ) : (
          <>
            <Hero />
            <Difference />
            <PartnerNetwork />
            <LiveSimulation />
            <Benefits />
            <PreOrderReserve />
            <PilotCta />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
