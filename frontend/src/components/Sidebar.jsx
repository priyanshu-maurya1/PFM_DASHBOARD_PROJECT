import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, CreditCard, Settings, LogOut, Award, BookOpen, MessageSquare, ChevronRight, Upload, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Translations for Sidebar
const translations = {
  en: {
    appName: "GJ Global Services",
    dashboard: "Dashboard",
    transactions: "Transactions",
    analytics: "Analytics",
    budget: "Budget",
    lms: "Learning Management System",
    Leaderboard: "Leaderboard",
    uploadFile: "Upload File",
    assessment: "GJ Global Services Assessment",
    certificate: "Certificate Verification Portal",
    message: "Message",
    profile: "My Profile",
    settings: "Settings",
    logout: "Logout",
  },
  hi: {
    appName: "GJ ग्लोबल सर्विसेज",
    dashboard: "डैशबोर्ड",
    transactions: "लेन-देन",
    analytics: "विश्लेषण",
    budget: "बजट",
    lms: "लर्निंग मैनेजमेंट सिस्टम",
    Leaderboard: "लीडरबोर्ड",
    uploadFile: "फाइल अपलोड",
    assessment: "GJ ग्लोबल सर्विसेज आकलन",
    certificate: "प्रमाणपत्र सत्यापन पोर्टल",
    message: "संदेश",
    profile: "मेरी प्रोफाइल",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
  },
  fr: {
    appName: "GJ Services Globaux",
    dashboard: "Tableau de bord",
    transactions: "Transactions",
    analytics: "Analytique",
    budget: "Budget",
    lms: "Système de gestion de l'apprentissage",
    Leaderboard: "Classement",
    uploadFile: "Téléverser un fichier",
    assessment: "Évaluation GJ Services Globaux",
    certificate: "Portail de vérification des certificats",
    message: "Message",
    settings: "Paramètres",
    logout: "Déconnexion"
  },
  es: {
    appName: "GJ Servicios Globales",
    dashboard: "Panel de control",
    transactions: "Transacciones",
    analytics: "Análisis",
    budget: "Presupuesto",
    lms: "Sistema de gestión del aprendizaje",
    Leaderboard: "Tabla de clasificación",
    uploadFile: "Subir archivo",
    assessment: "Evaluación de GJ Servicios Globales",
    certificate: "Portal de verificación de certificados",
    message: "Mensaje",
    settings: "Configuración",
    logout: "Cerrar sesión"
  },
  de: {
    appName: "GJ Globale Dienste",
    dashboard: "Dashboard",
    transactions: "Transaktionen",
    analytics: "Analytik",
    budget: "Budget",
    lms: "Lernmanagementsystem",
    Leaderboard: "Bestenliste",
    uploadFile: "Datei hochladen",
    assessment: "GJ Globale Dienste Bewertung",
    certificate: "Zertifikatsverifizierungsportal",
    message: "Nachricht",
    settings: "Einstellungen",
    logout: "Abmelden"
  },
  ja: {
    appName: "GJグローバルサービス",
    dashboard: "ダッシュボード",
    transactions: "取引",
    analytics: "分析",
    budget: "予算",
    lms: "学習管理システム",
    Leaderboard: "リーダーボード",
    uploadFile: "ファイルをアップロード",
    assessment: "GJグローバルサービス評価",
    certificate: "証明書検証ポータル",
    message: "メッセージ",
    settings: "設定",
    logout: "ログアウト"
  },
  zh: {
    appName: "GJ全球服务",
    dashboard: "仪表板",
    transactions: "交易",
    analytics: "分析",
    budget: "预算",
    lms: "学习管理系统",
    Leaderboard: "排行榜",
    uploadFile: "上传文件",
    assessment: "GJ全球服务评估",
    certificate: "证书验证门户",
    message: "消息",
    settings: "设置",
    logout: "退出"
  },
  ko: {
    appName: "GJ 글로벌 서비스",
    dashboard: "대시보드",
    transactions: "거래",
    analytics: "분석",
    budget: "예산",
    lms: "학습 관리 시스템",
    Leaderboard: "리더보드",
    uploadFile: "파일 업로드",
    assessment: "GJ 글로벌 서비스 평가",
    certificate: "인증서 검증 포털",
    message: "메시지",
    settings: "설정",
    logout: "로그아웃"
  },
  pt: {
    appName: "GJ Serviços Globais",
    dashboard: "Painel",
    transactions: "Transações",
    analytics: "Análise",
    budget: "Orçamento",
    lms: "Sistema de gestão de aprendizagem",
    Leaderboard: "Classificação",
    uploadFile: "Enviar arquivo",
    assessment: "Avaliação GJ Serviços Globais",
    certificate: "Portal de verificação de certificados",
    message: "Mensagem",
    settings: "Configurações",
    logout: "Sair"
  },
  ru: {
    appName: "GJ Глобальные Услуги",
    dashboard: "Панель управления",
    transactions: "Транзакции",
    analytics: "Аналитика",
    budget: "Бюджет",
    lms: "Система управления обучением",
    Leaderboard: "Таблица лидеров",
    uploadFile: "Загрузить файл",
    assessment: "Оценка GJ Глобальные Услуги",
    certificate: "Портал проверки сертификатов",
    message: "Сообщение",
    settings: "Настройки",
    logout: "Выйти"
  },
  it: {
    appName: "GJ Servizi Globali",
    dashboard: "Dashboard",
    transactions: "Transazioni",
    analytics: "Analisi",
    budget: "Budget",
    lms: "Sistema di gestione dell'apprendimento",
    Leaderboard: "Classifica",
    uploadFile: "Carica file",
    assessment: "Valutazione GJ Servizi Globali",
    certificate: "Portale di verifica certificati",
    message: "Messaggio",
    settings: "Impostazioni",
    logout: "Disconnetti"
  },
  ar: {
    appName: "GJ الخدمات العالمية",
    dashboard: "لوحة التحكم",
    transactions: "المعاملات",
    analytics: "التحليلات",
    budget: "الميزانية",
    lms: "نظام إدارة التعلم",
    Leaderboard: "لوحة المتصدرين",
    uploadFile: "رفع ملف",
    assessment: "تقييم GJ الخدمات العالمية",
    certificate: "بوابة التحقق من الشهادات",
    message: "رسالة",
    settings: "الإعدادات",
    logout: "تسجيل الخروج"
  },
  tr: {
    appName: "GJ Küresel Hizmetler",
    dashboard: "Pano",
    transactions: "İşlemler",
    analytics: "Analitik",
    budget: "Bütçe",
    lms: "Öğrenme Yönetim Sistemi",
    Leaderboard: "Liderlik Tablosu",
    uploadFile: "Dosya yükle",
    assessment: "GJ Küresel Hizmetler Değerlendirmesi",
    certificate: "Sertifika Doğrulama Portalı",
    message: "Mesaj",
    settings: "Ayarlar",
    logout: "Çıkış yap"
  },
  pl: {
    appName: "GJ Usługi Globalne",
    dashboard: "Pulpit",
    transactions: "Transakcje",
    analytics: "Analityka",
    budget: "Budżet",
    lms: "System zarządzania nauczaniem",
    Leaderboard: "Tablica wyników",
    uploadFile: "Prześlij plik",
    assessment: "Ocena GJ Usługi Globalne",
    certificate: "Portal weryfikacji certyfikatów",
    message: "Wiadomość",
    settings: "Ustawienia",
    logout: "Wyloguj"
  },
  nl: {
    appName: "GJ Globale Diensten",
    dashboard: "Dashboard",
    transactions: "Transacties",
    analytics: "Analyse",
    budget: "Budget",
    lms: "Leer Management Systeem",
    Leaderboard: "Klassement",
    uploadFile: "Bestand uploaden",
    assessment: "GJ Globale Diensten Evaluatie",
    certificate: "Certificaat Verificatie Portaal",
    message: "Bericht",
    settings: "Instellingen",
    logout: "Uitloggen"
  },
  sv: {
    appName: "GJ Globala Tjänster",
    dashboard: "Dashboard",
    transactions: "Transaktioner",
    analytics: "Analys",
    budget: "Budget",
    lms: "Lärandet system",
    Leaderboard: "Ledartavla",
    uploadFile: "Ladda upp fil",
    assessment: "GJ Globala Tjänster Utvärdering",
    certificate: "Certifikat Verifierings Portal",
    message: "Meddelande",
    settings: "Inställningar",
    logout: "Logga ut"
  },
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { logout } = useAuth();
  const t = translations[language] || translations.en;

  const menuItems = [
    { id: 'dashboard', name: t.dashboard, icon: <Home size={20} />, path: '/dashboard' },
    { id: 'message', name: t.message, icon: <MessageSquare size={20} />, path: '/messages' },
  
    { id: 'uploadFile', name: t.uploadFile, icon: <Upload size={20} />, path: '/uploadfile' },
    { id: 'transactions', name: t.transactions, icon: <CreditCard size={20} />, path: '/transactions' },
    
    
    { id: 'leaderboard', name: t.Leaderboard, icon: <BookOpen size={20} />, path: '/Leaderboard' },
    { id: 'lms', name: t.lms, icon: <BookOpen size={20} />, path: '/LMSPlatform' },
    { id: 'certificate', name: t.certificate, icon: <Award size={20} />, path: '/certificate-verify' },
    { id: 'settings', name: t.settings, icon: <Settings size={20} />, path: '/settings' },
  ];
  return (
<motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-blue-100 dark:border-slate-700 shadow-lg flex flex-col"
    >
{/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-blue-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
          alt="GJ Global Services Logo"
          className="w-9 h-9 object-contain rounded-md"
        />
        <h1 className="text-lg font-bold text-blue-700 dark:text-blue-400">
        {t.appName}
        </h1>
      </div>

{/*  Menu Items */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                  : 
                    'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

{/*  Logout Section */}
      <div className="border-t border-blue-100 dark:border-slate-700 px-3 py-4 bg-white/50 dark:bg-slate-800/50">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          {t.logout}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
