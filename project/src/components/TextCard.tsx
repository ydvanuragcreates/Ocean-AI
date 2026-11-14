import { useState, useEffect, ReactNode } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Wand2, PenLine } from 'lucide-react';
import { DocumentSection } from '../services/api';

interface TextCardProps {
  section: DocumentSection;
  index: number;
  onUpdate: (updates: Partial<DocumentSection>) => void;
}

/** Render **bold** spans inside a line of AI text. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-paper-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

/** Turn plain AI output into paragraphs and bullet lists. */
function renderContent(content: string) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="space-y-2 pl-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
              <span>{inline(b)}</span>
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };
  content.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) return flush();
    const bullet = line.match(/^([-•*]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[2]);
    } else {
      flush();
      blocks.push(<p key={`p-${blocks.length}`}>{inline(line.replace(/^#+\s*/, ''))}</p>);
    }
  });
  flush();
  return blocks;
}

function ToolButton({
  label,
  active,
  activeClass,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  activeClass?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`rounded-full p-2 transition-colors ${
        active ? activeClass : 'text-paper-muted hover:bg-paper-edge/70 hover:text-paper-ink'
      }`}
    >
      {children}
    </button>
  );
}

export default function TextCard({ section, index, onUpdate }: TextCardProps) {
  const [liked, setLiked] = useState<boolean | null>(
    section.feedback === 'like' ? true : section.feedback === 'dislike' ? false : null
  );
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState(section.comments || '');
  const [showAIInstructions, setShowAIInstructions] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(section.content);

  useEffect(() => {
    setLiked(section.feedback === 'like' ? true : section.feedback === 'dislike' ? false : null);
    setComment(section.comments || '');
    setEditedContent(section.content);
  }, [section]);

  const setFeedback = (value: boolean | null) => {
    setLiked(value);
    onUpdate({ feedback: value === true ? 'like' : value === false ? 'dislike' : undefined });
  };

  const handleSaveComment = () => {
    onUpdate({ comments: comment });
    setShowComment(false);
  };

  const handleSaveContent = () => {
    onUpdate({ content: editedContent });
    setIsEditing(false);
  };

  const anyPanelOpen = showComment || showAIInstructions || isEditing;

  return (
    <section className="group relative">
      {/* Heading row with margin toolbar */}
      <div className="flex items-baseline gap-4">
        <span className="w-8 shrink-0 font-mono text-xs text-paper-faint">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="flex-1 font-serif text-[30px] leading-tight text-paper-ink">{section.heading}</h2>
        <div
          className={`flex shrink-0 items-center gap-0.5 self-center rounded-full border border-paper-edge bg-paper px-1 py-0.5 transition-opacity ${
            anyPanelOpen || liked !== null ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
          }`}
        >
          <ToolButton
            label="Good section"
            active={liked === true}
            activeClass="bg-emerald-100 text-emerald-700"
            onClick={() => setFeedback(liked === true ? null : true)}
          >
            <ThumbsUp size={15} />
          </ToolButton>
          <ToolButton
            label="Needs work"
            active={liked === false}
            activeClass="bg-rose-100 text-rose-700"
            onClick={() => setFeedback(liked === false ? null : false)}
          >
            <ThumbsDown size={15} />
          </ToolButton>
          <span className="mx-1 h-4 w-px bg-paper-edge" />
          <ToolButton
            label="Edit text"
            active={isEditing}
            activeClass="bg-paper-ink text-paper"
            onClick={() => setIsEditing(!isEditing)}
          >
            <PenLine size={15} />
          </ToolButton>
          <ToolButton
            label="Ask AI to refine"
            active={showAIInstructions}
            activeClass="bg-ink/15 text-ink-deep"
            onClick={() => setShowAIInstructions(!showAIInstructions)}
          >
            <Wand2 size={15} />
          </ToolButton>
          <ToolButton
            label="Comment"
            active={showComment}
            activeClass="bg-amber-100 text-amber-800"
            onClick={() => setShowComment(!showComment)}
          >
            <MessageSquare size={15} />
          </ToolButton>
        </div>
      </div>

      <div className="mt-4 pl-12">
        {isEditing ? (
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={10}
              autoFocus
              className="w-full resize-y rounded-lg border border-paper-edge bg-white p-4 text-[16px] leading-[1.75] text-paper-ink/90 focus:border-paper-ink/40 focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(section.content);
                }}
                className="rounded-full px-4 py-1.5 text-sm text-paper-muted hover:text-paper-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                className="rounded-full bg-paper-ink px-4 py-1.5 text-sm font-medium text-paper hover:bg-black"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to edit"
            className="space-y-4 text-[16px] leading-[1.75] text-paper-ink/80"
          >
            {renderContent(section.content || '')}
          </div>
        )}

        {/* Ask the AI to revise */}
        {showAIInstructions && (
          <div className="mt-6 rounded-lg border-l-2 border-ink bg-ink/[0.06] p-4">
            <label
              htmlFor={`refine-${section.id}`}
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-deep"
            >
              <Wand2 size={12} /> Ask AI to revise
            </label>
            <textarea
              id={`refine-${section.id}`}
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              placeholder="Make it more concise, add numbers, use a friendlier tone…"
              rows={3}
              className="mt-2 w-full resize-none rounded-md border border-ink/20 bg-white p-3 text-sm text-paper-ink focus:border-ink focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowAIInstructions(false)}
                className="rounded-full px-4 py-1.5 text-sm text-paper-muted hover:text-paper-ink"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement AI refinement
                  alert('AI refinement feature coming soon!');
                  setAiInstructions('');
                  setShowAIInstructions(false);
                }}
                className="rounded-full bg-ink-deep px-4 py-1.5 text-sm font-medium text-white hover:bg-ink"
              >
                Refine
              </button>
            </div>
          </div>
        )}

        {/* Margin note */}
        {showComment ? (
          <div className="mt-6 rounded-lg border-l-2 border-amber-500 bg-amber-50 p-4">
            <label
              htmlFor={`comment-${section.id}`}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber-800"
            >
              Note
            </label>
            <textarea
              id={`comment-${section.id}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a note on this section…"
              rows={3}
              className="mt-2 w-full resize-none rounded-md border border-amber-200 bg-white p-3 text-sm text-paper-ink focus:border-amber-500 focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowComment(false)}
                className="rounded-full px-4 py-1.5 text-sm text-paper-muted hover:text-paper-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComment}
                className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Save note
              </button>
            </div>
          </div>
        ) : (
          section.comments && (
            <button
              onClick={() => setShowComment(true)}
              className="mt-6 block w-full rounded-lg border-l-2 border-amber-500 bg-amber-50/70 px-4 py-3 text-left"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-800">Note</span>
              <p className="mt-1 font-serif text-lg italic text-paper-ink/80">{section.comments}</p>
            </button>
          )
        )}
      </div>
    </section>
  );
}
