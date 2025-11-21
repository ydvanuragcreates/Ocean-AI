import { useState, useEffect } from 'react';
import { Plus, Trash2, ListChecks } from 'lucide-react';

interface Props {
  sections: string[];
  onUpdateSections: (sections: string[]) => void;
}

export default function OutlineSetup({ sections, onUpdateSections }: Props) {
  const [localSections, setLocalSections] = useState<string[]>(sections);
  const [newSection, setNewSection] = useState('');

  // Update local state when prop changes
  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  // Notify parent of changes
  useEffect(() => {
    onUpdateSections(localSections);
  }, [localSections, onUpdateSections]);

  const addSection = () => {
    if (newSection.trim()) {
      setLocalSections([...localSections, newSection.trim()]);
      setNewSection('');
    }
  };

  const removeSection = (index: number) => {
    setLocalSections(localSections.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSection();
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto text-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <ListChecks size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold">Outline Setup</h2>
        <span className="text-sm text-slate-500 ml-auto">
          {localSections.length} section{localSections.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Add Section Header
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter section name..."
              className="flex-1 px-3 py-2.5 bg-slate-950/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={addSection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {localSections.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No sections yet. Add some sections to get started.
            </div>
          ) : (
            localSections.map((section, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <span className="text-blue-400 font-bold text-xs w-6 text-center">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{section}</span>
                <button 
                  onClick={() => removeSection(index)} 
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
