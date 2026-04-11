/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import Scanner from './components/Scanner';
import Feed from './components/Feed';
import { Post, MOCK_POSTS } from './types';
import { ScanResult } from './services/gemini';
import { Camera, LayoutGrid, Leaf } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const handleNewPost = (result: ScanResult, image: string) => {
    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      imageUrl: image,
      quality: result.quality,
      details: result.details,
      visualNotes: result.visualNotes,
      warnings: result.warnings,
      terpenes: result.terpenes,
      userName: 'GuestUser_' + Math.floor(Math.random() * 1000)
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans selection:bg-emerald-500/30">
      <div className="max-w-md mx-auto h-screen flex flex-col relative overflow-hidden border-x border-slate-900">
        {/* Header */}
        <header className="p-4 flex items-center justify-between border-b border-slate-900 bg-black/50 backdrop-blur-md z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic text-emerald-500">
              BudScan <span className="text-slate-500">AI</span>
            </h1>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </header>

        <Tabs defaultValue="scanner" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <TabsContent value="scanner" className="h-full m-0 p-0">
              <Scanner onPost={handleNewPost} />
            </TabsContent>
            <TabsContent value="feed" className="h-full m-0 p-0">
              <Feed posts={posts} />
            </TabsContent>
          </div>

          {/* Bottom Navigation */}
          <TabsList className="h-20 bg-black/80 backdrop-blur-xl border-t border-slate-900 grid grid-cols-2 p-2 gap-2 rounded-none">
            <TabsTrigger 
              value="scanner" 
              className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-500 flex flex-col gap-1 transition-all duration-300"
            >
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Scanner</span>
            </TabsTrigger>
            <TabsTrigger 
              value="feed" 
              className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-500 flex flex-col gap-1 transition-all duration-300"
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Feed</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Toaster position="top-center" theme="dark" closeButton />
    </div>
  );
}
