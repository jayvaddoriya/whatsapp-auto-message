import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Calendar, Layers, Shield, Image, Globe, 
  Phone, ArrowRight, CheckCircle, Sparkles, Video, FileText,
  HelpCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Play
} from 'lucide-react';
import { HeaderControls } from '../App';

export default function Landing({ 
  lang, theme, toggleLang, toggleTheme, onAccessDashboard 
}) {
  const demoUrl = "https://wa.me/919512630583?text=Hi,%20I'm%20interested%20in%20a%20demo%20of%20the%20WhatsApp%20Auto-Message%20Broadcast%20Scheduler";

  // State for Scroll to Top Button
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
      statSecurity: "100% Secure Sessions",
      statDelay: "15s Delay Protection",
      statOpen: "98% Open Rates",
      
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

      // Safety section
      safetyTitle: "WhatsApp Safety & Broadcasting Guidelines",
      safetySubtitle: "Our slow-sending queue protects your number, but following these standard safety practices is essential to avoid account blocks.",
      safetyCard1Title: "Account Warm-Up",
      safetyCard1Desc: "Avoid broadcasting 500 messages from a brand-new number. Warm up your account by sending 20-30 messages daily first, and gradually scale up.",
      safetyCard2Title: "Opt-In & Opt-Out",
      safetyCard2Desc: "Only broadcast to contacts who have saved your number or opted-in. Always include a simple exit note like 'Reply STOP to opt-out'.",
      safetyCard3Title: "Two-Way Engagement",
      safetyCard3Desc: "WhatsApp trusts numbers with two-way chats. Encourage replies by asking questions (e.g. 'Reply YES to receive the code') to boost your score.",
      safetyCard4Title: "Avoid Spam Words",
      safetyCard4Desc: "Do not blast highly promotional keywords or identical links repeatedly. Keep your content relevant, useful, and personalized.",
      
      // Policy Section
      policyTitle: "Broadcasting Policy & Account Safety",
      policySubtitle: "Understand WhatsApp's official policies and how our built-in safety engine protects your account when sending to large lists.",
      policyCardTitle: "The 500-Contact Broadcast Policy",
      policyCardQuestion: "Will my WhatsApp account get blocked if I send to 500 contacts?",
      policyCardAnswer: "The short answer is no—provided you use our platform's built-in safeguards and follow standard policies. WhatsApp blocks accounts based on sending speed and user spam reports. Because our system enforces a mandatory 15-second delay, sending to 500 contacts is spread naturally over 2 hours, preventing automated spam triggers. However, to guarantee 100% safety, you must adhere to the official rules below.",
      policyRule1Title: "Only Send to Opt-In Contacts",
      policyRule1Desc: "Never broadcast unsolicited messages to strangers. If recipients report your number as spam, WhatsApp will block you regardless of sending speed.",
      policyRule2Title: "Gradually Scale Your Volume",
      policyRule2Desc: "If your number is brand new, start by sending 20-30 messages daily. Slowly warm up the account and increase your volume over 2-3 weeks before blasting to 500+ contacts.",
      policyRule3Title: "Keep Messages Personalized",
      policyRule3Desc: "Avoid blasting identical promotional text. Use our dynamic custom list templates to personalize names or content to look natural and organic.",
      policyRule4Title: "Encourage Two-Way Chats",
      policyRule4Desc: "WhatsApp trusts numbers that have mutual conversations. Ask questions or run interactive polls so recipients reply to you, boosting your number score.",

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
      statSecurity: "૧૦૦% સુરક્ષિત સત્રો",
      statDelay: "૧૫ સેકન્ડ વિલંબ સુરક્ષા",
      statOpen: "૯૮% ઓપન રેટ્સ",
      
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
      feature5Desc: "લોગિન સત્રો અને કનેક્શન્સ સીધા જ MongoDB માં સુરક્ષિત સેવ થાય છે, જેથી સરોવર રીસ્ટાર્ટ થવા પર કનેક્શન તૂટતું નથી.",
      feature6Title: "દ્વિભાષી ઇન્ટરફેસ",
      feature6Desc: "અંગ્રેજી અને ગુજરાતી માટે સંપૂર્ણ સ્થાનિક સપોર્ટ. સરળ ભાષા બદલવાની સુવિધા સાથે ઉપલબ્ધ.",

      // Safety section
      safetyTitle: "વોટ્સએપ સુરક્ષા અને પ્રસારણ માર્ગદર્શિકા",
      safetySubtitle: "અમારી ધીમી ગતિની મોકલવાની સિસ્ટમ તમારા નંબરને સુરક્ષિત રાખે છે, પરંતુ એકાઉન્ટ બ્લોકથી બચવા માટે આ સામાન્ય સુરક્ષા પદ્ધતિઓ અનુસરવી આવશ્યક છે.",
      safetyCard1Title: "એકાઉન્ટ વોર્મ-અપ",
      safetyCard1Desc: "નવા નંબરથી સીધા ૫૦૦ મેસેજ ન મોકલો. પહેલા દરરોજ ૨૦-૩૦ મેસેજ મોકલીને એકાઉન્ટ સક્રિય કરો, અને ધીમે-ધીમે સંખ્યા વધારો.",
      safetyCard2Title: "ઓપ્ટ-ઇન અને ઓપ્ટ-આઉટ",
      safetyCard2Desc: "ફક્ત એવા જ સંપર્કોને મોકલો જેમણે તમારો નંબર સેવ કર્યો હોય. હંમેશા મેસેજના અંતે 'દૂર કરવા માટે STOP મોકલો' એવું ઉમેરો.",
      safetyCard3Title: "પરસ્પર વાતચીત (Engagement)",
      safetyCard3Desc: "વોટ્સએપ એવા નંબરો પર વધુ ભરોસો કરે છે જેમાં સામેથી જવાબ આવે. પ્રશ્નો પૂછીને લોકોને જવાબ આપવા પ્રોત્સાહિત કરો.",
      safetyCard4Title: "સ્પામ શબ્દોથી બચો",
      safetyCard4Desc: "અતિશય પ્રમોશનલ શબ્દો અથવા એક સરખી લિંક્સ વારંવાર ન મોકલો. તમારું લખાણ સુસંગત, ઉપયોગી અને કસ્ટમાઇઝ્ડ રાખો.",
      
      // Policy Section
      policyTitle: "બ્રોડકાસ્ટિંગ પોલિસી અને એન્ટી-બેન સુરક્ષા",
      policySubtitle: "શું ૫૦૦+ સંપર્કોને બ્રોડકાસ્ટ કરવું સુરક્ષિત છે? વોટ્સએપની સત્તાવાર નીતિઓ અને આપણી બિલ્ટ-ઇન સુરક્ષા સિસ્ટમ વિશે જાણો.",
      policyCardTitle: "૫૦૦-સંપર્ક બ્રોડકાસ્ટ પોલિસી",
      policyCardQuestion: "જો હું ૫૦૦ સંપર્કોને મેસેજ મોકલું તો શું મારું વોટ્સએપ બંધ થઈ જશે?",
      policyCardAnswer: "ટૂંકો જવાબ: જો તમે અમારી સિસ્ટમના સુરક્ષા નિયમો અને વોટ્સએપ પોલિસીનું પાલન કરશો તો નહીં થાય. વોટ્સએપ એકાઉન્ટ સ્પીડ અને લોકોના સ્પામ રિપોર્ટ પરથી બ્લોક કરે છે. આપણી સિસ્ટમ ફરજિયાત ૧૫-સેકન્ડનો વિલંબ રાખે છે, જેથી ૫૦૦ મેસેજ મોકલવામાં આશરે ૨ કલાક લાગે છે જે કુદરતી સ્પીડ છે. જો કે, સંપૂર્ણ સુરક્ષા માટે તમારે નીચેના સત્તાવાર નિયમોનું પાલન કરવું જ પડશે.",
      policyRule1Title: "ફક્ત મંજૂરીવાળા સંપર્કોને જ મોકલો",
      policyRule1Desc: "અજાણ્યા લોકોને ક્યારેય ન મોકલો. જો લોકો તમારો મેસેજ જોઈને સ્પામ રિપોર્ટ કરશે, તો ગમે તેટલી ધીમી સ્પીડ હશે તો પણ વોટ્સએપ એકાઉન્ટ બ્લોક કરી દેશે.",
      policyRule2Title: "ધીમે-ધીમે વોલ્યુમ વધારો (Warm-up)",
      policyRule2Desc: "જો તમારો નંબર નવો હોય, તો પહેલા રોજ ૨૦-૩૦ મેસેજ જ મોકલો. ૨-૩ અઠવાડિયા સુધી એકાઉન્ટની ક્ષમતા વધારો, પછી જ ૫૦૦+ સંપર્કોને એકસાથે મોકલો.",
      policyRule3Title: "મેસેજ પર્સનલાઈઝ્ડ રાખો",
      policyRule3Desc: "બધાને એક સરખો જ પ્રમોશનલ મેસેજ ન મોકલો. ડાયનેમિક લિસ્ટનો ઉપયોગ કરી નામ અથવા વિગતો બદલીને મેસેજ મોકલો જેથી તે ઓર્ગેનિક લાગે.",
      policyRule4Title: "પરસ્પર વાતચીત વધારો",
      policyRule4Desc: "વોટ્સએપ એવા એકાઉન્ટને ટ્રસ્ટેડ માને છે જેમાં સામસામે વાતચીત થતી હોય. લોકો જવાબ આપે તેવા આકર્ષક પ્રશ્નો અથવા પોલ મોકલી રિપ્લાય મેળવો.",

      // FAQ section
      faqTitle: "વારંવાર પૂછાતા પ્રશ્નો",
      faqSubtitle: "વ્હોટ્સએપ ઓટો-મેસેજ બ્રોડકાસ્ટ શેડ્યૂલર વિશે સામાન્ય પ્રશ્નો અને જવાબો.",
      faqQ1: "શું આ સોફ્ટવેર વાપરવાથી મારું વ્હોટ્સએપ એકાઉન્ટ બંધ (બૅન) થઈ જશે?",
      faqA1: "બીજા સામાન્ય ટૂલ્સ એક સાથે સેંકડો મેસેજ મોકલે છે જે સ્પામ ગણાય છે. આપણી સિસ્ટમ મેસેજ વચ્ચે ફરજિયાત ૧૫ સેકન્ડનો વિલંબ રાખે છે. આ પ્રક્રિયા કુદરતી હોવાથી એકાઉન્ટ બંધ થવાનું જોખમ નહિવત થઈ જાય છે.",
      faqQ2: "મીડિયા ફાઇલો માટે કયા ફોર્મેટ અને સાઇઝ સપોર્ટેધ છે?",
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
      <nav className="landing-nav">
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
          <span className="landing-nav-logo-text" style={{
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
            className="btn btn-secondary landing-nav-btn"
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
      <section className="hero-grid">
        <div className="hero-grid-left">
          <div className="animate-fade-in-up" style={{
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

          <h1 className="animate-fade-in-up delay-100" style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            {t.heroTitle}
          </h1>

          <p className="animate-fade-in-up delay-200" style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '560px'
          }}>
            {t.heroSubtitle}
          </p>

          <div className="hero-buttons animate-fade-in-up delay-300" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
          <div className="hero-stats animate-fade-in-up delay-400" style={{
            display: 'flex',
            gap: '2rem',
            marginTop: '3.5rem',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-teal)' }}>98%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t.statOpen}</div>
            </div>
            <div className="hero-stats-divider" style={{ width: '1px', background: 'var(--color-border)' }}></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)' }}>15s</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t.statDelay}</div>
            </div>
            <div className="hero-stats-divider" style={{ width: '1px', background: 'var(--color-border)' }}></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t.statSecurity}</div>
            </div>
          </div>
        </div>

        {/* Hero Image Container */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
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
            className="hero-image-animate"
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
              zIndex: 1
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
        <div className="workflow-desktop-image" style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '4rem'
        }}>
          <div className="workflow-image-container" style={{
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
            border: '1px solid var(--color-border)',
            padding: '0.75rem',
            borderRadius: '24px',
            boxShadow: theme === 'dark' 
              ? '0 25px 50px rgba(0, 0, 0, 0.4)' 
              : '0 25px 50px rgba(8, 12, 22, 0.06)',
            maxWidth: '740px',
            width: '100%'
          }}>
            <img 
              src="/software_workflow.png" 
              alt="WhatsApp Scheduler 3-Step Workflow Infographic" 
              style={{
                width: '100%',
                borderRadius: '16px',
                display: 'block',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            />
          </div>
        </div>

        {/* Detailed steps columns */}
        <div className="workflow-steps-grid">
          <div className="workflow-step-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

          <div className="workflow-step-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

          <div className="workflow-step-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
          gridTemplateColumns: '0.95fr 1.05fr',
          gap: '4rem',
          alignItems: 'center'
        }} className="hero-grid">
          <div className="hero-grid-left">
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
              color: 'var(--text-secondary)',
              textAlign: 'left'
            }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '0.1rem' }} />
              <span>{t.timelineFooter}</span>
            </div>
          </div>

          {/* Timeline Visual Card */}
          <div className="glass-card timeline-visual-card" style={{
            padding: '2.5rem 2rem',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
          }}>
            {/* Timeline Item 1 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div className="timeline-step-badge" style={{
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
                <CheckCircle size={15} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <span className="timeline-step-text" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep1Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="timeline-connecting-line" style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 2 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div className="timeline-step-badge" style={{
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
                <CheckCircle size={15} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <span className="timeline-step-text" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep2Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="timeline-connecting-line" style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 3 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div className="timeline-step-badge" style={{
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
                <CheckCircle size={15} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <span className="timeline-step-text" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep3Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="timeline-connecting-line" style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 4 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div className="timeline-step-badge" style={{
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
                <CheckCircle size={15} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <span className="timeline-step-text" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep4Text}</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="timeline-connecting-line" style={{ width: '2px', height: '12px', background: 'var(--color-border)', marginLeft: '47px', marginTop: '-0.75rem', marginBottom: '-0.75rem' }}></div>

            {/* Timeline Item 5 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div className="timeline-step-badge" style={{
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
                <CheckCircle size={15} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <span className="timeline-step-text" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.timelineStep5Text}</span>
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

        <div className="features-grid">
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

      {/* Safety & Policy Guidelines Section */}
      <section className="safety-section" style={{
        padding: '6rem 5% 6rem 5%',
        borderBottom: '1px solid var(--color-border)',
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
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-warning)',
            marginBottom: '1rem'
          }}>
            <Shield size={13} />
            <span>Safety First Guidelines</span>
          </div>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.5px'
          }}>
            {t.safetyTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t.safetySubtitle}
          </p>
        </div>

        <div className="safety-grid">
          {/* Card 1 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-teal)' }}>
              <Sparkles size={18} />
              {t.safetyCard1Title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.safetyCard1Desc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)' }}>
              <CheckCircle size={18} />
              {t.safetyCard2Title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.safetyCard2Desc}
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
              <MessageSquare size={18} />
              {t.safetyCard3Title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.safetyCard3Desc}
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)' }}>
              <AlertTriangle size={18} />
              {t.safetyCard4Title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.safetyCard4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Broadcasting Policy & Anti-Ban Safety Section */}
      <section className="policy-section" style={{
        padding: '6rem 5% 6rem 5%',
        borderBottom: '1px solid var(--color-border)',
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
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#3b82f6',
            marginBottom: '1rem'
          }}>
            <Shield size={13} />
            <span>Official Anti-Ban & Safety Policy</span>
          </div>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.5px'
          }}>
            {t.policyTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t.policySubtitle}
          </p>
        </div>

        <div className="policy-content-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Left Side: Policy & 500-contacts explanation card */}
          <div className="glass-card policy-highlight-card" style={{
            padding: '2.5rem',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            background: theme === 'dark' ? 'rgba(8, 12, 22, 0.4)' : 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--color-warning)',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                {t.policyCardTitle}
              </h3>
            </div>

            <div style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              borderLeft: '3px solid var(--color-warning)',
              paddingLeft: '1rem',
              margin: '0.5rem 0'
            }}>
              {t.policyCardQuestion}
            </div>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0
            }}>
              {t.policyCardAnswer}
            </p>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <CheckCircle size={20} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {lang === 'en' 
                  ? "Built-in Anti-Ban Safeguard: Mandatory 15-second delivery delay is active by default."
                  : "બિલ્ટ-ઇન એન્ટી-બેન ગાર્ડ: ફરજિયાત ૧૫-સેકન્ડનો વિલંબ આપમેળે સક્રિય રહે છે."}
              </span>
            </div>
          </div>

          {/* Right Side: Rules checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Rule 1 */}
            <div className="glass-card policy-rule-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                color: 'var(--accent-teal)',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{t.policyRule1Title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{t.policyRule1Desc}</p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="glass-card policy-rule-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                color: 'var(--accent-green)',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{t.policyRule2Title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{t.policyRule2Desc}</p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="glass-card policy-rule-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                color: '#3b82f6',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{t.policyRule3Title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{t.policyRule3Desc}</p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="glass-card policy-rule-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--color-error)',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{t.policyRule4Title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{t.policyRule4Desc}</p>
              </div>
            </div>
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
                className="glass-card faq-card" 
                style={{ 
                  border: isOpen ? '1px solid var(--accent-teal)' : '1px solid var(--color-border)'
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
                    lineHeight: 1.6,
                    textAlign: 'left'
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
      <section className="cta-section" style={{
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
            gap: '1rem',
            width: '100%'
          }}>
            <a 
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.9rem 2.25rem',
                borderRadius: '30px',
                fontSize: '1.05rem',
                fontWeight: 700,
                boxShadow: '0 10px 30px var(--accent-glow)',
                textDecoration: 'none',
                color: '#fff',
                maxWidth: '320px',
                width: '100%'
              }}
            >
              <MessageSquare size={18} />
              <span>{t.contactUs}</span>
            </a>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              maxWidth: '260px',
              width: '100%'
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

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} />
      </button>

      {/* Global CSS Responsive Overrides */}
      <style>{`
        @keyframes floatImage {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* General Styles */
        .landing-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 5%;
          border-bottom: 1px solid var(--color-border);
          backdrop-filter: blur(12px);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background-color: ${theme === 'dark' ? 'rgba(8, 12, 22, 0.7)' : 'rgba(241, 245, 249, 0.75)'};
          transition: all var(--transition-fast);
        }
        
        .hero-grid {
          padding: 9rem 5% 4rem 5%;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
        }
        
        /* Navbar Responsiveness */
        @media (max-width: 600px) {
          .landing-nav {
            padding: 0.75rem 1rem !important;
          }
          .landing-nav-logo-text {
            display: none !important;
          }
          .landing-nav-btn {
            padding: 0.35rem 0.75rem !important;
            font-size: 0.75rem !important;
          }
        }

        /* Hero Grid Responsiveness */
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            padding: 7.5rem 1.25rem 3rem 1.25rem !important;
            text-align: center;
          }
          .hero-grid-left {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-grid h1 {
            font-size: 2.25rem !important;
            letter-spacing: -0.75px !important;
          }
          .hero-grid p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-buttons {
            justify-content: center;
            width: 100%;
          }
          .hero-stats {
            justify-content: center;
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .hero-grid h1 {
            font-size: 1.85rem !important;
          }
          .hero-buttons {
            flex-direction: column;
            width: 100%;
          }
          .hero-buttons a, .hero-buttons button {
            width: 100% !important;
            justify-content: center;
          }
          .hero-stats {
            flex-direction: column !important;
            align-items: center;
            gap: 1.5rem !important;
          }
          .hero-stats-divider {
            display: none !important;
          }
        }

        /* Workflow Graphic Responsiveness */
        .workflow-desktop-image {
          display: flex;
          justify-content: center;
          margin-bottom: 4rem;
        }
        @media (max-width: 768px) {
          .workflow-desktop-image {
            display: none !important;
          }
        }

        /* Workflow Steps Grid */
        .workflow-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .workflow-steps-grid {
            grid-template-columns: 1fr !important;
            gap: 1.75rem;
            padding: 0 0.5rem;
          }
        }

        /* Features Grid Responsiveness */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .features-grid {
            grid-template-columns: 1fr !important;
            padding: 0 0.5rem;
          }
        }

        /* Timeline Simulation Responsiveness */
        @media (max-width: 480px) {
          .timeline-visual-card {
            padding: 1.5rem 1rem !important;
            gap: 1rem !important;
          }
          .timeline-step-badge {
            min-width: 80px !important;
            font-size: 0.7rem !important;
            padding: 0.25rem 0.5rem !important;
          }
          .timeline-step-text {
            font-size: 0.85rem !important;
          }
          .timeline-connecting-line {
            margin-left: 40px !important;
          }
        }

        /* FAQ Accordion Responsiveness */
        .faq-card {
          padding: 1.25rem 1.75rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        @media (max-width: 600px) {
          .faq-card {
            padding: 1rem 1.25rem !important;
          }
          .faq-card h3 {
            font-size: 0.95rem !important;
          }
          .faq-card p {
            font-size: 0.85rem !important;
          }
        }

        /* CTA Section Responsiveness */
        @media (max-width: 600px) {
          .cta-section h2 {
            font-size: 1.85rem !important;
          }
          .cta-section p {
            font-size: 0.95rem !important;
          }
        }

        /* Mount Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }

        .hero-image-animate {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 200ms both,
                     floatImage 6s ease-in-out 1s infinite;
        }

        /* Hover Transitions & micro-interactions */
        .features-grid .glass-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .features-grid .glass-card:hover {
          transform: translateY(-6px);
          border-color: var(--accent-teal) !important;
          box-shadow: ${theme === 'dark' 
            ? '0 15px 30px rgba(6, 182, 212, 0.15)' 
            : '0 15px 30px rgba(6, 182, 212, 0.08)'} !important;
        }

        .workflow-step-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid transparent;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .workflow-step-card:hover {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
          border-color: var(--color-border);
          transform: translateY(-4px);
        }

        .timeline-visual-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .timeline-visual-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25) !important;
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          }
        }
        .timeline-step-badge {
          animation: pulseGlow 3s infinite ease-in-out;
        }

        /* Interactive Buttons Hover overrides */
        .btn-primary {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .btn-primary:hover {
          transform: scale(1.03) translateY(-1px);
          box-shadow: 0 10px 28px var(--accent-glow) !important;
        }
        .btn-secondary {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .btn-secondary:hover {
          transform: scale(1.02) translateY(-1px);
          border-color: var(--accent-teal) !important;
        }

        /* Infographic Hover effect */
        .workflow-image-container {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .workflow-image-container:hover {
          transform: translateY(-5px);
          box-shadow: ${theme === 'dark'
            ? '0 30px 60px rgba(16, 185, 129, 0.15)'
            : '0 30px 60px rgba(16, 185, 129, 0.08)'} !important;
          border-color: var(--accent-green) !important;
        }

        /* Mobile Section Spacing Overrides */
        @media (max-width: 768px) {
          section {
            padding: 2.5rem 1.25rem !important; /* Reduced vertical spacing on mobile */
          }
          /* Reduce spacing between Safety & Policy sections even further to make them contiguous */
          .safety-section {
            padding-bottom: 1rem !important;
            border-bottom: none !important; /* Merge visually */
          }
          .policy-section {
            padding-top: 1rem !important;
            padding-bottom: 1.5rem !important;
          }
        }

        /* Safety Grid Layout */
        .safety-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          max-width: 1280px;
          margin: 0 auto;
        }
        .safety-grid .glass-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .safety-grid .glass-card:hover {
          transform: translateY(-6px);
          border-color: var(--color-warning) !important;
          box-shadow: 0 15px 30px rgba(245, 158, 11, 0.15) !important;
        }
        @media (max-width: 768px) {
          .safety-grid {
            grid-template-columns: 1fr !important;
            padding: 0 0.5rem;
          }
        }

        /* Policy Section Styling & Hover Effects */
        .policy-content-grid {
          transition: all 0.4s ease;
        }
        .policy-highlight-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .policy-highlight-card:hover {
          transform: translateY(-6px);
          border-color: var(--color-warning) !important;
          box-shadow: ${theme === 'dark' 
            ? '0 15px 30px rgba(245, 158, 11, 0.2)' 
            : '0 15px 30px rgba(245, 158, 11, 0.1)'} !important;
        }

        .policy-rule-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .policy-rule-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-teal) !important;
          box-shadow: ${theme === 'dark'
            ? '0 10px 20px rgba(6, 182, 212, 0.15)'
            : '0 10px 20px rgba(6, 182, 212, 0.06)'} !important;
        }

        @media (max-width: 900px) {
          .policy-content-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 768px) {
          .policy-rule-card {
            padding: 1.25rem !important;
          }
        }

        /* FAQ Card Hover Glow */
        .faq-card {
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease !important;
        }
        .faq-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-teal) !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
        }

        /* Floating Scroll to Top Button - Bottom Left */
        .scroll-to-top-btn {
          position: fixed;
          bottom: 2rem;
          left: 2rem; /* Strictly bottom-left as requested */
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)'};
          backdrop-filter: blur(10px);
          border: 1px solid var(--color-border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transform: translateY(15px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .scroll-to-top-btn.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .scroll-to-top-btn:hover {
          background: var(--accent-gradient);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 10px 25px var(--accent-glow);
          transform: translateY(-3px);
        }
        .scroll-to-top-btn:active {
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .scroll-to-top-btn {
            bottom: 1.5rem;
            left: 1.5rem;
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}
