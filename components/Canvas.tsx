import React from 'react';
import { Asset, MediaType } from '../types';
import { Play } from 'lucide-react';

interface CanvasProps {
  activeAsset: Asset | null;
  onDrop: (e: React.DragEvent) => void;
}

const Canvas: React.FC<CanvasProps> = ({ activeAsset, onDrop }) => {
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden"
      onDrop={onDrop}
      onDragOver={handleDragOver}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      ></div>

      {!activeAsset && (
        <div className="text-center text-slate-500">
          <p className="mb-2 text-lg font-medium">Canvas Empty</p>
          <p className="text-sm">Generate media or drag from library</p>
        </div>
      )}

      {activeAsset && activeAsset.type === MediaType.IMAGE && (
        <img 
          src={activeAsset.url} 
          alt="Preview" 
          className="max-w-[90%] max-h-[90%] object-contain shadow-2xl rounded-sm border border-slate-800"
        />
      )}

      {activeAsset && activeAsset.type === MediaType.VIDEO && (
        <div className="relative max-w-[90%] max-h-[90%] shadow-2xl rounded-sm border border-slate-800 aspect-video bg-black">
          <video 
            src={activeAsset.url} 
            controls 
            className="w-full h-full"
            autoPlay
            loop
          />
        </div>
      )}

      {activeAsset && activeAsset.type === MediaType.AUDIO && (
         <div className="w-96 h-48 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center shadow-2xl p-6">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-blue-400">
              <Play size={32} fill="currentColor" />
            </div>
            <p className="text-slate-300 font-medium truncate w-full text-center mb-4">{activeAsset.name}</p>
            <audio controls src={activeAsset.url} className="w-full" />
         </div>
      )}
    </div>
  );
};

export default Canvas;
