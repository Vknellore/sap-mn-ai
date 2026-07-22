import React, { useState, useEffect, useRef } from 'react';
import {
  Sun, Moon, Send, Shield, Cloud, AlertTriangle, FileText, CheckCircle,
  Users, RefreshCw, Key, HelpCircle, ArrowRight, Check, Plus,
  Trash2, Mail, MessageSquare, Terminal, Eye, FileSpreadsheet,
  CreditCard, Award, CheckSquare, Layers, Lock, Sparkles, Slack
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

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showMfa, setShowMfa] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('admin@vjctai.com');
  const [password, setPassword] = useState<string>('password123');
  const [mfaCode, setMfaCode] = useState<string>('123456');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Optional Client-side OpenAI Key configuration
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);

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

  // Load Seed / LocalStorage Data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConnectors = localStorage.getItem('vjct_connectors');
      const savedGaps = localStorage.getItem('vjct_gaps');
      const savedLogs = localStorage.getItem('vjct_logs');

      if (savedConnectors) {
        setConnectors(JSON.parse(savedConnectors));
      } else {
        const seedConnectors = [
          { id: 'c1', provider: 'AWS', name: 'Production AWS Account', status: 'Connected', last_scan: new Date().toISOString(), score: 82 },
          { id: 'c2', provider: 'Azure', name: 'Enterprise Azure Subscription', status: 'Connected', last_scan: new Date().toISOString(), score: 78 },
          { id: 'c3', provider: 'Google Cloud', name: 'GCP Analytics Cluster', status: 'Connected', last_scan: new Date().toISOString(), score: 91 },
          { id: 'c4', provider: 'SAP BTP', name: 'SAP BTP Tenant ERP', status: 'Connected', last_scan: new Date().toISOString(), score: 85 }
        ];
        setConnectors(seedConnectors);
        localStorage.setItem('vjct_connectors', JSON.stringify(seedConnectors));
      }

      if (savedGaps) {
        setGaps(JSON.parse(savedGaps));
      } else {
        const seedGaps = [
          {
            id: 'g1',
            connector_id: 'c1',
            standard: 'ISO 27001',
            severity: 'High',
            title: 'MFA not enforced for IAM privileged accounts',
            description: 'Administrative access roles do not require multi-factor authentication (MFA). A compromised set of credentials could lead to full cloud takeover.',
            remediation: 'Access IAM Dashboard -> Policies -> Enable MFA Enforcement for Admin Group.',
            resource: 'arn:aws:iam::123456789012:user/admin-account',
            status: 'Open'
          },
          {
            id: 'g2',
            connector_id: 'c1',
            standard: 'GDPR',
            severity: 'Critical',
            title: 'Unencrypted S3 Buckets containing PII',
            description: 'S3 Buckets containing database dumps with customer records lack server-side encryption (SSE). Violation of data protection by design.',
            remediation: 'Enable S3 Default Encryption (SSE-KMS or SSE-S3) on the bucket property settings.',
            resource: 'arn:aws:s3:::customer-pii-records-backup',
            status: 'Open'
          },
          {
            id: 'g3',
            connector_id: 'c2',
            standard: 'Cyber Essentials',
            severity: 'Medium',
            title: 'Publicly exposed SSH / RDP ports on VM instance',
            description: 'Azure virtual machine has its network security group (NSG) configured to allow inbound SSH (22) and RDP (3389) traffic from any IP (*).',
            remediation: 'Configure the NSG to restrict SSH/RDP traffic to designated VPN/office IPs only.',
            resource: '/subscriptions/sub-1/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/vm-bastion',
            status: 'Open'
          },
          {
            id: 'g4',
            connector_id: 'c3',
            standard: 'NIST',
            severity: 'Low',
            title: 'Audit Logs not forwarded to centralized storage',
            description: 'Cloud logging metrics are kept in standard local buckets only and are not aggregated into a centralized SIEM platform.',
            remediation: 'Set up GCP Pub/Sub logging sink pointing to centralized storage or SIEM dashboard.',
            resource: 'projects/gcp-prod-123/logs/cloudaudit.googleapis.com',
            status: 'Open'
          },
          {
            id: 'g5',
            connector_id: 'c4',
            standard: 'UK Government Security Standards',
            severity: 'High',
            title: 'SAP BTP Subaccount Custom Domain lacks TLS 1.3',
            description: 'SAP Business Technology Platform Custom Domain is configured with deprecated cipher suites and does not mandate TLS 1.2 or TLS 1.3 protocols.',
            remediation: 'Update Custom Domain certificates and SSL hosts configuration to enforce TLS 1.3.',
            resource: 'sap-btp-prod.cfapps.eu10.hana.ondemand.com',
            status: 'Open'
          },
          {
            id: 'g6',
            connector_id: 'c2',
            standard: 'SOC 2',
            severity: 'Medium',
            title: 'Unrestricted Azure Key Vault access',
            description: 'The secure Key Vault lacks network restrictions, allowing calls from the public internet. Access policies allow broader scope than least privilege.',
            remediation: 'Set Network rules to "Enabled from selected networks" and reduce Access Policies to only mandatory app identities.',
            resource: '/subscriptions/sub-1/resourceGroups/prod-rg/providers/Microsoft.KeyVault/vaults/kv-prod-secrets',
            status: 'Open'
          }
        ];
        setGaps(seedGaps);
        localStorage.setItem('vjct_gaps', JSON.stringify(seedGaps));
      }

      if (savedLogs) {
        setNotificationLogs(JSON.parse(savedLogs));
      } else {
        setNotificationLogs([
          `[${new Date().toLocaleTimeString()}] Platform loaded. All 4 Cloud Providers active.`
        ]);
      }
    }
  }, []);

  // Recalculate summary metrics whenever connectors or gaps change
  useEffect(() => {
    if (connectors.length === 0) return;

    const avgScore = connectors.reduce((acc, c) => acc + c.score, 0) / connectors.length;
    const securityScore = Math.min(100, Math.round(avgScore + 2));

    const standardCounts: any = {
      'GDPR': { score: 92, open: 0 },
      'ISO 27001': { score: 85, open: 0 },
      'SOC 2': { score: 88, open: 0 },
      'NIST': { score: 81, open: 0 },
      'Cyber Essentials': { score: 94, open: 0 },
      'UK Government Security Standards': { score: 87, open: 0 }
    };

    gaps.forEach(g => {
      if (standardCounts[g.standard]) {
        if (g.status === 'Open') {
          standardCounts[g.standard].open++;
          standardCounts[g.standard].score = Math.max(50, standardCounts[g.standard].score - 6);
        }
      }
    });

    const standardsBreakdown: any = {};
    Object.keys(standardCounts).forEach(k => {
      standardsBreakdown[k] = standardCounts[k].score;
    });

    setSummary({
      complianceScore: Math.round(avgScore),
      securityScore,
      inventoryCount: 142 + (connectors.length * 15),
      standardsBreakdown,
      gapsCount: gaps.filter(g => g.status === 'Open').length
    });
  }, [connectors, gaps]);

  // Local secure login validation
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Support seeded credentials
    const validUsers: any = {
      'admin@vjctai.com': { id: 'u1', name: 'Alexander Admin', role: 'Admin' },
      'auditor@vjctai.com': { id: 'u2', name: 'Rachel Auditor', role: 'Auditor' },
      'compliance@vjctai.com': { id: 'u3', name: 'Charles Compliance', role: 'Compliance Manager' },
      'analyst@vjctai.com': { id: 'u4', name: 'Sarah Analyst', role: 'Security Analyst' },
      'client@vjctai.com': { id: 'u5', name: 'Christian Client', role: 'Client User' }
    };

    if (validUsers[cleanEmail] && password === 'password123') {
      setShowMfa(true);
    } else {
      alert('Invalid secure ID or password. Use password123 as the password.');
    }
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456') {
      const cleanEmail = email.trim().toLowerCase();
      const validUsers: any = {
        'admin@vjctai.com': { id: 'u1', name: 'Alexander Admin', role: 'Admin' },
        'auditor@vjctai.com': { id: 'u2', name: 'Rachel Auditor', role: 'Auditor' },
        'compliance@vjctai.com': { id: 'u3', name: 'Charles Compliance', role: 'Compliance Manager' },
        'analyst@vjctai.com': { id: 'u4', name: 'Sarah Analyst', role: 'Security Analyst' },
        'client@vjctai.com': { id: 'u5', name: 'Christian Client', role: 'Client User' }
      };

      const user = validUsers[cleanEmail] || { id: 'u1', name: 'Alexander Admin', role: 'Admin' };
      setCurrentUser(user);
      setIsAuthenticated(true);
      addNotificationLog(`Successfully authenticated session for ${user.name} via Entra ID MFA.`);
    } else {
      alert('Invalid MFA Pin. Use 123456 as the demo verification code.');
    }
  };

  const handleRoleSwitch = (roleName: string, roleEmail: string) => {
    const validUsers: any = {
      'admin@vjctai.com': { id: 'u1', name: 'Alexander Admin', role: 'Admin' },
      'auditor@vjctai.com': { id: 'u2', name: 'Rachel Auditor', role: 'Auditor' },
      'compliance@vjctai.com': { id: 'u3', name: 'Charles Compliance', role: 'Compliance Manager' },
      'analyst@vjctai.com': { id: 'u4', name: 'Sarah Analyst', role: 'Security Analyst' },
      'client@vjctai.com': { id: 'u5', name: 'Christian Client', role: 'Client User' }
    };
    const user = validUsers[roleEmail];
    setCurrentUser(user);
    setEmail(roleEmail);
    addNotificationLog(`Simulated IAM workspace switcher: logged into [${user.role}] successfully.`);
  };

  // Client-side simulated scan run
  const handleTriggerScan = (connId: string, provider: string) => {
    setIsScanning(connId);
    addNotificationLog(`Dispatched automated configuration scan on ${provider}...`);

    setTimeout(() => {
      const updated = connectors.map(c => {
        if (c.id === connId) {
          const newScore = Math.floor(Math.random() * 20) + 80;
          return { ...c, last_scan: new Date().toISOString(), score: newScore };
        }
        return c;
      });
      setConnectors(updated);
      localStorage.setItem('vjct_connectors', JSON.stringify(updated));
      setIsScanning(null);
      addNotificationLog(`Audit scan complete for ${provider}. Score recalculated.`);
    }, 1500);
  };

  // Client-side fix remediation
  const handleRemediate = (gapId: string, title: string) => {
    const updated = gaps.map(g => {
      if (g.id === gapId) {
        return { ...g, status: 'Resolved' };
      }
      return g;
    });
    setGaps(updated);
    localStorage.setItem('vjct_gaps', JSON.stringify(updated));
    addNotificationLog(`Applied automated fix playbook for finding: [${title}]`);
  };

  // Client-side RAG & ChatGPT response handler
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

    setTimeout(async () => {
      let responseContent = '';

      // Secure Client-Side OpenAI invocation if key is provided
      if (customApiKey && customApiKey.startsWith('sk-')) {
        try {
          const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${customApiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are vjct ai, an advanced secure multi-cloud compliance assistant. Help secure AWS, Azure, Google Cloud, and SAP BTP configurations against GDPR, ISO 27001, Cyber Essentials, and UK Government Security Guidelines. Give clear, command-line code snippet fixes.' },
                { role: 'user', content: query }
              ],
              temperature: 0.7
            })
          });
          const chatJson = await chatResponse.json();
          responseContent = chatJson.choices[0].message.content;
        } catch (apiError) {
          console.warn("Client-side OpenAI call failed. Defaulting to local RAG knowledge base.", apiError);
        }
      }

      // High-Fidelity Local RAG system
      if (!responseContent) {
        const text = query.toLowerCase();
        if (text.includes('gdpr')) {
          responseContent = `### vjct ai GDPR Compliance Insights
Your multi-cloud stack shows some specific risks related to **GDPR Article 25 (Data protection by design and by default)** and **Article 32 (Security of processing)**.

#### Highlighted Risk: Unencrypted AWS S3 Buckets containing Customer PII
- **Cloud Provider**: Amazon Web Services (AWS)
- **Impact**: Highly Vulnerable to data leakage and regulatory GDPR fines up to 4% of global turnover.
- **Remediation Action**:
  \`\`\`bash
  # Enforce Default SSE-S3 encryption via AWS CLI
  aws s3api put-bucket-encryption \\
    --bucket customer-pii-records-backup \\
    --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
  \`\`\`
- **Recommended Policy**: Implement an organization-wide Service Control Policy (SCP) to deny creation of unencrypted S3 buckets.`;
        } else if (text.includes('iso 27001') || text.includes('iso')) {
          responseContent = `### vjct ai ISO 27001 Audit Response
For **ISO/IEC 27001:2022 Control A.8.15 (Logging)** and **Control A.5.15 (Access control)**, you have active vulnerabilities in your infrastructure.

#### Critical Gaps Detected:
1. **Administrative MFA**: Multi-factor authentication is not enforced on AWS privileged accounts.
2. **Azure Key Vault Open Configuration**: Access policies do not strictly apply the "least privilege" principle.

#### Remediation commands:
- **Configure Azure Key Vault Network Access Rules via Azure CLI**:
  \`\`\`azurecli
  az keyvault update --name "kv-prod-secrets" --resource-group "prod-rg" --default-action Deny
  \`\`\`
Ensure only specific CIDR blocks and trusted cloud resource gateways have active endpoints mapped.`;
        } else if (text.includes('cyber essentials')) {
          responseContent = `### vjct ai Cyber Essentials Remediation Guide
According to **Cyber Essentials Rule Category: Secure Configuration (Port Firewall Controls)**, your cloud perimeter exhibits major exposures.

#### Exposed Bastion Host Protocol ports:
- **Provider**: Azure Subscription (Resource: \`vm-bastion\`)
- **Vulnerability**: Network security rule allows open SSH (TCP 22) and RDP (TCP 3389) from wildcard (\`*\`) source IPs.

#### Direct Fix:
Remove standard broad access rules and restrict remote management connections to authorized administrative public IPs:
\`\`\`azurecli
az network nsg rule update \\
  --resource-group prod-rg \\
  --nsg-name my-vm-nsg \\
  --name AllowSSH \\
  --source-address-prefixes "81.94.x.x/32" \\
  --access Allow
\`\`\`
This matches standard requirements for Cyber Essentials boundary firewall validation.`;
        } else if (text.includes('sap') || text.includes('btp')) {
          responseContent = `### vjct ai SAP BTP Security Audit
SAP Business Technology Platform integration audit results show TLS encryption issues under transport configuration protocols.

#### Security Gap:
- Custom domain endpoints do not mandate **TLS 1.3** and legacy cipher suites remain enabled.

#### Remediation Step:
1. Access the **SAP BTP Cockpit** or run the Cloud Foundry (CF) CLI.
2. Bind custom domains using secure certificates that disable TLS 1.0/1.1 and obsolete 3DES/RC4 cipher suites. Ensure default ingress rules only route HTTPS traffic.`;
        } else {
          responseContent = `### vjct ai Security Copilot
Hello! I am **vjct ai**, your dedicated AI-powered Secure Multi-Cloud Compliance Assistant.

I can guide you through securing your workloads across **AWS, Microsoft Azure, Google Cloud (GCP), and SAP BTP** while aligning to global standards like **GDPR, ISO 27001, SOC 2, NIST, Cyber Essentials, and UK Government Security Policies**.

**Things you can ask me:**
- "How do I fix Cyber Essentials compliance issues with open SSH ports?"
- "Draft an audit response report for our upcoming GDPR evaluation."
- "What security misconfigurations exist in our SAP BTP instance?"
- "Show me remediation code snippets to patch unencrypted S3 buckets on AWS."`;
        }
      }

      const assistantMsgId = 'ai_' + Date.now();
      const newAiMsg: Message = {
        id: assistantMsgId,
        sender: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString(),
        suggestedActions: [
          "Enforce MFA for AWS IAM users",
          "Enable S3 Server-Side Encryption",
          "Update SAP BTP cipher mapping",
          "Restrict Azure NSG incoming traffic"
        ]
      };

      setMessages(prev => [...prev, newAiMsg]);
      setIsAiLoading(false);

      if (chatHistory.length < 6) {
        setChatHistory(prev => [{ id: 'ch_' + Date.now(), title: query.substring(0, 24) + '...' }, ...prev]);
      }
    }, 1000);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setAttachedFiles(prev => [...prev, fileName]);
      addNotificationLog(`Successfully ingested evidence artifact file: [${fileName}]`);
    }
  };

  const addNotificationLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${msg}`;
    setNotificationLogs(prev => {
      const updated = [entry, ...prev.slice(0, 9)];
      localStorage.setItem('vjct_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Client-side CSV/Report file downloader
  const triggerDownload = (format: 'pdf' | 'xlsx', std: string) => {
    const filteredGaps = std === 'all' ? gaps : gaps.filter(g => g.standard.toLowerCase().includes(std.toLowerCase()));

    // Create CSV formatted string
    let fileContent = 'Gap ID,Standard,Severity,Cloud Connector,Title,Description,Remediation,Resource,Status\n';
    filteredGaps.forEach(g => {
      const conn = connectors.find(c => c.id === g.connector_id);
      const connName = conn ? `${conn.provider} - ${conn.name}` : 'Unknown';
      fileContent += `"${g.id}","${g.standard}","${g.severity}","${connName}","${g.title.replace(/"/g, '""')}","${g.description.replace(/"/g, '""')}","${g.remediation.replace(/"/g, '""')}","${g.resource}","${g.status}"\n`;
    });

    // Create Blob and download
    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vjctai_compliance_report_${std.replace(/ /g, '_')}.${format === 'xlsx' ? 'csv' : 'txt'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotificationLog(`Downloaded client-side ${format.toUpperCase()} compliance checklist dataset for [${std}].`);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
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
                    : (theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
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
                    : (theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
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
                    : (theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
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
                    : (theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
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
                    : (theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
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
              <div className="flex items-center space-x-3 text-xs">
                {/* OpenAI Key Configuration Trigger (Valuable for Live Client-side demoing) */}
                <button
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-750 hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-[10px]">OpenAI Key</span>
                </button>

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

            {/* Key configuration helper modal/overlay */}
            {showKeyConfig && (
              <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
                  <p className="text-inherit font-semibold">
                    You can input a private <strong className="text-amber-500">OpenAI API Key</strong> to process custom chat prompts directly from your browser. Leave blank to run offline on local compliance expert models.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="p-1.5 rounded border text-slate-800 text-xs w-60 outline-none"
                  />
                  <button onClick={() => setShowKeyConfig(false)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">Apply Key</button>
                </div>
              </div>
            )}

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
                    <div className="px-4 py-2 border-t border-slate-850/20 bg-amber-500/5 flex items-center gap-3 flex-wrap">
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

                  {/* Input Chat Field Panel */}
                  <div className={`p-3 rounded-2xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <label className="p-2 hover:bg-slate-750/25 rounded-xl cursor-pointer text-slate-400 transition" title="Upload Compliance Evidence PDF">
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
                      <button onClick={() => setNotificationLogs([])} className="text-xs text-slate-500 hover:text-slate-400 font-semibold font-medium">Clear logs</button>
                    </div>
                    <div className="p-3 bg-black/90 rounded-xl font-mono text-xs text-emerald-400 space-y-1.5 min-h-[120px] overflow-y-auto">
                      {notificationLogs.length === 0 ? (
                        <span className="text-slate-500 italic">No events or scan actions dispatched yet...</span>
                      ) : (
                        notificationLogs.map((log, i) => (
                          <div key={i} className="leading-relaxed">
                            <span className="text-emerald-500 font-bold">✔</span> {log}
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

                              <div className="p-3 bg-slate-800/10 border border-slate-750/10 rounded-xl mt-3">
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
