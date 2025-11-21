import { FileText } from 'lucide-react';
import TextCard from './TextCard';
import { DocumentSection } from '../services/api';

interface EditorProps {
  sections: DocumentSection[];
  onUpdateSection: (sectionId: number, updates: Partial<DocumentSection>) => void;
}

export default function Editor({ sections, onUpdateSection }: EditorProps) {
  return (
    <div className="w-full h-full bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText size={24} className="text-slate-600" />
          <h2 className="text-2xl font-semibold text-slate-800">Editor</h2>
          <span className="text-sm text-slate-500 ml-auto">
            {sections.length} section{sections.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <TextCard
              key={section.id}
              section={section}
              onUpdate={(updates) => onUpdateSection(section.id, updates)}
            />
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4">
              <FileText size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500">
              No content generated yet. Configure your project and generate content to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
