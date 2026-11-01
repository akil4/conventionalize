import { classifyDiff } from './classifier.js';
import { ConfigOptions, CommitMessage, ParsedDiff } from './types.js';
import { DEFAULT_MAX_DIFF_CHARS } from './constants.js';

export async function generateCommitMessage(
  diff: ParsedDiff,
  config: ConfigOptions
): Promise<CommitMessage> {
  if (diff.files.length === 0) {
    throw new Error('No staged changes detected. Stage files using `git add` before running conventionalize.');
  }

  if (config.provider === 'heuristic' || !config.apiKey) {
    const heuristicMsg = classifyDiff(diff, config.ticketPrefix);
    if (config.defaultScope && !heuristicMsg.scope) {
      heuristicMsg.scope = config.defaultScope;
      heuristicMsg.formatted = `${heuristicMsg.type}(${heuristicMsg.scope})${heuristicMsg.isBreaking ? '!' : ''}: ${heuristicMsg.subject}`;
    }
    return heuristicMsg;
  }

  try {
    if (config.provider === 'openai') {
      return await generateOpenAICommit(diff, config);
    } else if (config.provider === 'gemini') {
      return await generateGeminiCommit(diff, config);
    }
  } catch (error) {
    if (config.debug) {
      console.warn(`[conventionalize debug] LLM Provider failed (${(error as Error).message}). Falling back to heuristic classifier.`);
    }
  }

  return classifyDiff(diff, config.ticketPrefix);
}

async function generateOpenAICommit(diff: ParsedDiff, config: ConfigOptions): Promise<CommitMessage> {
  const maxChars = config.maxDiffChars || DEFAULT_MAX_DIFF_CHARS;
  const prompt = `Generate a single line Conventional Commit header (type(scope): concise subject) based on this git diff:\n\n${diff.rawDiff.slice(0, maxChars)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const rawText = data.choices?.[0]?.message?.content?.trim() || '';

  return parseRawLLMResponse(rawText, diff, config.ticketPrefix);
}

async function generateGeminiCommit(diff: ParsedDiff, config: ConfigOptions): Promise<CommitMessage> {
  const maxChars = config.maxDiffChars || DEFAULT_MAX_DIFF_CHARS;
  const prompt = `Generate a single line Conventional Commit (type(scope): summary) for this git diff:\n\n${diff.rawDiff.slice(0, maxChars)}`;
  const modelName = config.model || 'gemini-3.7-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  return parseRawLLMResponse(rawText, diff, config.ticketPrefix);
}

export function parseRawLLMResponse(rawText: string, diff: ParsedDiff, ticketPrefix?: string): CommitMessage {
  const match = rawText.match(/^([a-z]+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i);
  if (match) {
    const type = match[1].toLowerCase() as any;
    const scope = match[2];
    const isBreaking = Boolean(match[3]);
    let subject = match[4];

    if (ticketPrefix && ticketPrefix.trim() && !subject.includes(ticketPrefix.toUpperCase())) {
      subject = `[${ticketPrefix.trim().toUpperCase()}] ${subject}`;
    }

    const formatted = `${type}${scope ? `(${scope})` : ''}${isBreaking ? '!' : ''}: ${subject}`;

    return {
      type,
      scope,
      isBreaking,
      subject,
      formatted,
    };
  }

  const fallback = classifyDiff(diff, ticketPrefix);
  fallback.subject = rawText.slice(0, 72);
  fallback.formatted = `${fallback.type}${fallback.scope ? `(${fallback.scope})` : ''}: ${fallback.subject}`;
  return fallback;
}
