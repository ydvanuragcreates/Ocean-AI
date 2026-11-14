import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { DocType } from './DocVisuals';

interface Props {
  sections: string[];
  onUpdateSections: (sections: string[]) => void;
  docType?: DocType;
  title?: string;
  disabled?: boolean;
}

export default function OutlineSetup({ sections, onUpdateSections, docType = 'docx', title, disabled = false }: Props) {
  const [localSections, setLocalSections] = useState<string[]>(sections);
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  useEffect(() => {
    onUpdateSections(localSections);
  }, [localSections, onUpdateSections]);

  const addSection = () => {
    if (newSection.trim()) {
      setLocalSections([...localSections, newSection.trim()]);
      setNewSection('');
    }
  };

  const renameSection = (index: number, value: string) => {
    setLocalSections(localSections.map((s, i) => (i === index ? value : s)));
  };

  const removeSection = (index: number) => {
    setLocalSections(localSections.filter((_, i) => i !== index));
  };

  const unit = docType === 'docx' ? 'p.' : 'slide';

  return (
    <div className="sheet-shadow">
      <div className="sheet px-8 sm:px-14 pt-10 pb-12">
        <div className="flex items-center justify-between pb-4 border-b border-dashed border-paper-ink/15 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-muted">
          <span className="truncate pr-4">{title || 'Untitled document'}</span>
          <span className="shrink-0">
            {localSections.length} {docType === 'docx' ? 'section' : 'slide'}
            {localSections.length !== 1 ? 's' : ''}
          </span>
        </div>

        <h2 className="mt-10 font-serif text-5xl text-paper-ink">Contents</h2>
        <p className="mt-2 text-sm text-paper-muted">
          Drafted by AI. Rename, remove or add sections, then let it write.
        </p>

        <ol className="mt-8">
          {localSections.map((section, index) => (
            <li
              key={index}
              className="group flex items-baseline gap-4 border-b border-paper-ink/[0.06] py-3"
            >
              <span className="w-6 shrink-0 font-mono text-xs text-paper-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              <input
                value={section}
                onChange={(e) => renameSection(index, e.target.value)}
                disabled={disabled}
                aria-label={`Section ${index + 1} title`}
                size={Math.max(8, section.length)}
                className="min-w-0 max-w-[70%] bg-transparent font-serif text-[22px] leading-snug text-paper-ink rounded focus:outline-none focus:bg-white focus:px-1.5 focus:-mx-1.5 transition-all"
              />
              <span className="leader" />
              <span className="shrink-0 font-mono text-xs text-paper-muted">
                {unit} {index + 1}
              </span>
              {!disabled && (
                <button
                  onClick={() => removeSection(index)}
                  aria-label={`Remove ${section}`}
                  className="shrink-0 self-center rounded-full p-1 text-paper-faint opacity-0 transition-all hover:bg-rose-100 hover:text-rose-700 focus:opacity-100 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ol>

        {!disabled && (
          <div className="mt-2 flex items-center gap-4 py-3">
            <span className="w-6 shrink-0 font-mono text-xs text-paper-faint">
              {String(localSections.length + 1).padStart(2, '0')}
            </span>
            <input
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSection()}
              placeholder="Add a section…"
              className="flex-1 bg-transparent font-serif text-[22px] text-paper-ink placeholder:text-paper-ink/25 focus:outline-none"
            />
            <button
              onClick={addSection}
              disabled={!newSection.trim()}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-edge px-3 py-1.5 text-xs font-medium text-paper-muted transition-colors hover:border-paper-ink hover:text-paper-ink disabled:opacity-40 disabled:hover:border-paper-edge disabled:hover:text-paper-muted"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
