import { useState, useEffect } from 'react';
import { Settings, Sparkles } from 'lucide-react';

interface ConfigProps {
  onNext: (topic: string, type: 'docx' | 'pptx') => void;
  isLoading?: boolean;
  initialTopic?: string;
  initialDocType?: 'docx' | 'pptx';
}

export default function ProjectConfig({ onNext, isLoading = false, initialTopic = '', initialDocType = 'docx' }: ConfigProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [docType, setDocType] = useState<'docx' | 'pptx'>(initialDocType);

  // Update when initial values change
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialDocType) setDocType(initialDocType);
  }, [initialTopic, initialDocType]);

  const handleSubmit = () => {
    if (topic.trim()) {
      onNext(topic, docType);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Project Configuration</h2>
          <p className="text-slate-400 text-sm">Define the parameters for your AI document.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Topic or Title</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Market Analysis of EV Industry 2025"
            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-200 placeholder-slate-600 transition-all"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Document Format</label>
          <select 
            value={docType}
            onChange={(e) => setDocType(e.target.value as 'docx' | 'pptx')}
            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-200 cursor-pointer"
            disabled={isLoading}
          >
            <option value="docx">Microsoft Word (.docx)</option>
            <option value="pptx">PowerPoint Presentation (.pptx)</option>
          </select>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isLoading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 mt-4"
        >
          <Sparkles size={20} />
          {isLoading ? 'Initializing...' : 'Initialize AI Engine'}
        </button>
      </div>
    </div>
  );
}
