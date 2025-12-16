import React from 'react';
import { Asset, MediaType } from '../types';
import { Image, Video, Music, User, Plus, Users } from 'lucide-react';

interface SidebarProps {
  activeTool: string;
  onToolChange: (tool: any) => void;
  assets: Asset[];
  onDragStart: (e: React.DragEvent, asset: Asset) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolChange, assets, onDragStart }) => {
  
  const tools = [
    { id: 'generate', label: 'Generator', icon: <Plus size={20} /> },
    { id: 'avatar', label: 'Avatars', icon: <User size={20} /> },
    { id: 'team', label: 'Team', icon: <Users size={20} /> },
  ];

  const filterAssets = (type: MediaType) => assets.filter(a => a.type === type);

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      {/* Brand */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Aether Studio
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-700">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex-1 p-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              activeTool === tool.id 
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tool.icon}
            {tool.label}
          </button>
        ))}
      </div>

      {/* Asset Library */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Media Library</h3>
        
        {/* Images */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <Image size={14} /> <span className="text-sm">Images</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filterAssets(MediaType.IMAGE).map(asset => (
              <div 
                key={asset.id} 
                draggable 
                onDragStart={(e) => onDragStart(e, asset)}
                className="aspect-square bg-slate-800 rounded-md overflow-hidden border border-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-500 transition-all"
              >
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Videos */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <Video size={14} /> <span className="text-sm">Videos</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filterAssets(MediaType.VIDEO).map(asset => (
              <div 
                key={asset.id}
                draggable
                onDragStart={(e) => onDragStart(e, asset)}
                className="aspect-video bg-slate-800 rounded-md overflow-hidden border border-slate-700 cursor-grab relative group"
              >
                <video src={asset.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Video className="text-white" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio/TTS */}
        <div>
          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <Music size={14} /> <span className="text-sm">Audio</span>
          </div>
          <div className="flex flex-col gap-2">
             {filterAssets(MediaType.AUDIO).map(asset => (
              <div 
                key={asset.id}
                draggable
                onDragStart={(e) => onDragStart(e, asset)}
                className="p-2 bg-slate-800 rounded border border-slate-700 cursor-grab flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                  <Music size={14} className="text-slate-400" />
                </div>
                <span className="text-xs text-slate-300 truncate w-24">{asset.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
