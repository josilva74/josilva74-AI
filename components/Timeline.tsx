import React from 'react';
import { TimelineItem, MediaType } from '../types';
import { Play, SkipBack, Plus } from 'lucide-react';

interface TimelineProps {
  items: TimelineItem[];
  currentTime: number; // in seconds
  duration: number; // total duration
}

const Timeline: React.FC<TimelineProps> = ({ items, currentTime, duration }) => {
  const tracks = [
    { id: 1, type: MediaType.VIDEO, label: 'Video Track' },
    { id: 2, type: MediaType.AVATAR, label: 'Avatar Overlay' },
    { id: 3, type: MediaType.AUDIO, label: 'Audio Track' },
  ];

  const pixelsPerSecond = 20;

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-700 flex flex-col">
      {/* Controls */}
      <div className="h-10 border-b border-slate-700 flex items-center px-4 gap-4 bg-slate-800">
        <button className="text-slate-300 hover:text-white"><SkipBack size={18} /></button>
        <button className="text-slate-300 hover:text-white"><Play size={18} /></button>
        <div className="text-xs text-slate-400 font-mono">00:00:00 / 00:00:15</div>
        <div className="flex-1"></div>
        <button className="text-xs flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-200">
          <Plus size={14} /> Add Track
        </button>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative flex">
        {/* Track Headers */}
        <div className="w-32 bg-slate-900 border-r border-slate-700 z-10 flex-shrink-0">
          {tracks.map(track => (
            <div key={track.id} className="h-16 border-b border-slate-800 flex items-center px-2 text-xs text-slate-400 font-medium">
              {track.label}
            </div>
          ))}
        </div>

        {/* Track Content */}
        <div className="flex-1 relative min-w-[800px] bg-slate-950">
          {/* Time Ruler */}
          <div className="h-6 border-b border-slate-800 flex items-end">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 border-l border-slate-800 h-2 text-[10px] text-slate-600 pl-1">
                {i}s
              </div>
            ))}
          </div>

          {/* Tracks */}
          <div className="relative">
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: `${currentTime * pixelsPerSecond}px` }}
            >
              <div className="w-3 h-3 bg-red-500 -ml-[5px] -mt-1.5 rotate-45 transform"></div>
            </div>

            {tracks.map(track => (
              <div key={track.id} className="h-16 border-b border-slate-800 relative group">
                {/* Empty state lines */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_19px,#334155_20px)] bg-[length:20px_100%]"></div>
                
                {items.filter(i => i.trackId === track.id).map(item => (
                  <div
                    key={item.id}
                    className={`absolute top-2 bottom-2 rounded-md border text-xs flex items-center px-2 overflow-hidden whitespace-nowrap
                      ${item.type === MediaType.VIDEO ? 'bg-blue-900/50 border-blue-700 text-blue-200' : 
                        item.type === MediaType.AUDIO ? 'bg-green-900/50 border-green-700 text-green-200' :
                        'bg-purple-900/50 border-purple-700 text-purple-200'}
                    `}
                    style={{
                      left: `${item.startTime * pixelsPerSecond}px`,
                      width: `${item.duration * pixelsPerSecond}px`
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
