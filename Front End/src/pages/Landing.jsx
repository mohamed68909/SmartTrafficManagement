// STEP 5/6/7 DONE — Landing.jsx (Arabic RTL) — API-driven with auth
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import ThemeToggle from '../components/ThemeToggle';
import * as authService from '../api/services/authService';

const Landing = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [typeText, setTypeText] = useState('');
  const heroRef = useRef(null);

  // ── Auth form state ──
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regStoreArea, setRegStoreArea] = useState('');
  const [regProviderName, setRegProviderName] = useState('');
  const [regProviderCat, setRegProviderCat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const phrases = [
    'AI-powered smart traffic management',
    '24/7 emergency services',
    'A network of smart sensors across Cairo & Giza',
    'Egypt’s leading auto parts marketplace',
  ];

  useEffect(() => {
    let phraseIdx = 0, charIdx = 0, deleting = false;
    const tick = () => {
      const phrase = phrases[phraseIdx];
      if (!deleting) {
        setTypeText(phrase.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === phrase.length) {
          deleting = true;
          setTimeout(tick, 2000);
          return;
        }
      } else {
        setTypeText(phrase.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 30 : 60);
    };
    const timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── If already logged in, redirect ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      const route = authService.getRoleRoute(role);
      if (route !== '/') navigate(route, { replace: true });
    }
  }, [navigate]);

  const features = [
    { icon: '🗺️', title: 'Live traffic map', desc: 'Smart sensors across Cairo & Giza deliver real-time congestion data and instant alerts.', tag: 'Live data', color: 'var(--neon)' },
    { icon: '🚗', title: 'Emergency towing & rescue', desc: 'Get a verified rescue unit to your location in under 12 minutes — 24/7.', tag: '24/7 response', color: 'var(--blue)' },
    { icon: '⛽', title: 'Emergency fuel delivery', desc: 'Stuck with an empty tank? Order Octane 92/95 or diesel to your location via GPS.', tag: 'Delivery', color: 'var(--amber)' },
    { icon: '🔧', title: 'Mobile mechanic', desc: 'Connect with verified mechanics for instant repair or live video diagnostics.', tag: 'Verified', color: 'var(--red)' },
    { icon: '🛞', title: 'Tires & parts marketplace', desc: 'Browse premium tires, oils, and brake parts from verified sellers. Same-day installation available.', tag: 'E-commerce', color: 'var(--emerald)' },
    { icon: '🛡️', title: 'Smart sensing network', desc: 'More than 30 IoT sensors across Cairo powering our neural traffic network.', tag: 'IoT network', color: 'var(--purple)' },
  ];

  const galleryItems = [
    { icon: '🗺️', label: 'Map', title: 'Live traffic map', sub: 'Live city view' },
    { icon: '🚗', label: 'Towing', title: 'Select towing', sub: 'Choose a rescue unit' },
    { icon: '⛽', label: 'Fuel', title: 'Emergency fuel', sub: 'Delivered in minutes' },
    { icon: '🛞', label: 'Store', title: 'Tire service', sub: 'Buy & install tires' },
    { icon: '🔧', label: 'Service', title: 'Scheduled maintenance', sub: 'Book a service anytime' },
    { icon: '📊', label: 'Dashboard', title: 'Driver dashboard', sub: 'A complete view of activity' },
    { icon: '💬', label: 'Support', title: 'Live support chat', sub: '24/7 help' },
    { icon: '💳', label: 'Payments', title: 'Smart payments', sub: 'Vodafone Cash & PayPal' },
    { icon: '🌡️', label: 'Environment', title: 'Vehicle environment', sub: 'Road temperature & air quality' },
  ];

  const stats = [
    { val: '50,000+', label: 'Registered drivers', delta: '↑ 34% this year' },
    { val: '1,200+', label: 'Service providers', delta: '↑ 22% this year' },
    { val: '284,000+', label: 'Completed requests', delta: '↑ 41% this year' },
    { val: '98%', label: 'Driver satisfaction', delta: 'Best-in-class' },
  ];

  // ── Auth handlers ──
  const handleLogin = async () => {
    if (!loginEmail || !loginPass) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await authService.login(loginEmail, loginPass);
      showToast('You’re logged in successfully! Redirecting…', 'ok');
      setTimeout(() => navigate(result.redirect), 500);
    } catch (err) {
      setError(err.message || 'An error occurred while logging in');
      showToast(err.message || 'Login failed', 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedRole) {
      showToast('Please choose an account type first', 'err');
      return;
    }
    if (!regFirstName || !regLastName || !regEmail || !regPhone || !regPass) {
      setError('Please fill in all required fields');
      return;
    }
    if (regPass !== regConfirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.register({
        role: selectedRole, firstName: regFirstName, lastName: regLastName,
        email: regEmail, phone: regPhone, password: regPass,
        storeName: regStoreName, storeArea: regStoreArea,
        providerName: regProviderName, providerCategory: regProviderCat,
      });
      showToast('Account created successfully! Welcome to Smart Traffic', 'ok');
      setCurrentTab('login');
    } catch (err) {
      setError(err.message || 'An error occurred while signing up');
      showToast(err.message || 'Sign up failed', 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await authService.forgotPassword(loginEmail || 'user@example.com');
      showToast('Password reset email sent', 'ok');
    } catch (err) {
      showToast(err.message || 'An error occurred', 'err');
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Cairo, var(--body), sans-serif' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 5%', height: 66, display: 'flex', alignItems: 'center', gap: 20,
        background: scrolled ? 'rgba(4,6,8,.97)' : 'rgba(4,6,8,.85)',
        backdropFilter: 'blur(14px)', borderBottom: `1px solid rgba(170,255,0,${scrolled ? '.14' : '.08'})`,
        transition: 'all .3s',
      }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: 'var(--neon)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--head)', fontSize: 20, color: '#000',
            boxShadow: '0 0 16px var(--neon-glow)',
          }}>ST</div>
          <div style={{ fontFamily: 'var(--head)', fontSize: 18, letterSpacing: 1, color: 'var(--text)' }}>
            Smart <span style={{ color: 'var(--neon)' }}>Traffic</span>
          </div>
        </a>
        <div style={{ display: 'flex', gap: 6, marginRight: 'auto', alignItems: 'center' }}>
          {['Features', 'Gallery', 'About', 'Contact us'].map(link => (
            <a key={link} className="hide-mobile" href="#features" style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              color: 'var(--text2)', cursor: 'pointer', transition: 'all .15s', textDecoration: 'none',
            }}>{link}</a>
          ))}
          <button onClick={() => document.getElementById('signin')?.scrollIntoView({ behavior: 'smooth' })} style={{
            padding: '8px 22px', background: 'var(--neon)', color: '#000', borderRadius: 8,
            fontFamily: 'var(--head)', fontSize: 16, letterSpacing: .5, cursor: 'pointer',
            border: 'none', transition: 'all .18s',
            }}>Log in</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        height: '100vh', minHeight: 700, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }} ref={heroRef}>
        {/* Animated grid */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(rgba(170,255,0,.025) 1px,transparent 1px), linear-gradient(90deg,rgba(170,255,0,.025) 1px,transparent 1px)',
          backgroundSize: '60px 60px', animation: 'gridMove 20s linear infinite',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 900, height: 900,
          background: 'radial-gradient(ellipse,rgba(170,255,0,.07) 0%,transparent 65%)',
          animation: 'glowBreath 4s ease-in-out infinite',
        }} />
        {/* Scan line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,transparent,rgba(170,255,0,.4),transparent)',
          animation: 'scan 4s linear infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', maxWidth: 1000 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.2)',
            borderRadius: 20, padding: '5px 16px', fontSize: 11, fontFamily: 'var(--mono)',
            color: 'var(--neon)', letterSpacing: 2, marginBottom: 28, animation: 'fadeDown .8s ease both',
          }}>
            <div style={{ width: 6, height: 6, background: 'var(--neon)', borderRadius: '50%', animation: 'blink 1.5s infinite' }} />
            Cairo · Giza · Greater Cairo
          </div>

          <h1 style={{
            fontFamily: 'var(--head)', fontSize: 'clamp(52px,8vw,110px)',
            lineHeight: .92, letterSpacing: 2, marginBottom: 20, animation: 'fadeDown .9s .1s ease both',
          }}>
            <div>Management</div>
            <div style={{ color: 'var(--neon)', textShadow: '0 0 40px var(--neon-glow)' }}>Smart Traffic</div>
            <div style={{ color: 'rgba(200,216,232,.25)' }}>For urban mobility</div>
          </h1>

          <div style={{
            fontSize: 'clamp(15px,2vw,20px)', color: 'var(--text2)',
            marginBottom: 36, minHeight: 30, animation: 'fadeDown 1s .2s ease both',
            fontFamily: 'var(--mono)',
          }}>
            <span style={{ color: 'var(--neon)' }}>{typeText}</span>
            <span style={{ display: 'inline-block', width: 2, height: '1.1em', background: 'var(--neon)', verticalAlign: 'text-bottom', marginRight: 2, animation: 'cursorBlink .8s infinite' }} />
          </div>

          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeDown 1.1s .3s ease both', marginBottom: 44,
          }}>
            <button onClick={() => document.getElementById('signin')?.scrollIntoView({ behavior: 'smooth' })} style={{
              padding: '14px 34px', borderRadius: 10, fontFamily: 'var(--head)',
              fontSize: 18, letterSpacing: 1, cursor: 'pointer', border: 'none',
              background: 'var(--neon)', color: '#000', display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all .2s',
            }}>🚀 Get started</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{
              padding: '14px 34px', borderRadius: 10, fontFamily: 'var(--head)',
              fontSize: 18, letterSpacing: 1, cursor: 'pointer',
              background: 'transparent', color: 'var(--text)', border: '1px solid rgba(200,216,232,.2)',
              display: 'flex', alignItems: 'center', gap: 10, transition: 'all .2s',
            }}>▶ Watch demo</button>
          </div>

          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', animation: 'fadeDown 1.2s .4s ease both' }}>
            {[
              { val: '50K+', lbl: 'Active drivers' },
              { val: '1,200+', lbl: 'Service providers' },
              { val: '99.2%', lbl: 'Uptime' },
              { val: '<12 min', lbl: 'Avg. response time' },
            ].map(s => (
              <div key={s.lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 32, letterSpacing: 1, color: 'var(--neon)' }}>{s.val}</div>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 5%' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 1, background: 'var(--neon)', display: 'inline-block' }} />
          Why Smart Traffic
        </div>
        <h2 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(36px,5vw,64px)', letterSpacing: 1, lineHeight: 1, marginBottom: 16 }}>
          Built for <span style={{ color: 'var(--neon)' }}>mobility</span><br />advanced urban mobility
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 520, lineHeight: 1.7 }}>
          Everything your vehicle needs — live traffic intelligence, instant emergency response, and a connected marketplace. All in one platform.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18, marginTop: 56 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 12, padding: '26px 24px', transition: 'all .25s', cursor: 'default',
              position: 'relative', overflow: 'hidden', color: f.color,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(170,255,0,.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .5, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
              <div style={{
                display: 'inline-block', marginTop: 12, fontSize: 10, fontFamily: 'var(--mono)',
                padding: '2px 9px', borderRadius: 3, background: 'var(--bg)', color: 'var(--text)', opacity: .95,
              }}>{f.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <div style={{
        padding: '60px 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 1, background: 'rgba(255,255,255,.05)', position: 'relative',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg)', padding: '32px 24px', textAlign: 'center',
            cursor: 'default', transition: 'background .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--neon-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
          >
            <div style={{ fontFamily: 'var(--head)', fontSize: 48, letterSpacing: 2, color: 'var(--neon)', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text)', letterSpacing: 2, marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: 'var(--neon)', marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* GALLERY */}
      <section id="gallery" style={{ padding: '80px 5%', background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--neon)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 1, background: 'var(--neon)', display: 'inline-block' }} />
          The platform in action
        </div>
        <h2 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(36px,5vw,64px)', letterSpacing: 1, lineHeight: 1 }}>
          Inside <span style={{ color: 'var(--neon)' }}>the app</span>
        </h2>
        <div style={{ overflow: 'hidden', marginTop: 44, position: 'relative' }}>
          <div style={{
            display: 'flex', gap: 16, animation: 'scroll 28s linear infinite', width: 'max-content',
          }}>
            {[...galleryItems, ...galleryItems].map((g, i) => (
              <div key={i} style={{
                width: 240, height: 160, borderRadius: 10, overflow: 'hidden',
                border: '1px solid var(--border2)', flexShrink: 0,
                position: 'relative', cursor: 'pointer', transition: 'all .2s',
                background: 'var(--card2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 52 }}>{g.icon}</div>
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text2)',
                  padding: '2px 8px', borderRadius: 3,
                }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGN IN SECTION */}
      <section id="signin" style={{
        padding: '100px 5%', display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 60, alignItems: 'center', minHeight: '100vh',
      }}>
        {/* Right side - info */}
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--neon)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 30, height: 1, background: 'var(--neon)', display: 'inline-block' }} />
            Join the platform
          </div>
          <h2 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(40px,5vw,72px)', letterSpacing: 1, lineHeight: .95, marginBottom: 20 }}>
            Grow<br /><span style={{ color: 'var(--neon)' }}>your business</span><br />with us
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 420, marginBottom: 30 }}>
            Whether you run a towing service or an auto parts store, Smart Traffic connects you with thousands of drivers across Cairo & Giza — instantly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { num: '1', title: 'Create your account', sub: 'Choose a seller or service provider and sign up in minutes' },
              { num: '2', title: 'Verify & get approved', sub: 'Submit your documents — our team reviews within 24 hours' },
              { num: '3', title: 'Start & earn', sub: 'Begin receiving requests from 50,000+ drivers' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, background: 'var(--neon-dim)',
                  border: '1px solid rgba(170,255,0,.2)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontFamily: 'var(--head)', fontSize: 14, color: 'var(--neon)',
                  flexShrink: 0, marginTop: 2,
                }}>{s.num}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left side - Sign In Card */}
        <div style={{
          background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 16, padding: '38px 36px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,.5)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg,transparent,var(--neon),transparent)',
          }} />
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, background: 'var(--neon)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--head)', fontSize: 26, color: '#000',
              margin: '0 auto 14px', boxShadow: '0 0 24px var(--neon-glow)',
            }}>ST</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: 26, letterSpacing: .5, marginBottom: 4 }}>Welcome back</div>
            <div style={{ fontSize: 12.5, color: 'var(--text2)' }}>Log in to your Smart Traffic account</div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,45,72,.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 14,
              fontSize: 12.5, color: 'var(--red)', textAlign: 'center',
            }}>{error}</div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.07)', marginBottom: 20 }}>
            {[
              { key: 'login', label: 'Log in' },
              { key: 'register', label: 'Create account' },
            ].map(tab => (
              <div key={tab.key} onClick={() => { setCurrentTab(tab.key); setError(''); }} style={{
                flex: 1, padding: '9px 0', textAlign: 'center', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', color: currentTab === tab.key ? 'var(--neon)' : 'var(--text2)',
                borderBottom: `2px solid ${currentTab === tab.key ? 'var(--neon)' : 'transparent'}`,
                transition: 'all .15s',
              }}>{tab.label}</div>
            ))}
          </div>

          {/* Login Form */}
          {currentTab === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, animation: 'paneIn .2s ease' }}>
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>Email address</div>
                <input className="fi" type="email" placeholder="you@example.com" dir="ltr" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>Password</div>
                <input className="fi" type="password" placeholder="••••••••" dir="ltr" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '-4px 0' }}>
                <span style={{ fontSize: 12, color: 'var(--neon)', cursor: 'pointer' }} onClick={handleForgotPassword}>Forgot your password?</span>
              </div>
              <button onClick={handleLogin} disabled={loading} style={{
                width: '100%', padding: 13, background: loading ? 'var(--border2)' : 'var(--neon)', color: '#000',
                border: 'none', borderRadius: 10, fontFamily: 'var(--head)', fontSize: 19,
                letterSpacing: 1, cursor: loading ? 'wait' : 'pointer', transition: 'all .2s', marginTop: 4,
                opacity: loading ? .6 : 1,
              }}>{loading ? 'Loading…' : 'Log in →'}</button>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text2)' }}>
                Don’t have an account? <span style={{ color: 'var(--neon)', cursor: 'pointer' }} onClick={() => { setCurrentTab('register'); setError(''); }}>Create one here</span>
              </div>
              {/* Test accounts hint */}
              <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 1.5, marginBottom: 6 }}>Demo accounts</div>
                {[
                  { email: 'provider@test.com', label: 'Service provider' },
                  { email: 'seller@test.com', label: 'Seller' },
                  { email: 'admin@test.com', label: 'Admin' },
                  { email: 'cs@test.com', label: 'Customer support' },
                ].map(a => (
                  <div key={a.email} onClick={() => { setLoginEmail(a.email); setLoginPass('123456'); }} style={{
                    fontSize: 11, color: 'var(--text3)', cursor: 'pointer', padding: '2px 0',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{a.email}</span>
                    <span style={{ color: 'var(--neon)', fontSize: 10 }}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Register Form */}
          {currentTab === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, animation: 'paneIn .2s ease' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>I am</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {[
                  { key: 'seller', icon: '🏪', name: 'Seller', desc: 'Auto parts & tires store' },
                  { key: 'provider', icon: '🚛', name: 'Service provider', desc: 'Towing, fuel & mobile mechanic' },
                ].map(role => (
                  <div key={role.key} onClick={() => setSelectedRole(role.key)} style={{
                    padding: 16, borderRadius: 10, border: `1.5px solid ${selectedRole === role.key ? 'var(--neon)' : 'rgba(255,255,255,.08)'}`,
                    background: selectedRole === role.key ? 'var(--neon-dim)' : 'rgba(255,255,255,.02)',
                    cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 7 }}>{role.icon}</div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 16, letterSpacing: .3, marginBottom: 3 }}>{role.name}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{role.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>First name</div>
                  <input className="fi" placeholder="John" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Last name</div>
                  <input className="fi" placeholder="Doe" value={regLastName} onChange={e => setRegLastName(e.target.value)} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Email address</div>
                <input className="fi" type="email" placeholder="you@example.com" dir="ltr" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Phone number</div>
                <input className="fi" type="tel" placeholder="+20 1XX XXX XXXX" dir="ltr" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Password</div>
                  <input className="fi" type="password" placeholder="••••••••" dir="ltr" value={regPass} onChange={e => setRegPass(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Confirm</div>
                  <input className="fi" type="password" placeholder="••••••••" dir="ltr" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
                </div>
              </div>

              {selectedRole === 'seller' && (
                <div style={{ background: 'rgba(170,255,0,.03)', border: '1px solid rgba(170,255,0,.1)', borderRadius: 8, padding: 14, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 1.5, marginBottom: 10 }}>🏪 Seller details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="fi" placeholder="e.g., Tire World Egypt" value={regStoreName} onChange={e => setRegStoreName(e.target.value)} />
                    <input className="fi" placeholder="e.g., Cairo and Giza" value={regStoreArea} onChange={e => setRegStoreArea(e.target.value)} />
                  </div>
                </div>
              )}

              {selectedRole === 'provider' && (
                <div style={{ background: 'rgba(170,255,0,.03)', border: '1px solid rgba(170,255,0,.1)', borderRadius: 8, padding: 14, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 1.5, marginBottom: 10 }}>🚛 Service provider details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="fi" placeholder="e.g., Quick Rescue" value={regProviderName} onChange={e => setRegProviderName(e.target.value)} />
                    <select className="fi" value={regProviderCat} onChange={e => setRegProviderCat(e.target.value)}>
                      <option value="">Select category</option>
                      <option value="ونش / سحب">Towing / rescue</option>
                      <option value="توصيل وقود">Fuel delivery</option>
                      <option value="ميكانيكي متنقل">Mobile mechanic</option>
                      <option value="خدمة إطارات">Tire services</option>
                    </select>
                  </div>
                </div>
              )}

              <button onClick={handleRegister} disabled={loading} style={{
                width: '100%', padding: 13, background: loading ? 'var(--border2)' : 'var(--neon)', color: '#000',
                border: 'none', borderRadius: 10, fontFamily: 'var(--head)', fontSize: 19,
                letterSpacing: 1, cursor: loading ? 'wait' : 'pointer', transition: 'all .2s', marginTop: 4,
                opacity: loading ? .6 : 1,
              }}>{loading ? 'Loading…' : 'Create account →'}</button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '50px 5% 30px', borderTop: '1px solid rgba(255,255,255,.04)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 30,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--neon)', borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--head)', fontSize: 18, color: '#000',
            }}>ST</div>
            <span style={{ fontFamily: 'var(--head)', fontSize: 16, letterSpacing: .5, paddingBottom: 18, display: 'inline-block' }}>Smart Traffic</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
            An AI-powered smart urban mobility platform for Cairo and Giza.
          </p>
        </div>
        {[
          { title: 'Platform', links: ['Features', 'How it works', 'For providers', 'For sellers'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Partnerships'] },
          { title: 'Support', links: ['Help Center', 'Contact us', 'Privacy Policy', 'Terms & Conditions'] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'var(--head)', fontSize: 14, letterSpacing: .5, color: 'var(--neon)', marginBottom: 12 }}>{col.title}</div>
            {col.links.map(link => (
              <a key={link} href="#" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', textDecoration: 'none', marginBottom: 7, cursor: 'pointer', transition: 'color .15s' }}>{link}</a>
            ))}
          </div>
        ))}
      </footer>
      <div style={{
        padding: '18px 5%', borderTop: '1px solid rgba(255,255,255,.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
      }}>
        <span>© 2026 Smart Traffic. All rights reserved.</span>
        <span>Version 2.4.0</span>
      </div>
    </div>
  );
};

export default Landing;
