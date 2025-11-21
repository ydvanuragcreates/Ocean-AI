import { FolderOpen, Plus, Layout, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
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
    <aside className="w-64 h-screen flex flex-col bg-slate-900/40 backdrop-blur-xl border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-6 text-blue-400">
          <Layout size={24} />
          <span className="font-bold text-lg tracking-wide text-white">OCEAN AI</span>
        </div>
        <button 
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
          My Projects
        </h2>

        <div className="space-y-1">
          {projects.length === 0 ? (
            <div className="text-center py-8 px-2 text-slate-500 text-sm">
              No projects yet. Create your first project!
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg transition-all group ${
                  activeProject === project.id
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <button
                  onClick={() => onProjectSelect(project.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <FolderOpen size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${project.name}"?`)) {
                      onDeleteProject(project.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                  title="Delete project"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
