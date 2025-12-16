import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import ControlPanel from './components/ControlPanel';
import CollaborationPanel from './components/CollaborationPanel';
import Canvas from './components/Canvas';
import { Asset, MediaType, TimelineItem, GenerationConfig, Collaborator, Comment } from './types';
import { generateImage, generateVideo, generateSpeech } from './services/geminiService';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState('generate');
  const [activeMediaType, setActiveMediaType] = useState<MediaType>(MediaType.IMAGE);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // Drag and Drop state
  const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);

  // Collaboration State
  const [currentUser] = useState<Collaborator>({
    id: 'u1', name: 'You', initials: 'ME', color: 'bg-purple-600', role: 'editor', status: 'active'
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: 'u1', name: 'You', initials: 'ME', color: 'bg-purple-600', role: 'editor', status: 'active' },
    { id: 'u2', name: 'Alex Design', initials: 'AD', color: 'bg-green-600', role: 'editor', status: 'active' },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', userId: 'u2', text: 'Hey! I think we should try a neon cyberpunk vibe for the next scene.', timestamp: Date.now() - 3600000 },
  ]);

  // Simulate real-time update
  useEffect(() => {
    const timer = setTimeout(() => {
      const newComment: Comment = {
        id: 'c_mock',
        userId: 'u2',
        text: 'Just uploaded a new reference image for the avatar!',
        timestamp: Date.now()
      };
      setComments(prev => [...prev, newComment]);
    }, 15000); // Trigger after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleInvite = (email: string, role: 'viewer' | 'editor') => {
    const newCollab: Collaborator = {
      id: `u${Date.now()}`,
      name: email.split('@')[0],
      initials: email.substring(0, 2).toUpperCase(),
      color: 'bg-blue-500',
      role,
      status: 'pending',
      email
    };
    setCollaborators(prev => [...prev, newCollab]);
  };

  const handleAddComment = (text: string) => {
    const comment: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      text,
      timestamp: Date.now()
    };
    setComments(prev => [...prev, comment]);
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    setDraggedAsset(asset);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedAsset) {
      setActiveAsset(draggedAsset);
      // Also add to timeline if appropriate
      const newItem: TimelineItem = {
        id: Date.now().toString(),
        assetId: draggedAsset.id,
        trackId: draggedAsset.type === MediaType.AUDIO ? 3 : 1, // Simple mapping
        startTime: 0,
        duration: 5,
        name: draggedAsset.name,
        type: draggedAsset.type,
      };
      setTimelineItems(prev => [...prev, newItem]);
      setDraggedAsset(null);
    }
  };

  const handleGenerate = async (config: GenerationConfig) => {
    setIsGenerating(true);
    setGenerationProgress("Starting generation...");
    
    try {
      let resultUrl = '';
      let type = activeMediaType;

      if (activeMediaType === MediaType.IMAGE) {
        setGenerationProgress("Creating high-fidelity image...");
        resultUrl = await generateImage(config.prompt, config.aspectRatio, config.stylePreset || '');
      } 
      else if (activeMediaType === MediaType.VIDEO) {
        setGenerationProgress("Connecting to Veo model...");
        resultUrl = await generateVideo(
          config.prompt, 
          config.aspectRatio, 
          config.resolution,
          (msg) => setGenerationProgress(msg)
        );
      }
      else if (activeMediaType === MediaType.AUDIO) {
        setGenerationProgress("Synthesizing speech...");
        // Use default voice 'Kore' if not specified
        resultUrl = await generateSpeech(config.prompt, "Kore");
        type = MediaType.AUDIO;
      }

      const newAsset: Asset = {
        id: Date.now().toString(),
        type: type,
        url: resultUrl,
        name: `${type} - ${new Date().toLocaleTimeString()}`,
        createdAt: Date.now(),
        metadata: { prompt: config.prompt }
      };

      setAssets(prev => [newAsset, ...prev]);
      setActiveAsset(newAsset);
      setGenerationProgress("Done!");

    } catch (error: any) {
      console.error(error);
      setGenerationProgress(`Error: ${error.message || 'Generation failed'}`);
      // Clear error msg after 3s
      setTimeout(() => setGenerationProgress(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          activeTool={activeTool} 
          onToolChange={setActiveTool} 
          assets={assets}
          onDragStart={handleDragStart}
        />

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col relative z-0">
          <Canvas 
            activeAsset={activeAsset} 
            onDrop={handleCanvasDrop}
          />
        </div>

        {/* Right Controls: Toggle based on tool */}
        {activeTool === 'team' ? (
          <CollaborationPanel 
            collaborators={collaborators}
            comments={comments}
            onInvite={handleInvite}
            onAddComment={handleAddComment}
          />
        ) : (
          <ControlPanel 
            activeMediaType={activeMediaType}
            onMediaTypeChange={setActiveMediaType}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
          />
        )}
      </div>

      {/* Bottom Timeline */}
      <Timeline 
        items={timelineItems} 
        currentTime={0} 
        duration={15} 
      />
    </div>
  );
};

export default App;
