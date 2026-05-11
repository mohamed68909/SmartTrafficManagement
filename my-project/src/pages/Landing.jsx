// Landing Page
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useTranslation } from '../i18n/LanguageContext';
import * as authService from '../api/services/authService';

const Landing = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginFieldErrors, setLoginFieldErrors] = useState({});
  const [showRegSuccess, setShowRegSuccess] = useState(false);

  const phrases = t('landing.hero.phrases');

  useEffect(() => {
    let phraseIdx = 0, charIdx = 0, deleting = false;
    let timerId = null;
    let cancelled = false;

    const schedule = (delay) => {
      if (cancelled) return;
      timerId = setTimeout(tick, delay);
    };

    const tick = () => {
      if (cancelled) return;
      const phrase = phrases[phraseIdx];
      if (!deleting) {
        setTypeText(phrase.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === phrase.length) {
          deleting = true;
          schedule(2000);
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
      schedule(deleting ? 30 : 60);
    };

    setTypeText('');
    schedule(500);

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      const route = authService.getRoleRoute(role);
      if (route !== '/') navigate(route, { replace: true });
    }
  }, [navigate]);

  const featureColors = ['var(--neon)', 'var(--blue)', 'var(--amber)', 'var(--red)', 'var(--emerald)', 'var(--purple)', 'var(--blue)', 'var(--neon)'];
  const features = t('landing.features').map((f, i) => ({ ...f, color: featureColors[i] }));
  const galleryItems = t('landing.galleryItems');
  const stats = t('landing.stats');

  // ── Auth handlers ──
  const handleLogin = async () => {
    const errs = {};
    if (!loginEmail.trim())                                          errs.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) errs.email    = 'Invalid email format';
    if (!loginPass)                                                  errs.password = 'Password is required';
    else if (loginPass.length < 6)                                   errs.password = 'At least 6 characters';

    if (Object.keys(errs).length > 0) {
      setLoginFieldErrors(errs);
      return;
    }

    setLoginFieldErrors({});
    setError('');
    setLoading(true);
    try {
      const result = await authService.login(loginEmail.trim(), loginPass);
      showToast(t('landing.signin.toasts.loginSuccess'), 'ok');
      setTimeout(() => navigate(result.redirect), 500);
    } catch (err) {
      setError(err.message || t('landing.signin.errors.loginGeneric'));
      showToast(err.message || t('landing.signin.errors.loginFailed'), 'err');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    const errs = {};
    if (!selectedRole)                          errs._role     = 'Please select your role';
    if (!regFirstName.trim())                   errs.firstName = 'First name is required';
    else if (regFirstName.trim().length < 2)    errs.firstName = 'At least 2 characters';
    if (!regLastName.trim())                    errs.lastName  = 'Last name is required';
    else if (regLastName.trim().length < 2)     errs.lastName  = 'At least 2 characters';
    if (!regEmail.trim())                       errs.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs.email = 'Invalid email format';
    if (!regPhone.trim())                       errs.phone     = 'Phone number is required';
    else if (!/^[0-9+\s\-]{7,15}$/.test(regPhone.trim()))  errs.phone = 'Invalid phone number';
    if (!regPass)                               errs.password  = 'Password is required';
    else if (regPass.length < 8)               errs.password  = 'At least 8 characters';
    else if (!/[A-Z]/.test(regPass))           errs.password  = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(regPass))           errs.password  = 'Must include a number';
    else if (!/[@#$!%*?&]/.test(regPass))      errs.password  = 'Must include a special character (@#$!%*?&)';
    if (!regConfirm)                            errs.confirm   = 'Please confirm your password';
    else if (regPass !== regConfirm)            errs.confirm   = 'Passwords do not match';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      if (errs._role) showToast(errs._role, 'err');
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      await authService.register({
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        phoneNumber: regPhone.trim(),
        password: regPass,
        requestedRole: selectedRole,
      });
      const result = await authService.login(regEmail.trim(), regPass);
      setShowRegSuccess(true);
      setTimeout(() => {
        setShowRegSuccess(false);
        navigate(result.redirect);
      }, 2500);
    } catch (err) {
      setError(err.message || t('landing.signin.errors.regGeneric'));
      showToast(err.message || t('landing.signin.errors.regFailed'), 'err');
    } finally { setLoading(false); }
  };



  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Cairo, var(--body), sans-serif' }}>

      {/* ── GLOBAL KEYFRAMES (injected once) ── */}
      <style>{`
        @keyframes gridMove    { to { backgroundPosition: 60px 60px; } }
        @keyframes scan        { 0%{top:-4px} 100%{top:100%} }
        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeDown    { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes paneIn      { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scroll      { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes glowBreath  { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.12)} }

        /* ── Dark mode aurora blobs ── */
        @keyframes auroraA { 0%,100%{transform:translate(0,0) scale(1)}   50%{transform:translate(60px,-40px) scale(1.15)} }
        @keyframes auroraB { 0%,100%{transform:translate(0,0) scale(1)}   50%{transform:translate(-50px,50px) scale(1.1)}  }
        @keyframes auroraC { 0%,100%{transform:translate(0,0) scale(1)}   33%{transform:translate(40px,60px) scale(1.08)}  66%{transform:translate(-30px,-30px) scale(0.95)} }
        @keyframes auroraD { 0%,100%{transform:translate(0,0) scale(1)}   40%{transform:translate(-70px,30px) scale(1.2)}  80%{transform:translate(30px,-20px) scale(0.9)} }

        .aurora-blob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }

        /* ════════════════════════════════════════════════════════════════
           LIGHT MODE — ANTARCTIC CURTAIN AURORA  (fully animated)
           Each band morphs shape, shifts hue, ripples vertically
           ════════════════════════════════════════════════════════════════ */

        /* Band 1 — primary emerald curtain, big vertical ripple + hue drift */
        @keyframes curtain1 {
          0%   { transform: translateY(0)    scaleX(1)    skewY(-3deg); opacity:.70; filter:blur(36px) hue-rotate(0deg);
                 border-radius: 60% 40% 55% 45% / 32% 28% 72% 68%; }
          18%  { border-radius: 52% 48% 62% 38% / 42% 18% 82% 58%; }
          35%  { transform: translateY(-65px) scaleX(1.14) skewY(4deg);  opacity:.98; filter:blur(26px) hue-rotate(22deg);
                 border-radius: 45% 55% 48% 52% / 38% 42% 58% 62%; }
          55%  { border-radius: 58% 42% 52% 48% / 28% 36% 64% 72%; }
          72%  { transform: translateY(-30px) scaleX(.91) skewY(-2deg); opacity:.78; filter:blur(44px) hue-rotate(8deg); }
          88%  { border-radius: 62% 38% 58% 42% / 34% 24% 76% 66%; }
          100% { transform: translateY(0)    scaleX(1)    skewY(-3deg); opacity:.70; filter:blur(36px) hue-rotate(0deg);
                 border-radius: 60% 40% 55% 45% / 32% 28% 72% 68%; }
        }

        /* Band 2 — teal/cyan secondary, offset phase, morphing blob */
        @keyframes curtain2 {
          0%   { transform: translateY(0)    scaleX(1)    skewY(2deg);  opacity:.58; filter:blur(46px) hue-rotate(0deg);
                 border-radius: 50% 50% 62% 38% / 36% 26% 74% 64%; }
          25%  { border-radius: 44% 56% 55% 45% / 44% 18% 82% 56%; }
          45%  { transform: translateY(70px)  scaleX(.90) skewY(-4deg); opacity:.95; filter:blur(32px) hue-rotate(-18deg);
                 border-radius: 56% 44% 46% 54% / 30% 44% 56% 70%; }
          65%  { border-radius: 48% 52% 60% 40% / 40% 30% 70% 60%; }
          80%  { transform: translateY(28px)  scaleX(1.11) skewY(3deg); opacity:.68; filter:blur(52px) hue-rotate(-6deg); }
          100% { transform: translateY(0)    scaleX(1)    skewY(2deg);  opacity:.58; filter:blur(46px) hue-rotate(0deg);
                 border-radius: 50% 50% 62% 38% / 36% 26% 74% 64%; }
        }

        /* Band 3 — mint/lime slow pulse from above */
        @keyframes curtain3 {
          0%   { transform: translateY(0)    scaleX(1)    skewY(-1deg); opacity:.52; filter:blur(54px) hue-rotate(0deg);
                 border-radius: 46% 54% 50% 50% / 42% 22% 78% 58%; }
          30%  { border-radius: 54% 46% 44% 56% / 36% 38% 62% 64%; }
          50%  { transform: translateY(-80px) scaleX(1.16) skewY(2deg);  opacity:.90; filter:blur(38px) hue-rotate(30deg);
                 border-radius: 50% 50% 56% 44% / 28% 46% 54% 72%; }
          80%  { transform: translateY(-22px) scaleX(.94) skewY(-2deg); opacity:.62; filter:blur(58px) hue-rotate(12deg); }
          100% { transform: translateY(0)    scaleX(1)    skewY(-1deg); opacity:.52; filter:blur(54px) hue-rotate(0deg);
                 border-radius: 46% 54% 50% 50% / 42% 22% 78% 58%; }
        }

        /* Band 4 — right-side cyan/indigo drift */
        @keyframes curtain4 {
          0%   { transform: translateY(0)   scaleX(1)    skewY(3deg);  opacity:.48; filter:blur(50px) hue-rotate(0deg);
                 border-radius: 54% 46% 44% 56% / 28% 38% 62% 72%; }
          40%  { transform: translateY(-50px) scaleX(1.08) skewY(-2deg); opacity:.85; filter:blur(36px) hue-rotate(-25deg); }
          60%  { border-radius: 44% 56% 56% 44% / 40% 28% 72% 60%; }
          80%  { transform: translateY(40px) scaleX(.88) skewY(4deg);  opacity:.60; filter:blur(56px) hue-rotate(-10deg); }
          100% { transform: translateY(0)   scaleX(1)    skewY(3deg);  opacity:.48; filter:blur(50px) hue-rotate(0deg);
                 border-radius: 54% 46% 44% 56% / 28% 38% 62% 72%; }
        }

        /* ── STAR TWINKLE ── */
        @keyframes starPop {
          0%,100% { transform:scale(0); opacity:0; }
          40%,60% { transform:scale(1); opacity:1; }
        }
        @keyframes starDrift {
          0%   { transform:translateY(0) scale(1);   opacity:.9; }
          50%  { transform:translateY(-8px) scale(1.3); opacity:1; }
          100% { transform:translateY(0) scale(1);   opacity:.9; }
        }

        /* ── METEOR / MOON-SHOT ── */
        @keyframes meteor {
          0%   { transform:translate(0,0) rotate(35deg)    scaleX(0); opacity:0; }
          5%   { opacity:1; transform:translate(20px,-14px) rotate(35deg) scaleX(1); }
          100% { transform:translate(420px,-300px) rotate(35deg) scaleX(1); opacity:0; }
        }
        @keyframes meteor2 {
          0%   { transform:translate(0,0) rotate(28deg)    scaleX(0); opacity:0; }
          5%   { opacity:.8; transform:translate(14px,-10px) rotate(28deg) scaleX(1); }
          100% { transform:translate(320px,-240px) rotate(28deg) scaleX(1); opacity:0; }
        }

        /* ── SILVER SHINE on "Management" ── */
        @keyframes silverShine {
          0%   { background-position: -300% center; }
          100% { background-position: 300%  center; }
        }
        .management-shine {
          background: linear-gradient(100deg,
            rgba(160,185,210,.35) 0%,
            rgba(160,185,210,.35) 30%,
            rgba(230,242,255,.95) 42%,
            rgba(255,255,255,1)   50%,
            rgba(230,242,255,.95) 58%,
            rgba(160,185,210,.35) 70%,
            rgba(160,185,210,.35) 100%
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: silverShine 3.6s linear infinite;
        }

        /* ════════════════════════════════════════════════════════════════
           LIGHT MODE CSS OVERRIDES
           ════════════════════════════════════════════════════════════════ */

        /* ★ CURTAIN BAND 1 */
        :root[data-theme="light"] .aurora-blob-a {
          border-radius: 60% 40% 55% 45% / 32% 28% 72% 68% !important;
          background: linear-gradient(105deg,
            rgba(16,185,129,.0)  0%,
            rgba(16,185,129,.6)  14%,
            rgba(20,184,166,.72) 34%,
            rgba(6,182,212,.58)  55%,
            rgba(34,211,238,.45) 72%,
            rgba(16,185,129,.22) 88%,
            rgba(16,185,129,.0)  100%
          ) !important;
          top: -18% !important; left: -10% !important;
          width: 130% !important; height: 430px !important;
          filter: blur(36px) !important;
          animation: curtain1 8s ease-in-out infinite !important;
        }

        /* ★ CURTAIN BAND 2 */
        :root[data-theme="light"] .aurora-blob-b {
          border-radius: 50% 50% 62% 38% / 36% 26% 74% 64% !important;
          background: linear-gradient(98deg,
            rgba(20,184,166,.0)  0%,
            rgba(20,184,166,.52) 20%,
            rgba(6,182,212,.68)  42%,
            rgba(99,102,241,.42) 62%,
            rgba(20,184,166,.28) 80%,
            rgba(20,184,166,.0)  100%
          ) !important;
          top: -5% !important; left: -5% !important; right: auto !important;
          width: 120% !important; height: 350px !important;
          filter: blur(46px) !important;
          animation: curtain2 11s ease-in-out infinite !important;
        }

        /* ★ CURTAIN BAND 3 */
        :root[data-theme="light"] .aurora-blob-c {
          border-radius: 46% 54% 50% 50% / 42% 22% 78% 58% !important;
          background: linear-gradient(112deg,
            rgba(52,211,153,.0)  0%,
            rgba(52,211,153,.58) 18%,
            rgba(74,222,128,.52) 38%,
            rgba(163,230,53,.36) 58%,
            rgba(52,211,153,.22) 78%,
            rgba(52,211,153,.0)  100%
          ) !important;
          top: -26% !important; left: 8% !important; right: auto !important;
          width: 112% !important; height: 370px !important;
          filter: blur(54px) !important;
          animation: curtain3 14s ease-in-out infinite !important;
        }

        /* ★ CURTAIN BAND 4 */
        :root[data-theme="light"] .aurora-blob-d {
          border-radius: 54% 46% 44% 56% / 28% 38% 62% 72% !important;
          background: linear-gradient(88deg,
            rgba(6,182,212,.0)   0%,
            rgba(6,182,212,.40)  22%,
            rgba(34,211,238,.52) 45%,
            rgba(99,102,241,.30) 65%,
            rgba(6,182,212,.18)  82%,
            rgba(6,182,212,.0)   100%
          ) !important;
          top: -10% !important; left: auto !important; right: -6% !important;
          width: 88% !important; height: 320px !important;
          filter: blur(50px) !important;
          animation: curtain4 17s ease-in-out infinite !important;
        }

        /* ★ Grid */
        :root[data-theme="light"] .hero-grid {
          background:
            linear-gradient(rgba(20,184,166,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,184,166,.07) 1px, transparent 1px) !important;
        }

        /* ★ Radial glow */
        :root[data-theme="light"] .hero-radial {
          background: radial-gradient(ellipse at 50% 30%, rgba(16,185,129,.13) 0%, rgba(6,182,212,.06) 40%, transparent 70%) !important;
        }

        /* ★ Scan line */
        :root[data-theme="light"] .hero-scan {
          background: linear-gradient(90deg, transparent, rgba(16,185,129,.55), transparent) !important;
        }

        /* ★ Navbar */
        :root[data-theme="light"] .st-navbar {
          background: rgba(255,255,255,.93) !important;
          border-bottom: 1px solid rgba(16,185,129,.2) !important;
          box-shadow: 0 1px 20px rgba(16,185,129,.06) !important;
        }
        :root[data-theme="light"] .st-navbar.scrolled {
          background: rgba(255,255,255,.98) !important;
          border-bottom: 1px solid rgba(16,185,129,.35) !important;
          box-shadow: 0 4px 30px rgba(16,185,129,.12) !important;
        }

        /* ══════════════════════════════════════════════════════════
           ★ FEATURE CARDS — vivid per-card colored edges
           ══════════════════════════════════════════════════════════ */
        :root[data-theme="light"] .feat-card {
          background: #ffffff !important;
          border: 2px solid transparent !important;
          border-radius: 14px !important;
          box-shadow: 0 2px 10px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.05) !important;
          transition: transform .25s, box-shadow .25s, border-color .25s !important;
        }
        :root[data-theme="light"] .feat-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 16px 48px rgba(0,0,0,.12) !important;
        }
        /* Card 1 — green/neon */
        :root[data-theme="light"] .feat-card:nth-child(1)       { border-color: rgba(74,222,128,.55)  !important; box-shadow: 0 2px 14px rgba(74,222,128,.15) !important; }
        :root[data-theme="light"] .feat-card:nth-child(1):hover { border-color: rgba(74,222,128,.9)   !important; box-shadow: 0 12px 40px rgba(74,222,128,.25) !important; }
        /* Card 2 — blue */
        :root[data-theme="light"] .feat-card:nth-child(2)       { border-color: rgba(59,130,246,.5)   !important; box-shadow: 0 2px 14px rgba(59,130,246,.13) !important; }
        :root[data-theme="light"] .feat-card:nth-child(2):hover { border-color: rgba(59,130,246,.85)  !important; box-shadow: 0 12px 40px rgba(59,130,246,.22) !important; }
        /* Card 3 — amber */
        :root[data-theme="light"] .feat-card:nth-child(3)       { border-color: rgba(245,158,11,.5)   !important; box-shadow: 0 2px 14px rgba(245,158,11,.13) !important; }
        :root[data-theme="light"] .feat-card:nth-child(3):hover { border-color: rgba(245,158,11,.85)  !important; box-shadow: 0 12px 40px rgba(245,158,11,.22) !important; }
        /* Card 4 — red */
        :root[data-theme="light"] .feat-card:nth-child(4)       { border-color: rgba(239,68,68,.48)   !important; box-shadow: 0 2px 14px rgba(239,68,68,.12) !important; }
        :root[data-theme="light"] .feat-card:nth-child(4):hover { border-color: rgba(239,68,68,.82)   !important; box-shadow: 0 12px 40px rgba(239,68,68,.2)  !important; }
        /* Card 5 — emerald */
        :root[data-theme="light"] .feat-card:nth-child(5)       { border-color: rgba(16,185,129,.52)  !important; box-shadow: 0 2px 14px rgba(16,185,129,.13) !important; }
        :root[data-theme="light"] .feat-card:nth-child(5):hover { border-color: rgba(16,185,129,.88)  !important; box-shadow: 0 12px 40px rgba(16,185,129,.23) !important; }
        /* Card 6 — purple */
        :root[data-theme="light"] .feat-card:nth-child(6)       { border-color: rgba(139,92,246,.5)   !important; box-shadow: 0 2px 14px rgba(139,92,246,.13) !important; }
        :root[data-theme="light"] .feat-card:nth-child(6):hover { border-color: rgba(139,92,246,.85)  !important; box-shadow: 0 12px 40px rgba(139,92,246,.22) !important; }
        /* Card 7 — blue (repeat) */
        :root[data-theme="light"] .feat-card:nth-child(7)       { border-color: rgba(14,165,233,.5)   !important; box-shadow: 0 2px 14px rgba(14,165,233,.13) !important; }
        :root[data-theme="light"] .feat-card:nth-child(7):hover { border-color: rgba(14,165,233,.85)  !important; box-shadow: 0 12px 40px rgba(14,165,233,.22) !important; }
        /* Card 8 — lime/neon */
        :root[data-theme="light"] .feat-card:nth-child(8)       { border-color: rgba(132,204,22,.52)  !important; box-shadow: 0 2px 14px rgba(132,204,22,.13) !important; }
        :root[data-theme="light"] .feat-card:nth-child(8):hover { border-color: rgba(132,204,22,.88)  !important; box-shadow: 0 12px 40px rgba(132,204,22,.23) !important; }

        /* Card tag pill */
        :root[data-theme="light"] .feat-card .feat-tag-pill {
          background: rgba(240,253,250,1) !important;
          color: rgba(5,150,105,1) !important;
          border: 1px solid rgba(16,185,129,.25) !important;
        }

        /* ★ Stat band */
        :root[data-theme="light"] .stat-band {
          background: linear-gradient(180deg, rgba(240,253,250,.6) 0%, rgba(236,254,255,.4) 100%) !important;
        }
        :root[data-theme="light"] .stat-cell {
          background: #ffffff !important;
          border: 1.5px solid rgba(20,184,166,.18) !important;
          box-shadow: 0 2px 12px rgba(16,185,129,.07) !important;
        }
        :root[data-theme="light"] .stat-cell:hover {
          background: linear-gradient(135deg, rgba(240,253,250,.9) 0%, rgba(236,254,255,.7) 100%) !important;
          border-color: rgba(16,185,129,.45) !important;
          box-shadow: 0 6px 24px rgba(16,185,129,.15) !important;
        }

        /* ★ Sign-in card */
        :root[data-theme="light"] .signin-card {
          background: #ffffff !important;
          border: 2px solid rgba(20,184,166,.22) !important;
          box-shadow: 0 20px 60px rgba(16,185,129,.12), 0 4px 20px rgba(6,182,212,.08) !important;
        }

        /* ★ Hero badge */
        :root[data-theme="light"] .hero-badge {
          background: rgba(240,253,250,.92) !important;
          border: 1px solid rgba(16,185,129,.38) !important;
          box-shadow: 0 2px 10px rgba(16,185,129,.12) !important;
        }

        /* ★ Footer */
        :root[data-theme="light"] .st-footer {
          border-top: 1px solid rgba(20,184,166,.15) !important;
          background: rgba(240,253,250,.3) !important;
        }

        /* ★ Gallery cards */
        :root[data-theme="light"] .gallery-card {
          background: #ffffff !important;
          border: 2px solid rgba(20,184,166,.22) !important;
          box-shadow: 0 3px 12px rgba(16,185,129,.08) !important;
        }
        :root[data-theme="light"] .gallery-card:hover {
          border-color: rgba(16,185,129,.52) !important;
          box-shadow: 0 8px 24px rgba(16,185,129,.16) !important;
        }

        /* ★ Hero muted text */
        :root[data-theme="light"] .hero-muted {
          color: rgba(20,184,166,.25) !important;
        }

        /* ★ Watch-demo button */
        :root[data-theme="light"] .btn-outline {
          border: 1.5px solid rgba(20,184,166,.45) !important;
          color: rgba(5,150,105,.85) !important;
          background: rgba(240,253,250,.5) !important;
        }
        :root[data-theme="light"] .btn-outline:hover {
          background: rgba(240,253,250,.9) !important;
          border-color: rgba(16,185,129,.7) !important;
        }

        /* ★ Silver shine — also show subtly in dark mode */
        .management-shine {
          background: linear-gradient(100deg,
            rgba(160,185,210,.28) 0%,
            rgba(160,185,210,.28) 30%,
            rgba(220,235,252,.92) 42%,
            rgba(255,255,255,1)   50%,
            rgba(220,235,252,.92) 58%,
            rgba(160,185,210,.28) 70%,
            rgba(160,185,210,.28) 100%
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: silverShine 3.6s linear infinite;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="st-navbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 5%', height: 66, display: 'flex', alignItems: 'center', gap: 20,
        background: scrolled ? 'rgba(4,6,8,.97)' : 'rgba(4,6,8,.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid rgba(170,255,0,${scrolled ? '.14' : '.08'})`,
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
        <div style={{ display: 'flex', gap: 6, marginInlineStart: 'auto', alignItems: 'center' }}>
          {[
            { key: 'features', label: t('landing.nav.features'), href: '#features' },
            { key: 'gallery',  label: t('landing.nav.gallery'),  href: '#gallery'  },
            { key: 'about',    label: t('landing.nav.about'),    href: '#features' },
            { key: 'contact',  label: t('landing.nav.contact'),  href: '#contact' },
          ].map(link => (
            <a key={link.key} className="hide-mobile" href={link.href} style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              color: 'var(--text2)', cursor: 'pointer', transition: 'all .15s', textDecoration: 'none',
            }}>{link.label}</a>
          ))}
          <button onClick={() => document.getElementById('signin')?.scrollIntoView({ behavior: 'smooth' })} style={{
            padding: '8px 22px', background: 'var(--neon)', color: '#000', borderRadius: 8,
            fontFamily: 'var(--head)', fontSize: 16, letterSpacing: .5, cursor: 'pointer',
            border: 'none', transition: 'all .18s',
          }}>{t('landing.nav.signIn')}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        height: '100vh', minHeight: 700, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }} ref={heroRef}>

        {/* Aurora blobs — behind everything */}
        <div className="aurora-blob aurora-blob-a" style={{
          width: 700, height: 700, top: '5%', left: '-8%',
          background: 'radial-gradient(ellipse, rgba(138,43,226,.22) 0%, transparent 65%)',
          animation: 'auroraA 12s ease-in-out infinite',
        }} />
        <div className="aurora-blob aurora-blob-b" style={{
          width: 600, height: 600, top: '20%', right: '-5%',
          background: 'radial-gradient(ellipse, rgba(0,210,255,.18) 0%, transparent 65%)',
          animation: 'auroraB 15s ease-in-out infinite',
        }} />
        <div className="aurora-blob aurora-blob-c" style={{
          width: 500, height: 500, bottom: '10%', left: '30%',
          background: 'radial-gradient(ellipse, rgba(170,255,0,.12) 0%, transparent 65%)',
          animation: 'auroraC 18s ease-in-out infinite',
        }} />
        <div className="aurora-blob aurora-blob-d" style={{
          width: 450, height: 450, top: '40%', left: '55%',
          background: 'radial-gradient(ellipse, rgba(236,72,153,.14) 0%, transparent 65%)',
          animation: 'auroraD 20s ease-in-out infinite',
        }} />

        {/* ── METEORS / moon-shot streaks ── */}
        {[
          { top: '12%', left: '18%', delay: '0s',   dur: '5.5s',  w: 90,  anim: 'meteor'  },
          { top: '28%', left: '55%', delay: '2.8s',  dur: '4.8s',  w: 65,  anim: 'meteor2' },
          { top: '8%',  left: '72%', delay: '1.4s',  dur: '6.2s',  w: 110, anim: 'meteor'  },
          { top: '40%', left: '33%', delay: '4.1s',  dur: '5.0s',  w: 75,  anim: 'meteor2' },
        ].map((m, i) => (
          <div key={`meteor-${i}`} style={{
            position: 'absolute', top: m.top, left: m.left, zIndex: 1,
            width: m.w, height: 1.5, pointerEvents: 'none',
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.85) 60%, rgba(255,255,255,0))',
            animation: `${m.anim} ${m.dur} ${m.delay} ease-out infinite`,
            opacity: 0,
          }} />
        ))}

        {/* ── STAR SPARKS — tiny twinkling dots ── */}
        {[
          { top: '14%', left: '12%', delay: '0s',   dur: '2.1s', size: 3 },
          { top: '22%', left: '80%', delay: '.6s',  dur: '1.8s', size: 2 },
          { top: '35%', left: '47%', delay: '1.2s', dur: '2.4s', size: 2.5 },
          { top: '10%', left: '62%', delay: '1.8s', dur: '1.6s', size: 2 },
          { top: '50%', left: '25%', delay: '.3s',  dur: '2.8s', size: 3 },
          { top: '18%', left: '38%', delay: '2.1s', dur: '2.0s', size: 2 },
          { top: '42%', left: '70%', delay: '.9s',  dur: '1.9s', size: 2.5 },
          { top: '60%', left: '15%', delay: '1.5s', dur: '2.3s', size: 2 },
          { top: '30%', left: '88%', delay: '2.7s', dur: '1.7s', size: 3 },
          { top: '55%', left: '52%', delay: '.4s',  dur: '2.6s', size: 2 },
          { top: '8%',  left: '90%', delay: '1.1s', dur: '2.2s', size: 2.5 },
          { top: '68%', left: '78%', delay: '2.4s', dur: '1.5s', size: 2 },
        ].map((s, i) => (
          <div key={`star-${i}`} style={{
            position: 'absolute', top: s.top, left: s.left, zIndex: 1,
            width: s.size, height: s.size, borderRadius: '50%', pointerEvents: 'none',
            background: '#fff',
            boxShadow: `0 0 ${s.size * 2}px ${s.size}px rgba(255,255,255,.6)`,
            animation: `starPop ${s.dur} ${s.delay} ease-in-out infinite`,
          }} />
        ))}

        {/* Animated grid */}
        <div className="hero-grid" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(rgba(170,255,0,.025) 1px,transparent 1px), linear-gradient(90deg,rgba(170,255,0,.025) 1px,transparent 1px)',
          backgroundSize: '60px 60px', animation: 'gridMove 20s linear infinite',
        }} />
        {/* Radial glow */}
        <div className="hero-radial" style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 900, height: 900,
          background: 'radial-gradient(ellipse,rgba(170,255,0,.06) 0%,transparent 65%)',
          animation: 'glowBreath 4s ease-in-out infinite',
        }} />
        {/* Scan line */}
        <div className="hero-scan" style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,transparent,rgba(170,255,0,.4),transparent)',
          animation: 'scan 4s linear infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px',marginTop:'66px' ,  maxWidth: 1000 }}>
          <div className="hero-badge" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.2)',
            borderRadius: 20, padding: '5px 16px', fontSize: 11, fontFamily: 'var(--mono)',
            color: 'var(--neon)', letterSpacing: 2, marginBottom: 28, animation: 'fadeDown .8s ease both',
          }}>
            <div style={{ width: 6, height: 6, background: 'var(--neon)', borderRadius: '50%', animation: 'blink 1.5s infinite' }} />
            {t('landing.hero.badge')}
          </div>

          <h1 style={{
            fontFamily: 'var(--head)', fontSize: 'clamp(52px,8vw,110px)',
            lineHeight: .92, letterSpacing: 2, marginBottom: 20, animation: 'fadeDown .9s .1s ease both',
          }}>
            <div>{t('landing.hero.titleLine1')}</div>
            <div style={{ color: 'var(--neon)', textShadow: '0 0 40px var(--neon-glow)' }}>{t('landing.hero.titleLine2')}</div>
            <div className="hero-muted management-shine" style={{ color: 'rgba(200,216,232,.25)' }}>{t('landing.hero.titleLine3')}</div>
          </h1>

          <div style={{
            fontSize: 'clamp(15px,2vw,20px)', color: 'var(--text2)',
            marginBottom: 36, minHeight: 30, animation: 'fadeDown 1s .2s ease both',
            fontFamily: 'var(--mono)',
          }}>
            <span style={{ color: 'var(--neon)' }}>{typeText}</span>
            <span style={{
              display: 'inline-block', width: 2, height: '1.1em',
              background: 'var(--neon)', verticalAlign: 'text-bottom', marginRight: 2,
              animation: 'cursorBlink .8s infinite',
            }} />
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
            }}>{t('landing.hero.cta')}</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline" style={{
              padding: '14px 34px', borderRadius: 10, fontFamily: 'var(--head)',
              fontSize: 18, letterSpacing: 1, cursor: 'pointer',
              background: 'transparent', color: 'var(--text)', border: '1px solid rgba(200,216,232,.2)',
              display: 'flex', alignItems: 'center', gap: 10, transition: 'all .2s',
            }}>{t('landing.hero.secondaryCta')}</button>
          </div>

          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', animation: 'fadeDown 1.2s .4s ease both' }}>
            {t('landing.hero.heroStats').map(s => (
              <div key={s.lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 32, letterSpacing: 1, color: 'var(--neon)' }}>{s.val}</div>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 5%' }}>

        {/* Header row: image-pane (left) + text (right) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56,
          alignItems: 'center', marginBottom: 72,
        }}>

          {/* ── LEFT: mock app screenshot ── */}
          <div style={{
            borderRadius: 18, overflow: 'hidden', position: 'relative',
            border: '1px solid rgba(170,255,0,.12)',
            background: 'rgba(8,14,10,.9)',
            boxShadow: '0 0 60px rgba(170,255,0,.06), 0 24px 60px rgba(0,0,0,.5)',
            minHeight: 340,
          }}>
            {/* Top bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px',
              borderBottom: '1px solid rgba(170,255,0,.08)',
              background: 'rgba(170,255,0,.03)',
            }}>
              {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: .7 }} />
              ))}
              <div style={{
                flex: 1, marginLeft: 6, height: 20, borderRadius: 4,
                background: 'rgba(170,255,0,.06)', display: 'flex', alignItems: 'center',
                paddingLeft: 10,
              }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--neon)', opacity: .5 }}>
                  smarttraffic.eg/map/live
                </span>
              </div>
            </div>

            {/* Map mock */}
            <div style={{ position: 'relative', padding: '18px 18px 14px' }}>
              {/* Grid lines */}
              <svg width="100%" height="220" style={{ position: 'absolute', top: 0, left: 0, opacity: .1 }}>
                {[0,1,2,3,4].map(i => (
                  <line key={`h${i}`} x1="0" y1={44*i} x2="100%" y2={44*i} stroke="rgba(170,255,0,1)" strokeWidth=".5"/>
                ))}
                {[0,1,2,3,4,5].map(i => (
                  <line key={`v${i}`} x1={`${i*20}%`} y1="0" x2={`${i*20}%`} y2="100%" stroke="rgba(170,255,0,1)" strokeWidth=".5"/>
                ))}
              </svg>

              {/* Road dots */}
              {[
                { top: 30,  left: '15%',  w: '60%', h: 4,  col: 'rgba(170,255,0,.45)' },
                { top: 80,  left: '25%',  w: '50%', h: 3,  col: 'rgba(0,210,255,.4)' },
                { top: 130, left: '10%',  w: '70%', h: 4,  col: 'rgba(255,180,0,.4)' },
                { top: 175, left: '30%',  w: '40%', h: 3,  col: 'rgba(170,255,0,.3)' },
              ].map((r, i) => (
                <div key={i} style={{
                  position: 'absolute', top: r.top, left: r.left, width: r.w, height: r.h,
                  background: r.col, borderRadius: 2,
                }} />
              ))}

              {/* Pulsing location pins */}
              {[
                { top: 40,  left: '35%', col: 'var(--neon)' },
                { top: 100, left: '60%', col: 'var(--blue)' },
                { top: 155, left: '20%', col: 'var(--amber)' },
              ].map((pin, i) => (
                <div key={i} style={{ position: 'absolute', top: pin.top - 6, left: pin.left }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', background: pin.col,
                    boxShadow: `0 0 12px ${pin.col}`,
                    animation: `blink ${1.2 + i * 0.4}s infinite`,
                  }} />
                </div>
              ))}

              {/* Status badges */}
              <div style={{ marginTop: 210, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(() => {
                  const badges = t('landing.whyUs.mapBadges');
                  const colors = ['var(--neon)', 'var(--amber)', 'var(--blue)'];
                  return badges.map((label, i) => (
                    <div key={i} style={{
                      fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 1.5,
                      padding: '3px 8px', borderRadius: 4,
                      border: `1px solid ${colors[i]}`,
                      color: colors[i], background: `${colors[i]}11`,
                    }}>{label}</div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* ── RIGHT: heading + text ── */}
          <div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)',
              letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ width: 30, height: 1, background: 'var(--neon)', display: 'inline-block' }} />
              {t('landing.whyUs.eyebrow')}
            </div>
            <h2 style={{
              fontFamily: 'var(--head)', fontSize: 'clamp(36px,5vw,64px)',
              letterSpacing: 1, lineHeight: 1, marginBottom: 16,
            }}>
              {t('landing.whyUs.titleA')} <span style={{ color: 'var(--neon)' }}>{t('landing.whyUs.titleHl')}</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 480, lineHeight: 1.7, marginBottom: 28 }}>
              {t('landing.whyUs.desc')}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {t('landing.whyUs.perks').map(p => (
                <div key={p.text} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 14px', borderRadius: 8,
                  border: '1px solid rgba(170,255,0,.15)',
                  background: 'rgba(170,255,0,.04)',
                  fontSize: 13, color: 'var(--text)',
                }}>
                  <span>{p.icon}</span> {p.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8-card grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18,
        }}>
          {features.map((f, i) => (
            <div key={i} className="feat-card" style={{
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
              <div className="feat-tag-pill" style={{
                display: 'inline-block', marginTop: 12, fontSize: 10, fontFamily: 'var(--mono)',
                padding: '2px 9px', borderRadius: 3, background: 'var(--bg)', color: 'var(--text)', opacity: .9,
              }}>{f.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div className="stat-band" style={{
        padding: '60px 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 1, background: 'rgba(255,255,255,.05)', position: 'relative',
      }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-cell" style={{
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

      {/* ── GALLERY ── */}
      <section id="gallery" style={{
        padding: '80px 5%', background: 'var(--bg)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--neon)', letterSpacing: 3,
          textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 30, height: 1, background: 'var(--neon)', display: 'inline-block' }} />
          {t('landing.gallery.eyebrow')}
        </div>
        <h2 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(36px,5vw,64px)', letterSpacing: 1, lineHeight: 1 }}>
          {t('landing.gallery.titleA')} <span style={{ color: 'var(--neon)' }}>{t('landing.gallery.titleHl')}</span>
        </h2>
        <div style={{ overflow: 'hidden', marginTop: 44, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 16, animation: 'scroll 28s linear infinite', width: 'max-content' }}>
            {[...galleryItems, ...galleryItems].map((g, i) => (
              <div key={i} className="gallery-card" style={{
                width: 240, height: 160, borderRadius: 10, overflow: 'hidden',
                border: '1px solid var(--border2)', flexShrink: 0,
                position: 'relative', cursor: 'pointer', transition: 'all .2s',
                background: 'var(--card2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 52 }}>{g.icon}</div>
                <div style={{
                  position: 'absolute', top: 10, insetInlineEnd: 10,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text2)',
                  padding: '2px 8px', borderRadius: 3,
                }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGN IN SECTION ── */}
      <section id="signin" style={{
        padding: '100px 5%',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 60, alignItems: 'center', minHeight: '100vh',
      }}>
        {/* Right side - info */}
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--neon)', letterSpacing: 3,
            textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ width: 30, height: 1, background: 'var(--neon)', display: 'inline-block' }} />
            {t('landing.signin.eyebrow')}
          </div>
          <h2 style={{
            fontFamily: 'var(--head)', fontSize: 'clamp(40px,5vw,72px)',
            letterSpacing: 1, lineHeight: .95, marginBottom: 20,
          }}>
            {t('landing.signin.titleA')}<br /><span style={{ color: 'var(--neon)' }}>{t('landing.signin.titleHl')}</span><br />{t('landing.signin.titleB')}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 420, marginBottom: 30 }}>
            {t('landing.signin.desc')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {t('landing.signin.steps').map(s => (
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
        <div className="signin-card" style={{
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
            <div style={{ fontFamily: 'var(--head)', fontSize: 26, letterSpacing: .5, marginBottom: 4 }}>{t('landing.signin.welcome')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text2)' }}>{t('landing.signin.welcomeSub')}</div>
          </div>

          {error && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,45,72,.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 14,
              fontSize: 12.5, color: 'var(--red)', textAlign: 'center',
            }}>{error}</div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.07)', marginBottom: 20 }}>
            {[{ key: 'login', label: t('landing.signin.tabLogin') }, { key: 'register', label: t('landing.signin.tabRegister') }].map(tab => (
              <div key={tab.key} onClick={() => { setCurrentTab(tab.key); setError(''); }} style={{
                flex: 1, padding: '9px 0', textAlign: 'center', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                color: currentTab === tab.key ? 'var(--neon)' : 'var(--text2)',
                borderBottom: `2px solid ${currentTab === tab.key ? 'var(--neon)' : 'transparent'}`,
                transition: 'all .15s',
              }}>{tab.label}</div>
            ))}
          </div>

          {/* Login Form */}
          {currentTab === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, animation: 'paneIn .2s ease' }}>
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>{t('landing.signin.email')}</div>
                <input className="fi" type="email" placeholder="you@example.com" dir="ltr" value={loginEmail}
                  onChange={e => { setLoginEmail(e.target.value); if (error) setError(''); setLoginFieldErrors(p => ({ ...p, email: '' })); }}
                  style={{ width: '100%', boxSizing: 'border-box', borderColor: loginFieldErrors.email ? 'var(--red)' : '' }} />
                {loginFieldErrors.email && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{loginFieldErrors.email}</div>}
              </div>
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>{t('landing.signin.password')}</div>
                <input className="fi" type="password" placeholder="••••••••" dir="ltr" value={loginPass}
                  onChange={e => { setLoginPass(e.target.value); if (error) setError(''); setLoginFieldErrors(p => ({ ...p, password: '' })); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ width: '100%', boxSizing: 'border-box', borderColor: loginFieldErrors.password ? 'var(--red)' : '' }} />
                {loginFieldErrors.password && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{loginFieldErrors.password}</div>}
              </div>

              <button onClick={handleLogin} disabled={loading} style={{
                width: '100%', padding: 13, background: loading ? 'var(--border2)' : 'var(--neon)', color: '#000',
                border: 'none', borderRadius: 10, fontFamily: 'var(--head)', fontSize: 19,
                letterSpacing: 1, cursor: loading ? 'wait' : 'pointer', transition: 'all .2s', marginTop: 4,
                opacity: loading ? .6 : 1,
              }}>{loading ? t('landing.signin.loading') : t('landing.signin.submit')}</button>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text2)' }}>
                {t('landing.signin.noAccount')}{' '}
                <span style={{ color: 'var(--neon)', cursor: 'pointer' }} onClick={() => { setCurrentTab('register'); setError(''); }}>{t('landing.signin.registerHere')}</span>
              </div>
              {/* Test accounts */}
              <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 1.5, marginBottom: 6 }}>{t('landing.signin.testAccounts')}</div>
                {[
                  { email: 'provider@test.com', password: 'Provider@123', label: t('landing.signin.testRoles.provider') },
                  { email: 'seller@test.com',   password: 'Seller@123',   label: t('landing.signin.testRoles.seller') },
                  { email: 'admin@test.com',    password: 'Admin@123',    label: t('landing.signin.testRoles.admin') },
                  { email: 'cs@test.com',       password: 'CSAgent@123',  label: t('landing.signin.testRoles.cs') },
                ].map(a => (
                  <div key={a.email} onClick={() => { setLoginEmail(a.email); setLoginPass(a.password); }} style={{
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
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{t('landing.signin.iAmA')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {[
                  { key: 'seller',   icon: '🏪', name: t('landing.signin.roleSeller.name'),   desc: t('landing.signin.roleSeller.desc') },
                  { key: 'provider', icon: '🚛', name: t('landing.signin.roleProvider.name'), desc: t('landing.signin.roleProvider.desc') },
                ].map(role => (
                  <div key={role.key} onClick={() => setSelectedRole(role.key)} style={{
                    padding: 16, borderRadius: 10,
                    border: `1.5px solid ${selectedRole === role.key ? 'var(--neon)' : 'rgba(255,255,255,.08)'}`,
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
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>{t('landing.signin.firstName')}</div>
                  <input className="fi" placeholder={t('landing.signin.firstNamePh')} value={regFirstName}
                    onChange={e => { setRegFirstName(e.target.value); setFieldErrors(p => ({ ...p, firstName: '' })); }}
                    style={{ borderColor: fieldErrors.firstName ? 'var(--red)' : '' }} />
                  {fieldErrors.firstName && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{fieldErrors.firstName}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>{t('landing.signin.lastName')}</div>
                  <input className="fi" placeholder={t('landing.signin.lastNamePh')} value={regLastName}
                    onChange={e => { setRegLastName(e.target.value); setFieldErrors(p => ({ ...p, lastName: '' })); }}
                    style={{ borderColor: fieldErrors.lastName ? 'var(--red)' : '' }} />
                  {fieldErrors.lastName && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{fieldErrors.lastName}</div>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>{t('landing.signin.email')}</div>
                <input className="fi" type="email" placeholder="you@example.com" dir="ltr" value={regEmail}
                  onChange={e => { setRegEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                  style={{ borderColor: fieldErrors.email ? 'var(--red)' : '' }} />
                {fieldErrors.email && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{fieldErrors.email}</div>}
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>{t('landing.signin.phone')}</div>
                <input className="fi" type="tel" placeholder="+20 1XX XXX XXXX" dir="ltr" value={regPhone}
                  onChange={e => { setRegPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: '' })); }}
                  style={{ borderColor: fieldErrors.phone ? 'var(--red)' : '' }} />
                {fieldErrors.phone && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{fieldErrors.phone}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>{t('landing.signin.password')}</div>
                  <input className="fi" type="password" placeholder="••••••••" dir="ltr" value={regPass}
                    onChange={e => { setRegPass(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                    style={{ borderColor: fieldErrors.password ? 'var(--red)' : '' }} />
                  {fieldErrors.password && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{fieldErrors.password}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>{t('landing.signin.confirmPw')}</div>
                  <input className="fi" type="password" placeholder="••••••••" dir="ltr" value={regConfirm}
                    onChange={e => { setRegConfirm(e.target.value); setFieldErrors(p => ({ ...p, confirm: '' })); }}
                    style={{ borderColor: fieldErrors.confirm ? 'var(--red)' : '' }} />
                  {fieldErrors.confirm && <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 4 }}>{fieldErrors.confirm}</div>}
                </div>
              </div>

              {selectedRole === 'seller' && (
                <div style={{ background: 'rgba(170,255,0,.03)', border: '1px solid rgba(170,255,0,.1)', borderRadius: 8, padding: 14, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 1.5, marginBottom: 10 }}>{t('landing.signin.sellerDetails')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="fi" placeholder={t('landing.signin.storeNamePh')} value={regStoreName} onChange={e => setRegStoreName(e.target.value)} />
                    <input className="fi" placeholder={t('landing.signin.storeAreaPh')} value={regStoreArea}  onChange={e => setRegStoreArea(e.target.value)} />
                  </div>
                </div>
              )}

              {selectedRole === 'provider' && (
                <div style={{ background: 'rgba(170,255,0,.03)', border: '1px solid rgba(170,255,0,.1)', borderRadius: 8, padding: 14, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 1.5, marginBottom: 10 }}>{t('landing.signin.providerDetails')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="fi" placeholder={t('landing.signin.providerNamePh')} value={regProviderName} onChange={e => setRegProviderName(e.target.value)} />
                    <select className="fi" value={regProviderCat} onChange={e => setRegProviderCat(e.target.value)}>
                      <option value="">{t('landing.signin.selectCategory')}</option>
                      <option>{t('landing.signin.cats.tow')}</option>
                      <option>{t('landing.signin.cats.fuel')}</option>
                      <option>{t('landing.signin.cats.mechanic')}</option>
                      <option>{t('landing.signin.cats.tire')}</option>
                    </select>
                  </div>
                </div>
              )}

              <button onClick={handleRegister} disabled={loading} style={{
                width: '100%', padding: 13, background: loading ? 'var(--border2)' : 'var(--neon)', color: '#000',
                border: 'none', borderRadius: 10, fontFamily: 'var(--head)', fontSize: 19,
                letterSpacing: 1, cursor: loading ? 'wait' : 'pointer', transition: 'all .2s', marginTop: 4,
                opacity: loading ? .6 : 1,
              }}>{loading ? t('landing.signin.loading') : t('landing.signin.createAccount')}</button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id='contact' className="st-footer" style={{
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
            {t('landing.footer.tagline')}
          </p>
        </div>
        {[
          { title: t('landing.footer.colPlatform'), links: t('landing.footer.linksPlatform') },
          { title: t('landing.footer.colCompany'),  links: t('landing.footer.linksCompany') },
          { title: t('landing.footer.colSupport'),  links: t('landing.footer.linksSupport') },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'var(--head)', fontSize: 14, letterSpacing: .5, color: 'var(--neon)', marginBottom: 12 }}>{col.title}</div>
            {col.links.map(link => (
              <a key={link} href="#" style={{
                display: 'block', fontSize: 12.5, color: 'var(--text2)', textDecoration: 'none',
                marginBottom: 7, cursor: 'pointer', transition: 'color .15s',
              }}>{link}</a>
            ))}
          </div>
        ))}
      </footer>
      <div className="st-footer" style={{textAlign:'center',
        padding: '18px 5%', borderTop: '1px solid rgba(255,255,255,.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
      }}>
        <span>{t('landing.footer.copy')}</span>
        <span>{t('landing.footer.version')}</span>
      </div>
      {/* ── REGISTER SUCCESS POPUP ── */}
      {showRegSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(4,7,12,0.82)', backdropFilter: 'blur(6px)',
          animation: 'fadeDown .3s ease',
        }}>
          <div style={{
            background: 'var(--card)', border: '1px solid rgba(170,255,0,.25)',
            borderRadius: 18, padding: '44px 40px', textAlign: 'center',
            maxWidth: 380, width: '90%', position: 'relative',
            boxShadow: '0 0 60px rgba(170,255,0,.12)',
          }}>
            {/* Top neon line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg,transparent,var(--neon),transparent)',
              borderRadius: '18px 18px 0 0',
            }} />
            {/* Checkmark circle */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--neon-dim)', border: '2px solid var(--neon)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 28px var(--neon-glow)',
            }}>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M7 18L13.5 24.5L27 10" stroke="var(--neon)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--head)', fontSize: 24, letterSpacing: .5, marginBottom: 10 }}>
              Account Created!
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28 }}>
              Your account has been successfully registered.<br/>
              Taking you to your dashboard now...
            </div>
            {/* Progress bar */}
            <div style={{ height: 3, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--neon)', borderRadius: 99,
                animation: 'regProgress 2.5s linear forwards',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, fontFamily: 'var(--mono)' }}>
              Redirecting to dashboard...
            </div>
            <style>{`
              @keyframes regProgress { from { width: 0% } to { width: 100% } }
            `}</style>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
