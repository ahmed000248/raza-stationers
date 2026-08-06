import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Patterns matching active credential values
const SENSITIVE_PATTERNS = [
  { name: 'TOTP URI', regex: /otpauth:\/\/[^\s"'`]+/gi },
  { name: 'QR Code URL with secret', regex: /https?:\/\/[^\s"'`]*qrserver[^\s"'`]*otpauth[^\s"'`]+/gi },
  { name: 'Exposed TOTP Env Assignment', regex: /VERIFY_OWNER_TOTP_SECRET\s*=\s*['"]?[A-Z2-7]{16,64}['"]?/g },
  { name: 'Raw Bearer Token String', regex: /Authorization['"]?\s*:\s*['"]Bearer\s+(?:eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|[a-f0-9]{32,})['"]/gi },
  { name: 'BetterAuth Secret Export', regex: /BETTER_AUTH_SECRET\s*=\s*['"][A-Fa-f0-9]{32,}['"]/g },
];

const IGNORED_PATHS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.env.production.verification', // Local ignored env file
  '.env',
  '.env.local',
  '.env.example',
  'scripts/security/scan-sensitive-material.mjs'
];

function isIgnored(filePath) {
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  return IGNORED_PATHS.some(ignored => relPath === ignored || relPath.startsWith(ignored + '/'));
}

function redact(text) {
  if (!text || text.length <= 8) return '[REDACTED]';
  return text.slice(0, 4) + '...' + '[REDACTED]';
}

function scanFile(filePath) {
  const findings = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const pattern of SENSITIVE_PATTERNS) {
        const matches = line.match(pattern.regex);
        if (matches) {
          matches.forEach(match => {
            findings.push({
              file: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
              line: index + 1,
              type: pattern.name,
              preview: redact(match)
            });
          });
        }
      }
    });
  } catch (err) {
    // Ignore unreadable or binary files
  }
  return findings;
}

function scanDir(dirPath) {
  let allFindings = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (isIgnored(fullPath)) continue;

    if (entry.isDirectory()) {
      allFindings = allFindings.concat(scanDir(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const scannableExts = ['.js', '.mjs', '.ts', '.tsx', '.json', '.md', '.sql', '.yml', '.yaml', '.txt', '.env'];
      if (scannableExts.includes(ext) || entry.name.startsWith('.env')) {
        allFindings = allFindings.concat(scanFile(fullPath));
      }
    }
  }
  return allFindings;
}

console.log('=== RUNNING REPOSITORY SENSITIVE MATERIAL SCAN ===');
const findings = scanDir(ROOT_DIR);

if (findings.length > 0) {
  console.error(`\n[SECURITY SCAN ERROR] Found ${findings.length} exposed credential pattern(s) in current tree:`);
  findings.forEach(f => {
    console.error(`  - ${f.file}:${f.line} [${f.type}] Preview: ${f.preview}`);
  });
  console.error('\nRemediation required: Remove exposed credentials before committing.');
  process.exit(1);
} else {
  console.log('✔ Security Scan Passed: Zero exposed credentials detected in current tree.');
  process.exit(0);
}
