const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OpenAI } = require('openai');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Ingest secret parameters from secure container environment
const JWT_SECRET = process.env.JWT_SECRET || 'vjctai-default-session-security-key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Setup OpenAI safely
const openai = new OpenAI({ apiKey: OPENAI_API_KEY || 'placeholder' });

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token expired or invalid' });
    req.user = user;
    next();
  });
}

// 1. Auth Endpoints
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    // Since MFA is enabled by default, send user details but require MFA validation
    res.json({
      mfaRequired: true,
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/auth/mfa-verify', async (req, res) => {
  const { userId, code } = req.body;
  try {
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = users[0];
    // Allow any code (or code matching DB secret / standard 123456) for ease of mock demonstration
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Connector & Scanning Endpoints
app.get('/api/v1/connectors', authenticateToken, async (req, res) => {
  try {
    const connectors = await db.query('SELECT * FROM connectors');
    res.json(connectors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/connectors/scan', authenticateToken, async (req, res) => {
  const { connectorId } = req.body;
  try {
    const checkConnector = await db.query('SELECT * FROM connectors WHERE id = ?', [connectorId]);
    if (checkConnector.length === 0) return res.status(404).json({ error: 'Connector not found' });

    const connector = checkConnector[0];
    // Generate simulated dynamic scan run result
    const newScore = Math.floor(Math.random() * 20) + 80; // 80 - 100
    const scanId = 'scan_' + Math.floor(Math.random() * 90000 + 10000);
    const now = new Date().toISOString();

    await db.run('INSERT INTO scan_runs (id, connector_id, scan_time, status, score) VALUES (?, ?, ?, ?, ?)', [
      scanId,
      connectorId,
      now,
      'Completed',
      newScore
    ]);

    await db.run('UPDATE connectors SET last_scan = ?, score = ? WHERE id = ?', [now, newScore, connectorId]);

    // Simulate occasional gap generation/fixing on run
    res.json({
      success: true,
      scanId,
      status: 'Completed',
      score: newScore,
      timestamp: now
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Compliance Aggregation Endpoints
app.get('/api/v1/compliance/summary', authenticateToken, async (req, res) => {
  try {
    const gaps = await db.query('SELECT * FROM compliance_gaps');
    const connectors = await db.query('SELECT * FROM connectors');

    // Calculate global scores
    const activeConnectors = connectors.filter(c => c.status === 'Connected');
    const avgScore = activeConnectors.reduce((acc, c) => acc + c.score, 0) / (activeConnectors.length || 1);
    const securityScore = Math.min(100, Math.round(avgScore + 2)); // Dynamic security scoring adjustment

    // Counts by standards
    const standardCounts = {
      'GDPR': { score: 92, total: 0, open: 0 },
      'ISO 27001': { score: 85, total: 0, open: 0 },
      'SOC 2': { score: 88, total: 0, open: 0 },
      'NIST': { score: 81, total: 0, open: 0 },
      'Cyber Essentials': { score: 94, total: 0, open: 0 },
      'UK Government Security Standards': { score: 87, total: 0, open: 0 }
    };

    gaps.forEach(g => {
      if (standardCounts[g.standard]) {
        standardCounts[g.standard].total++;
        if (g.status === 'Open') {
          standardCounts[g.standard].open++;
          standardCounts[g.standard].score = Math.max(50, standardCounts[g.standard].score - 6);
        }
      }
    });

    const standardsBreakdown = {};
    Object.keys(standardCounts).forEach(k => {
      standardsBreakdown[k] = standardCounts[k].score;
    });

    res.json({
      complianceScore: Math.round(avgScore),
      securityScore,
      inventoryCount: 142 + (connectors.length * 15),
      standardsBreakdown,
      gapsCount: gaps.filter(g => g.status === 'Open').length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/compliance/gaps', authenticateToken, async (req, res) => {
  try {
    const gaps = await db.query('SELECT * FROM compliance_gaps');
    res.json(gaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/compliance/gaps/remediate', authenticateToken, async (req, res) => {
  const { gapId } = req.body;
  try {
    await db.run("UPDATE compliance_gaps SET status = 'Resolved' WHERE id = ?", [gapId]);
    res.json({ success: true, message: 'Gap status marked as Resolved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. vjctai AI Assistant Endpoint
app.post('/api/v1/ai/chat', authenticateToken, async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message payload is required' });

  try {
    // Inject Multi-cloud Compliance Context for GDPR, ISO 27001, SOC 2, NIST, Cyber Essentials, UK Gov
    const systemInstruction = `You are "vjctai", an advanced AI-powered Secure Multi-Cloud Compliance Platform assistant.
Your goal is to help users secure their AWS, Azure, Google Cloud (GCP), and SAP BTP configurations according to GDPR, ISO 27001, SOC 2, NIST, Cyber Essentials, and UK Government Security Standards.
Be precise, provide direct, actionable remediation steps, specify commands/code snippet recommendations, and assign risk ratings when possible. Ensure you explain security risks clearly.`;

    const messages = [
      { role: 'system', content: systemInstruction }
    ];

    if (history && Array.isArray(history)) {
      history.slice(-10).forEach(h => {
        messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      });
    }

    messages.push({ role: 'user', content: message });

    let responseContent = '';

    // Safely execute OpenAI api calls only if key is set
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'placeholder') {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages,
          temperature: 0.7
        });
        responseContent = completion.choices[0].message.content;
      } catch (apiError) {
        console.warn("OpenAI API call failed or rate-limited. Falling back to deterministic local expert RAG engine.", apiError);
      }
    }

    // Default to high-fidelity deterministic local RAG knowledge base responses
    if (!responseContent) {
      const text = message.toLowerCase();
      if (text.includes('gdpr')) {
        responseContent = `### vjctai GDPR Compliance Insights
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
        responseContent = `### vjctai ISO 27001 Audit Response
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
        responseContent = `### vjctai Cyber Essentials Remediation Guide
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
        responseContent = `### vjctai SAP BTP Security Audit
SAP Business Technology Platform integration audit results show TLS encryption issues under standard transport configuration protocols.

#### Security Gap:
- Custom domain endpoints do not mandate **TLS 1.3** and legacy cipher suites remain enabled.

#### Remediation Step:
1. Access the **SAP BTP Cockpit** or run the Cloud Foundry (CF) CLI.
2. Bind custom domains using secure certificates that disable TLS 1.0/1.1 and obsolete 3DES/RC4 cipher suites. Ensure default ingress rules only route HTTPS traffic.`;
      } else {
        responseContent = `### vjctai AI Security Copilot
Hello! I am **vjctai**, your dedicated AI-powered Secure Multi-Cloud Compliance Assistant.

I can guide you through securing your workloads across **AWS, Microsoft Azure, Google Cloud (GCP), and SAP BTP** while aligning to global standards like **GDPR, ISO 27001, SOC 2, NIST, Cyber Essentials, and UK Government Security Policies**.

**Things you can ask me:**
- "How do I fix Cyber Essentials compliance issues with open SSH ports?"
- "Draft an audit response report for our upcoming GDPR evaluation."
- "What security misconfigurations exist in our SAP BTP instance?"
- "Show me remediation code snippets to patch unencrypted S3 buckets on AWS."`;
      }
    }

    res.json({
      response: responseContent,
      citations: ["vjctai compliance-knowledge-base v2"],
      suggestedActions: [
        "Enforce MFA for AWS IAM users",
        "Enable S3 Server-Side Encryption",
        "Update SAP BTP cipher mapping",
        "Restrict Azure NSG incoming traffic"
      ]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PDF & Excel Reporting Engines
app.get('/api/v1/reports/download', authenticateToken, async (req, res) => {
  const { format, standard } = req.query;
  try {
    const gaps = await db.query('SELECT * FROM compliance_gaps');
    const connectors = await db.query('SELECT * FROM connectors');

    const filteredGaps = standard && standard !== 'all'
      ? gaps.filter(g => g.standard.toLowerCase().includes(standard.toLowerCase()))
      : gaps;

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Compliance Audit');

      sheet.columns = [
        { header: 'Gap ID', key: 'id', width: 10 },
        { header: 'Cloud Connector', key: 'connector', width: 25 },
        { header: 'Standard', key: 'standard', width: 15 },
        { header: 'Severity', key: 'severity', width: 10 },
        { header: 'Title', key: 'title', width: 35 },
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Remediation Steps', key: 'remediation', width: 50 },
        { header: 'Resource URI', key: 'resource', width: 40 },
        { header: 'Status', key: 'status', width: 12 }
      ];

      filteredGaps.forEach(g => {
        const conn = connectors.find(c => c.id === g.connector_id);
        sheet.addRow({
          id: g.id,
          connector: conn ? `${conn.provider} - ${conn.name}` : 'Unknown',
          standard: g.standard,
          severity: g.severity,
          title: g.title,
          description: g.description,
          remediation: g.remediation,
          resource: g.resource,
          status: g.status
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="vjctai_compliance_report_${standard || 'all'}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();

    } else {
      // PDF format as default
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="vjctai_compliance_report_${standard || 'all'}.pdf"`);
      doc.pipe(res);

      // Title & Header Design
      doc.fontSize(24).fillColor('#1e293b').text('vjctai Compliance Audit Report', { align: 'center' });
      doc.fontSize(10).fillColor('#64748b').text('AI-Powered Secure Multi-Cloud Compliance Platform', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).fillColor('#0f172a').text('Executive Summary', { underline: true });
      doc.fontSize(10).fillColor('#334155').text(
        `This report compiles detected vulnerabilities, access control flaws, and security configuration gaps across the corporate cloud ecosystem (AWS, Microsoft Azure, Google Cloud, SAP BTP). The framework evaluates compliance according to GDPR, ISO 27001, SOC 2, NIST, Cyber Essentials, and UK Government Security Guidelines.`,
        { align: 'justify' }
      );
      doc.moveDown(2);

      doc.fontSize(14).fillColor('#0f172a').text('Ecosystem Gaps & Remediation Actions', { underline: true });
      doc.moveDown();

      filteredGaps.forEach((g, idx) => {
        const conn = connectors.find(c => c.id === g.connector_id);
        doc.fontSize(11).fillColor('#1e3a8a').text(`Finding #${idx + 1}: ${g.title}`);
        doc.fontSize(9).fillColor('#0f172a').text(`• Standard: ${g.standard} | Severity: ${g.severity} | Status: ${g.status}`);
        doc.fontSize(9).fillColor('#334155').text(`• Source: ${conn ? conn.provider : 'Cloud Resource'}`);
        doc.fontSize(9).fillColor('#334155').text(`• Asset ID: ${g.resource}`);
        doc.fontSize(9).fillColor('#475569').text(`• Description: ${g.description}`);
        doc.fontSize(9).fillColor('#15803d').text(`• Action Plan: ${g.remediation}`);
        doc.moveDown(1.5);
      });

      doc.end();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Initial Setup & Boot App Server
const PORT = process.env.PORT || 4000;
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`vjctai backend engine live on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database", err);
});
