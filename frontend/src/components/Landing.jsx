import React from 'react';
import { 
  MessageSquare, Calendar, Layers, Shield, Image, Globe, 
  Phone, ArrowRight, CheckCircle, Sparkles, Video, FileText
} from 'lucide-react';
import { HeaderControls } from '../App';

export default function Landing({ 
  lang, theme, toggleLang, toggleTheme, onAccessDashboard 
}) {
  const demoUrl = "https://wa.me/919512630583?text=Hi,%20I'm%20interested%20in%20a%20demo%20of%20the%20WhatsApp%20Auto-Message%20Broadcast%20Scheduler";

  // Localized texts
  const content = {
    en: {
      heroTitle: "Automate Your WhatsApp Broadcasts Seamlessly",
      heroSubtitle: "A premium, stateless scheduling and automation platform. Deliver messages, rich media, and customized campaigns with built-in anti-ban protection.",
      bookDemo: "Book a Demo",
      accessDashboard: "Access Dashboard",
      featuresTitle: "Why Choose Our WhatsApp Scheduler?",
      featuresSubtitle: "Enterprise-grade features designed to protect your account and maximize your outreach efficiency.",
      statSecurity: "100% Secure Sessions",
      statDelay: "15s Delay Protection",
      statOpen: "98% Open Rates",
      feature1Title: "Smart Scheduled Broadcasts",
      feature1Desc: "Schedule campaigns to send once or recur periodically. Run fully automated campaigns in the background.",
      feature2Title: "Rich Media Attachments",
      feature2Desc: "Attach images and videos up to 15MB with custom captions. Store everything securely in the cloud.",
      feature3Title: "Smart Excel/CSV Import",
      feature3Desc: "Upload any contact spreadsheet. Our intelligent parser extracts and validates numbers from any column instantly.",
      feature4Title: "Anti-Ban Protection",
      feature4Desc: "Automatic 15-second delay between messages on multi-contact lists to protect your account from spam bans.",
      feature5Title: "Stateless Security",
      feature5Desc: "Secure session credentials stored directly in MongoDB. Fully stateless architecture, serverless-ready.",
      feature6Title: "Dual Language Interface",
      feature6Desc: "Full native support for English and Gujarati. Smooth toggle for interface, alerts, and formatting.",
      footerTitle: "Ready to Transform Your Outreach?",
      footerSubtitle: "Contact us now for a live demonstration and custom workspace setup.",
      contactUs: "Chat on WhatsApp",
      copyright: "© 2026 AutoSend. All rights reserved."
    },
    gu: {
      heroTitle: "તમારા વ્હોટ્સએપ બ્રોડકાસ્ટને સરળતાથી ઓટોમેટ કરો",
      heroSubtitle: "એક પ્રીમિયમ, સ્ટેટલેસ શેડ્યુલિંગ અને ઓટોમેશન પ્લેટફોર્મ. બિલ્ટ-ઇન એન્ટી-બેન પ્રોટેક્શન સાથે સંદેશા, મીડિયા અને કસ્ટમાઇઝ્ડ કેમ્પેઈન મોકલો.",
      bookDemo: "ડેમો બુક કરો",
      accessDashboard: "ડેશબોર્ડ ખોલો",
      featuresTitle: "શા માટે અમારું વ્હોટ્સએપ શેડ્યૂલર પસંદ કરવું?",
      featuresSubtitle: "તમારા એકાઉન્ટને સુરક્ષિત રાખવા અને તમારી પહોંચ વધારવા માટે ડિઝાઇન કરાયેલ વિશેષતાઓ.",
      statSecurity: "૧૦૦% સુરક્ષિત સત્રો",
      statDelay: "૧૫ સેકન્ડ વિલંબ સુરક્ષા",
      statOpen: "૯૮% ઓપન રેટ્સ",
      feature1Title: "સ્માર્ટ શેડ્યૂલ બ્રોડકાસ્ટ",
      feature1Desc: "એકવાર અથવા સમયાંતરે પુનરાવર્તિત થવા માટે કેમ્પેઈન સેટ કરો. બેકગ્રાઉન્ડમાં સંપૂર્ણપણે ઓટોમેટેડ મોકલો.",
      feature2Title: "મીડિયા ફાઇલો જોડાણ",
      feature2Desc: "કસ્ટમ કૅપ્શન સાથે ૧૫MB સુધીના ચિત્રો અને વિડિયો જોડો. બધું ક્લાઉડમાં સુરક્ષિત રીતે સંગ્રહિત થાય છે.",
      feature3Title: "સ્માર્ટ એક્સેલ / CSV આયાત",
      feature3Desc: "કોઈપણ સંપર્ક સ્પ્રેડશીટ અપલોડ કરો. અમારું ઇન્ટેલિજન્ટ પાર્સર કોઈપણ કોલમમાંથી નંબરો શોધી લે છે.",
      feature4Title: "એન્ટી-બેન પ્રોટેક્શન",
      feature4Desc: "તમારા એકાઉન્ટને પ્રતિબંધોથી બચાવવા માટે મલ્ટિ-કોન્ટેક્ટ લિસ્ટ પર સંદેશાઓ વચ્ચે આપમેળે ૧૫-સેકન્ડનો વિલંબ.",
      feature5Title: "સ્ટેટલેસ સુરક્ષા",
      feature5Desc: "સુરક્ષિત લોગિન સત્રો સીધા MongoDB માં સંગ્રહિત થાય છે. સર્વરલેસ પ્લેટફોર્મ માટે સજ્જ આર્કિટેક્ચર.",
      feature6Title: "દ્વિભાષી ઇન્ટરફેસ",
      feature6Desc: "અંગ્રેજી અને ગુજરાતી માટે સંપૂર્ણ સ્થાનિક સપોર્ટ. સરળ ભાષા બદલવાની સુવિધા.",
      footerTitle: "તમારી આઉટરીચ બદલવા માટે તૈયાર છો?",
      footerSubtitle: "લાઈવ ડેમોન્સ્ટ્રેશન અને કસ્ટમ વર્કસ્પેસ સેટઅપ માટે અત્યારે જ અમારો સંપર્ક કરો.",
      contactUs: "વ્હોટ્સએપ પર ચેટ કરો",
      copyright: "© ૨૦૨૬ AutoSend. સર્વાધિકાર સુરક્ષિત."
    }
  };

  const t = content[lang] || content.en;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-family)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Glow effects background */}
      <div className="bg-gradient-glow"></div>

      {/* Header/Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 5%',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: theme === 'dark' ? 'rgba(8, 12, 22, 0.5)' : 'rgba(241, 245, 249, 0.7)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            padding: '0.45rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--accent-glow)'
          }}>
            <MessageSquare size={20} style={{ color: '#fff' }} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AutoSend
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <HeaderControls lang={lang} theme={theme} toggleLang={toggleLang} toggleTheme={toggleTheme} />
          
          <button 
            onClick={onAccessDashboard}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              borderRadius: '20px',
              height: 'auto',
              borderWidth: '1px'
            }}
          >
            {t.accessDashboard}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 5% 4rem 5%',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '4rem',
        alignItems: 'center',
        maxWidth: '1280px',
        margin: '0 auto'
      }} className="hero-grid">
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--accent-teal)',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={13} />
            <span>Next-Gen WhatsApp Broadcasting</span>
          </div>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            {t.heroTitle}
          </h1>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '560px'
          }}>
            {t.heroSubtitle}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a 
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.75rem',
                borderRadius: '30px',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: '0 8px 25px var(--accent-glow)',
                textDecoration: 'none',
                color: '#fff'
              }}
            >
              <span>{t.bookDemo}</span>
              <ArrowRight size={16} />
            </a>

            <button 
              onClick={onAccessDashboard}
              className="btn btn-secondary"
              style={{
                padding: '0.8rem 1.75rem',
                borderRadius: '30px',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderWidth: '1.5px'
              }}
            >
              {t.accessDashboard}
            </button>
          </div>

          {/* Mini Stats */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            marginTop: '3.5rem',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '2rem'
          }} className="hero-stats">
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-teal)' }}>98%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t.statOpen}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--color-border)' }}></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>15s</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t.statDelay}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--color-border)' }}></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t.statSecurity}</div>
            </div>
          </div>
        </div>

        {/* Hero Image Container */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Glass Glow effect behind image */}
          <div style={{
            position: 'absolute',
            width: '90%',
            height: '90%',
            background: 'radial-gradient(circle, var(--accent-glow) 0%, rgba(0,0,0,0) 70%)',
            zIndex: 0,
            pointerEvents: 'none'
          }}></div>

          <img 
            src="/landing_hero.png" 
            alt="WhatsApp Scheduler Dashboard Illustration" 
            style={{
              width: '100%',
              maxHeight: '420px',
              objectFit: 'contain',
              borderRadius: '24px',
              zIndex: 1,
              filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.45))',
              animation: 'floatImage 6s ease-in-out infinite'
            }}
          />

          <style>{`
            @keyframes floatImage {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @media (max-width: 900px) {
              .hero-grid {
                grid-template-columns: 1fr !important;
                gap: 3rem !important;
                padding-top: 2.5rem !important;
              }
              .hero-grid h1 {
                font-size: 2.25rem !important;
              }
              .hero-stats {
                gap: 1.25rem !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 5% 6rem 5%',
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.45)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '700px',
          margin: '0 auto 4rem auto'
        }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.5px'
          }}>
            {t.featuresTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t.featuresSubtitle}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          {/* Feature 1 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              background: 'rgba(6, 182, 212, 0.08)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-teal)'
            }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.feature1Title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.feature1Desc}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-green)'
            }}>
              <Image size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.feature2Title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.feature2Desc}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.feature3Title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.feature3Desc}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-error)'
            }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.feature4Title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.feature4Desc}
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              background: 'rgba(168, 85, 247, 0.08)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7'
            }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.feature5Title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.feature5Desc}
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-warning)'
            }}>
              <Globe size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.feature6Title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.feature6Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <section style={{
        padding: '6rem 5% 5rem 5%',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '1.25rem',
            letterSpacing: '-0.5px'
          }}>
            {t.footerTitle}
          </h2>
          
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: 1.6
          }}>
            {t.footerSubtitle}
          </p>

          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <a 
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 2.25rem',
                borderRadius: '30px',
                fontSize: '1.05rem',
                fontWeight: 700,
                boxShadow: '0 10px 30px var(--accent-glow)',
                textDecoration: 'none',
                color: '#fff'
              }}
            >
              <MessageSquare size={18} />
              <span>{t.contactUs}</span>
            </a>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid var(--color-border)'
            }}>
              <Phone size={14} style={{ color: 'var(--accent-teal)' }} />
              <span style={{ fontWeight: 600 }}>+91 9512630583</span>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div style={{
          marginTop: '6rem',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '2rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          {t.copyright}
        </div>
      </section>
    </div>
  );
}
