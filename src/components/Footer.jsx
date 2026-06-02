import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';
import { getImageUrl } from '../utils/imageHelper';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings: siteSettings } = useSettings();
  const [links, setLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [settings, setSettings] = useState({
    footer_logo: "",
    footer_description: "Authentic South Indian flavours crafted with love. From crispy dosas and fluffy idlis to traditional sweets and filter coffee — taste the heritage of MBW Foods.",
    footer_cta_heading: "The Performance Archive",
    footer_cta_subheading: "Join our elite circle for private previews",
    footer_cta_placeholder: "Newsletter ID...",
    footer_cta_btn: "Apply",
    footer_copyright: `Copyrights © 2026 ${siteSettings.site_name || 'MBW Foods '}. All rights reserved.`,
    footer_powered_by: `Powered by ${siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'}`
  });
  const [email, setEmail] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus({ type: 'loading', message: 'Joining...' });
    try {
      const res = await fetch(`${API_BASE}/api/subscribers`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Successfully joined!' });
        setEmail('');
        setTimeout(() => setStatus({ type: '', message: '' }), 5000);
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to join.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Error. Try again later.' });
    }
  };

  useEffect(() => {
    // Fetch footer section settings (description, CTA, etc.)
    fetch(`${API_BASE}/api/section-settings?section=footer`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Object.keys(data).length > 0) setSettings(prev => ({ ...prev, ...data })); })
      .catch(console.error);

    // Fetch navigation links
    fetch(`${API_BASE}/api/footer-links`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setLinks(data.filter(l => l.status === 'Active') || []); })
      .catch(console.error);

    // Fetch social links
    fetch(`${API_BASE}/api/social-links`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setSocialLinks(data.filter(l => l.status === 'Active') || []); })
      .catch(console.error);

    // Fetch payment methods
    fetch(`${API_BASE}/api/payment-methods`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setPaymentMethods(data.filter(l => l.status === 'Active') || []); })
      .catch(console.error);
  }, []);

  // Define SVG icons for social media
  const SocialIcon = ({ type }) => {
    switch (type) {
      case 'Instagram':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
      case 'Pinterest':
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987S18.638 0 12.017 0z" /></svg>;
      case 'Threads':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 11c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z"></path><path d="M12 11c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4"></path><path d="M4.1 11c.1-3.3 2.1-6.1 5.1-7.1"></path><path d="M14.9 3.9c3 1 5 3.8 5.1 7.1"></path><path d="M19.9 13.5c-.2 3.2-2.1 6-5 7"></path><path d="M9.1 20.6c-3-1-5-3.8-5.1-7.1"></path></svg>;
      case 'Facebook':
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
      case 'Twitter':
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>;
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
    }
  };

  const categorizedLinks = links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  const categoryNames = Object.keys(categorizedLinks);

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-12 overflow-hidden relative">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-12">
          <div className="space-y-10">
            <Link to="/">
              <div className="flex items-center mb-8">
                <div className="h-40 flex items-center">
                  {siteSettings?.footer_logo ? (
                    <img
                      src={`${getImageUrl(siteSettings.footer_logo)}?t=${Date.now()}`}
                      alt={siteSettings.site_name || "MBW"}
                      className="h-full w-auto object-contain"
                    />
                  ) : siteSettings?.site_logo ? (
                    <img
                      src={`${getImageUrl(siteSettings.site_logo)}?t=${Date.now()}`}
                      alt={siteSettings.site_name || "Brand"}
                      className="h-full w-auto object-contain brightness-0 invert"
                    />
                  ) : (
                    <span className="text-4xl font-black text-white tracking-tighter">
                      {siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'Brand'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            <p className="max-w-md text-slate-300 font-light leading-relaxed text-sm">
              {settings.footer_description}
            </p>
            <div className="flex gap-6">
              {socialLinks.map(social => (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-all transform hover:scale-110">
                  <SocialIcon type={social.icon_type} />
                </a>
              ))}
            </div>
          </div>

          <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(categoryNames.length, 4)} gap-10`}>
            {categoryNames.map(catName => (
              <div key={catName} className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{catName}</h4>
                <ul className="space-y-4">
                  {categorizedLinks[catName].map(link => (
                    <React.Fragment key={link.id}>
                      <li>
                        <Link to={link.url} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Protocols */}
        {paymentMethods.length > 0 && (
          <div className="flex items-center justify-center lg:justify-end gap-10 mb-8">
            {paymentMethods.map(method => (
              <div key={method.id} className="bg-white/10 p-2 rounded-xl hover:bg-white transition-all group">
                <img
                  src={`${getImageUrl(method.logo)}?t=${Date.now()}`}
                  alt={method.name}
                  className="h-10 w-auto object-contain group-hover:scale-110 transition-transform"
                  title={method.name}
                />
              </div>
            ))}
          </div>
        )}

        {/* Newsletter / CTA Section */}
        <div className="border-y border-white/5 py-8 flex flex-col lg:flex-row items-center justify-between gap-10 mb-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-serif italic text-white">{settings.footer_cta_heading}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{settings.footer_cta_subheading}</p>
          </div>
          <div className="flex flex-col w-full max-w-md gap-3">
            <form onSubmit={handleSubscribe} className="flex w-full bg-white/5 border border-white/10 rounded-full p-1.5 focus-within:border-brand-accent transition-colors">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={settings.footer_cta_placeholder}
                className="bg-transparent flex-grow px-6 text-sm font-medium focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="px-8 py-3 bg-brand-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl disabled:opacity-50"
              >
                {status.type === 'loading' ? 'wait...' : settings.footer_cta_btn}
              </button>
            </form>
            {status.message && (
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 ${status.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status.message}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-6 border-t border-white/5">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-6">
              <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/return-policy" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 hover:text-white transition-colors">
                Return Policy
              </Link>

            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
              Copyrights © {currentYear} {siteSettings.site_name || 'MBW Car Accessories'}. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="text-slate-400">
              {settings.footer_powered_by?.split(/(MBW)/i).map((part, i) =>
                part.toLowerCase() === 'mbw' ? (
                  <a key={i} href="http://mbwit.net" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-white transition-colors cursor-pointer font-bold opacity-100">
                    {part}
                  </a>
                ) : part
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Background Aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-30 pointer-events-none"></div>
    </footer>
  );
}
