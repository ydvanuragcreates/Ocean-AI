export type DocType = 'docx' | 'pptx';

/** Brand mark: a sheet of paper with the AI's spark in the corner. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M7 2h13l8 8v18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#f6f3ec" />
      <path d="M20 2v6a2 2 0 0 0 2 2h6z" fill="#d6cfbd" />
      <path d="M10 18h10M10 22h12M10 26h7" stroke="#1d1b18" strokeWidth="1.8" strokeLinecap="round" opacity=".5" />
      <path d="M13 5.5l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="#8b7bff" />
    </svg>
  );
}

/** Miniature A4 page with text lines. */
export function PageGlyph({ className = '' }: { className?: string }) {
  return (
    <div
      className={`aspect-[1/1.414] bg-white rounded-[3px] border border-paper-edge shadow-sm px-[12%] py-[13%] flex flex-col gap-[5%] ${className}`}
    >
      <div className="h-[5%] w-3/5 rounded-full bg-paper-ink/80" />
      {[100, 92, 97, 68].map((w, i) => (
        <div key={i} className="h-[2.5%] rounded-full bg-paper-ink/20" style={{ width: `${w}%` }} />
      ))}
      <div className="h-[3.5%] w-2/5 rounded-full bg-ink/80 mt-[4%]" />
      {[100, 86, 94].map((w, i) => (
        <div key={i} className="h-[2.5%] rounded-full bg-paper-ink/20" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/** Miniature 16:9 slide with a title and a content block. */
export function SlideGlyph({ className = '' }: { className?: string }) {
  return (
    <div
      className={`aspect-video bg-white rounded-[3px] border border-paper-edge shadow-sm p-[7%] flex flex-col gap-[7%] ${className}`}
    >
      <div className="h-[9%] w-1/2 rounded-full bg-paper-ink/80" />
      <div className="flex-1 flex gap-[6%]">
        <div className="flex-1 flex flex-col gap-[12%] pt-[2%]">
          {[100, 84, 92].map((w, i) => (
            <div key={i} className="flex items-center gap-[6%]" style={{ width: `${w}%` }}>
              <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-ink/80" />
              <div className="h-[4px] flex-1 rounded-full bg-paper-ink/20" />
            </div>
          ))}
        </div>
        <div className="w-[38%] rounded-[2px] bg-gradient-to-br from-ink/30 to-ink/10" />
      </div>
    </div>
  );
}

interface PreviewProps {
  docType: DocType;
  sections: string[];
  /** Index of the section the AI is currently writing, if any. */
  activeIndex?: number | null;
}

/**
 * Live thumbnails of the document being planned: one mini page per
 * section (Word) or one slide per section (PowerPoint).
 */
export function PreviewStack({ docType, sections, activeIndex = null }: PreviewProps) {
  if (sections.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
        Add a section to see it appear here.
      </div>
    );
  }

  return (
    <div className={docType === 'docx' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
      {sections.map((heading, i) => {
        const isActive = activeIndex === i;
        const isDone = activeIndex !== null && i < activeIndex;
        return (
          <div key={`${i}-${heading}`} className="relative">
            <div
              className={`relative overflow-hidden bg-paper rounded-[3px] transition-all duration-300 ${
                docType === 'docx' ? 'aspect-[1/1.414] p-2.5' : 'aspect-video p-3'
              } ${isActive ? 'ring-2 ring-ink shadow-[0_0_24px_rgba(139,123,255,0.45)]' : 'ring-1 ring-black/20'}`}
            >
              <p
                className={`font-serif text-paper-ink leading-tight line-clamp-2 ${
                  docType === 'docx' ? 'text-[11px]' : 'text-[13px]'
                }`}
              >
                {heading}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {(docType === 'docx' ? [100, 90, 96, 70, 100, 84] : [80, 66, 74]).map((w, j) => (
                  <div
                    key={j}
                    className={`h-[3px] rounded-full ${
                      isActive ? 'ai-shimmer' : isDone ? 'bg-paper-ink/35' : 'bg-paper-ink/10'
                    }`}
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
            <span className="absolute -bottom-0.5 right-1.5 font-mono text-[9px] text-paper-muted">
              {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
