'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Database,
  ArrowRight,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  dataSources?: string[];
  followups?: string[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello. I am the FOODWISE AI Institutional Assistant. I can synthesize queries regarding audited plate leftover volumes, food category distributions, dining facility comparisons, and active SDG 12.3 interventions based directly on our live institutional database.',
      dataSources: ['SQLite Institutional Database (`data/foodwise.db`)', 'YOLOv11 Audits'],
      followups: [
        'Which food category has the highest observed waste?',
        'What is our average waste area index across all cafeterias?',
        'What recommendations are currently active?',
        'How is our progress toward SDG Target 12.3?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(textToSend);
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: res.answer,
          dataSources: res.data_sources,
          followups: res.suggested_followups
        }
      ]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'I encountered an error retrieving data from the institutional records. Please verify backend service availability.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary tracking-tight">
              FOODWISE Institutional Assistant
            </h2>
            <span className="fw-badge fw-badge-success text-[10px]">
              Grounding Active
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Backend-controlled query engine synthesizing plate telemetry and operational insights
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="fw-card bg-surface flex flex-col h-[650px] p-0 overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${
                m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  m.role === 'user'
                    ? 'bg-accent text-white'
                    : 'bg-primary text-white shadow-xs'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-xl text-xs space-y-2.5 ${
                  m.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-background border border-border text-text-primary'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-line">{m.content}</div>

                {/* Data Sources consulted */}
                {m.dataSources && m.dataSources.length > 0 && (
                  <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 text-[10px] text-text-muted">
                    <Database className="w-3 h-3 text-accent" />
                    <span>Grounding Sources: {m.dataSources.join(', ')}</span>
                  </div>
                )}

                {/* Suggested followups */}
                {m.followups && m.followups.length > 0 && (
                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Suggested Inquiries:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.followups.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-surface hover:bg-primary-light hover:text-primary border border-border text-text-secondary text-left transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-background border border-border text-xs text-text-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>Synthesizing institutional telemetry...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cafeteria waste rates, top leftover items, or SDG 12.3 progress..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs text-text-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
