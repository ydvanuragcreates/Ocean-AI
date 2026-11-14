import { useState, useEffect } from 'react';
import { Download, LogOut, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { projectsAPI, aiAPI, sectionsAPI, Project, DocumentSection } from './services/api';

// Components
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ProjectConfig from './components/ProjectConfig';
import OutlineSetup from './components/OutlineSetup';
import Editor from './components/Editor';
import { Logo, PreviewStack } from './components/DocVisuals';

type Step = 'config' | 'outline' | 'editor';

const STEPS: { key: Step; label: string }[] = [
  { key: 'config', label: 'Brief' },
  { key: 'outline', label: 'Outline' },
  { key: 'editor', label: 'Draft' },
];

export default function App() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('config');

  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);

  // Config state
  const [projectTopic, setProjectTopic] = useState('');
  const [docType, setDocType] = useState<'docx' | 'pptx'>('docx');

  // Outline state
  const [outlineSections, setOutlineSections] = useState<string[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // Editor state
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      const projectList = await projectsAPI.getAll();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    try {
      const project = await projectsAPI.getById(Number(projectId));
      setActiveProject(project);
      setProjectTopic(project.title);
      setDocType(project.doc_type);

      if (project.sections && project.sections.length > 0) {
        setSections(project.sections);
        setOutlineSections(project.sections.map((s) => s.heading));
        setCurrentStep('editor');
      } else {
        setSections([]);
        setOutlineSections([]);
        setCurrentStep('config');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleCreateProject = async (topic: string, type: 'docx' | 'pptx') => {
    try {
      setIsGeneratingOutline(true);
      setProjectTopic(topic);
      setDocType(type);

      const newProject = await projectsAPI.create(topic, type);
      setActiveProject(newProject);
      setProjects((prev) => [...prev, newProject]);

      const generatedOutline = await aiAPI.generateOutline(topic, type);
      setOutlineSections(generatedOutline);
      setCurrentStep('outline');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to create project. Please try again.';
      alert('Error: ' + errorMessage);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!activeProject) return;

    try {
      setIsGeneratingContent(true);
      const generatedSections: DocumentSection[] = [];
      const headings = outlineSections.filter((h) => h.trim());

      for (let i = 0; i < headings.length; i++) {
        setGeneratingIndex(i);
        const heading = headings[i];
        const content = await aiAPI.generateSection(heading, projectTopic, docType);
        const section = await sectionsAPI.create(activeProject.id, heading, content, i);
        generatedSections.push(section);
      }

      setSections(generatedSections);
      setCurrentStep('editor');
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGeneratingContent(false);
      setGeneratingIndex(null);
    }
  };

  const handleExport = async () => {
    if (!activeProject) return;
    try {
      const blob = await projectsAPI.export(activeProject.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.title}.${activeProject.doc_type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export document. Please try again.');
    }
  };

  const handleNewProject = () => {
    setActiveProject(null);
    setSections([]);
    setOutlineSections([]);
    setProjectTopic('');
    setCurrentStep('config');
  };

  const stepAvailable = (step: Step) =>
    !isGeneratingContent &&
    !isGeneratingOutline &&
    (step === 'config' || (step === 'outline' && outlineSections.length > 0) || (step === 'editor' && sections.length > 0));

  if (authLoading) {
    return (
      <div className="desk-bg flex h-screen flex-col items-center justify-center gap-4">
        <Logo size={36} />
        <div className="h-1 w-24 rounded-full ai-shimmer-dark" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);
  const total = outlineSections.filter((h) => h.trim()).length;

  return (
    <div className="desk-bg flex h-screen overflow-hidden text-slate-200">
      <Sidebar
        projects={projects.map((p) => ({ id: p.id.toString(), name: p.title, docType: p.doc_type }))}
        activeProject={activeProject?.id.toString() || null}
        onProjectSelect={handleProjectSelect}
        onNewProject={handleNewProject}
        onDeleteProject={async (id) => {
          try {
            await projectsAPI.delete(Number(id));
            setProjects(projects.filter((p) => p.id !== Number(id)));
            if (activeProject?.id === Number(id)) handleNewProject();
          } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project');
          }
        }}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-6 border-b border-white/[0.07] px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Library</span>
            <span className="text-slate-600">/</span>
            <span className="truncate font-serif text-xl text-white">
              {activeProject?.title || projectTopic || 'Untitled document'}
            </span>
          </div>

          {/* Stepper */}
          <nav aria-label="Progress" className="hidden lg:flex items-center gap-2">
            {STEPS.map((step, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={step.key} className="flex items-center gap-2">
                  {i > 0 && <span className={`h-px w-8 ${i <= currentIdx ? 'bg-ink/60' : 'bg-white/10'}`} />}
                  <button
                    onClick={() => stepAvailable(step.key) && setCurrentStep(step.key)}
                    disabled={!stepAvailable(step.key)}
                    aria-current={active ? 'step' : undefined}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors disabled:cursor-default ${
                      active ? 'bg-white/[0.07] text-white' : done ? 'text-slate-300 hover:text-white' : 'text-slate-600'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${
                        active ? 'bg-ink text-white' : done ? 'bg-ink/20 text-ink-soft' : 'border border-white/15'
                      }`}
                    >
                      {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                    </span>
                    {step.label}
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {activeProject && sections.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-sm font-medium text-paper-ink transition-colors hover:bg-white"
              >
                <Download size={15} />
                Export .{activeProject.doc_type}
              </button>
            )}
            <button
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* The desk */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                className="flex min-h-full items-center justify-center px-6 py-12"
              >
                <ProjectConfig
                  onNext={handleCreateProject}
                  isLoading={isGeneratingOutline}
                  initialTopic={projectTopic}
                  initialDocType={docType}
                />
              </motion.div>
            )}

            {currentStep === 'outline' && (
              <motion.div
                key="outline"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_300px]"
              >
                <div className="min-w-0">
                  <OutlineSetup
                    sections={outlineSections}
                    onUpdateSections={setOutlineSections}
                    docType={docType}
                    title={projectTopic}
                    disabled={isGeneratingContent}
                  />

                  {/* Actions */}
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={() => setCurrentStep('config')}
                      disabled={isGeneratingContent}
                      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
                    >
                      <ArrowLeft size={16} /> Back to brief
                    </button>

                    {isGeneratingContent && generatingIndex !== null ? (
                      <div className="flex min-w-[280px] flex-1 items-center gap-4 sm:flex-none" aria-live="polite">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3 font-mono text-xs">
                            <span className="truncate text-ink-soft">
                              Writing “{outlineSections.filter((h) => h.trim())[generatingIndex]}”
                            </span>
                            <span className="shrink-0 text-slate-500">
                              {generatingIndex + 1}/{total}
                            </span>
                          </div>
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              className="h-full rounded-full bg-ink"
                              animate={{ width: `${((generatingIndex + 0.5) / total) * 100}%` }}
                              transition={{ ease: 'easeOut', duration: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateContent}
                        disabled={total === 0}
                        className="flex items-center gap-2.5 rounded-full bg-paper px-6 py-3 text-sm font-medium text-paper-ink transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(139,123,255,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Sparkles size={16} className="text-ink-deep" />
                        Write the {docType === 'docx' ? 'document' : 'slides'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Live preview */}
                <aside className="lg:sticky lg:top-10 lg:self-start">
                  <div className="rounded-2xl border border-white/[0.07] bg-desk-raised/70 p-4 backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Preview</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {docType === 'docx' ? 'A4' : '16:9'} · {total} {docType === 'docx' ? 'pp.' : 'slides'}
                      </span>
                    </div>
                    <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                      <PreviewStack docType={docType} sections={outlineSections.filter((h) => h.trim())} activeIndex={generatingIndex} />
                    </div>
                  </div>
                </aside>
              </motion.div>
            )}

            {currentStep === 'editor' && (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                className="mx-auto max-w-4xl px-6 py-10"
              >
                <button
                  onClick={() => setCurrentStep('outline')}
                  className="mb-6 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ArrowLeft size={16} /> Back to outline
                </button>
                <Editor
                  title={activeProject?.title || projectTopic}
                  docType={docType}
                  sections={sections}
                  onUpdateSection={async (sectionId, updates) => {
                    try {
                      const updated = await sectionsAPI.update(sectionId, updates);
                      setSections((prev) => prev.map((s) => (s.id === sectionId ? updated : s)));
                    } catch (error) {
                      console.error('Failed to update section:', error);
                    }
                  }}
                />
                <p className="mt-6 text-center font-mono text-[11px] text-slate-600">
                  Hover a section to rate, edit, refine or comment · double-click text to edit
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
