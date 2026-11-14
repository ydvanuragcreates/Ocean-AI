import { Sparkles } from 'lucide-react';
import TextCard from './TextCard';
import { DocumentSection } from '../services/api';
import { DocType } from './DocVisuals';

interface EditorProps {
  title: string;
  docType: DocType;
  sections: DocumentSection[];
  onUpdateSection: (sectionId: number, updates: Partial<DocumentSection>) => void;
}

export default function Editor({ title, docType, sections, onUpdateSection }: EditorProps) {
  const words = sections.reduce(
    (n, s) => n + (s.content ? s.content.trim().split(/\s+/).filter(Boolean).length : 0),
    0
  );

  return (
    <div className="sheet-shadow">
      <article className="sheet px-8 sm:px-16 pt-10 pb-16">
        <div className="flex items-center justify-between pb-4 border-b border-dashed border-paper-ink/15 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-muted">
          <span>
            {docType === 'docx' ? 'Document' : 'Presentation'} · .{docType}
          </span>
          <span className="flex items-center gap-1.5 text-ink-deep">
            <Sparkles size={12} /> AI draft
          </span>
        </div>

        <h1 className="mt-12 font-serif text-5xl sm:text-6xl leading-[1.02] text-paper-ink">{title}</h1>
        <p className="mt-5 font-mono text-xs text-paper-muted">
          {sections.length} {docType === 'docx' ? 'sections' : 'slides'} · {words.toLocaleString()} words · ~
          {Math.max(1, Math.round(words / 220))} min read
        </p>

        {sections.length > 0 ? (
          <div className="mt-14 space-y-14">
            {sections.map((section, i) => (
              <TextCard
                key={section.id}
                index={i}
                section={section}
                onUpdate={(updates) => onUpdateSection(section.id, updates)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-16 text-center font-serif text-2xl italic text-paper-faint">
            This page is still blank. Go back to the outline and let the AI write it.
          </p>
        )}

        <div className="mt-20 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-faint">
          <span className="h-px w-10 bg-paper-ink/15" />
          End of document
          <span className="h-px w-10 bg-paper-ink/15" />
        </div>
      </article>
    </div>
  );
}
