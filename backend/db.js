const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'compliance.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Users Table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE,
          password_hash TEXT,
          role TEXT,
          mfa_secret TEXT,
          mfa_enabled INTEGER DEFAULT 1
        )
      `);

      // 2. Connectors Table
      db.run(`
        CREATE TABLE IF NOT EXISTS connectors (
          id TEXT PRIMARY KEY,
          provider TEXT,
          name TEXT,
          status TEXT,
          last_scan TEXT,
          score INTEGER DEFAULT 100
        )
      `);

      // 3. Scan Runs Table
      db.run(`
        CREATE TABLE IF NOT EXISTS scan_runs (
          id TEXT PRIMARY KEY,
          connector_id TEXT,
          scan_time TEXT,
          status TEXT,
          score INTEGER
        )
      `);

      // 4. Compliance Gaps Table
      db.run(`
        CREATE TABLE IF NOT EXISTS compliance_gaps (
          id TEXT PRIMARY KEY,
          connector_id TEXT,
          standard TEXT,
          severity TEXT,
          title TEXT,
          description TEXT,
          remediation TEXT,
          resource TEXT,
          status TEXT DEFAULT 'Open'
        )
      `);

      // 5. Chat Sessions Table
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          title TEXT,
          created_at TEXT
        )
      `);

      // 6. Chat Messages Table
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          session_id TEXT,
          sender TEXT,
          content TEXT,
          created_at TEXT
        )
      `, async (err) => {
        if (err) return reject(err);

        try {
          await seedData();
          resolve();
        } catch (seedErr) {
          reject(seedErr);
        }
      });
    });
  });
}

async function seedData() {
  const hash = await bcrypt.hash('password123', 10);

  // Seed Users
  const users = [
    { id: 'u1', name: 'Alexander Admin', email: 'admin@vjctai.com', password_hash: hash, role: 'Admin', mfa_secret: 'MFA123' },
    { id: 'u2', name: 'Rachel Auditor', email: 'auditor@vjctai.com', password_hash: hash, role: 'Auditor', mfa_secret: 'MFA456' },
    { id: 'u3', name: 'Charles Compliance', email: 'compliance@vjctai.com', password_hash: hash, role: 'Compliance Manager', mfa_secret: 'MFA789' },
    { id: 'u4', name: 'Sarah Analyst', email: 'analyst@vjctai.com', password_hash: hash, role: 'Security Analyst', mfa_secret: 'MFA012' },
    { id: 'u5', name: 'Christian Client', email: 'client@vjctai.com', password_hash: hash, role: 'Client User', mfa_secret: 'MFA345' }
  ];

  for (const u of users) {
    db.run(
      `INSERT OR IGNORE INTO users (id, name, email, password_hash, role, mfa_secret) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.password_hash, u.role, u.mfa_secret]
    );
  }

  // Seed Connectors
  const connectors = [
    { id: 'c1', provider: 'AWS', name: 'Production AWS Account', status: 'Connected', last_scan: new Date().toISOString(), score: 82 },
    { id: 'c2', provider: 'Azure', name: 'Enterprise Azure Subscription', status: 'Connected', last_scan: new Date().toISOString(), score: 78 },
    { id: 'c3', provider: 'Google Cloud', name: 'GCP Analytics Cluster', status: 'Connected', last_scan: new Date().toISOString(), score: 91 },
    { id: 'c4', provider: 'SAP BTP', name: 'SAP BTP Tenant ERP', status: 'Connected', last_scan: new Date().toISOString(), score: 85 }
  ];

  for (const c of connectors) {
    db.run(
      `INSERT OR IGNORE INTO connectors (id, provider, name, status, last_scan, score) VALUES (?, ?, ?, ?, ?, ?)`,
      [c.id, c.provider, c.name, c.status, c.last_scan, c.score]
    );
  }

  // Seed Compliance Gaps
  const gaps = [
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

  for (const g of gaps) {
    db.run(
      `INSERT OR IGNORE INTO compliance_gaps (id, connector_id, standard, severity, title, description, remediation, resource, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [g.id, g.connector_id, g.standard, g.severity, g.title, g.description, g.remediation, g.resource, g.status]
    );
  }
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  initDb,
  query,
  run
};
