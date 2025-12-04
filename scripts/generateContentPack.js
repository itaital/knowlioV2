#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const LANGUAGE_CODES = ['en', 'he', 'es', 'fr', 'de', 'tr'];
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

function parseArgs(argv) {
  const args = {};
  argv.forEach((arg, idx) => {
    if (arg.startsWith('--')) {
      const key = arg.replace(/^--/, '');
      const next = argv[idx + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
      } else {
        args[key] = true;
      }
    }
  });
  return args;
}

function dateRange(startIso, days) {
  const dates = [];
  const start = new Date(startIso);
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function loadHistory(historyPath) {
  if (!historyPath || !fs.existsSync(historyPath)) return [];
  const raw = fs.readFileSync(historyPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Could not parse history file ${historyPath}: ${err.message}`);
    return [];
  }
}

function buildPrompt(dates, history) {
  const historyAuthors = new Set();
  const historyFacts = new Set();
  history.forEach((entry) => {
    LANGUAGE_CODES.forEach((lang) => {
      const langData = entry?.languages?.[lang];
      langData?.quotes?.forEach((q) => historyAuthors.add(q.author));
      langData?.interestingKnowledge?.forEach((fact) => historyFacts.add(fact.title));
    });
  });

  const historySummary = `${historyAuthors.size} prior authors, ${historyFacts.size} prior fact titles will be avoided`;
  return `Act as a Senior Content Architect and Data Engineer. Generate a TypeScript-ready array of objects covering these dates: ${dates.join(', ')}. Each object must follow the DAILY_RECORDS shape used in Knowlio (date + languages with quotes, whoWereThey, interestingKnowledge). Languages: en, he, es, fr, de, tr. For every date and language: 3 quotes with authors, 3 matching bios, 5 knowledge facts (40-60 words). Do not repeat any quote, author, bio, or fact title used earlier in this batch or in history (${historySummary}). Output raw objects only, comma-separated.`;
}

function ensureUniqueness(batch) {
  const quoteSet = new Set();
  const factSet = new Set();

  batch.forEach((entry) => {
    LANGUAGE_CODES.forEach((lang) => {
      const langData = entry.languages?.[lang];
      langData?.quotes?.forEach(({ text, author }) => {
        const key = `${lang}:${text.trim()}`;
        if (quoteSet.has(key)) {
          throw new Error(`Duplicate quote detected for ${lang} on ${entry.date}`);
        }
        quoteSet.add(key);
        const authorKey = `${lang}:author:${author.trim()}`;
        if (quoteSet.has(authorKey)) {
          throw new Error(`Duplicate author detected for ${lang} on ${entry.date}`);
        }
        quoteSet.add(authorKey);
      });
      langData?.interestingKnowledge?.forEach(({ title }) => {
        const key = `${lang}:${title.trim()}`;
        if (factSet.has(key)) {
          throw new Error(`Duplicate fact title detected for ${lang} on ${entry.date}`);
        }
        factSet.add(key);
      });
    });
  });
}

async function callModel({ endpoint, apiKey, model, prompt }) {
  const body = {
    model,
    temperature: 0.8,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You generate localized daily content for a PWA. Respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Model request failed: ${response.status} ${response.statusText}\n${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Model response missing content');
  }
  return content;
}

function writeOutput(outputPath, content) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Saved content to ${outputPath}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const start = args.start || new Date().toISOString().slice(0, 10);
  const days = Number(args.days || 30);
  const output = args.output || path.join('generated', `pack-${start}-${days}d.json`);
  const historyPath = args.history;
  const endpoint = args.endpoint || DEFAULT_ENDPOINT;
  const model = args.model || DEFAULT_MODEL;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY. Set it in your environment to generate content.');
    process.exit(1);
  }

  const dates = dateRange(start, days);
  const history = loadHistory(historyPath);
  const prompt = buildPrompt(dates, history);
  console.log('Requesting generation for dates:', dates.join(', '));

  const content = await callModel({ endpoint, apiKey, model, prompt });
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error(`Model response was not valid JSON: ${err.message}`);
  }

  ensureUniqueness(parsed);
  writeOutput(output, JSON.stringify(parsed, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
