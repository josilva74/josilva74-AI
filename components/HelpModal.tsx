
import React, { useState } from 'react';
// Fix: Import FolderPlus icon which was used but missing from imports
import { X, Book, Image as ImageIcon, Video, Mic, Folder, Command, HelpCircle, ChevronRight, FolderPlus } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('basics');

  const categories = [
    { id: 'basics', label: 'Basics', icon: <Book size={16} /> },
    { id: 'imaging', label: 'AI Imaging', icon: <ImageIcon size={16} /> },
    { id: 'video', label: 'Video Studio', icon: <Video size={16} /> },
    { id: 'voice', label: 'Voice & TTS', icon: <Mic size={16} /> },
    { id: 'folders', label: 'Organization', icon: <Folder size={16} /> },
    { id: 'shortcuts', label: 'Shortcuts', icon: <Command size={16} /> },
  ];

  const content: Record<string, React.ReactNode> = {
    basics: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Welcome to Aether</h3>
        <p className="text-sm text-slate-400 leading-relaxed">Aether Studio is an integrated AI production suite powered by Google Gemini and Veo. You can generate assets, organize them into folders, and edit them using natural language.</p>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Live Canvas</h4>
            <p className="text-xs text-slate-500">Drag assets from the library to the canvas to view or edit them.</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Dual Timeline</h4>
            <p className="text-xs text-slate-500">Sequence your AI creations across multiple tracks for video production.</p>
          </div>
        </div>
      </div>
    ),
    imaging: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Image Generation & Editing</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Pro Generation</p>
              <p className="text-xs text-slate-400">Use 'gemini-3-pro-image-preview' for 1K, 2K, and 4K high-fidelity generations.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Image Editing</p>
              <p className="text-xs text-slate-400">Upload a source image, then enter a prompt like "Add a red hat" to modify it.</p>
            </div>
          </div>
        </div>
      </div>
    ),
    folders: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Asset Organization</h3>
        <p className="text-sm text-slate-400">Keep your production tidy using the Media Library.</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-xs text-slate-300">
            <ChevronRight size={12} className="text-blue-500"/>
            Create folders using the <FolderPlus size={12}/> icon in the sidebar.
          </li>
          <li className="flex items-center gap-2 text-xs text-slate-300">
            <ChevronRight size={12} className="text-blue-500"/>
            Move assets by dragging them onto a folder header.
          </li>
          <li className="flex items-center gap-2 text-xs text-slate-300">
            <ChevronRight size={12} className="text-blue-500"/>
            Right-click a folder to rename or delete it.
          </li>
        </ul>
      </div>
    ),
    shortcuts: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { key: 'Ctrl + N', action: 'New Project' },
            { key: 'Ctrl + S', action: 'Save Project' },
            { key: 'Ctrl + I', action: 'Import Media' },
            { key: 'Space', action: 'Play/Pause Timeline' },
            { key: 'Delete', action: 'Delete Selected Asset' },
          ].map(s => (
            <div key={s.key} className="flex justify-between items-center bg-slate-800/30 p-2 rounded border border-slate-700/50">
              <span className="text-[10px] font-mono text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">{s.key}</span>
              <span className="text-xs text-slate-400">{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Help Sidebar */}
        <div className="w-64 border-r border-slate-800 flex flex-col p-6 bg-slate-900/50">
          <div className="flex items-center gap-2 text-blue-400 mb-8">
            <HelpCircle size={20} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Manual</span>
          </div>
          <nav className="space-y-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === cat.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Help Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
          <div className="p-4 flex justify-end">
            <button onClick={onClose} className="text-slate-500 hover:text-white bg-slate-800 p-1.5 rounded-full">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            {content[activeTab] || content['basics']}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
