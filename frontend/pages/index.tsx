import React, { useState, useEffect, useRef } from 'react';
import {
  Sun, Moon, Send, Shield, Cloud, AlertTriangle, FileText, CheckCircle,
  Users, RefreshCw, Key, Download, HelpCircle, ArrowRight, Check, Plus,
  Trash2, Bell, Slack, Mail, MessageSquare, Terminal, Eye, FileSpreadsheet,
  CreditCard, Award, CheckSquare, Layers
} from 'lucide-react';

// Core Type Definitions
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}

interface Connector {
  id: string;
  provider: string;
  name: string;
  status: string;
  last_scan: string;
  score: number;
}

interface Gap {
  id: string;
  connector_id: string;
  standard: string;
  severity: string;
  title: string;
  description: string;
  remediation: string;
  resource: string;
  status: string;
}

export default function Home() {
  // Theme state: 'light' ("Sun White" ☀️) or 'dark' ("Moon Dark" 🌙)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Dynamic API URL resolve to support published/external network environments
  const [apiBase, setApiBase] = useState<string>('http://localhost:4000/api/v1');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Resolve to the current hosting server IP / domain on port 4000
      setApiBase(`http://${hostname}:4000/api/v1`);
    }
  }, []);

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showMfa, setShowMfa] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('admin@vjctai.com');
  const [password, setPassword] = useState<string>('password123');
  const [mfaCode, setMfaCode] = useState<string>('123456');
  const [token, setToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Layout View Tabs: 'chat', 'dashboard', 'gaps', 'connectors', 'subscription'
  const [activeTab, setActiveTab] = useState<string>('chat');

  // Chat Messages Store
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      content: `### Hello! I am **vjct ai**, your AI-Powered Secure Multi-Cloud Compliance Companion.
How can I assist your organization today across **AWS**, **Microsoft Azure**, **Google Cloud (GCP)**, and **SAP BTP** setups?

I specialize in aligning your infrastructure to global standards, including **GDPR**, **ISO 27001**, **SOC 2**, **NIST**, **Cyber Essentials**, and the **UK Government Security Guidelines**.`,
      timestamp: new Date().toLocaleTimeString(),
      suggestedActions: [
        "Check ISO 27001 gaps on AWS",
        "Explain GDPR data encryption risks",
        "Analyze SAP BTP cipher configurations",
        "Cyber Essentials boundary firewall advice"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string }>>([
    { id: 'ch1', title: 'AWS ISO 27001 Audit' },
    { id: 'ch2', title: 'S3 Bucket Encryption Gap' },
    { id: 'ch3', title: 'SAP BTP Custom Domain' }
  ]);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Subscription Details State
  const [subscription, setSubscription] = useState<any>({
    tier: 'Enterprise Compliance Suite',
    status: 'Active',
    expires: 'December 31, 2027',
    cloudScanLimit: 'Unlimited',
    scansUsed: 142,
    nodesConnected: 4,
    organizationName: 'Global Cloud Secure Ltd',
    licenseKey: 'VJCTAI-ECS-9943-8821-X902'
  });

  // Platform Metrics & Data States
  const [summary, setSummary] = useState<any>({
    complianceScore: 84,
    securityScore: 89,
    inventoryCount: 202,
    standardsBreakdown: {
      "GDPR": 88,
      "ISO 27001": 79,
      "SOC 2": 85,
      "NIST": 80,
      "Cyber Essentials": 92,
      "UK Government Security Standards": 82
    },
    gapsCount: 6
  });
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedConnector, setSelectedConnector] = useState<string>('all');
  const [isScanning, setIsScanning] = useState<string | null>(null);

  // Notifications State
  const [notificationConfig, setNotificationConfig] = useState({
    slackEnabled: true,
    teamsEnabled: false,
    emailEnabled: true,
    alertEmail: 'secops@vjctai.com'
  });
  const [notificationLogs, setNotificationLogs] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll down on chat messages updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effect to load system metrics & datasets
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSummary();
      fetchConnectors();
      fetchGaps();
    }
  }, [isAuthenticated, token, apiBase]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${apiBase}/compliance/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.error) setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConnectors = async () => {
    try {
      const res = await fetch(`${apiBase}/connectors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.error) setConnectors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGaps = async () => {
    try {
      const res = await fetch(`${apiBase}/compliance/gaps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.error) setGaps(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Authenticate login handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.mfaRequired) {
        setShowMfa(true);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      alert(`Could not connect to backend engine at ${apiBase}. Make sure server is running on port 4000.`);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/auth/mfa-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'u1', code: mfaCode })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (err) {
      alert('Verification server error');
    }
  };

  // Perform quick switch simulation for Auditor/Compliance/Client views
  const handleRoleSwitch = async (roleName: string, roleEmail: string) => {
    try {
      const loginRes = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: roleEmail, password: 'password123' })
      });
      const loginData = await loginRes.json();

      const res = await fetch(`${apiBase}/auth/mfa-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loginData.userId, code: '123456' })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        addNotificationLog(`Successfully simulated login switcher for security role: [${data.user.role}]`);
      }
    } catch (err) {
      alert('Error switching roles context');
    }
  };

  // Trigger Scanner Scan
  const handleTriggerScan = async (connId: string, provider: string) => {
    setIsScanning(connId);
    addNotificationLog(`Dispatched automated API crawler for multi-cloud node: [${provider}]`);

    try {
      const res = await fetch(`${apiBase}/connectors/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ connectorId: connId })
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          fetchConnectors();
          fetchSummary();
          setIsScanning(null);
          addNotificationLog(`Completed multi-cloud compliance check for [${provider}]. Generated security scan report.`);
        }, 1500);
      }
    } catch (err) {
      setIsScanning(null);
    }
  };

  // Remediate Finding Gap
  const handleRemediate = async (gapId: string, title: string) => {
    try {
      const res = await fetch(`${apiBase}/compliance/gaps/remediate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gapId })
      });
      const data = await res.json();
      if (data.success) {
        fetchGaps();
        fetchSummary();
        addNotificationLog(`Triggered automated remediation playbook to patch gap: [${title}]`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat message submit handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsgId = 'u_' + Date.now();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsAiLoading(true);

    try {
      const res = await fetch(`${apiBase}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({ role: m.sender, content: m.content }))
        })
      });
      const data = await res.json();

      const assistantMsgId = 'ai_' + Date.now();
      const newAiMsg: Message = {
        id: assistantMsgId,
        sender: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString(),
        suggestedActions: data.suggestedActions
      };
      setMessages(prev => [...prev, newAiMsg]);

      if (chatHistory.length < 6) {
        setChatHistory(prev => [{ id: 'ch_' + Date.now(), title: query.substring(0, 24) + '...' }, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // File Attach Handler
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setAttachedFiles(prev => [...prev, fileName]);
      addNotificationLog(`Successfully ingested evidence artifact file: [${fileName}]`);
    }
  };

  const addNotificationLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setNotificationLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 9)]);
  };

  // Download compliance audit exports (excel / pdf)
  const triggerDownload = (format: 'pdf' | 'xlsx', std: string) => {
    const url = `${apiBase}/reports/download?format=${format}&standard=${std}&token=${token}`;
    window.open(url, '_blank');
    addNotificationLog(`Downloaded executive ${format.toUpperCase()} compliance checklist for standard: [${std}]`);
  };

  return (
    <div className={`min-h-screen font-sans ${
      theme === 'dark'
        ? 'bg-black text-[#f8fafc]'
        : 'bg-white text-slate-900'
    }`}>

      {/* 1. Login & MFA Screen Wrapper */}
      {!isAuthenticated && (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617]">
          <div className="w-full max-w-md p-8 transition-transform duration-300 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 mb-2 rounded-xl bg-blue-600/20 text-blue-400">
                <Shield className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">vjct ai</h1>
              <p className="text-xs text-slate-400 text-center mt-1">AI-powered Secure Multi-Cloud Compliance Platform</p>
            </div>

            {!showMfa ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Secure Email ID</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="name@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">System Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="••••••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Request Double Factor MFA
                </button>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <span className="block text-center text-xs text-slate-400 mb-2 font-medium">Demo Quick Login Accounts (Any Role)</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button type="button" onClick={() => { setEmail('admin@vjctai.com'); setPassword('password123'); }} className="py-1 px-2 bg-white/5 hover:bg-white/10 rounded text-slate-300 transition text-left truncate">👑 Admin User</button>
                    <button type="button" onClick={() => { setEmail('auditor@vjctai.com'); setPassword('password123'); }} className="py-1 px-2 bg-white/5 hover:bg-white/10 rounded text-slate-300 transition text-left truncate">🔍 Auditor</button>
                    <button type="button" onClick={() => { setEmail('compliance@vjctai.com'); setPassword('password123'); }} className="py-1 px-2 bg-white/5 hover:bg-white/10 rounded text-slate-300 transition text-left truncate">📈 Compliance Manager</button>
                    <button type="button" onClick={() => { setEmail('analyst@vjctai.com'); setPassword('password123'); }} className="py-1 px-2 bg-white/5 hover:bg-white/10 rounded text-slate-300 transition text-left truncate">🛠️ Security Analyst</button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <div className="text-center mb-4">
                  <span className="inline-block text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 font-medium rounded-full mb-2">Simulating Entra ID MFA</span>
                  <p className="text-sm text-slate-300">Enter secure verification pin from your authenticator application.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">MFA Access Code</label>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full text-center tracking-widest text-xl font-bold px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                    placeholder="123456"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Verify Authenticated Access
                </button>
                <button
                  type="button"
                  onClick={() => setShowMfa(false)}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-300 underline"
                >
                  Back to credentials
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Dashboard & AI Chat Workspace Area */}
      {isAuthenticated && (
        <div className="flex h-screen overflow-hidden">

          {/* A. Sidebar Panel (ChatGPT Experience Style - White vs Black) */}
          <aside className={`w-80 flex flex-col flex-shrink-0 border-r transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-black border-slate-800 text-slate-200'
              : 'bg-slate-100 border-slate-300 text-slate-900'
          }`}>
            {/* Sidebar Title Header */}
            <div className="p-4 border-b flex items-center justify-between border-inherit">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">vjct ai</h2>
                  <span className="block text-[9px] text-slate-500 uppercase font-bold">Multi-Cloud Security</span>
                </div>
              </div>

              {/* Theme Selector Toggle: Sun White vs Moon Dark Emojis */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                    : 'bg-white border border-slate-300 text-indigo-900 hover:bg-slate-200'
                }`}
                title={theme === 'dark' ? 'Switch to Sun White' : 'Switch to Moon Dark'}
              >
                {theme === 'dark' ? (
                  <div className="flex items-center space-x-1 text-xs">
                    <span>☀️</span>
                    <span className="font-semibold text-[10px]">Sun White</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-xs">
                    <span>🌙</span>
                    <span className="font-semibold text-[10px]">Moon Dark</span>
                  </div>
                )}
              </button>
            </div>

            {/* Conversation/Actions Tabs */}
            <div className="p-3 border-b border-inherit space-y-1">
              <button
                onClick={() => { setActiveTab('chat'); }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-md'
                    : (theme === 'dark' ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>vjct ai Assistant</span>
              </button>

              <button
                onClick={() => { setActiveTab('dashboard'); }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : (theme === 'dark' ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>Executive Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab('gaps'); }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'gaps'
                    ? 'bg-blue-600 text-white shadow-md'
                    : (theme === 'dark' ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Compliance Gap Explorer</span>
              </button>

              <button
                onClick={() => { setActiveTab('connectors'); }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'connectors'
                    ? 'bg-blue-600 text-white shadow-md'
                    : (theme === 'dark' ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Cloud Connectors</span>
              </button>

              <button
                onClick={() => { setActiveTab('subscription'); }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'subscription'
                    ? 'bg-blue-600 text-white shadow-md'
                    : (theme === 'dark' ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>vjct ai Subscription</span>
              </button>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">History Log</span>
              {chatHistory.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => {
                    setActiveTab('chat');
                    handleSendMessage(`Run standard assessment for: ${ch.title}`);
                  }}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ch.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated IAM User Profile Context */}
            <div className={`p-4 border-t border-inherit flex flex-col space-y-2 ${
              theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {currentUser?.name ? currentUser.name[0] : 'U'}
                  </div>
                  <div className="truncate text-inherit">
                    <span className="block text-xs font-semibold truncate">{currentUser?.name || 'Alexander Admin'}</span>
                    <span className="block text-[10px] text-slate-500 capitalize">{currentUser?.role || 'Admin'}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setIsAuthenticated(false); setShowMfa(false); }}
                  className="text-xs text-rose-600 hover:text-rose-500 hover:underline font-semibold"
                >
                  Logout
                </button>
              </div>

              {/* Security Level Switcher */}
              <div className="pt-2 border-t border-slate-700/20">
                <span className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Simulate IAM Role</span>
                <select
                  className={`w-full text-xs p-1.5 rounded outline-none ${
                    theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800 border border-slate-300'
                  }`}
                  value={currentUser?.role || 'Admin'}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected === 'Admin') handleRoleSwitch('Admin', 'admin@vjctai.com');
                    if (selected === 'Auditor') handleRoleSwitch('Auditor', 'auditor@vjctai.com');
                    if (selected === 'Compliance Manager') handleRoleSwitch('Compliance Manager', 'compliance@vjctai.com');
                    if (selected === 'Security Analyst') handleRoleSwitch('Security Analyst', 'analyst@vjctai.com');
                    if (selected === 'Client User') handleRoleSwitch('Client User', 'client@vjctai.com');
                  }}
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Auditor">Auditor (View Gaps & Reports)</option>
                  <option value="Compliance Manager">Compliance Manager</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="Client User">Client User (Restricted)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* B. Core Working Viewport Panel (White vs Black) */}
          <main className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200 ${
            theme === 'dark' ? 'bg-black' : 'bg-[#fcfcfc]'
          }`}>

            {/* Top Workspace Header Panel */}
            <header className={`px-6 py-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'bg-black border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {activeTab === 'chat' && 'vjct ai Compliance Copilot'}
                  {activeTab === 'dashboard' && 'Executive Compliance Dashboard'}
                  {activeTab === 'gaps' && 'Multi-Cloud Compliance Findings'}
                  {activeTab === 'connectors' && 'Cloud Providers Connection Center'}
                  {activeTab === 'subscription' && 'VJCT AI Platform License & Subscription'}
                </h1>
                <p className="text-xs text-slate-400">
                  vjct ai - AI-powered Secure Multi-Cloud Compliance Platform
                </p>
              </div>

              {/* Quick Actions summary metrics bar */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Compliance: {summary.complianceScore}%</span>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Security: {summary.securityScore}%</span>
                </div>
              </div>
            </header>

            {/* C. Dynamic View Router Page Layouts */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* TAB 1: ChatGPT conversational view */}
              {activeTab === 'chat' && (
                <div className="max-w-4xl mx-auto flex flex-col h-full">
                  {/* Messages Stream Wrapper */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex space-x-4 p-4 rounded-xl transition-all ${
                          m.sender === 'assistant'
                            ? (theme === 'dark' ? 'bg-slate-900/60 border border-slate-800/40' : 'bg-slate-100/90 border border-slate-200')
                            : (theme === 'dark' ? 'bg-blue-600/15 border border-blue-500/30' : 'bg-blue-50/90 border border-blue-100')
                        }`}
                      >
                        <div className={`p-2.5 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                          m.sender === 'assistant' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-indigo-500'
                        }`}>
                          {m.sender === 'assistant' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-400">
                              {m.sender === 'assistant' ? 'vjct ai Copilot' : 'Authenticated User'}
                            </span>
                            <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                          </div>

                          {/* Message markup parser wrapper */}
                          <div className="text-sm leading-relaxed whitespace-pre-line text-inherit font-medium">
                            {m.content}
                          </div>

                          {/* Quick trigger action chips */}
                          {m.suggestedActions && m.suggestedActions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-700/20">
                              <span className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Suggested Actions:</span>
                              <div className="flex flex-wrap gap-2">
                                {m.suggestedActions.map((act, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleSendMessage(act)}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                      theme === 'dark'
                                        ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                                        : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {act}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex space-x-4 p-4 rounded-xl bg-slate-800/10 animate-pulse">
                        <div className="p-2.5 h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center text-white">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        </div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-2 bg-slate-700 rounded w-1/4"></div>
                          <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                          <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attached evidence documents preview */}
                  {attachedFiles.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-800/20 bg-amber-500/5 flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-bold text-amber-500 uppercase">Evidence Context files:</span>
                      {attachedFiles.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-900 rounded-lg">
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          <span>{f}</span>
                          <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Input Chat Field Panel (ChatGPT look and feel) */}
                  <div className={`p-3 rounded-2xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <label className="p-2 hover:bg-slate-700/25 rounded-xl cursor-pointer text-slate-400 transition" title="Upload Compliance Evidence PDF">
                        <Plus className="w-5 h-5" />
                        <input type="file" className="hidden" onChange={handleFileAttach} accept=".pdf,.json,.xlsx" />
                      </label>

                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        placeholder="Ask vjct ai to audit resources, write fixes, or check GDPR/ISO gaps..."
                        className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm py-2 text-inherit"
                      />

                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Executive Dashboard View */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 max-w-6xl mx-auto">

                  {/* Grid summary metric indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Global Compliance Index</span>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="text-4xl font-extrabold text-blue-500">{summary.complianceScore}%</span>
                        <span className="text-xs text-emerald-500 font-bold">▲ 1.4%</span>
                      </div>
                      <div className="w-full bg-slate-700/30 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${summary.complianceScore}%` }}></div>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Risk Remediation Score</span>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="text-4xl font-extrabold text-emerald-500">{summary.securityScore}%</span>
                        <span className="text-xs text-emerald-500 font-bold">▲ 0.8%</span>
                      </div>
                      <div className="w-full bg-slate-700/30 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${summary.securityScore}%` }}></div>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Cloud Monitored Assets</span>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="text-4xl font-extrabold text-indigo-500">{summary.inventoryCount}</span>
                        <span className="text-xs text-indigo-400 font-bold font-semibold">Active Inventory</span>
                      </div>
                      <div className="mt-3 flex items-center space-x-1 text-slate-500 text-xs font-medium">
                        <span>AWS, Azure, GCP, SAP BTP nodes</span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Active Compliance Gaps</span>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="text-4xl font-extrabold text-rose-500">{summary.gapsCount}</span>
                        <span className="text-xs text-rose-400 font-bold">Unresolved Gaps</span>
                      </div>
                      <div className="mt-3 flex items-center space-x-1 text-slate-500 text-xs font-medium">
                        <span>Across multiple cloud providers</span>
                      </div>
                    </div>
                  </div>

                  {/* Standards compliance list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Compliance standard coverage card */}
                    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
                      <h3 className="text-lg font-bold mb-4">Coverage by Regulatory Standards</h3>
                      <div className="space-y-4">
                        {Object.keys(summary.standardsBreakdown).map((std) => (
                          <div key={std} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">{std}</span>
                              <span className="font-bold">{summary.standardsBreakdown[std]}%</span>
                            </div>
                            <div className="w-full bg-slate-700/20 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  summary.standardsBreakdown[std] > 90 ? 'bg-emerald-500' : summary.standardsBreakdown[std] > 80 ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${summary.standardsBreakdown[std]}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Integrated reporting module triggers */}
                    <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
                    }`}>
                      <div>
                        <h3 className="text-lg font-bold mb-1">Reports & Evidence Exporter</h3>
                        <p className="text-xs text-slate-400 mb-4">Export secure compliance checklist datasets, gap remediation spreadsheets, and certification reviews.</p>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1 font-semibold">Target Regulatory Standard</label>
                            <select
                              className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                                theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-300'
                              }`}
                              value={selectedStandard}
                              onChange={(e) => setSelectedStandard(e.target.value)}
                            >
                              <option value="all">All Regulatory Standards</option>
                              <option value="GDPR">GDPR - Data Protection</option>
                              <option value="ISO 27001">ISO 27001 - Information Security</option>
                              <option value="SOC 2">SOC 2 - Trust Principles</option>
                              <option value="Cyber Essentials">Cyber Essentials</option>
                              <option value="UK Government Security Standards">UK Government Standard</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                              onClick={() => triggerDownload('pdf', selectedStandard)}
                              className="flex items-center justify-center space-x-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Export PDF Report</span>
                            </button>
                            <button
                              onClick={() => triggerDownload('xlsx', selectedStandard)}
                              className="flex items-center justify-center space-x-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Export Excel Report</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Notification alerts center */}
                      <div className="mt-6 pt-5 border-t border-slate-700/20">
                        <span className="block text-xs font-bold uppercase text-slate-500 mb-3">Target Alerts Integration</span>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <button
                            onClick={() => {
                              setNotificationConfig(prev => ({ ...prev, slackEnabled: !prev.slackEnabled }));
                              addNotificationLog(`Toggled Slack Security Alert Channel integration`);
                            }}
                            className={`flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded border transition-colors ${
                              notificationConfig.slackEnabled
                                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-semibold'
                                : 'bg-transparent border-slate-700 text-slate-400'
                            }`}
                          >
                            <Slack className="w-3.5 h-3.5" />
                            <span>Slack</span>
                          </button>

                          <button
                            onClick={() => {
                              setNotificationConfig(prev => ({ ...prev, teamsEnabled: !prev.teamsEnabled }));
                              addNotificationLog(`Toggled Microsoft Teams Security Alert Channel integration`);
                            }}
                            className={`flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded border transition-colors ${
                              notificationConfig.teamsEnabled
                                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                                : 'bg-transparent border-slate-700 text-slate-400'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Teams</span>
                          </button>

                          <button
                            onClick={() => {
                              setNotificationConfig(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }));
                              addNotificationLog(`Toggled Security Email Alert channel`);
                            }}
                            className={`flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded border transition-colors ${
                              notificationConfig.emailEnabled
                                ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 font-semibold'
                                : 'bg-transparent border-slate-700 text-slate-400'
                            }`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Security Log console box */}
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold flex items-center space-x-2 text-inherit">
                        <Terminal className="w-4 h-4 text-blue-500" />
                        <span>Live Cloud Auditing & Connector Logs</span>
                      </h3>
                      <button onClick={() => setNotificationLogs([])} className="text-xs text-slate-500 hover:text-slate-400 font-semibold">Clear logs</button>
                    </div>
                    <div className="p-3 bg-black/90 rounded-xl font-mono text-xs text-emerald-400 space-y-1.5 min-h-[120px] overflow-y-auto">
                      {notificationLogs.length === 0 ? (
                        <span className="text-slate-500 italic">No events or scan actions dispatched yet...</span>
                      ) : (
                        notificationLogs.map((log, i) => (
                          <div key={i} className="leading-relaxed">
                            <span className="text-emerald-500">✔</span> {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Compliance Gaps & Remediations List */}
              {activeTab === 'gaps' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">
                      Found {gaps.filter(g => g.status === 'Open').length} outstanding security gaps across multi-cloud environments.
                    </p>

                    {/* Filters bar */}
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        className={`text-xs p-2 rounded border outline-none ${
                          theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-300 shadow-sm'
                        }`}
                        value={selectedStandard}
                        onChange={(e) => setSelectedStandard(e.target.value)}
                      >
                        <option value="all">All Standards</option>
                        <option value="GDPR">GDPR</option>
                        <option value="ISO 27001">ISO 27001</option>
                        <option value="SOC 2">SOC 2</option>
                        <option value="NIST">NIST</option>
                        <option value="Cyber Essentials">Cyber Essentials</option>
                        <option value="UK Government Security Standards">UK Government Standard</option>
                      </select>

                      <select
                        className={`text-xs p-2 rounded border outline-none ${
                          theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-300 shadow-sm'
                        }`}
                        value={selectedConnector}
                        onChange={(e) => setSelectedConnector(e.target.value)}
                      >
                        <option value="all">All Cloud Connectors</option>
                        <option value="c1">AWS Production</option>
                        <option value="c2">Azure Subscription</option>
                        <option value="c3">Google Cloud Cluster</option>
                        <option value="c4">SAP BTP ERP</option>
                      </select>
                    </div>
                  </div>

                  {/* Findings Grid */}
                  <div className="space-y-4">
                    {gaps
                      .filter(g => selectedStandard === 'all' || g.standard.toLowerCase().includes(selectedStandard.toLowerCase()))
                      .filter(g => selectedConnector === 'all' || g.connector_id === selectedConnector)
                      .map((gap) => (
                        <div
                          key={gap.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            gap.status === 'Resolved'
                              ? 'opacity-60 bg-emerald-500/5 border-emerald-500/20'
                              : (theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-300 hover:shadow-md')
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  gap.severity === 'Critical' ? 'bg-red-500/10 text-red-400' :
                                  gap.severity === 'High' ? 'bg-amber-500/10 text-amber-400' :
                                  gap.severity === 'Medium' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                                }`}>
                                  {gap.severity} Priority
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-700/20 text-slate-300 rounded-full font-bold">
                                  {gap.standard}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  gap.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                  {gap.status}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-inherit">{gap.title}</h3>
                              <p className="text-xs text-slate-500 font-medium">{gap.description}</p>

                              <div className="pt-2">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Target Cloud Resource:</span>
                                <code className="block text-[11px] font-mono text-blue-500 truncate mt-0.5">{gap.resource}</code>
                              </div>

                              <div className="p-3 bg-slate-800/10 border border-slate-700/10 rounded-xl mt-3">
                                <span className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">🤖 vjct ai Action Recommendation:</span>
                                <p className="text-xs text-inherit font-medium">{gap.remediation}</p>
                              </div>
                            </div>

                            {/* Remediation Playbook Button triggers */}
                            {gap.status === 'Open' && (
                              <button
                                onClick={() => handleRemediate(gap.id, gap.title)}
                                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Apply Fix Playbook</span>
                              </button>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Connected Multi-cloud Accounts */}
              {activeTab === 'connectors' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {connectors.map((conn) => (
                      <div
                        key={conn.id}
                        className={`p-6 rounded-2xl border ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                              <Cloud className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-extrabold text-slate-500">{conn.provider} Connector</span>
                              <h3 className="text-base font-bold">{conn.name}</h3>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">
                              {conn.status}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1">Score: {conn.score}/100</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1.5 border-b border-slate-700/20">
                            <span className="text-slate-500 font-semibold">Last Scanned:</span>
                            <span className="font-semibold text-slate-600">
                              {conn.last_scan ? new Date(conn.last_scan).toLocaleString() : 'Never'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-slate-500 font-semibold">Endpoint Target:</span>
                            <span className="font-mono text-slate-600 truncate max-w-xs text-right">
                              api.{conn.provider.toLowerCase().replace(' ', '')}.secure.internal
                            </span>
                          </div>
                        </div>

                        {/* Scanner Actions Trigger bar */}
                        <div className="mt-5 pt-4 border-t border-slate-700/20 flex justify-end">
                          <button
                            onClick={() => handleTriggerScan(conn.id, conn.provider)}
                            disabled={isScanning === conn.id}
                            className={`flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors ${
                              isScanning === conn.id ? 'opacity-40 cursor-wait' : ''
                            }`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isScanning === conn.id ? 'animate-spin' : ''}`} />
                            <span>{isScanning === conn.id ? 'Analyzing Compliance Gaps...' : 'Trigger Secure Audit Scan'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connector addition information panel */}
                  <div className={`p-6 rounded-2xl border border-dashed text-center ${
                    theme === 'dark' ? 'bg-[#111827]/30 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <HelpCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="text-sm font-bold mb-1">Add Dynamic New Cloud Subscription Hook</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      Connect private cloud VPC, cluster subaccounts, or organizational subscriptions to ingest live configuration states into vjctai.
                    </p>
                    <button
                      onClick={() => alert('Connectors are preconfigured for enterprise AWS, Microsoft Azure, GCP, and SAP BTP workloads in this environment.')}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Configure custom API Credentials</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: Subscription Management View */}
              {activeTab === 'subscription' && (
                <div className="max-w-4xl mx-auto space-y-6">

                  {/* Subscription card panel */}
                  <div className={`p-8 rounded-2xl border bg-gradient-to-br transition-all duration-200 ${
                    theme === 'dark'
                      ? 'from-blue-950/40 to-slate-950 border-blue-900/40 text-slate-100 shadow-2xl'
                      : 'from-blue-50 to-white border-blue-200 text-slate-900 shadow-lg'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700/20">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                          <Award className="w-3.5 h-3.5" />
                          <span>Active Subscription</span>
                        </span>
                        <h2 className="text-2xl font-extrabold">{subscription.tier}</h2>
                        <p className="text-sm text-slate-400">License registered to: <span className="font-bold text-blue-500">{subscription.organizationName}</span></p>
                      </div>

                      <div className="flex flex-col md:items-end">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Security Renewal Date</span>
                        <span className="text-lg font-bold text-emerald-500">{subscription.expires}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                      <div className="space-y-1">
                        <span className="block text-xs text-slate-400 uppercase font-semibold">Total Cloud Scan Limit</span>
                        <span className="text-xl font-extrabold">{subscription.cloudScanLimit}</span>
                        <p className="text-[11px] text-slate-400">Unlimited real-time scans on verified subaccounts.</p>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-xs text-slate-400 uppercase font-semibold">Audit Scans Completed</span>
                        <span className="text-xl font-extrabold text-blue-500">{subscription.scansUsed}</span>
                        <p className="text-[11px] text-slate-400">Total API checks performed this calendar year.</p>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-xs text-slate-400 uppercase font-semibold">Monitored Cloud Subscriptions</span>
                        <span className="text-xl font-extrabold text-indigo-500">{subscription.nodesConnected} Connected</span>
                        <p className="text-[11px] text-slate-400">AWS Production, Azure Sub, GCP Analytics, SAP BTP.</p>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-slate-800/10 border border-slate-700/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Key className="w-5 h-5 text-amber-500" />
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">Secure Enterprise Key</span>
                          <code className="text-xs font-mono text-slate-300 font-bold">{subscription.licenseKey}</code>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded font-bold">Verified Licence</span>
                    </div>
                  </div>

                  {/* Pricing tier & limits simulator */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-2xl border ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
                    }`}>
                      <h3 className="text-base font-bold mb-3 flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                        <span>Included Subscription Features</span>
                      </h3>
                      <ul className="space-y-2.5 text-xs text-slate-400">
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Complete Multi-Cloud Connectors (AWS, Azure, GCP, SAP BTP)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>vjct ai GPT-4o Advanced Remediations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Continuous UK Gov Security Standards scans & Cyber Essentials checklist</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Automated Slack, MS Teams, & Corporate email dispatchers</span>
                        </li>
                      </ul>
                    </div>

                    <div className={`p-6 rounded-2xl border ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
                    }`}>
                      <h3 className="text-base font-bold mb-3 flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <span>Plan Licensing Upgrades</span>
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Need higher frequency scanning, dedicated vector-database isolation, or private on-premise deployments? Upgrade your security envelope.
                      </p>
                      <button
                        onClick={() => alert('You are already enjoying the top tier Enterprise Unlimited license tier!')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Contact vjct ai Sales Engineering
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </main>
        </div>
      )}

    </div>
  );
}
