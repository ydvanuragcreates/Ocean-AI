import { useState, useEffect } from 'react';
import { Download, ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { projectsAPI, aiAPI, sectionsAPI, Project, DocumentSection } from './services/api';

// Components
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ProjectConfig from './components/ProjectConfig';
import OutlineSetup from './components/OutlineSetup';
import Editor from './components/Editor';
import NeuralBackground from './components/3d/NeuralBackground';
import DocumentStack3D from './components/3d/DocumentStack3D';

export default function App() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<'config' | 'outline' | 'editor'>('config');
  
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

  // Load projects on mount
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
      
      // Load sections if they exist
      if (project.sections && project.sections.length > 0) {
        setSections(project.sections);
        setCurrentStep('editor');
      } else {
        setCurrentStep('config');
      }
      
      setDocType(project.doc_type);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleCreateProject = async (topic: string, type: 'docx' | 'pptx') => {
    try {
      setIsGeneratingOutline(true);
      setProjectTopic(topic);
      setDocType(type);
      
      console.log('Creating project...', { topic, type });
      
      // Create the project
      const newProject = await projectsAPI.create(topic, type);
      console.log('Project created:', newProject);
      setActiveProject(newProject);
      setProjects([...projects, newProject]);
      
      // Generate outline
      console.log('Generating outline...');
      const generatedOutline = await aiAPI.generateOutline(topic, type);
      console.log('Outline generated:', generatedOutline);
      setOutlineSections(generatedOutline);
      
      setCurrentStep('outline');
      console.log('Moved to outline step');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create project. Please try again.';
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
      
      // Generate content for each section
      for (let i = 0; i < outlineSections.length; i++) {
        const heading = outlineSections[i];
        const content = await aiAPI.generateSection(heading, projectTopic, docType);
        
        // Save section to backend
        const section = await sectionsAPI.create(
          activeProject.id,
          heading,
          content,
          i
        );
        
        generatedSections.push(section);
      }
      
      setSections(generatedSections);
      setCurrentStep('editor');
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGeneratingContent(false);
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div>Loading...</div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen text-slate-200 overflow-hidden">
      {/* 1. The 3D Background Layer */}
      <NeuralBackground />

      {/* 2. Sidebar */}
      <Sidebar 
        projects={projects.map(p => ({ id: p.id.toString(), name: p.title }))} 
        activeProject={activeProject?.id.toString() || null} 
        onProjectSelect={handleProjectSelect}
        onNewProject={handleNewProject}
        onDeleteProject={async (id) => {
          try {
            await projectsAPI.delete(Number(id));
            setProjects(projects.filter(p => p.id !== Number(id)));
            if (activeProject?.id === Number(id)) {
              setActiveProject(null);
              setSections([]);
              setCurrentStep('config');
            }
          } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project');
          }
        }}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Project</span>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {activeProject?.title || 'New Generation'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {activeProject && sections.length > 0 && (
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-600/90 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              >
                <Download size={16} />
                Export
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Center Panel: The Active Task */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode='wait'>
              {currentStep === 'config' && (
                <motion.div 
                  key="config"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col"
                >
                  <div className="flex-1 overflow-hidden">
                    <OutlineSetup 
                      sections={outlineSections}
                      onUpdateSections={setOutlineSections}
                    />
                  </div>
                  
                  <div className="p-4 border-t border-white/10 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm">
                    <button 
                      onClick={() => setCurrentStep('config')}
                      className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <span>←</span>
                      <span>Back to Config</span>
                    </button>
                    <button 
                      onClick={handleGenerateContent}
                      disabled={isGeneratingContent || outlineSections.length === 0}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed font-semibold shadow-lg"
                    >
                      {isGeneratingContent ? '✨ Generating Content...' : '🚀 Generate Full Text'}
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'editor' && (
                <motion.div 
                  key="editor"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                  {/* Back button header */}
                  <div className="px-6 py-3 border-b border-white/10 bg-slate-900/40 backdrop-blur-sm flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentStep('outline')}
                      className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <span>←</span>
                      <span>Back to Outline</span>
                    </button>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <span className="text-sm text-slate-500">
                      You can edit the outline and regenerate content
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <Editor 
                      sections={sections}
                      onUpdateSection={async (sectionId, updates) => {
                        try {
                          const updated = await sectionsAPI.update(sectionId, updates);
                          setSections(sections.map(s => s.id === sectionId ? updated : s));
                        } catch (error) {
                          console.error('Failed to update section:', error);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: The 3D Visualization - Only show on outline step */}
          {currentStep === 'outline' && (
            <div className="w-80 flex flex-col bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-lg shadow-blue-900/10">
              <div className="text-sm font-bold text-blue-400 mb-4 text-center uppercase tracking-wider flex items-center justify-center gap-2">
                <span>📊</span>
                <span>Live Document Preview</span>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden relative" style={{ minHeight: '450px' }}>
                <DocumentStack3D docType={docType} itemCount={outlineSections.length || 3} />
              </div>
              <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="text-center mb-2">
                  {docType === 'docx' ? (
                    <div className="text-sm font-semibold text-slate-300">📄 Standard A4 Format</div>
                  ) : (
                    <div className="text-sm font-semibold text-slate-300">📊 16:9 Widescreen Slides</div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-400">
                    {outlineSections.length}
                  </span>
                  <span className="text-sm text-slate-400 ml-2">
                    {docType === 'docx' ? 'Section' : 'Slide'}{outlineSections.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300 text-center">
                💡 Add or remove sections to see the stack update!
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
