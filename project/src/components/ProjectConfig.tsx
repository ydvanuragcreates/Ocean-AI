import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageGlyph, SlideGlyph, DocType } from './DocVisuals';

interface ConfigProps {
  onNext: (topic: string, type: DocType) => void;
  isLoading?: boolean;
  initialTopic?: string;
  initialDocType?: DocType;
}

const STATUS = [
  'Reading your topic',
  'Mapping the key ideas',
  'Structuring sections',
  'Drafting the outline',
];

const FORMATS: { value: DocType; name: string; detail: string }[] = [
  { value: 'docx', name: 'Document', detail: 'Word · A4 pages' },
  { value: 'pptx', name: 'Presentation', detail: 'PowerPoint · 16:9 slides' },
];

const today = new Date()
  .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  .toUpperCase();

export default function ProjectConfig({
  onNext,
  isLoading = false,
  initialTopic = '',
  initialDocType = 'docx',
}: ConfigProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [docType, setDocType] = useState<DocType>(initialDocType);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialDocType) setDocType(initialDocType);
  }, [initialTopic, initialDocType]);

  // Walk through the status messages while the AI is working
  useEffect(() => {
    if (!isLoading) {
      setStatusIdx(0);
      return;
    }
    const t = setInterval(() => setStatusIdx((i) => Math.min(i + 1, STATUS.length - 1)), 1800);
    return () => clearInterval(t);
  }, [isLoading]);

  const handleSubmit = () => {
    if (topic.trim() && !isLoading) onNext(topic.trim(), docType);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="sheet-shadow">
        <div className="sheet px-8 sm:px-14 pt-10 pb-12">
          {/* Letterhead */}
          <div className="flex items-center justify-between pb-4 border-b border-dashed border-paper-ink/15 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-muted">
            <span>New document · Draft 0</span>
            <span>{today}</span>
          </div>

          {/* Title, typed straight onto the page */}
          <label htmlFor="doc-title" className="block mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
            Title
          </label>
          <input
            id="doc-title"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Untitled document"
            autoFocus
            disabled={isLoading}
            className="mt-2 w-full bg-transparent font-serif text-4xl sm:text-5xl leading-tight text-paper-ink placeholder:text-paper-ink/25 focus:outline-none disabled:opacity-100"
          />
          <p className="mt-3 text-sm text-paper-muted">
            Describe what it's about. The AI drafts an outline you can edit before anything is written.
          </p>

          <AnimatePresence mode="wait">
            {isLoading ? (
              /* The AI writing on the page */
              <motion.div
                key="writing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-10"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 font-mono text-xs text-ink-deep">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
                  </span>
                  <span className="caret">{STATUS[statusIdx]}</span>
                </div>
                <div className="mt-6 space-y-6">
                  {[0, 1, 2].map((block) => (
                    <motion.div
                      key={block}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: block * 0.5 }}
                      className="space-y-2.5"
                    >
                      <div className="h-3.5 w-2/5 rounded-full ai-shimmer" />
                      {[100, 94, 72].map((w, i) => (
                        <div key={i} className="h-2 rounded-full ai-shimmer" style={{ width: `${w}%` }} />
                      ))}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Format picker */}
                <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">Format</p>
                <div className="mt-3 grid grid-cols-2 gap-4" role="radiogroup" aria-label="Format">
                  {FORMATS.map((f) => {
                    const selected = docType === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setDocType(f.value)}
                        className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? 'border-ink bg-white shadow-[0_0_0_3px_rgba(139,123,255,0.18)]'
                            : 'border-paper-edge hover:border-paper-faint hover:bg-white/60'
                        }`}
                      >
                        <div className="w-14 shrink-0">
                          {f.value === 'docx' ? <PageGlyph className="w-11 mx-auto" /> : <SlideGlyph />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif text-xl text-paper-ink leading-none">{f.name}</div>
                          <div className="mt-1.5 font-mono text-[11px] text-paper-muted">
                            {f.detail}
                          </div>
                        </div>
                        <span
                          className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                            selected ? 'border-ink bg-ink shadow-[inset_0_0_0_3px_white]' : 'border-paper-faint'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <span className="hidden sm:block font-mono text-[11px] text-paper-faint">
              {isLoading ? 'This usually takes a few seconds' : 'Press Enter ↵ to start'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !topic.trim()}
              className="group ml-auto inline-flex items-center gap-2.5 rounded-full bg-paper-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-black disabled:cursor-not-allowed disabled:bg-paper-ink/25"
            >
              <Sparkles size={16} className="text-ink-soft" />
              {isLoading ? 'Drafting outline…' : 'Draft outline with AI'}
              {!isLoading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
