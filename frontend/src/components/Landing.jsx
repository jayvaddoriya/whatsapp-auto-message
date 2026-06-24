import React, { useState } from 'react';
import { 
  MessageSquare, Calendar, Layers, Shield, Image, Globe, 
  Phone, ArrowRight, CheckCircle, Sparkles, Video, FileText,
  HelpCircle, Check, Play, Clock, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { HeaderControls } from '../App';

export default function Landing({ 
  lang, theme, toggleLang, toggleTheme, onAccessDashboard 
}) {
  const demoUrl = "https://wa.me/919512630583?text=Hi,%20I'm%20interested%20in%20a%20demo%20of%20the%20WhatsApp%20Auto-Message%20Broadcast%20Scheduler";

  // State for FAQ Accordion
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Localized texts
  const content = {
    en: {
      heroTitle: "Automate Your WhatsApp Broadcasts Seamlessly",
      heroSubtitle: "A premium, stateless scheduling and automation platform. Deliver messages, rich media, and customized campaigns with built-in anti-ban protection.",
      bookDemo: "Book a Demo",
      accessDashboard: "Access Dashboard",
      
      // Scenario workflow section
      workflowTitle: "Get Started in 3 Simple Steps",
      workflowSubtitle: "Follow this straightforward scenario to launch your first broadcast campaign in under two minutes.",
      step1Title: "1. Scan & Connect (QR Code)",
      step1Desc: "Open WhatsApp on your phone, navigate to 'Linked Devices', and scan the dynamically generated QR code on your dashboard. Instantly establish a secure, stateless connection.",
      step2Title: "2. Import Excel or CSV Contacts",
      step2Desc: "Drag and drop any contact sheet. Our smart parser scans every cell and column, automatically extracting, cleaning, and validating phone numbers into your custom list.",
      step3Title: "3. Schedule & Attach Media",
      step3Desc: "Draft your message, upload an image or video up to 15MB, select your recipient list, and set the delivery time (once or recurring). The scheduler handles the rest.",

      // Anti-Ban timeline section
      timelineTitle: "The Anti-Ban Guard in Action",
      timelineSubtitle: "Standard broadcasting tools send messages all at once, leading to quick account bans. Our smart queue spaces them out with a natural human delay.",
      timelineStep1: "00:00 Secs",
      timelineStep1Text: "Message 1 sent to Recipient A (Immediate)",
      timelineStep2: "00:15 Secs",
      timelineStep2Text: "Message 2 sent to Recipient B (15s Delay)",
      timelineStep3: "00:30 Secs",
      timelineStep3Text: "Message 3 sent to Recipient C (15s Delay)",
      timelineStep4: "00:45 Secs",
      timelineStep4Text: "Message 4 sent to Recipient D (15s Delay)",
      timelineStep5: "01:00 Mins",
      timelineStep5Text: "Message 5 sent to Recipient E (15s Delay)",
      timelineFooter: "This 15-second sequence mimics natural human behavior, safeguarding your phone number from WhatsApp's spam detection filters.",

      // Features section
      featuresTitle: "Enterprise-Grade Features",
      featuresSubtitle: "Powerful capabilities designed to protect your account and maximize your business outreach efficiency.",
      feature1Title: "Smart Scheduled Broadcasts",
      feature1Desc: "Schedule campaigns to send once or recur periodically (hourly, daily, weekly, monthly). Runs fully in the background.",
      feature2Title: "Rich Media Attachments",
      feature2Desc: "Attach images and videos up to 15MB with custom captions. Delivered directly as a native media message.",
      feature3Title: "Smart Excel/CSV Import",
      feature3Desc: "Upload any contact spreadsheet. No specific headers or columns required; our parser finds valid numbers anywhere.",
      feature4Title: "Anti-Ban Protection",
      feature4Desc: "Automatic 15-second delay between messages on multi-contact lists to protect your account from spam bans.",
      feature5Title: "Stateless Security",
      feature5Desc: "Secure session credentials stored directly in MongoDB. Fully stateless architecture, serverless-ready.",
      feature6Title: "Dual Language Interface",
      feature6Desc: "Full native support for English and Gujarati. Smooth toggle for interface, alerts, and formatting.",

      // FAQ section
      faqTitle: "Frequently Asked Questions",
      faqSubtitle: "Everything you need to know about the WhatsApp Auto-Message Broadcast Scheduler.",
      faqQ1: "Will my WhatsApp account get banned using this software?",
      faqA1: "Unlike standard bulk-sending tools that blast hundreds of messages at once, our system enforces a mandatory 15-second delay between messages. This mimics human speed, which significantly lowers the risk and keeps your account safe.",
      faqQ2: "What file formats and sizes are supported for media?",
      faqA2: "You can upload images (JPG, PNG, GIF) and videos (MP4) up to 15MB. The media is stored as a base64 string in MongoDB and delivered directly with your message text as a caption.",
      faqQ3: "Do I need to structure my Excel file in a specific way?",
      faqA3: "No. Our intelligent parser scans every single cell in your Excel (.xlsx, .xls) or CSV file, automatically removing formatting characters (+, -, brackets, spaces) and extracting any valid 8-15 digit phone numbers.",
      faqQ4: "What does 'stateless session' mean?",
      faqA4: "It means your WhatsApp login session credentials are saved directly in your secure MongoDB database rather than on the server's local hard drive. This allows the application to run smoothly on modern serverless hosting like Render, Railway, or Vercel without losing your login connection.",

      // Footer
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
      
      // Scenario workflow section
      workflowTitle: "ફક્ત ૩ સરળ સ્ટેપ્સમાં શરૂ કરો",
      workflowSubtitle: "બે મિનિટથી ઓછા સમયમાં તમારી પ્રથમ બ્રોડકાસ્ટ ઝુંબેશ શરૂ કરવા માટે આ સરળ પ્રક્રિયા અનુસરો.",
      step1Title: "૧. સ્કેન અને કનેક્ટ (QR કોડ)",
      step1Desc: "તમારા ફોન પર વોટ્સએપ ખોલો, 'લિંક્ડ ડિવાઇસીસ' પર જાઓ, અને ડેશબોર્ડ પર દેખાતો QR કોડ સ્કેન કરો. સેકન્ડોમાં સુરક્ષિત કનેક્શન સ્થાપિત કરો.",
      step2Title: "૨. એક્સેલ અથવા CSV સંપર્કો આયાત કરો",
      step2Desc: "કોઈપણ કોન્ટેક્ટ શીટ અપલોડ કરો. અમારું સ્માર્ટ પાર્સર દરેક સેલ સ્કેન કરીને ફોન નંબરો આપમેળે શોધી અને કન્વર્ટ કરી લે છે.",
      step3Title: "૩. મીડિયા ફાઇલ અને શેડ્યૂલ સેટ કરો",
      step3Desc: "સંદેશ લખો, ૧૫MB સુધીનું ચિત્ર અથવા વિડિયો અપલોડ કરો, તમારી યાદી પસંદ કરો અને સમય સેટ કરો. બાકીનું કામ શેડ્યૂલર આપમેળે કરશે.",

      // Anti-Ban timeline section
      timelineTitle: "એન્ટી-બેન ગાર્ડ કેવી રીતે કામ કરે છે",
      timelineSubtitle: "સામાન્ય ટૂલ્સ એક સાથે બધા મેસેજ મોકલે છે, જેનાથી વોટ્સએપ નંબર તરત બંધ થઈ જાય છે. આપણી સિસ્ટમ ૧૫ સેકન્ડનો કુદરતી ગેપ રાખે છે.",
      timelineStep1: "૦૦:૦૦ સેકન્ડ",
      timelineStep1Text: "પહેલો મેસેજ સંપર્ક A ને મોકલ્યો (તરત જ)",
      timelineStep2: "૦૦:૧૫ સેકન્ડ",
      timelineStep2Text: "બીજો મેસેજ સંપર્ક B ને મોકલ્યો (૧૫ સેકન્ડ ગેપ)",
      timelineStep3: "૦૦:૩૦ સેકન્ડ",
      timelineStep3Text: "ત્રીજો મેસેજ સંપર્ક C ને મોકલ્યો (૧૫ સેકન્ડ ગેપ)",
      timelineStep4: "૦૦:૪૫ સેકન્ડ",
      timelineStep4Text: "ચોથો મેસેજ સંપર્ક D ને મોકલ્યો (૧૫ સેકન્ડ ગેપ)",
      timelineStep5: "૦૧:૦૦ મિનિટ",
      timelineStep5Text: "પાંચમો મેસેજ સંપર્ક E ને મોકલ્યો (૧૫ સેકન્ડ ગેપ)",
      timelineFooter: "આ ૧૫ સેકન્ડની પ્રક્રિયા કુદરતી માનવ વર્તન જેવી છે, જે તમારા ફોન નંબરને વોટ્સએપના સ્પામ ફિલ્ટર્સથી સુરક્ષિત રાખે છે.",

      // Features section
      featuresTitle: "પ્રીમિયમ સુવિધાઓ",
      featuresSubtitle: "તમારા એકાઉન્ટને સુરક્ષિત રાખવા અને વ્યવસાયિક આઉટરીચ ક્ષમતા વધારવા માટે આધુનિક સિસ્ટમ.",
      feature1Title: "સ્માર્ટ શેડ્યૂલ બ્રોડકાસ્ટ",
      feature1Desc: "એકવાર અથવા સમયાંતરે પુનરાવર્તિત (કલાક દીઠ, દૈનિક, સાપ્તાહિક, માસિક) મોકલવા સેટ કરો. બેકગ્રાઉન્ડમાં આપમેળે રન થાય છે.",
      feature2Title: "મીડિયા ફાઇલો જોડાણ",
      feature2Desc: "કસ્ટમ કૅપ્શન સાથે ૧૫MB સુધીના ચિત્રો અને વિડિયો જોડો. સીધા જ વ્હોટ્સએપ મીડિયા મેસેજ તરીકે ડિલિવર થશે.",
      feature3Title: "સ્માર્ટ એક્સેલ / CSV આયાત",
      feature3Desc: "કોઈપણ સંપર્ક શીટ અપલોડ કરો. કોઈ ચોક્કસ કોલમ નામની જરૂર નથી; અમારું પાર્સર ગમે ત્યાંથી નંબરો શોધી લે છે.",
      feature4Title: "એન્ટી-બેન પ્રોટેક્શન",
      feature4Desc: "મલ્ટિ-કોન્ટેક્ટ લિસ્ટ પર સંદેશાઓ વચ્ચે આપમેળે ૧૫-સેકન્ડનો વિલંબ, જે એકાઉન્ટને પ્રતિબંધોથી બચાવે છે.",
      feature5Title: "સ્ટેટલેસ સુરક્ષા",
      feature5Desc: "લોગિન સત્રો અને કનેક્શન્સ સીધા જ MongoDB માં સુરક્ષિત સેવ થાય છે, જેથી સર્વર રીસ્ટાર્ટ થવા પર કનેક્શન તૂટતું નથી.",
      feature6Title: "દ્વિભાષી ઇન્ટરફેસ",
      feature6Desc: "અંગ્રેજી અને ગુજરાતી માટે સંપૂર્ણ સ્થાનિક સપોર્ટ. સરળ ભાષા બદલવાની સુવિધા સાથે ઉપલબ્ધ.",

      // FAQ section
      faqTitle: "વારંવાર પૂછાતા પ્રશ્નો",
      faqSubtitle: "વ્હોટ્સએપ ઓટો-મેસેજ બ્રોડકાસ્ટ શેડ્યૂલર વિશે સામાન્ય પ્રશ્નો અને જવાબો.",
      faqQ1: "શું આ સોફ્ટવેર વાપરવાથી મારું વ્હોટ્સએપ એકાઉન્ટ બંધ (બૅન) થઈ જશે?",
      faqA1: "બીજા સામાન્ય ટૂલ્સ એક સાથે સેંકડો મેસેજ મોકલે છે જે સ્પામ ગણાય છે. આપણી સિસ્ટમ મેસેજ વચ્ચે ફરજિયાત ૧૫ સેકન્ડનો વિલંબ રાખે છે. આ પ્રક્રિયા કુદરતી હોવાથી એકાઉન્ટ બંધ થવાનું જોખમ નહિવત થઈ જાય છે.",
      faqQ2: "મીડિયા ફાઇલો માટે કયા ફોર્મેટ અને સાઇઝ સપોર્ટેડ છે?",
      faqA2: "તમે ૧૫MB સુધીના ફોટા (JPG, PNG, GIF) અને વિડિયો (MP4) અપલોડ કરી શકો છો. આ ફાઇલો ડેટાબેઝમાં સેવ થાય છે અને ટેક્સ્ટ કૅપ્શન સાથે તમારા સંપર્કોને મોકલવામાં આવે છે.",
      faqQ3: "શું મારે એક્સેલ ફાઇલને કોઈ ખાસ રીતે ફોર્મેટ કરવી પડશે?",
      faqA3: "ના. અમારું ઇન્ટેલિજન્ટ પાર્સર એક્સેલ (.xlsx, .xls) અથવા CSV ફાઇલના દરેક સેલને સ્કેન કરે છે. તે આપમેળે વધારાના અક્ષરો (+, -, કૌંસ, સ્પેસ) દૂર કરીને ૮ થી ૧૫ આંકડાના માન્ય નંબરો શોધી લે છે.",
      faqQ4: "'સ્ટેટલેસ સેશન' એટલે શું?",
      faqA4: "તેનો અર્થ એ છે કે તમારા વોટ્સએપ લોગિન ઓળખપત્રો લોકલ હાર્ડ ડિસ્કને બદલે સુરક્ષિત MongoDB ડેટાબેઝમાં સંગ્રહિત થાય છે. આનાથી સિસ્ટમ ક્લાઉડ પ્લેટફોર્મ (જેમ કે Render, Railway) પર કનેક્શન ગુમાવ્યા વિના રન થઈ શકે છે.",

      // Footer
      footerTitle: "તમારી આઉટરીચ બદલવા માટે તૈયાર છો?",
      footerSubtitle: "લાઈવ ડેમોન્સ્ટ્રેશન અને કસ્ટમ વર્કસ્પેસ સેટઅપ માટે અત્યારે જ અમારો સંપર્ક કરો.",
      contactUs: "વ્હોટ્સએપ પર ચેટ કરો",
      copyright: "© ૨૦૨૬ AutoSend. સર્વાધિકાર સુરક્ષિત."
    }
  };

  const t = content[lang] || content.en;

  const faqData = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 }
  ];

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
          {/* Glass Glow effect behind image - Only in dark mode */}
          {theme === 'dark' && (
            <div style={{
              position: 'absolute',
              width: '90%',
              height: '90%',
              background: 'radial-gradient(circle, var(--accent-glow) 0%, rgba(0,0,0,0) 70%)',
              zIndex: 0,
              pointerEvents: 'none'
            }}></div>
          )}

          <img 
            src="/landing_hero.png" 
            alt="WhatsApp Scheduler Dashboard Illustration" 
            style={{
              width: '100%',
              maxWidth: '420px',
              aspectRatio: '1/1',
              objectFit: 'cover',
              borderRadius: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: theme === 'dark' 
                ? '0 20px 45px rgba(0, 0, 0, 0.5)' 
                : '0 20px 45px rgba(8, 12, 22, 0.15)',
              zIndex: 1,
              animation: 'floatImage 6s ease-in-out infinite'
            }}
          />
        </div>
      </section>

      {/* How It Works (Scenario Section) */}
      <section style={{
        padding: '6rem 5% 6rem 5%',
        borderTop: '1px solid var(--color-border)',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '700px',
          margin: '0 auto 4rem auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--accent-green)',
            marginBottom: '1rem'
          }}>
            <Play size={12} style={{ fill: 'var(--accent-green)' }} />
            <span>Workflow Scenario</span>
          </div>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.5px'
          }}>
            {t.workflowTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t.workflowSubtitle}
          </p>
        </div>

        {/* Workflow Infographic Graphic */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '4rem',
          position: 'relative'
        }}>
          <img 
            src="/software_workflow.png" 
            alt="WhatsApp Scheduler 3-Step Workflow Infographic" 
            style={{
              width: '100%',
              maxWidth: '960px',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              boxShadow: theme === 'dark' 
                ? '0 15px 35px rgba(0, 0, 0, 0.4)' 
                : '0 15px 35px rgba(8, 12, 22, 0.1)'
            }}
          />
        </div>

        {/* Detailed steps columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-teal)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>1</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.step1Title}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.step1Desc}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-green)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>2</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.step2Title}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.step2Desc}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>3</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.step3Title}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.step3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Anti-Ban Timeline Section */}
      <section style={{
        padding: '6rem 5%',
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.3)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: '4rem',
          alignItems: 'center'
        }} className="hero-grid">
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-error)',
              marginBottom: '1.5rem'
            }}>
              <Clock size={13} />
              <span>Anti-Ban Delivery Simulation</span>
            </div>

            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              letterSpacing: '-0.5px'
            }}>
              {t.timelineTitle}
            </h2>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '2rem'
            }}>
              {t.timelineSubtitle}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '0.1rem' }} />
              <span>{t.timelineFooter}</span>
            </div>
          </div>

          {/* Timeline Visual Card */}
          <div className="glass-card" style={{
            padding: '2.5rem 2rem',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
          }}>
            {/* Timeline Item 1 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{
                background: 'var(--accent-teal)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                minWidth: '95px',
                textAlign: 'center',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)'
              }}>{t.timelineStep1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep1Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 2 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{
                background: 'var(--accent-teal)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                minWidth: '95px',
                textAlign: 'center',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)'
              }}>{t.timelineStep2}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep2Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 3 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{
                background: 'var(--accent-teal)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                minWidth: '95px',
                textAlign: 'center',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)'
              }}>{t.timelineStep3}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep3Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 4 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{
                background: 'var(--accent-teal)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                minWidth: '95px',
                textAlign: 'center',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)'
              }}>{t.timelineStep4}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep4Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 5 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{
                background: 'var(--accent-green)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                minWidth: '95px',
                textAlign: 'center',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
              }}>{t.timelineStep5}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep5Text}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '6rem 5% 6rem 5%',
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.45)',
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
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

      {/* FAQ Section */}
      <section style={{
        padding: '6rem 5%',
        maxWidth: '900px',
        margin: '0 auto',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4.5rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#3b82f6',
            marginBottom: '1rem'
          }}>
            <HelpCircle size={13} />
            <span>Support Center</span>
          </div>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.5px'
          }}>
            {t.faqTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t.faqSubtitle}
          </p>
        </div>

        {/* Accordion list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqData.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="glass-card" 
                style={{ 
                  padding: '1.25rem 1.75rem', 
                  cursor: 'pointer',
                  border: isOpen ? '1px solid var(--accent-teal)' : '1px solid var(--color-border)',
                  transition: 'all 0.25s ease'
                }}
                onClick={() => toggleFaq(index)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {faq.q}
                  </h3>
                  {isOpen ? (
                    <ChevronUp size={18} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  )}
                </div>

                {isOpen && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
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
