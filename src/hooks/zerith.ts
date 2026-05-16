'use client'

import { useState, useEffect, useCallback } from 'react';
import { useZerith as useZerithInternal } from 'zerithdb-react';
import { EventEmitter } from 'zerithdb-core';

/**
 * A shared event emitter to notify hooks of local database changes within the same tab.
 */
const localDbEvents = new EventEmitter<{ 'change': null }>();

/**
 * A BroadcastChannel to notify hooks in other tabs of database changes.
 * This is essential because IndexedDB changes don't automatically trigger UI refreshes in other tabs.
 */
const crossTabSync = typeof window !== 'undefined' ? new BroadcastChannel('zerith_p2p_sync') : null;

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
      // Sort by timestamp
      setData(docs.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
    } catch (err) {
      console.error("Failed to fetch docs:", err);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    fetchDocs();

    const refresh = () => fetchDocs();
    
    // Listen to remote P2P updates (if signaling server is up)
    app.sync.on('update:remote' as any, refresh);
    app.sync.on('update:local' as any, refresh);
    
    // Listen to local mutations in the CURRENT tab
    localDbEvents.on('change', refresh);

    // Listen to local mutations in OTHER tabs
    if (crossTabSync) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data === 'db:change') {
          refresh();
        }
      };
      crossTabSync.addEventListener('message', handleMessage);
      return () => {
        app.sync.off('update:remote' as any, refresh);
        app.sync.off('update:local' as any, refresh);
        localDbEvents.off('change', refresh);
        crossTabSync.removeEventListener('message', handleMessage);
      };
    }

    return () => {
      app.sync.off('update:remote' as any, refresh);
      app.sync.off('update:local' as any, refresh);
      localDbEvents.off('change', refresh);
    };
  }, [app, fetchDocs]);

  const notifyChange = () => {
    // Notify this tab
    localDbEvents.emit('change', null);
    // Notify other tabs
    crossTabSync?.postMessage('db:change');
  };

  const insert = async (doc: any) => {
    const res = await collection.insert(doc);
    notifyChange();
    return res;
  };

  const remove = async (id: string) => {
    const res = await collection.delete({ _id: id } as any);
    notifyChange();
    return res;
  };

  const update = async (id: string, updates: any) => {
    const res = await collection.update({ _id: id } as any, { $set: updates });
    notifyChange();
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
