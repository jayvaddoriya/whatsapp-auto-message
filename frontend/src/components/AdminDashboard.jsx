import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Calendar, Clock, Send, Trash2, Edit2, Play, CheckCircle, 
  XCircle, AlertCircle, LogOut, MessageSquare, RefreshCw, Layers, Plus, X, Search
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { HeaderControls } from '../App';


const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function AdminDashboard({ 
  token, user, onLogout, t, lang, theme, toggleLang, toggleTheme 
}) {
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules', 'custom_lists', or 'whatsapp'
  
  // WhatsApp connection states
  const [waStatus, setWaStatus] = useState({
    status: 'disconnected', // disconnected, connecting, qr_ready, connected
    qr_code: null,
    phone_number: null,
    push_name: null
  });
  const [initializingWa, setInitializingWa] = useState(false);

  // Synced broadcasts list (merges synced and custom lists)
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);

  // Custom Lists Manager states
  const [customLists, setCustomLists] = useState([]);
  const [customListSearch, setCustomListSearch] = useState('');
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [editingCustomList, setEditingCustomList] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customNumbersText, setCustomNumbersText] = useState('');
  const [submittingCustom, setSubmittingCustom] = useState(false);
  const [customError, setCustomError] = useState('');
  const [excelImportStatus, setExcelImportStatus] = useState('');
  const excelInputRef = useRef(null);


  // Contacts states
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [contactSearch, setContactSearch] = useState('');

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [schedulesError, setSchedulesError] = useState('');

  // Schedule Form State
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formFields, setFormFields] = useState({
    broadcast_jid: '',
    message: '',
    schedule_date: '',
    schedule_time: '',
    period: 'once'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [formError, setFormError] = useState('');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Setup refs for interval polling
  const pollingRef = useRef(null);

  // Fetch WhatsApp status
  const fetchWaStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setWaStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch WA status:', err);
    }
  };

  // Initialize WhatsApp connection
  const handleConnectWa = async () => {
    setInitializingWa(true);
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/connect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to initialize WhatsApp.');
      
      // Update status immediately and start polling
      fetchWaStatus();
      setActiveTab('whatsapp');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setInitializingWa(false);
    }
  };

  // Disconnect / Log out WhatsApp
  const handleDisconnectWa = async () => {
    if (!window.confirm(lang === 'en' 
      ? 'Are you sure you want to log out from WhatsApp? You will have to scan the QR code again to reconnect.'
      : 'શું તમે ખરેખર વોટ્સએપમાંથી લોગ આઉટ કરવા માંગો છો? ફરીથી કનેક્ટ કરવા માટે તમારે ફરીથી QR કોડ સ્કેન કરવો પડશે.'
    )) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to disconnect.');
      
      setWaStatus({
        status: 'disconnected',
        qr_code: null,
        phone_number: null,
        push_name: null
      });
      setBroadcasts([]);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Fetch broadcast lists (merges synced and custom lists)
  const fetchBroadcasts = async () => {
    setLoadingBroadcasts(true);
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/broadcasts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBroadcasts(data);
      }
    } catch (err) {
      console.error('Failed to fetch broadcasts:', err);
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  // Fetch detailed custom broadcast lists
  const [fetchingCustomListsInProgress, setFetchingCustomListsInProgress] = useState(false);
  const fetchCustomLists = async (search = '') => {
    setLoadingCustom(true);
    setCustomError('');
    try {
      const response = await fetch(`${API_BASE}/api/custom-broadcasts?search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch custom lists.');
      setCustomLists(data);
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setLoadingCustom(false);
    }
  };

  // Fetch synced WhatsApp contacts
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleToggleContact = (phoneNumber) => {
    setSelectedNumbers(prev => 
      prev.includes(phoneNumber)
        ? prev.filter(num => num !== phoneNumber)
        : [...prev, phoneNumber]
    );
  };

  const handleSelectAll = () => {
    const q = contactSearch.toLowerCase();
    const filtered = contacts.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const phoneMatch = (c.phone_number || '').includes(q);
      return nameMatch || phoneMatch;
    });
    const allFilteredNums = filtered.map(c => c.phone_number);
    setSelectedNumbers(prev => {
      const unique = new Set([...prev, ...allFilteredNums]);
      return Array.from(unique);
    });
  };

  const handleDeselectAll = () => {
    const q = contactSearch.toLowerCase();
    const filtered = contacts.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const phoneMatch = (c.phone_number || '').includes(q);
      return nameMatch || phoneMatch;
    });
    const allFilteredNums = filtered.map(c => c.phone_number);
    setSelectedNumbers(prev => prev.filter(num => !allFilteredNums.includes(num)));
  };

  // Load custom list for editing
  const startEditCustomList = (list) => {
    setEditingCustomList(list);
    setCustomName(list.name);
    setCustomNumbersText(list.numbers.join('\n'));
  };

  // Cancel custom list editing
  const cancelEditCustomList = () => {
    setEditingCustomList(null);
    setCustomName('');
    setCustomNumbersText('');
    setCustomError('');
    setExcelImportStatus('');
    if (excelInputRef.current) {
      excelInputRef.current.value = '';
    }
  };

  // Handle Excel/CSV File Upload & Parsing
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelImportStatus('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse sheet to JSON rows
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract numbers from all cells
        const foundNumbers = [];
        rows.forEach(row => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              if (cell !== null && cell !== undefined) {
                const str = String(cell).trim();
                // Clean formatting characters
                const cleaned = str.replace(/[\s\-\(\)\+]/g, '');
                // Validate digits length 8 to 15
                if (/^\d{8,15}$/.test(cleaned)) {
                  foundNumbers.push(cleaned);
                }
              }
            });
          }
        });

        // Deduplicate numbers
        const uniqueNumbers = Array.from(new Set(foundNumbers));

        if (uniqueNumbers.length === 0) {
          setExcelImportStatus(
            lang === 'en'
              ? 'No valid phone numbers found in the file.'
              : 'ફાઇલમાં કોઈ માન્ય ફોન નંબરો મળ્યા નથી.'
          );
          return;
        }

        // Merge and set numbers
        setCustomNumbersText(prev => {
          const currentNums = prev
            .split(/[\n,]/)
            .map(n => n.trim())
            .filter(n => n.length > 0);
          
          const combined = Array.from(new Set([...currentNums, ...uniqueNumbers]));
          return combined.join('\n');
        });

        setExcelImportStatus(
          lang === 'en'
            ? `Successfully imported ${uniqueNumbers.length} unique numbers from ${file.name}`
            : `સફળતાપૂર્વક ${file.name} માંથી ${uniqueNumbers.length} અનન્ય નંબરો આયાત કર્યા`
        );

        // Reset file input
        if (excelInputRef.current) {
          excelInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Excel parse error:', err);
        setExcelImportStatus(
          lang === 'en'
            ? 'Error parsing Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.'
            : 'એક્સેલ ફાઇલ પાર્સ કરવામાં ભૂલ. કૃપા કરીને ખાતરી કરો કે તે એક માન્ય .xlsx, .xls અથવા .csv ફાઇલ છે.'
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Create a new custom list
  const handleCreateCustomList = async (e) => {
    e.preventDefault();
    setCustomError('');
    
    const numbersArray = customNumbersText
      .split(/[\n,]/)
      .map(num => num.trim())
      .filter(num => num.length > 0);

    if (numbersArray.length === 0) {
      setCustomError(lang === 'en' ? 'Please enter at least one phone number.' : 'કૃપા કરીને ઓછામાં ઓછો એક ફોન નંબર દાખલ કરો.');
      return;
    }

    setSubmittingCustom(true);
    try {
      const url = editingCustomList 
        ? `${API_BASE}/api/custom-broadcasts/${editingCustomList.id}`
        : `${API_BASE}/api/custom-broadcasts`;
      const method = editingCustomList ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: customName,
          numbers: numbersArray
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save list.');

      setCustomName('');
      setCustomNumbersText('');
      setEditingCustomList(null);
      setExcelImportStatus('');
      if (excelInputRef.current) {
        excelInputRef.current.value = '';
      }
      
      fetchCustomLists();
      fetchBroadcasts();
      alert(editingCustomList
        ? (lang === 'en' ? 'Custom broadcast list updated successfully!' : 'કસ્ટમ બ્રોડકાસ્ટ યાદી સફળતાપૂર્વક અપડેટ કરવામાં આવી છે!')
        : (lang === 'en' ? 'Custom broadcast list created successfully!' : 'કસ્ટમ બ્રોડકાસ્ટ યાદી સફળતાપૂર્વક બનાવવામાં આવી છે!')
      );
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setSubmittingCustom(false);
    }
  };


  // Delete a custom list
  const handleDeleteCustomList = async (listId) => {
    if (!window.confirm(lang === 'en'
      ? 'Delete this custom list? Any schedule targeting this custom list will fail to send.'
      : 'આ કસ્ટમ યાદી કાઢી નાખવી છે? આ યાદી પર મોકલાતા આયોજનો નિષ્ફળ જશે.'
    )) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/custom-broadcasts/${listId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete custom list.');

      fetchCustomLists();
      fetchBroadcasts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Fetch schedules
  const fetchSchedules = async (search = '') => {
    setLoadingSchedules(true);
    setSchedulesError('');
    try {
      const response = await fetch(`${API_BASE}/api/schedules?search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch schedules.');
      setSchedules(data);
    } catch (err) {
      setSchedulesError(err.message);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Poll WhatsApp status regularly & load initial data
  useEffect(() => {
    fetchWaStatus();
    fetchBroadcasts();
    fetchContacts();
    
    pollingRef.current = setInterval(() => {
      fetchWaStatus();
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token]);

  // Debounced search trigger for Schedules
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSchedules(scheduleSearch);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [scheduleSearch, token]);

  // Debounced search trigger for Custom Lists
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomLists(customListSearch);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [customListSearch, token]);

  // Fetch broadcast lists and contacts when WhatsApp transitions to connected
  useEffect(() => {
    fetchBroadcasts();
    fetchContacts();
  }, [waStatus.status]);

  // Set today's date as default in form
  useEffect(() => {
    if (!editingSchedule) {
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().slice(0, 5); // "HH:MM"
      setFormFields(prev => ({
        ...prev,
        schedule_date: today,
        schedule_time: nowTime
      }));
    }
  }, [editingSchedule]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Limit file size to 15MB to fit within MongoDB 16MB document limit safely
    if (file.size > 15 * 1024 * 1024) {
      alert(lang === 'en' 
        ? 'File size must be under 15MB to prevent database storage issues.' 
        : 'ડેટાબેઝ સંગ્રહ મર્યાદાને લીધે ફાઇલનું કદ ૧૫MB થી ઓછું હોવું આવશ્યક છે.'
      );
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1]; // Get raw base64 string
      setSelectedFile({
        data: base64Data,
        contentType: file.type,
        filename: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create or Update Schedule
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formFields.broadcast_jid) {
      setFormError(t('chooseBroadcast'));
      return;
    }

    setSubmittingSchedule(true);
    try {
      const selectedList = broadcasts.find(b => b.jid === formFields.broadcast_jid);
      
      // Calculate exact UTC ISO string from client timezone
      const localDate = new Date(`${formFields.schedule_date}T${formFields.schedule_time}`);
      const nextRunAtUTC = isNaN(localDate.getTime()) ? null : localDate.toISOString();

      const payload = {
        broadcast_jid: formFields.broadcast_jid,
        broadcast_name: selectedList ? selectedList.name : 'Unknown Broadcast',
        message: formFields.message,
        schedule_date: formFields.schedule_date,
        schedule_time: formFields.schedule_time,
        period: formFields.period,
        next_run_at: nextRunAtUTC,
        media: selectedFile
      };

      const url = editingSchedule 
        ? `${API_BASE}/api/schedules/${editingSchedule.id}`
        : `${API_BASE}/api/schedules`;

      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save schedule.');

      setEditingSchedule(null);
      setFormFields({
        broadcast_jid: '',
        message: '',
        schedule_date: new Date().toISOString().split('T')[0],
        schedule_time: new Date().toTimeString().slice(0, 5),
        period: 'once'
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchSchedules();
      alert(editingSchedule 
        ? (lang === 'en' ? 'Schedule updated successfully.' : 'આયોજન સફળતાપૂર્વક સાચવવામાં આવ્યું.')
        : (lang === 'en' ? 'Schedule created successfully.' : 'આયોજન સફળતાપૂર્વક ઉમેરવામાં આવ્યું.')
      );
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  // Load Schedule for Editing
  const startEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setFormFields({
      broadcast_jid: schedule.broadcast_jid,
      message: schedule.message,
      schedule_date: schedule.schedule_date,
      schedule_time: schedule.schedule_time,
      period: schedule.period
    });
    setSelectedFile(schedule.media && schedule.media.data ? schedule.media : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Editing
  const cancelEdit = () => {
    setEditingSchedule(null);
    setFormFields({
      broadcast_jid: '',
      message: '',
      schedule_date: new Date().toISOString().split('T')[0],
      schedule_time: new Date().toTimeString().slice(0, 5),
      period: 'once'
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this schedule?' : 'શું તમે ખરેખર આ શેડ્યૂલ કાઢી નાખવા માંગો છો?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete schedule.');
      
      fetchSchedules();
    } catch (err) {
      alert(`Error deleting schedule: ${err.message}`);
    }
  };

  // Send Schedule Immediately
  const handleSendImmediately = async (scheduleId) => {
    if (!window.confirm(lang === 'en' 
      ? 'Send this message immediately to the broadcast list?' 
      : 'શું આ સંદેશો બ્રોડકાસ્ટ યાદી પર તરત જ મોકલવો છે?'
    )) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/schedules/${scheduleId}/send-now`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message.');
      
      alert(lang === 'en' ? 'Message sent successfully!' : 'સંદેશો સફળતાપૂર્વક મોકલવામાં આવ્યો!');
      fetchSchedules();
    } catch (err) {
      alert(`Failed to send message: ${err.message}`);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'sent': return 'badge-success';
      case 'active': return 'badge-info';
      case 'failed': return 'badge-danger';
      case 'pending':
      default:
        return 'badge-warning';
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'once': return t('freqOnce');
      case '5_min': return t('freq5Min');
      case '15_min': return t('freq15Min');
      case '30_min': return t('freq30Min');
      case 'hourly': return t('freqHourly');
      case 'daily': return t('freqDaily');
      case 'weekly': return t('freqWeekly');
      case 'monthly': return t('freqMonthly');
      case 'yearly': return t('freqYearly');
      default: return period;
    }
  };

  return (
    <div className="app-container">
      <div className="bg-gradient-glow"></div>

      {/* Header Bar */}
      <header className="glass-card" style={{
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        borderTop: 'none',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center'
          }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('title')}</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('loggedInAs')}: {user.name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Quick status bar */}
          <div 
            onClick={() => setActiveTab('whatsapp')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              background: waStatus.status === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: waStatus.status === 'connected' ? 'var(--accent-green)' : 'var(--color-error)',
              border: `1px solid ${waStatus.status === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              cursor: 'pointer'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: waStatus.status === 'connected' ? 'var(--accent-green)' : 'var(--color-error)',
              display: 'inline-block'
            }}></span>
            <span>{waStatus.status === 'connected' ? t('waConnected') : t('waDisconnected')}</span>
          </div>

          {/* Theme & Language Controls */}
          <HeaderControls lang={lang} theme={theme} toggleLang={toggleLang} toggleTheme={toggleTheme} />

          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-container" style={{ paddingTop: 0 }}>
        
        {/* Navigation Tabs */}
        <div className="tab-container">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
          >
            {t('schedulesTab')}
          </button>
          
          <button
            onClick={() => setActiveTab('custom_lists')}
            className={`tab-btn ${activeTab === 'custom_lists' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Layers size={16} />
            {t('customTab')}
          </button>
          
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <QrCode size={16} />
            {t('whatsappTab')}
          </button>
        </div>

        {/* TAB 1: WhatsApp Scanner */}
        {activeTab === 'whatsapp' && (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
              
              {waStatus.status === 'disconnected' && (
                <div>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--color-error)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <XCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('waDisconnected')}</h3>
                  <p style={{ maxWidth: '400px', margin: '0 auto 2rem auto', fontSize: '0.9rem' }}>
                    {t('waDisconnectWarning')}
                  </p>
                  
                  <button 
                    onClick={handleConnectWa} 
                    className="btn btn-primary"
                    disabled={initializingWa}
                    style={{ padding: '0.85rem 2rem' }}
                  >
                    {initializingWa ? t('connectingService') : t('linkDevice')}
                  </button>
                </div>
              )}

              {waStatus.status === 'connecting' && (
                <div style={{ padding: '2rem 0' }}>
                  <div className="spinner" style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTopColor: 'var(--accent-teal)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1.5rem auto'
                  }}></div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('waConnecting')}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {t('waConnectingDesc')}
                  </p>
                </div>
              )}

              {waStatus.status === 'qr_ready' && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('scanTitle')}</h3>
                  <p style={{ maxWidth: '450px', margin: '0 auto 2rem auto', fontSize: '0.85rem' }}>
                    {t('scanDesc')}
                  </p>
                  
                  <div style={{
                    display: 'inline-block',
                    background: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1.5rem',
                    position: 'relative'
                  }}>
                    {waStatus.qr_code ? (
                      <img 
                        src={waStatus.qr_code} 
                        alt="WhatsApp Scan QR" 
                        style={{ width: '240px', height: '240px', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                        Loading QR...
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-teal)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 2s linear infinite' }} />
                    <span>{t('awaitingScan')}</span>
                  </div>

                  <button 
                    onClick={handleDisconnectWa} 
                    className="btn btn-secondary mt-4" 
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              )}

              {waStatus.status === 'connected' && (
                <div>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--accent-green)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    animation: 'pulse-glow 2s infinite'
                  }}>
                    <CheckCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent-green)' }}>{t('waConnectedSuccess')}</h3>
                  
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    padding: '1rem',
                    maxWidth: '350px',
                    margin: '1.5rem auto 2.5rem auto',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{t('waConnDetails')}:</span>
                      <span style={{ fontWeight: 600 }}>{waStatus.push_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Phone Number' : 'ફોન નંબર'}:</span>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>+{waStatus.phone_number}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleDisconnectWa} 
                    className="btn btn-danger"
                    style={{ padding: '0.8rem 2rem' }}
                  >
                    {t('disconnectWa')}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 1.5: Custom Broadcast Lists Manager */}
        {activeTab === 'custom_lists' && (
          <div className="grid-layout">
            {/* Create Custom List Card */}
            <div className="sidebar-card">
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editingCustomList ? <Edit2 size={18} style={{ color: 'var(--accent-teal)' }} /> : <Plus size={18} style={{ color: 'var(--accent-teal)' }} />}
                  {editingCustomList ? t('editCustomTitle') : t('createCustomTitle')}
                </h3>

                {customError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    color: 'var(--color-error)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{customError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateCustomList}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'en' ? 'List Name' : 'યાદીનું નામ'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. My Customers"
                      className="form-input"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {lang === 'en' ? 'Import from Excel / CSV (Optional)' : 'એક્સેલ / CSV માંથી આયાત કરો (વૈકલ્પિક)'}
                    </label>
                    <input
                      type="file"
                      ref={excelInputRef}
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelImport}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      {lang === 'en' 
                        ? 'Select an Excel (.xlsx, .xls) or CSV file. All valid numbers will be extracted.' 
                        : 'એક્સેલ (.xlsx, .xls) અથવા CSV ફાઇલ પસંદ કરો. બધા માન્ય નંબરો આપમેળે ખેંચવામાં આવશે.'}
                    </span>
                    {excelImportStatus && (
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: excelImportStatus.includes('Successfully') || excelImportStatus.includes('સફળતાપૂર્વક') 
                          ? 'var(--color-success)' 
                          : 'var(--color-error)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        {excelImportStatus}
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">{lang === 'en' ? 'Recipient Phone Numbers' : 'પ્રાપ્તકર્તાના ફોન નંબરો'}</label>
                    <textarea
                      required
                      placeholder={t('numbersPlaceholder')}
                      className="form-input"
                      value={customNumbersText}
                      onChange={(e) => setCustomNumbersText(e.target.value)}
                      rows={8}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      {t('numbersHelp')}
                    </span>
                  </div>


                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    {editingCustomList && (
                      <button
                        type="button"
                        onClick={cancelEditCustomList}
                        className="btn btn-secondary w-full"
                        disabled={submittingCustom}
                      >
                        {t('cancel')}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={submittingCustom}
                    >
                      {submittingCustom ? '...' : (editingCustomList ? t('updateListBtn') : t('createListBtn'))}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Custom Lists Table Card */}
            <div className="main-content-card">
              <div className="glass-card section-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('customListsHeader')}</h2>
                  <p style={{ fontSize: '0.85rem' }}>{t('customListsDesc')}</p>
                </div>
                <button onClick={fetchCustomLists} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--color-border)' }}>
                  <RefreshCw size={14} style={{ color: 'var(--accent-teal)' }}/>
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('searchCustomLists')}
                  value={customListSearch}
                  onChange={(e) => setCustomListSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <Search size={18} />
                </span>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loadingCustom ? (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="spinner" style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid rgba(255,255,255,0.1)',
                      borderTopColor: 'var(--accent-teal)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1rem auto'
                    }}></div>
                    <p>{t('loadingCustom')}</p>
                  </div>
                ) : customLists.length === 0 ? (
                  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{t('noCustomLists')}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('customListsHelp')}</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{t('nameLabel')}</th>
                          <th>{t('recipientCount')}</th>
                          <th>{t('numbersPreview')}</th>
                          <th>{t('createdAtLabel')}</th>
                          <th style={{ textAlign: 'right' }}>{t('actionsLabel')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customLists.map((list) => (
                          <tr key={list.id}>
                            <td style={{ fontWeight: 600 }}>{list.name}</td>
                            <td>
                              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                                {list.recipient_count} {lang === 'en' ? 'contacts' : 'સંપર્કો'}
                              </span>
                            </td>
                            <td>
                              <div style={{
                                maxWidth: '250px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                fontFamily: 'monospace'
                              }} title={list.numbers.join(', ')}>
                                {list.numbers.join(', ')}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {new Date(list.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => startEditCustomList(list)}
                                  className="btn-icon btn-icon-edit"
                                  title="Edit Custom List"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomList(list.id)}
                                  className="btn-icon btn-danger"
                                  title="Delete Custom List"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Schedules & Auto-Message */}
        {activeTab === 'schedules' && (
          <div className="grid-layout">
            
            {/* Scheduler Form */}
            <div className="sidebar-card">
              <div className="glass-card" style={{ position: 'sticky', top: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editingSchedule ? <Edit2 size={18} style={{ color: 'var(--accent-teal)' }} /> : <Plus size={18} style={{ color: 'var(--accent-teal)' }} />}
                  {editingSchedule ? t('editScheduleTitle') : t('scheduleTitle')}
                </h3>

                {formError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    color: 'var(--color-error)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {waStatus.status !== 'connected' && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1.25rem',
                    color: 'var(--color-warning)',
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                  }}>
                    <strong>{lang === 'en' ? 'Note:' : 'નોંધ:'}</strong> {t('waDisconnectWarning')}
                  </div>
                )}

                <form onSubmit={handleScheduleSubmit}>
                  {/* Select Broadcast JID */}
                  <div className="form-group">
                    <label className="form-label">{lang === 'en' ? 'WhatsApp Broadcast List' : 'વોટ્સએપ બ્રોડકાસ્ટ યાદી'}</label>
                    {loadingBroadcasts ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('syncingBroadcasts')}</div>
                    ) : broadcasts.length === 0 ? (
                      <select 
                        disabled 
                        className="form-input"
                        value=""
                        style={{ borderStyle: 'dashed' }}
                      >
                        <option value="">
                          {lang === 'en' ? 'Create a Custom List first or link WhatsApp' : 'પહેલા કસ્ટમ યાદી બનાવો અથવા વોટ્સએપ લિંક કરો'}
                        </option>
                      </select>
                    ) : (
                      <select
                        name="broadcast_jid"
                        className="form-input"
                        value={formFields.broadcast_jid}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">{t('chooseBroadcast')}</option>
                        {broadcasts.map((list) => (
                          <option key={list.jid} value={list.jid}>
                            {list.name} ({list.recipient_count} {lang === 'en' ? 'contacts' : 'સંપર્કો'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="form-group">
                    <label className="form-label">{t('writeMessage') || t('scheduleTitle')}</label>
                    <textarea
                      name="message"
                      required
                      placeholder={t('writeMessage')}
                      className="form-input"
                      value={formFields.message}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  {/* Media File Attachment */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {lang === 'en' ? 'Attach Image or Video (Optional)' : 'ચિત્ર અથવા વિડિઓ જોડો (વૈકલ્પિક)'}
                    </label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      {lang === 'en' ? 'Supported formats: JPG, PNG, GIF, MP4 (Max 15MB)' : 'સપોર્ટેડ ફોર્મેટ: JPG, PNG, GIF, MP4 (મહત્તમ ૧૫MB)'}
                    </span>

                    {/* Preview Box */}
                    {selectedFile && selectedFile.data && (
                      <div style={{
                        marginTop: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-teal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={selectedFile.filename}>
                            📎 {selectedFile.filename || 'Attached File'}
                          </span>
                          <button 
                            type="button" 
                            onClick={removeSelectedFile}
                            className="btn-icon btn-danger"
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', height: 'auto', display: 'inline-flex' }}
                          >
                            {lang === 'en' ? 'Remove' : 'દૂર કરો'}
                          </button>
                        </div>

                        {/* Preview Rendering */}
                        {selectedFile.contentType?.startsWith('image/') ? (
                          <img 
                            src={`data:${selectedFile.contentType};base64,${selectedFile.data}`} 
                            alt="Media Preview" 
                            style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
                          />
                        ) : selectedFile.contentType?.startsWith('video/') ? (
                          <video 
                            src={`data:${selectedFile.contentType};base64,${selectedFile.data}`} 
                            controls
                            style={{ width: '100%', maxHeight: '140px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
                          />
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Date & Time Picker */}
                  <div className="schedule-datetime-grid">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} style={{ color: 'var(--accent-teal)' }} /> {t('dateLabel')}
                      </label>
                      <input
                        type="date"
                        name="schedule_date"
                        required
                        className="form-input"
                        value={formFields.schedule_date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} style={{ color: 'var(--accent-teal)' }} /> {t('timeLabel')}
                      </label>
                      <input
                        type="time"
                        name="schedule_time"
                        required
                        className="form-input"
                        value={formFields.schedule_time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Schedule Interval (Period) */}
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Layers size={14} style={{ color: 'var(--accent-teal)' }} /> {t('frequencyLabel')}
                    </label>
                    <select
                      name="period"
                      className="form-input"
                      value={formFields.period}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="once">{t('freqOnce')}</option>
                      <option value="5_min">{t('freq5Min')}</option>
                      <option value="15_min">{t('freq15Min')}</option>
                      <option value="30_min">{t('freq30Min')}</option>
                      <option value="hourly">{t('freqHourly')}</option>
                      <option value="daily">{t('freqDaily')}</option>
                      <option value="weekly">{t('freqWeekly')}</option>
                      <option value="monthly">{t('freqMonthly')}</option>
                      <option value="yearly">{t('freqYearly')}</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="schedule-actions">
                    {editingSchedule && (
                      <button 
                        type="button" 
                        onClick={cancelEdit} 
                        className="btn btn-secondary w-full"
                        disabled={submittingSchedule}
                      >
                        {t('cancel')}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={submittingSchedule}
                    >
                      {submittingSchedule 
                        ? t('saving') 
                        : (editingSchedule ? t('saveChanges') : t('scheduleMessageBtn'))
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Schedules Table */}
            <div className="main-content-card">
              <div className="glass-card section-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('schedulesHeader')}</h2>
                  <p style={{ fontSize: '0.85rem' }}>{t('schedulesDesc')}</p>
                </div>
                <button onClick={fetchSchedules} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--color-border)' }} title="Refresh List">
                  <RefreshCw size={14} style={{ color: 'var(--accent-teal)' }}/>
                </button>
              </div>

              {schedulesError && (
                <div className="glass-card" style={{
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: 'var(--color-error)',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <AlertCircle size={20} />
                  <span>{schedulesError}</span>
                </div>
              )}

              {/* Search Bar */}
              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('searchSchedules')}
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <Search size={18} />
                </span>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loadingSchedules ? (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="spinner" style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid rgba(255,255,255,0.1)',
                      borderTopColor: 'var(--accent-teal)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1rem auto'
                    }}></div>
                    <p>{t('loadingSchedules')}</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{t('noSchedules')}</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{lang === 'en' ? 'Broadcast List' : 'બ્રોડકાસ્ટ યાદી'}</th>
                          <th>{lang === 'en' ? 'Message' : 'સંદેશ'}</th>
                          <th>{t('frequencyLabel') || 'Interval'}</th>
                          <th>{t('nextSendTime') || 'Next Send Time'}</th>
                          <th>{t('statusLabel') || 'Status'}</th>
                          <th style={{ textAlign: 'right' }}>{t('actionsLabel')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{schedule.broadcast_name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {schedule.broadcast_jid.split('@')[0]}
                              </div>
                            </td>
                            
                            <td>
                              <div 
                                style={{ 
                                  maxWidth: '180px', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.85rem'
                                }}
                                title={schedule.message}
                              >
                                {schedule.message}
                              </div>
                              {schedule.media && schedule.media.data && (
                                <div style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '0.25rem', 
                                  fontSize: '0.7rem', 
                                  color: 'var(--accent-teal)', 
                                  marginTop: '0.25rem',
                                  fontWeight: 600
                                }}>
                                  {schedule.media.contentType?.startsWith('video/') ? '🎥 Video' : '📷 Image'}
                                </div>
                              )}
                            </td>
                            
                            <td>
                              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                                {getPeriodLabel(schedule.period)}
                              </span>
                            </td>
                            
                            <td>
                              {schedule.status === 'sent' ? (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Finished</div>
                              ) : schedule.next_run_at ? (
                                <div style={{ fontSize: '0.85rem' }}>
                                  <div style={{ fontWeight: 500 }}>
                                    {new Date(schedule.next_run_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {new Date(schedule.next_run_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</div>
                              )}
                            </td>
                            
                            <td>
                              <span className={`badge ${getStatusBadgeClass(schedule.status)}`} style={{ fontSize: '0.7rem' }}>
                                {schedule.status}
                              </span>
                              {schedule.error_message && (
                                <div 
                                  style={{ fontSize: '0.65rem', color: 'var(--color-error)', marginTop: '0.2rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                                  title={schedule.error_message}
                                >
                                  {schedule.error_message}
                                </div>
                              )}
                            </td>
                            
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                  <button 
                                    onClick={() => startEditSchedule(schedule)}
                                    className="btn-icon btn-icon-edit"
                                    title="Edit Schedule"
                                  >
                                    <Edit2 size={13} />
                                  </button>

                                <button
                                  onClick={() => handleSendImmediately(schedule.id)}
                                  className="btn-icon btn-icon-success"
                                  title={t('sendImmediatelyNow') || 'Send Now'}
                                >
                                  <Play size={13} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                  className="btn-icon btn-danger"
                                  title="Delete Schedule"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          display: inline-block;
        }
        .contact-row-hover:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        [data-theme="light"] .contact-row-hover:hover {
          background: rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
}
