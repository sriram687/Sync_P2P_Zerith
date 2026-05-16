'use client'

import { useState, useEffect, useCallback } from 'react';
import { useZerith as useZerithInternal } from 'zerithdb-react';
import { EventEmitter } from 'zerithdb-core';

/**
 * A shared event emitter to notify hooks of local database changes.
 */
const localDbEvents = new EventEmitter<{ 'change': null }>();

/**
 * Access the underlying ZerithDB client.
 */
export const useZerith = useZerithInternal;

/**
 * Reactive hook for sync status and controls.
 */
export function useSync() {
  const app = useZerith();
  const [state, setState] = useState({
    ...app.sync.state,
    connectedPeers: app.network.connectedPeerCount
  });

  useEffect(() => {
    const refreshState = () => {
      setState({
        ...app.sync.state,
        connectedPeers: app.network.connectedPeerCount
      });
    };

    app.sync.on('state:change', refreshState);
    app.network.on('peer:connected', refreshState);
    app.network.on('peer:disconnected', refreshState);
    
    refreshState();

    return () => {
      app.sync.off('state:change', refreshState);
      app.network.off('peer:connected', refreshState);
      app.network.off('peer:disconnected', refreshState);
    };
  }, [app]);

  return {
    state,
    enable: useCallback(async () => {
      app.sync.enable();
      try {
        await app.network.connect(app.config.appId);
      } catch (err) {
        console.error("Failed to connect to ZerithDB signaling room:", err);
      }
    }, [app]),
    disable: useCallback(() => app.sync.disable(), [app])
  };
}

/**
 * Reactive hook to query a collection and perform mutations.
 */
export function useQuery<T = any>(collectionName: string) {
  const app = useZerith();
  const collection = app.db(collectionName);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    try {
      const docs = await collection.find({});
      // Sort by timestamp if available to keep a stable UI
      setData(docs.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    fetchDocs();

    const refresh = () => fetchDocs();
    
    // Listen to remote P2P updates
    app.sync.on('update:remote' as any, refresh);
    app.sync.on('update:local' as any, refresh);
    
    // Listen to local mutations from other hooks
    localDbEvents.on('change', refresh);

    return () => {
      app.sync.off('update:remote' as any, refresh);
      app.sync.off('update:local' as any, refresh);
      localDbEvents.off('change', refresh);
    };
  }, [app, fetchDocs]);

  const insert = async (doc: any) => {
    const res = await collection.insert(doc);
    localDbEvents.emit('change', null);
    return res;
  };

  const remove = async (id: string) => {
    const res = await collection.delete({ _id: id } as any);
    localDbEvents.emit('change', null);
    return res;
  };

  const update = async (id: string, updates: any) => {
    const res = await collection.update({ _id: id } as any, { $set: updates });
    localDbEvents.emit('change', null);
    return res;
  };

  return { data, loading, insert, remove, update };
}

/**
 * Reactive hook for authentication and identity.
 */
export function useAuth() {
  const app = useZerith();
  const [identity, setIdentity] = useState(app.auth.identity);

  const signIn = async () => {
    const id = await app.auth.signIn();
    setIdentity(id);
    return id;
  };

  const signOut = () => {
    app.auth.signOut();
    setIdentity(null);
  };

  return { identity, signIn, signOut };
}
