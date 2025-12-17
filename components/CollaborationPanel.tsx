import React, { useState } from 'react';
import { Collaborator, Comment } from '../types';
import { Send, UserPlus, Clock, MoreHorizontal } from 'lucide-react';

interface CollaborationPanelProps {
  collaborators: Collaborator[];
  comments: Comment[];
  onInvite: (email: string, role: 'viewer' | 'editor') => void;
  onAddComment: (text: string) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ 
  collaborators, 
  comments, 
  onInvite, 
  onAddComment 
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('editor');
  const [newComment, setNewComment] = useState('');

  const handleInvite = () => {
    if (inviteEmail) {
      onInvite(inviteEmail, inviteRole);
      setInviteEmail('');
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const getUser = (userId: string) => collaborators.find(c => c.id === userId) || { 
    name: 'Unknown', 
    initials: '??', 
    color: 'bg-slate-500' 
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Team & Comments</h2>
      </div>

      {/* Collaborators List */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500">Collaborators</h3>
          <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">{collaborators.length}</span>
        </div>
        
        <div className="space-y-3 mb-4">
          {collaborators.map(c => (
            <div key={c.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{c.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{c.role} • {c.status}</p>
              </div>
              <button className="text-slate-500 hover:text-slate-300">
                <MoreHorizontal size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Invite Form */}
        <div className="bg-slate-800 p-2 rounded-md space-y-2">
          <input 
            type="email" 
            value={inviteEmail}
            // Fix: Cast target to any for value property access
            onChange={(e) => setInviteEmail((e.target as any).value)}
            placeholder="Invite by email..." 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <select 
              value={inviteRole}
              // Fix: Cast target to any for value property access
              onChange={(e) => setInviteRole((e.target as any).value as any)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button 
              onClick={handleInvite}
              disabled={!inviteEmail}
              className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded flex items-center justify-center w-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Feed */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-slate-800 bg-slate-900/50">
           <h3 className="text-xs font-semibold text-slate-500">Project Activity</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 && (
             <div className="text-center py-8 text-slate-600 italic text-xs">
               No comments yet. Start the conversation!
             </div>
          )}
          {comments.map(comment => {
            const user = getUser(comment.userId);
            return (
              <div key={comment.id} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`w-6 h-6 rounded-full ${user.color} flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-1`}>
                  {user.initials}
                </div>
                <div className="flex-1 bg-slate-800 rounded-lg rounded-tl-none p-2 border border-slate-700">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300">{user.name}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleComment} className="p-3 border-t border-slate-800 bg-slate-800">
          <div className="relative">
            <input 
              type="text" 
              value={newComment}
              // Fix: Cast target to any for value property access
              onChange={(e) => setNewComment((e.target as any).value)}
              placeholder="Add a comment..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-4 pr-10 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="absolute right-1 top-1 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:bg-slate-700 transition-all"
            >
              <Send size={12} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollaborationPanel;