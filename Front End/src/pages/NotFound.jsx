import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const NotFound = () => (
  <div style={{
    height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    background: 'var(--bg)', direction: 'ltr', textAlign: 'center', gap: 16,
      fontFamily: 'Cairo, var(--body), sans-serif',
  }}>
    <div style={{ position: 'absolute', top: 18, right: 18 }}><ThemeToggle /></div>
    <div style={{ fontFamily: 'var(--head)', fontSize: 'clamp(80px,15vw,160px)', color: 'var(--neon)', lineHeight: 1, textShadow: '0 0 40px var(--neon-glow)' }}>404</div>
    <h2 style={{ fontFamily: 'var(--head)', fontSize: 28, letterSpacing: 1, color: 'var(--text)' }}>Page not found</h2>
    <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 420, lineHeight: 1.6 }}>
      Sorry, the page you’re looking for doesn’t exist or has been moved. Check the link or return to the home page.
    </p>
    <Link to="/" style={{
      padding: '12px 28px', background: 'var(--neon)', color: '#000',
      borderRadius: 10, fontFamily: 'var(--head)', fontSize: 18, letterSpacing: .5,
      textDecoration: 'none', transition: 'all .2s', marginTop: 8,
    }}>← Back to Home</Link>
  </div>
);

export default NotFound;
