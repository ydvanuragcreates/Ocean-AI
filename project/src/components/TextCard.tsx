import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Wand2 } from 'lucide-react';
import { DocumentSection } from '../services/api';

interface TextCardProps {
  section: DocumentSection;
  onUpdate: (updates: Partial<DocumentSection>) => void;
}

export default function TextCard({ section, onUpdate }: TextCardProps) {
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

  const handleLike = () => {
    const newLiked = liked === true ? null : true;
    setLiked(newLiked);
    onUpdate({ 
      feedback: newLiked === true ? 'like' : newLiked === false ? 'dislike' : undefined 
    });
  };

  const handleDislike = () => {
    const newLiked = liked === false ? null : false;
    setLiked(newLiked);
    onUpdate({ 
      feedback: newLiked === true ? 'like' : newLiked === false ? 'dislike' : undefined 
    });
  };

  const handleSaveComment = () => {
    onUpdate({ comments: comment });
    setShowComment(false);
  };

  const handleSaveContent = () => {
    onUpdate({ content: editedContent });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">{section.heading}</h3>
        
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none text-slate-700"
              rows={8}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(section.content);
                }}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p 
            className="text-slate-600 leading-relaxed mb-4 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {section.content}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              liked === true
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ThumbsUp size={16} />
            <span className="text-sm font-medium">Like</span>
          </button>

          <button
            onClick={handleDislike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              liked === false
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ThumbsDown size={16} />
            <span className="text-sm font-medium">Dislike</span>
          </button>

          <button
            onClick={() => setShowAIInstructions(!showAIInstructions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showAIInstructions
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Wand2 size={16} />
            <span className="text-sm font-medium">Refine</span>
          </button>

          <button
            onClick={() => setShowComment(!showComment)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showComment || section.comments
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare size={16} />
            <span className="text-sm font-medium">Comment</span>
          </button>
        </div>
      </div>

      {showAIInstructions && (
        <div className="px-6 pb-6">
          <div className="pt-4 border-t border-slate-200">
            <label htmlFor="aiInstructions" className="block text-sm font-medium text-slate-700 mb-2">
              AI Instructions
            </label>
            <textarea
              id="aiInstructions"
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              placeholder="E.g., Make this more concise, add more technical details, change the tone to casual..."
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowAIInstructions(false)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
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
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Refine Text
              </button>
            </div>
          </div>
        </div>
      )}

      {showComment && (
        <div className="px-6 pb-6">
          <div className="pt-4 border-t border-slate-200">
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback..."
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowComment(false)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComment}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
