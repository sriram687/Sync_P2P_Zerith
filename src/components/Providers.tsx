'use client'

import React from "react";
import { ZerithProvider } from "zerithdb-react";

const zerithConfig = {
  appId: "sync-p2p-kanban",
  sync: { 
    signalingUrl: "wss://signal.zerithdb.dev"
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ZerithProvider config={zerithConfig}>
      {children}
    </ZerithProvider>
  );
}
