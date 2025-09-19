import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Hand, Heart, ThumbsUp, Smile } from 'lucide-react';

interface Reaction {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

const StreamingReactions: React.FC = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Clean up old reactions
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions(prev => prev.filter(reaction => now - reaction.timestamp < 3000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addReaction = (type: string, emoji: string) => {
    const reaction: Reaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      emoji,
      x: Math.random() * 80 + 10, // Random position from 10% to 90%
      y: Math.random() * 60 + 20, // Random position from 20% to 80%
      timestamp: Date.now()
    };

    setReactions(prev => [...prev, reaction]);
    setShowPanel(false);
  };

  const reactionTypes = [
    { type: 'hand', emoji: '✋', icon: Hand, label: 'Levantar Mão' },
    { type: 'heart', emoji: '❤️', icon: Heart, label: 'Curtir' },
    { type: 'thumbs', emoji: '👍', icon: ThumbsUp, label: 'Aprovação' },
    { type: 'smile', emoji: '😊', icon: Smile, label: 'Sorriso' },
  ];

  return (
    <>
      {/* Reactions floating on screen */}
      <div className="fixed inset-0 pointer-events-none z-30">
        {reactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute text-4xl animate-bounce"
            style={{
              left: `${reaction.x}%`,
              top: `${reaction.y}%`,
              animation: 'reaction-float 3s ease-out forwards'
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Reactions panel */}
      <div className="fixed right-4 bottom-24 z-40">
        {showPanel && (
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 mb-2 shadow-lg border border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {reactionTypes.map(({ type, emoji, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => addReaction(type, emoji)}
                  className="flex flex-col items-center gap-1 text-white hover:bg-gray-700 h-auto py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowPanel(!showPanel)}
          className="w-12 h-12 rounded-full p-0"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </div>

      <style>{`
        @keyframes reaction-float {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-50px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.8);
          }
        }
      `}</style>
    </>
  );
};

export default StreamingReactions;