import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, AlertTriangle, ShieldAlert, CheckCircle2, Clock, User } from 'lucide-react';
import { Post } from '@/src/types';
import { motion } from 'motion/react';

interface FeedProps {
  posts: Post[];
}

export default function Feed({ posts }: FeedProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'fire': return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10';
      case 'suspect': return 'text-amber-400 border-amber-400/50 bg-amber-400/10';
      case 'moldy': return 'text-red-400 border-red-400/50 bg-red-400/10';
      case 'pgr': return 'text-purple-400 border-purple-400/50 bg-purple-400/10';
      default: return 'text-slate-400 border-slate-400/50 bg-slate-400/10';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'fire': return <Zap className="w-4 h-4" />;
      case 'suspect': return <AlertTriangle className="w-4 h-4" />;
      case 'moldy': return <ShieldAlert className="w-4 h-4" />;
      case 'pgr': return <ShieldAlert className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-4 max-w-md mx-auto pb-24">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold tracking-tighter text-emerald-500 uppercase italic">Community Feed</h2>
          <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500/60">
            {posts.length} SCANS
          </Badge>
        </div>

        {posts.length === 0 && (
          <Card className="bg-slate-900/40 border-slate-800 p-4 text-sm text-slate-300">
            No live scans yet. Submit a scan to create the first real feed entry.
          </Card>
        )}

        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/40 border-slate-800 overflow-hidden group">
              <div className="p-3 flex items-center justify-between border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <User className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{post.userName}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-mono">
                  <Clock className="w-3 h-3" />
                  {formatTime(post.timestamp)}
                </div>
              </div>

              <div className="relative aspect-square">
                <img 
                  src={post.imageUrl} 
                  alt="Bud Scan" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={`uppercase font-bold tracking-tighter ${getQualityColor(post.quality)}`}>
                    <span className="mr-1">{getQualityIcon(post.quality)}</span>
                    {post.quality}
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{post.details}"
                </p>

                <div className="space-y-2">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Visual Analysis</div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {post.visualNotes}
                  </p>
                </div>

                {post.terpenes && post.terpenes.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {post.terpenes.map(t => (
                      <Badge key={t} variant="secondary" className="text-[9px] bg-slate-800 text-slate-400 border-none">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                {post.warnings.length > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase pt-2 border-t border-slate-800/50">
                    <ShieldAlert className="w-3 h-3" />
                    {post.warnings[0]} {post.warnings.length > 1 ? `(+${post.warnings.length - 1} more)` : ''}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
