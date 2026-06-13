import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────────────────────────────────────────── */

const TRANSLATIONS = {
  en: {
    tagline: "Enterprise Banking Platform",
    welcome: "Welcome back",
    subtitle: "Sign in to your GJ Global Services account",
    emailOrUsername: "Email or Username",
    emailPlaceholder: "you@gjglobal.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signIn: "Sign In",
    signingIn: "Signing in\u2026",
    noAccount: "Don't have an account?",
    register: "Create account",
    resetTitle: "Reset your password",
    resetDesc: "Enter your registered email and we\u2019ll send you a secure reset link.",
    resetEmailLabel: "Email address",
    resetBtn: "Send reset link",
    sending: "Sending\u2026",
    cancelBtn: "Cancel",
    secureNote: "Protected by 256-bit SSL encryption",
    footer: "\u00a9 2025 GJ Global Services Pvt. Ltd. All rights reserved.",
    panelHeadline: "Secure financial operations at scale",
    panelBody: "GJ Global Services delivers world-class enterprise banking and financial management — built for security, speed, and reliability.",
    orContinue: "or continue with",
    google: "Google",
    linkedin: "LinkedIn",
  },
  hi: {
    tagline: "\u090f\u0902\u091f\u0930\u092a\u094d\u0930\u093e\u0907\u091c \u092c\u0948\u0902\u0915\u093f\u0902\u0917 \u092a\u094d\u0932\u0947\u091f\u092b\u093c\u0949\u0930\u094d\u092e",
    welcome: "\u0938\u094d\u0935\u093e\u0917\u0924 \u0939\u0948",
    subtitle: "\u0905\u092a\u0928\u0947 GJ Global Services \u062e\u093e\u062a\u0947 \u092e\u0947\u0902 \u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902",
    emailOrUsername: "\u0908\u092e\u0947\u0932 \u092f\u093e \u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e \u0928\u093e\u092e",
    emailPlaceholder: "\u0906\u092a@gjglobal.com",
    password: "\u092a\u093e\u0938\u0935\u0930\u094d\u0921",
    passwordPlaceholder: "\u0905\u092a\u0928\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902",
    rememberMe: "\u092e\u0941\u091d\u0947 \u092f\u093e\u0926 \u0930\u0916\u0947\u0902",
    forgotPassword: "\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092d\u0942\u0932 \u0917\u090f?",
    signIn: "\u0938\u093e\u0907\u0928 \u0907\u0928",
    signingIn: "\u0938\u093e\u0907\u0928 \u0907\u0928 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026",
    noAccount: "\u062e\u093e\u062a\u093e \u0928\u0939\u0940\u0902 \u0939\u0948?",
    register: "\u062e\u093e\u062a\u093e \u092c\u0928\u093e\u090f\u0902",
    resetTitle: "\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0930\u0940\u0938\u0947\u091f \u0915\u0930\u0947\u0902",
    resetDesc: "\u0905\u092a\u0928\u093e \u0908\u092e\u0947\u0932 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902, \u0939\u092e \u0906\u092a\u0915\u094b \u0930\u0940\u0938\u0947\u091f \u0932\u093f\u0902\u0915 \u092d\u0947\u091c\u0947\u0902\u0917\u0947\u0964",
    resetEmailLabel: "\u0908\u092e\u0947\u0932 \u092a\u0924\u093e",
    resetBtn: "\u0932\u093f\u0902\u0915 \u092d\u0947\u091c\u0947\u0902",
    sending: "\u092d\u0947\u091c\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948\u2026",
    cancelBtn: "\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902",
    secureNote: "256-bit SSL \u090f\u0928\u094d\u0915\u094d\u0930\u093f\u092a\u094d\u0936\u0928 \u0926\u094d\u0935\u093e\u0930\u093e \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924",
    footer: "\u00a9 2025 GJ Global Services Pvt. Ltd.",
    panelHeadline: "\u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0935\u093f\u0924\u094d\u0924\u0940\u092f \u0938\u0902\u091a\u093e\u0932\u0928",
    panelBody: "GJ Global Services \u090f\u0902\u091f\u0930\u092a\u094d\u0930\u093e\u0907\u091c \u092c\u0948\u0902\u0915\u093f\u0902\u0917 \u092f\u0902\u0924\u094d\u0930 \u092a\u094d\u0930\u0926\u093e\u0928 \u0915\u0930\u0924\u093e \u0939\u0948\u0964",
    orContinue: "\u092f\u093e \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902",
    google: "Google",
    linkedin: "LinkedIn",
  },
  fr: {
    tagline: "Plateforme bancaire d'entreprise",
    welcome: "Bon retour",
    subtitle: "Connectez-vous \u00e0 votre compte GJ Global Services",
    emailOrUsername: "E-mail ou nom d'utilisateur",
    emailPlaceholder: "vous@gjglobal.com",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oubli\u00e9\u00a0?",
    signIn: "Se connecter",
    signingIn: "Connexion\u2026",
    noAccount: "Pas de compte\u00a0?",
    register: "Cr\u00e9er un compte",
    resetTitle: "R\u00e9initialiser le mot de passe",
    resetDesc: "Entrez votre e-mail pour recevoir un lien de r\u00e9initialisation.",
    resetEmailLabel: "Adresse e-mail",
    resetBtn: "Envoyer le lien",
    sending: "Envoi\u2026",
    cancelBtn: "Annuler",
    secureNote: "Prot\u00e9g\u00e9 par chiffrement SSL 256 bits",
    footer: "\u00a9 2025 GJ Global Services Pvt. Ltd.",
    panelHeadline: "Op\u00e9rations financi\u00e8res s\u00e9curis\u00e9es",
    panelBody: "GJ Global Services fournit des outils bancaires d'entreprise de classe mondiale.",
    orContinue: "ou continuer avec",
    google: "Google",
    linkedin: "LinkedIn",
  },
  es: {
    tagline: "Plataforma bancaria empresarial",
    welcome: "Bienvenido de nuevo",
    subtitle: "Inicia sesi\u00f3n en tu cuenta de GJ Global Services",
    emailOrUsername: "Correo o usuario",
    emailPlaceholder: "t\u00fa@gjglobal.com",
    password: "Contrase\u00f1a",
    passwordPlaceholder: "Introduce tu contrase\u00f1a",
    rememberMe: "Recu\u00e9rdame",
    forgotPassword: "\u00bfOlvidaste tu contrase\u00f1a?",
    signIn: "Iniciar sesi\u00f3n",
    signingIn: "Iniciando sesi\u00f3n\u2026",
    noAccount: "\u00bfNo tienes cuenta?",
    register: "Crear cuenta",
    resetTitle: "Restablecer contrase\u00f1a",
    resetDesc: "Introduce tu correo y te enviaremos un enlace seguro.",
    resetEmailLabel: "Correo electr\u00f3nico",
    resetBtn: "Enviar enlace",
    sending: "Enviando\u2026",
    cancelBtn: "Cancelar",
    secureNote: "Protegido con cifrado SSL de 256 bits",
    footer: "\u00a9 2025 GJ Global Services Pvt. Ltd.",
    panelHeadline: "Operaciones financieras seguras",
    panelBody: "GJ Global Services ofrece herramientas bancarias empresariales de clase mundial.",
    orContinue: "o continuar con",
    google: "Google",
    linkedin: "LinkedIn",
  },
  de: {
    tagline: "Enterprise-Banking-Plattform",
    welcome: "Willkommen zur\u00fcck",
    subtitle: "Melden Sie sich bei Ihrem GJ Global Services-Konto an",
    emailOrUsername: "E-Mail oder Benutzername",
    emailPlaceholder: "sie@gjglobal.com",
    password: "Passwort",
    passwordPlaceholder: "Passwort eingeben",
    rememberMe: "Angemeldet bleiben",
    forgotPassword: "Passwort vergessen?",
    signIn: "Anmelden",
    signingIn: "Anmeldung\u2026",
    noAccount: "Kein Konto?",
    register: "Konto erstellen",
    resetTitle: "Passwort zur\u00fccksetzen",
    resetDesc: "Geben Sie Ihre E-Mail ein und wir senden Ihnen einen Link.",
    resetEmailLabel: "E-Mail-Adresse",
    resetBtn: "Link senden",
    sending: "Senden\u2026",
    cancelBtn: "Abbrechen",
    secureNote: "Gesch\u00fctzt durch 256-Bit-SSL-Verschl\u00fcsselung",
    footer: "\u00a9 2025 GJ Global Services Pvt. Ltd.",
    panelHeadline: "Sichere Finanzoperationen",
    panelBody: "GJ Global Services bietet Enterprise-Banking-Tools der Weltklasse.",
    orContinue: "oder weiter mit",
    google: "Google",
    linkedin: "LinkedIn",
  },
  ja: {
    tagline: "\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30ba\u30d0\u30f3\u30ad\u30f3\u30b0\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0",
    welcome: "\u304a\u304b\u3048\u308a\u306a\u3055\u3044",
    subtitle: "GJ Global Services\u30a2\u30ab\u30a6\u30f3\u30c8\u306b\u30b5\u30a4\u30f3\u30a4\u30f3",
    emailOrUsername: "\u30e1\u30fc\u30eb\u307e\u305f\u306f\u30e6\u30fc\u30b6\u30fc\u540d",
    emailPlaceholder: "you@gjglobal.com",
    password: "\u30d1\u30b9\u30ef\u30fc\u30c9",
    passwordPlaceholder: "\u30d1\u30b9\u30ef\u30fc\u30c9\u3092\u5165\u529b",
    rememberMe: "\u30ed\u30b0\u30a4\u30f3\u7b46\u614b\u3092\u4fdd\u6301",
    forgotPassword: "\u30d1\u30b9\u30ef\u30fc\u30c9\u3092\u304a\u5fd8\u308c\u3067\u3059\u304b\uff1f",
    signIn: "\u30b5\u30a4\u30f3\u30a4\u30f3",
    signingIn: "\u30b5\u30a4\u30f3\u30a4\u30f3\u4e2d\u2026",
    noAccount: "\u30a2\u30ab\u30a6\u30f3\u30c8\u3092\u304a\u6301\u3061\u3067\u306a\u3044\u65b9\u306f",
    register: "\u30a2\u30ab\u30a6\u30f3\u30c8\u4f5c\u6210",
    resetTitle: "\u30d1\u30b9\u30ef\u30fc\u30c9\u306e\u30ea\u30bb\u30c3\u30c8",
    resetDesc: "\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u3092\u5165\u529b\u3057\u3066\u30ea\u30bb\u30c3\u30c8\u30ea\u30f3\u30af\u3092\u53d7\u3051\u53d6\u3063\u3066\u304f\u3060\u3055\u3044\u3002",
    resetEmailLabel: "\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9",
    resetBtn: "\u30ea\u30f3\u30af\u3092\u9001\u4fe1",
    sending: "\u9001\u4fe1\u4e2d\u2026",
    cancelBtn: "\u30ad\u30e3\u30f3\u30bb\u30eb",
    secureNote: "256\u30d3\u30c3\u30c8SSL\u6697\u53f7\u5316\u3067\u4fdd\u8b77",
    footer: "\u00a9 2025 GJ Global Services Pvt. Ltd.",
    panelHeadline: "\u5b89\u5168\u306a\u91d1\u878d\u69cb\u6210",
    panelBody: "GJ Global Services\u306f\u4e16\u754c\u30af\u30e9\u30b9\u306e\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30ba\u30d0\u30f3\u30ad\u30f3\u30b0\u30c4\u30fc\u30eb\u3092\u63d0\u4f9b\u3057\u307e\u3059\u3002",
    orContinue: "\u307e\u305f\u306f\u7d9a\u3051\u308b",
    google: "Google",
    linkedin: "LinkedIn",
  },
  zh: {
    tagline: "\u4f01\u4e1a\u9280\u884c\u5e73\u53f0",
    welcome: "\u6b22\u8fce\u56de\u6765",
    subtitle: "\u767b\u5f55\u60a8\u7684 GJ Global Services \u8d26\u6237",
    emailOrUsername: "\u90ae\u7b71\u6216\u7528\u6237\u540d",
    emailPlaceholder: "\u60a8@gjglobal.com",
    password: "\u5bc6\u7801",
    passwordPlaceholder: "\u8f93\u5165\u5bc6\u7801",
    rememberMe: "\u8bb0\u4f4f\u6211",
    forgotPassword: "\u5fd8\u8bb0\u5bc6\u7801\uff1f",
    signIn: "\u767b\u5f55",
    signingIn: "\u767b\u5f55\u4e2d\u2026",
    noAccount: "\u6ca1\u6709\u8d26\u6237\uff1f",
    register: "\u521b\u5efa\u8d26\u6237",
    resetTitle: "\u91cd\u7f6e\u5bc6\u7801",
    resetDesc: "\u8f93\u5165\u60a8\u7684\u90ae\u7b71\uff0c\u6211\u4eec\u5c06\u53d1\u9001\u5b89\u5168\u91cd\u7f6e\u94fe\u63a5\u3002",
    resetEmailLabel: "\u90ae\u7b71\u5730\u5740",
    resetBtn: "\u53d1\u9001\u94fe\u63a5",
    sending: "\u53d1\u9001\u4e2d\u2026",
    cancelBtn: "\u53d6\u6d88",
    secureNote: "\u53d7256\u4f4dSSL\u52a0\u5bc6\u4fdd\u62a4",
    footer: "\u00a9 2025 GJ Global Services Pvt. Ltd.",
    panelHeadline: "\u5b89\u5168\u7684\u91d1\u878d\u8fd0\u8425",
    panelBody: "GJ Global Services \u63d0\u4f9b\u4e16\u754c\u7ea7\u4f01\u4e1a\u9280\u884c\u548c\u8d22\u52a1\u7ba1\u7406\u5de5\u5177\u3002",
    orContinue: "\u6216\u7ee7\u7eed\u4f7f\u7528",
    google: "Google",
    linkedin: "\u9886\u82f1",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   ICON COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="gjgs-v3-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   FORGOT PASSWORD MODAL
───────────────────────────────────────────────────────────────────────────── */

const ForgotPasswordModal = ({ t, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Reset link sent to ${email}`);
        toast.success(data.message || "Reset link sent!");
        setEmail("");
      } else {
        setError(data.error || "Failed to send reset link.");
        toast.error(data.error || "Failed to send reset link.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="gjgs-v3-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="gjgs-v3-modal"
      >
        <div className="gjgs-v3-modal-header">
          <h3 id="reset-title" className="gjgs-v3-modal-title">{t.resetTitle}</h3>
          <button onClick={onClose} className="gjgs-v3-modal-close" aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <p className="gjgs-v3-modal-desc">{t.resetDesc}</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="gjgs-v3-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="reset-email" className="gjgs-v3-label">{t.resetEmailLabel}</label>
            <input
              id="reset-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gjglobal.com"
              className="gjgs-v3-input"
              autoComplete="email" required
            />
          </div>
          {error && (
            <motion.div role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gjgs-v3-banner gjgs-v3-banner--error">{error}</motion.div>
          )}
          {success && (
            <motion.div role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gjgs-v3-banner gjgs-v3-banner--success">{success}</motion.div>
          )}
          <div className="gjgs-v3-modal-actions">
            <button type="button" onClick={onClose} className="gjgs-v3-btn gjgs-v3-btn--ghost">{t.cancelBtn}</button>
            <button type="submit" disabled={loading} className="gjgs-v3-btn gjgs-v3-btn--primary">
              {loading ? <><SpinnerIcon />{t.sending}</> : t.resetBtn}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────────────────────────────────────────── */

const LoadingScreen = () => (
  <div className="gjgs-v3-loading-screen">
    <div className="gjgs-v3-loading-inner">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
        alt="GJ Global Services"
        className="gjgs-v3-loading-logo"
      />
      <SpinnerIcon />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LOGIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, initialLoading } = useAuth();
  const { t: langT, language, setLanguage, availableLanguages } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [credentials, setCredentials] = useState({ username_or_email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Use component-level translations (self-contained) with fallback to context t()
  const translations = TRANSLATIONS[language] || TRANSLATIONS.en;

  // ── Apply theme class via ThemeContext ─────────────────────────────────────
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, [isDark]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = useCallback((e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const result = await login(credentials);
    
    if (result.success) {
      toast.success("Login successful! Redirecting...");
      // ProtectedRoute + App.jsx will handle redirect after state update
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleSocialLogin = (provider) => {
    setSocialLoading(provider);
    setError("");
    window.location.href = `/api/auth/${provider}`;
  };

  // ── Early return: loading screen ───────────────────────────────────────────
  if (initialLoading) return <LoadingScreen />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Design tokens ── */
        :root {
          --gjgs-brand:#1a56db;--gjgs-brand-hover:#1649c7;
          --gjgs-success:#16a34a;--gjgs-error:#dc2626;
          --gjgs-radius:10px;--gjgs-radius-lg:16px;
          --gjgs-shadow:0 4px 24px rgba(0,0,0,.08),0 1px 4px rgba(0,0,0,.04);
          --gjgs-shadow-lg:0 16px 48px rgba(0,0,0,.14),0 4px 12px rgba(0,0,0,.06);
          --bg-page:#f1f5f9;--bg-card:#fff;--bg-input:#f8fafc;--bg-subtle:#f1f5f9;
          --border:#e2e8f0;--border-focus:#1a56db;
          --text-primary:#0f172a;--text-secondary:#475569;--text-muted:#94a3b8;
          --btn-primary-bg:#1a56db;--btn-primary-fg:#fff;
          --panel-bg:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1a56db 100%);
          --announce-bg:#0f172a;--announce-fg:#93c5fd;
        }
        [data-theme="dark"]{
          --bg-page:#0b1120;--bg-card:#131f35;--bg-input:#1a2942;--bg-subtle:#1a2942;
          --border:#1e3352;--border-focus:#3b82f6;
          --text-primary:#f1f5f9;--text-secondary:#94a3b8;--text-muted:#475569;
          --btn-primary-bg:#2563eb;
          --panel-bg:linear-gradient(135deg,#060d1f 0%,#0c1e42 50%,#0f3375 100%);
          --announce-bg:#060d1f;--announce-fg:#60a5fa;
        }
        *,*::before,*::after{box-sizing:border-box;}

        /* Loading screen */
        .gjgs-v3-loading-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-page);}
        .gjgs-v3-loading-inner{display:flex;flex-direction:column;align-items:center;gap:16px;}
        .gjgs-v3-loading-logo{width:52px;height:52px;border-radius:10px;object-fit:contain;background:#fff;padding:3px;border:1px solid var(--border);}

        /* Page */
        .gjgs-v3-page{min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);font-family:'DM Sans','Segoe UI',system-ui,sans-serif;color:var(--text-primary);transition:background .3s,color .3s;}

        /* Announcement */
        .gjgs-v3-announce{background:var(--announce-bg);color:var(--announce-fg);font-size:12px;font-weight:500;letter-spacing:.04em;overflow:hidden;padding:9px 0;white-space:nowrap;}
        .gjgs-v3-announce-track{display:inline-flex;animation:gjgs-v3-marquee 28s linear infinite;}
        .gjgs-v3-announce-track span{padding-right:80px;}
        @keyframes gjgs-v3-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        /* Navbar */
        .gjgs-v3-nav{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:var(--bg-card);border-bottom:1px solid var(--border);}
        .gjgs-v3-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
        .gjgs-v3-brand-logo{width:38px;height:38px;border-radius:8px;object-fit:contain;background:#fff;padding:2px;border:1px solid var(--border);}
        .gjgs-v3-brand-name{font-size:15px;font-weight:700;color:var(--text-primary);letter-spacing:-.01em;}
        .gjgs-v3-brand-tagline{display:block;font-size:11px;font-weight:400;color:var(--text-muted);line-height:1.3;}
        .gjgs-v3-nav-ctrls{display:flex;align-items:center;gap:10px;}
        .gjgs-v3-lang{padding:5px 8px;font-size:12.5px;border:1px solid var(--border);border-radius:var(--gjgs-radius);background:var(--bg-subtle);color:var(--text-secondary);cursor:pointer;outline:none;transition:border-color .2s;}
        .gjgs-v3-lang:focus{border-color:var(--border-focus);}
        .gjgs-v3-theme-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--bg-subtle);cursor:pointer;font-size:16px;transition:background .2s,transform .15s;}
        .gjgs-v3-theme-btn:hover{transform:scale(1.08);background:var(--bg-input);}

        /* Main grid */
        .gjgs-v3-main{flex:1;display:grid;grid-template-columns:1fr 1fr;min-height:0;}
        @media(max-width:860px){.gjgs-v3-main{grid-template-columns:1fr}.gjgs-v3-panel{display:none}}

        /* Left panel */
        .gjgs-v3-panel{background:var(--panel-bg);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:56px 52px;position:relative;overflow:hidden;}
        .gjgs-v3-panel::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 80%,rgba(14,165,233,.18) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 20%,rgba(59,130,246,.14) 0%,transparent 60%);pointer-events:none;}
        .gjgs-v3-panel-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:32px 32px;pointer-events:none;}
        .gjgs-v3-panel-content{position:relative;z-index:1;}
        .gjgs-v3-panel-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#60a5fa;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.25);padding:5px 12px;border-radius:99px;margin-bottom:28px;}
        .gjgs-v3-panel-dot{width:6px;height:6px;background:#34d399;border-radius:50%;animation:gjgs-v3-pulse 2s ease-in-out infinite;}
        @keyframes gjgs-v3-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.85)}}
        .gjgs-v3-panel-headline{font-size:clamp(26px,3vw,36px);font-weight:800;line-height:1.18;color:#f1f5f9;letter-spacing:-.03em;margin:0 0 16px;}
        .gjgs-v3-panel-headline span{color:#60a5fa;}
        .gjgs-v3-panel-body{font-size:14.5px;color:#94a3b8;line-height:1.65;max-width:360px;margin:0 0 40px;}
        .gjgs-v3-panel-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;width:100%;max-width:380px;}
        .gjgs-v3-stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:var(--gjgs-radius);padding:16px;}
        .gjgs-v3-stat-value{font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-.03em;line-height:1;margin-bottom:4px;}
        .gjgs-v3-stat-label{font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:.05em;}

        /* Form column */
        .gjgs-v3-form-col{display:flex;align-items:center;justify-content:center;padding:40px 24px;overflow-y:auto;}
        .gjgs-v3-card{width:100%;max-width:420px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--gjgs-radius-lg);box-shadow:var(--gjgs-shadow);padding:36px 36px 28px;}
        @media(max-width:480px){.gjgs-v3-card{padding:28px 20px 24px}}

        /* Card header */
        .gjgs-v3-card-header{margin-bottom:28px;}
        .gjgs-v3-card-logo-row{display:flex;align-items:center;gap:10px;margin-bottom:20px;}
        .gjgs-v3-card-logo{width:40px;height:40px;border-radius:8px;object-fit:contain;background:#fff;padding:2px;border:1px solid var(--border);}
        .gjgs-v3-card-logo-text{font-size:14px;font-weight:700;color:var(--text-primary);letter-spacing:-.01em;}
        .gjgs-v3-card-title{font-size:22px;font-weight:800;letter-spacing:-.03em;color:var(--text-primary);margin:0 0 4px;}
        .gjgs-v3-card-subtitle{font-size:13.5px;color:var(--text-secondary);margin:0;}

        /* OAuth */
        .gjgs-v3-oauth-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
        .gjgs-v3-oauth-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--gjgs-radius);background:var(--bg-card);color:var(--text-primary);font-size:13.5px;font-weight:600;cursor:pointer;transition:background .18s,border-color .18s,transform .12s,box-shadow .18s;white-space:nowrap;font-family:inherit;}
        .gjgs-v3-oauth-btn:hover:not(:disabled){background:var(--bg-subtle);border-color:var(--border-focus);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08);}
        .gjgs-v3-oauth-btn:disabled{opacity:.55;cursor:not-allowed;}

        /* Divider */
        .gjgs-v3-divider{display:flex;align-items:center;gap:12px;margin:0 0 20px;color:var(--text-muted);font-size:12px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;}
        .gjgs-v3-divider::before,.gjgs-v3-divider::after{content:'';flex:1;height:1px;background:var(--border);}

        /* Fields */
        .gjgs-v3-fields{display:flex;flex-direction:column;gap:16px;margin-bottom:8px;}
        .gjgs-v3-field{display:flex;flex-direction:column;gap:5px;}
        .gjgs-v3-label{font-size:12.5px;font-weight:600;color:var(--text-secondary);letter-spacing:.01em;}
        .gjgs-v3-input-wrap{position:relative;}
        .gjgs-v3-input{width:100%;padding:10px 14px;background:var(--bg-input);border:1.5px solid var(--border);border-radius:var(--gjgs-radius);color:var(--text-primary);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s,background .2s;}
        .gjgs-v3-input::placeholder{color:var(--text-muted);}
        .gjgs-v3-input:focus{border-color:var(--border-focus);background:var(--bg-card);box-shadow:0 0 0 3px rgba(26,86,219,.12);}
        .gjgs-v3-input-with-suffix{padding-right:42px!important;}
        .gjgs-v3-input-suffix{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;background:none;border:none;padding:0;transition:color .18s;}
        .gjgs-v3-input-suffix:hover{color:var(--text-secondary);}

        /* Form row (remember me + forgot) */
        .gjgs-v3-form-row{display:flex;align-items:center;justify-content:space-between;margin:4px 0 20px;}
        .gjgs-v3-checkbox-label{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--text-secondary);cursor:pointer;user-select:none;}
        .gjgs-v3-checkbox{width:15px;height:15px;border-radius:4px;accent-color:var(--gjgs-brand);cursor:pointer;flex-shrink:0;}
        .gjgs-v3-forgot{font-size:13px;font-weight:600;color:var(--gjgs-brand);background:none;border:none;cursor:pointer;padding:0;text-decoration:none;transition:color .18s;}
        .gjgs-v3-forgot:hover{color:var(--gjgs-brand-hover);text-decoration:underline;}

        /* Error banner */
        .gjgs-v3-banner{padding:10px 14px;border-radius:var(--gjgs-radius);font-size:13px;font-weight:500;margin-bottom:14px;line-height:1.5;}
        .gjgs-v3-banner--error{background:#fef2f2;color:var(--gjgs-error);border:1px solid #fecaca;}
        .gjgs-v3-banner--success{background:#f0fdf4;color:var(--gjgs-success);border:1px solid #bbf7d0;}
        [data-theme="dark"] .gjgs-v3-banner--error{background:rgba(220,38,38,.12);border-color:rgba(220,38,38,.25);}
        [data-theme="dark"] .gjgs-v3-banner--success{background:rgba(22,163,74,.12);border-color:rgba(22,163,74,.25);}

        /* Buttons */
        .gjgs-v3-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:var(--gjgs-radius);font-family:inherit;font-weight:700;cursor:pointer;border:none;outline:none;transition:background .18s,color .18s,transform .12s,box-shadow .18s,border-color .18s;}
        .gjgs-v3-btn--primary{width:100%;padding:12px;font-size:14.5px;background:var(--btn-primary-bg);color:var(--btn-primary-fg);box-shadow:0 1px 3px rgba(26,86,219,.25),0 4px 12px rgba(26,86,219,.15);}
        .gjgs-v3-btn--primary:hover:not(:disabled){background:var(--gjgs-brand-hover);transform:translateY(-1px);box-shadow:0 4px 16px rgba(26,86,219,.35);}
        .gjgs-v3-btn--primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none;}
        .gjgs-v3-btn--ghost{flex:1;padding:10px;font-size:14px;background:transparent;color:var(--text-secondary);border:1.5px solid var(--border);}
        .gjgs-v3-btn--ghost:hover{background:var(--bg-subtle);}

        /* Secure note */
        .gjgs-v3-secure{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11.5px;color:var(--text-muted);margin-top:16px;}

        /* Sign-up row */
        .gjgs-v3-signup-row{text-align:center;font-size:13.5px;color:var(--text-secondary);margin-top:20px;padding-top:20px;border-top:1px solid var(--border);}
        .gjgs-v3-signup-link{color:var(--gjgs-brand);font-weight:700;text-decoration:none;margin-left:4px;}
        .gjgs-v3-signup-link:hover{text-decoration:underline;}

        /* Footer */
        .gjgs-v3-footer{padding:14px 28px;border-top:1px solid var(--border);background:var(--bg-card);text-align:center;font-size:11.5px;color:var(--text-muted);letter-spacing:.02em;}

        /* Modal */
        .gjgs-v3-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;}
        .gjgs-v3-modal{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--gjgs-radius-lg);box-shadow:var(--gjgs-shadow-lg);padding:28px;width:100%;max-width:400px;}
        .gjgs-v3-modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
        .gjgs-v3-modal-title{font-size:18px;font-weight:800;letter-spacing:-.02em;margin:0;}
        .gjgs-v3-modal-desc{font-size:13.5px;color:var(--text-secondary);margin:0 0 20px;line-height:1.55;}
        .gjgs-v3-modal-close{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:6px;border:none;background:var(--bg-subtle);color:var(--text-muted);cursor:pointer;transition:background .18s,color .18s;}
        .gjgs-v3-modal-close:hover{background:var(--border);color:var(--text-primary);}
        .gjgs-v3-modal-actions{display:flex;gap:10px;margin-top:20px;}

        /* Spinner */
        .gjgs-v3-spinner{animation:gjgs-v3-spin .7s linear infinite;flex-shrink:0;}
        @keyframes gjgs-v3-spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Announcement */}
      <div className="gjgs-v3-announce" role="marquee">
        <div className="gjgs-v3-announce-track">
          <span>🔒 GJ Global Services — Secure Enterprise Banking Platform  •  ISO 27001 Certified  •  24/7 Support  •  Trusted by 10,000+ clients worldwide</span>
          <span aria-hidden="true">🔒 GJ Global Services — Secure Enterprise Banking Platform  •  ISO 27001 Certified  •  24/7 Support  •  Trusted by 10,000+ clients worldwide</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="gjgs-v3-nav">
        <a href="/" className="gjgs-v3-brand" aria-label="GJ Global Services home">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
            alt="GJ Global Services Logo"
            className="gjgs-v3-brand-logo"
          />
          <div>
            <span className="gjgs-v3-brand-name">GJ Global Services</span>
            <span className="gjgs-v3-brand-tagline">{translations.tagline}</span>
          </div>
        </a>
        <div className="gjgs-v3-nav-ctrls">
          {availableLanguages && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="gjgs-v3-lang"
              aria-label="Select language"
            >
              {availableLanguages.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</option>
              ))}
            </select>
          )}
          <button
            onClick={toggleTheme}
            className="gjgs-v3-theme-btn"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="gjgs-v3-main">

        {/* Left brand panel */}
        <div className="gjgs-v3-panel" aria-hidden="true">
          <div className="gjgs-v3-panel-grid" />
          <motion.div
            className="gjgs-v3-panel-content"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .6, ease: [.22, 1, .36, 1] }}
          >
            <div className="gjgs-v3-panel-eyebrow">
              <div className="gjgs-v3-panel-dot" />
              Enterprise Platform
            </div>
            <h1 className="gjgs-v3-panel-headline">
              {translations.panelHeadline.split(" ").slice(0, 3).join(" ")}<br />
              <span>{translations.panelHeadline.split(" ").slice(3).join(" ")}</span>
            </h1>
            <p className="gjgs-v3-panel-body">{translations.panelBody}</p>
            <div className="gjgs-v3-panel-stats">
              {[
                { value: "10K+", label: "Clients" },
                { value: "\u20b92B+", label: "Processed" },
                { value: "99.9%", label: "Uptime" },
              ].map((s) => (
                <div key={s.label} className="gjgs-v3-stat">
                  <div className="gjgs-v3-stat-value">{s.value}</div>
                  <div className="gjgs-v3-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right form column */}
        <div className="gjgs-v3-form-col">
          <motion.div
            className="gjgs-v3-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
          >
            {/* Header */}
            <div className="gjgs-v3-card-header">
              <div className="gjgs-v3-card-logo-row">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
                  alt=""
                  className="gjgs-v3-card-logo"
                />
                <span className="gjgs-v3-card-logo-text">GJ Global Services</span>
              </div>
              <h2 className="gjgs-v3-card-title">{translations.welcome}</h2>
              <p className="gjgs-v3-card-subtitle">{translations.subtitle}</p>
            </div>

            {/* OAuth */}
            <div className="gjgs-v3-oauth-grid">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={socialLoading !== null}
                className="gjgs-v3-oauth-btn"
                aria-label="Continue with Google"
              >
                {socialLoading === "google" ? <SpinnerIcon /> : <GoogleIcon />}
                <span>{translations.google}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("linkedin")}
                disabled={socialLoading !== null}
                className="gjgs-v3-oauth-btn"
                aria-label="Continue with LinkedIn"
              >
                {socialLoading === "linkedin" ? <SpinnerIcon /> : <LinkedInIcon />}
                <span>{translations.linkedin}</span>
              </button>
            </div>

            <div className="gjgs-v3-divider">{translations.orContinue}</div>

            {/* Error banner */}
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="gjgs-v3-banner gjgs-v3-banner--error"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="gjgs-v3-fields">
                {/* Email / Username */}
                <div className="gjgs-v3-field">
                  <label htmlFor="username_or_email" className="gjgs-v3-label">
                    {translations.emailOrUsername}
                  </label>
                  <input
                    id="username_or_email"
                    name="username_or_email"
                    type="text"
                    placeholder={translations.emailPlaceholder}
                    value={credentials.username_or_email}
                    onChange={handleInputChange}
                    autoComplete="username email"
                    required
                    disabled={authLoading}
                    className="gjgs-v3-input"
                  />
                </div>

                {/* Password */}
                <div className="gjgs-v3-field">
                  <label htmlFor="password" className="gjgs-v3-label">
                    {translations.password}
                  </label>
                  <div className="gjgs-v3-input-wrap">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={translations.passwordPlaceholder}
                      value={credentials.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      required
                      disabled={authLoading}
                      className="gjgs-v3-input gjgs-v3-input-with-suffix"
                    />
                    <button
                      type="button"
                      className="gjgs-v3-input-suffix"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={authLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember me + Forgot */}
              <div className="gjgs-v3-form-row">
                <label className="gjgs-v3-checkbox-label">
                  <input
                    type="checkbox"
                    className="gjgs-v3-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {translations.rememberMe}
                </label>
                <button
                  type="button"
                  className="gjgs-v3-forgot"
                  onClick={() => setShowForgot(true)}
                >
                  {translations.forgotPassword}
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="gjgs-v3-btn gjgs-v3-btn--primary"
              >
                {authLoading ? <><SpinnerIcon />{translations.signingIn}</> : translations.signIn}
              </button>
            </form>

            {/* Secure note */}
            <div className="gjgs-v3-secure">
              <ShieldIcon />{translations.secureNote}
            </div>

            {/* Register link */}
            <div className="gjgs-v3-signup-row">
              {translations.noAccount}
              <Link to="/register" className="gjgs-v3-signup-link">
                {translations.register}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="gjgs-v3-footer">{translations.footer}</footer>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <ForgotPasswordModal t={translations} onClose={() => setShowForgot(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Login;