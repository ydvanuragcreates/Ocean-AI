import { Plus, Trash2, FileText, Presentation } from 'lucide-react';
import { Logo, DocType } from './DocVisuals';

interface Project {
  id: string;
  name: string;
  docType?: DocType;
}

interface SidebarProps {
  projects: Project[];
  activeProject: string | null;
  onProjectSelect: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
}

export default function Sidebar({ projects, activeProject, onProjectSelect, onNewProject, onDeleteProject }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-72 h-screen shrink-0 flex-col border-r border-white/[0.07] bg-desk-raised/80 backdrop-blur-xl">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <Logo size={30} />
          <div className="leading-none">
            <div className="font-serif text-[22px] text-white">Ocean AI</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Documents</div>
          </div>
        </div>

        <button
          onClick={onNewProject}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-paper px-4 py-2.5 text-sm font-medium text-paper-ink transition-all hover:bg-white hover:shadow-[0_0_24px_rgba(246,243,236,0.15)]"
        >
          <Plus size={16} />
          New document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <h2 className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Library</h2>

        {projects.length === 0 ? (
          <div className="mx-2 mt-2 rounded-lg border border-dashed border-white/10 px-4 py-8 text-center">
            <FileText size={20} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">Your documents will be filed here.</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {[...projects].reverse().map((project) => {
              const active = activeProject === project.id;
              const Icon = project.docType === 'pptx' ? Presentation : FileText;
              return (
                <li
                  key={project.id}
                  className={`group relative flex items-center rounded-lg transition-colors ${
                    active ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-ink" />}
                  <button
                    onClick={() => onProjectSelect(project.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                  >
                    <Icon size={16} className={`shrink-0 ${active ? 'text-ink-soft' : ''}`} />
                    <span className="truncate text-sm">{project.name}</span>
                    {project.docType && (
                      <span className="ml-auto shrink-0 rounded border border-white/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-slate-500 group-hover:hidden">
                        {project.docType}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${project.name}"?`)) onDeleteProject(project.id);
                    }}
                    className="mr-2 hidden shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-rose-500/15 hover:text-rose-400 group-hover:block"
                    aria-label={`Delete ${project.name}`}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
