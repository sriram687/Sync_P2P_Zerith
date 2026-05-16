'use client'

import React, { useEffect } from 'react'
import { RefreshCcw, Wifi } from 'lucide-react'
import { useSync } from '@/hooks/zerith'
import { cn } from '@/lib/utils'

export function SyncIndicator() {
  const { state, enable } = useSync()
  const [isSignaling, setIsSignaling] = React.useState(false)

  useEffect(() => {
    enable().then(() => setIsSignaling(true))
  }, [enable])

  const peerCount = state?.connectedPeers || 0
  const isConnected = peerCount > 0

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300">
      <div className={cn(
        "w-2 h-2 rounded-full transition-all duration-500",
        isConnected 
          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
          : isSignaling ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-zinc-600"
      )} />
      <span className="text-xs font-medium text-white/60">
        {isConnected 
          ? `${peerCount} ${peerCount === 1 ? 'Peer' : 'Peers'}` 
          : isSignaling ? 'Searching...' : 'Connecting...'}
      </span>
      {isConnected ? (
        <Wifi className="w-3 h-3 text-emerald-500/60" />
      ) : (
        <RefreshCcw className="w-3 h-3 text-white/20 animate-spin" />
      )}
    </div>
  )
}
