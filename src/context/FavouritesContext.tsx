'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Listing } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface FavouritesContextType {
  favourites: Listing[];
  favouriteIds: Set<string>;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (listing: Listing) => Promise<void>;
  isLoading: boolean;
  refreshFavourites: () => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'ivy_favs_guest';

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [favourites, setFavourites] = useState<Listing[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const prevUserRef = useRef<string | null>(null);

  const getUserStorageKey = useCallback((email?: string | null) => {
    return email ? `ivy_favs_${email}` : GUEST_STORAGE_KEY;
  }, []);

  const loadFavourites = useCallback(async () => {
    setIsLoading(true);
    try {
      const isUser = !!(user?.email && token);
      const storageKey = getUserStorageKey(user?.email);

      // Load cached local favourites for current scope
      const localData = localStorage.getItem(storageKey);
      let localFavs: Listing[] = [];
      if (localData) {
        try {
          localFavs = JSON.parse(localData);
        } catch (e) {}
      }

      if (isUser && token) {
        // Check if guest had any unsynced favourites to migrate to this newly authenticated user
        const guestData = localStorage.getItem(GUEST_STORAGE_KEY);
        let guestFavs: Listing[] = [];
        if (guestData) {
          try {
            guestFavs = JSON.parse(guestData);
          } catch (e) {}
        }

        // Fetch server saved listings via /v1/saved
        const serverFavs = await api.getFavourites(token);

        // Merge: server + user local cache + guest migration
        const mergedMap = new Map<string, Listing>();
        serverFavs.forEach((item) => mergedMap.set(item.listing_id, item));
        localFavs.forEach((item) => mergedMap.set(item.listing_id, item));
        guestFavs.forEach((item) => mergedMap.set(item.listing_id, item));

        const merged = Array.from(mergedMap.values());
        setFavourites(merged);
        setFavouriteIds(new Set(merged.map((f) => f.listing_id)));
        localStorage.setItem(storageKey, JSON.stringify(merged));

        // If there were guest favourites or unpersisted local favourites, sync them to server
        const unsyncedToSave = [...guestFavs, ...localFavs].filter(
          (localItem) => !serverFavs.some((s) => s.listing_id === localItem.listing_id)
        );

        if (unsyncedToSave.length > 0) {
          Promise.allSettled(
            unsyncedToSave.map((item) => api.addFavourite(item.listing_id, token))
          ).catch(() => {});
        }

        // Clear guest storage now that items have migrated
        if (guestFavs.length > 0) {
          localStorage.removeItem(GUEST_STORAGE_KEY);
        }
      } else {
        // Guest mode
        setFavourites(localFavs);
        setFavouriteIds(new Set(localFavs.map((f) => f.listing_id)));
      }
    } catch (e) {
      console.error('Failed to load favourites', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, token, getUserStorageKey]);

  useEffect(() => {
    // When user changes (e.g. login or logout), reload favourites
    if (prevUserRef.current !== (user?.email || null)) {
      prevUserRef.current = user?.email || null;
    }
    loadFavourites();
  }, [user?.email, token, loadFavourites]);

  const isFavourite = (id: string) => favouriteIds.has(id);

  const toggleFavourite = async (listing: Listing) => {
    const storageKey = getUserStorageKey(user?.email);
    const id = listing.listing_id;
    const isCurrentlySaved = favouriteIds.has(id);

    if (isCurrentlySaved) {
      // Remove
      const updated = favourites.filter((f) => f.listing_id !== id);
      setFavourites(updated);
      setFavouriteIds(new Set(updated.map((f) => f.listing_id)));
      localStorage.setItem(storageKey, JSON.stringify(updated));

      if (token) {
        await api.removeFavourite(id, token).catch((e) => {
          console.warn('Failed to remove favourite from server', e);
        });
      }
    } else {
      // Add
      const updated = [listing, ...favourites];
      setFavourites(updated);
      setFavouriteIds(new Set(updated.map((f) => f.listing_id)));
      localStorage.setItem(storageKey, JSON.stringify(updated));

      if (token) {
        await api.addFavourite(id, token).catch((e) => {
          console.warn('Failed to save favourite to server', e);
        });
      }
    }
  };

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        favouriteIds,
        isFavourite,
        toggleFavourite,
        isLoading,
        refreshFavourites: loadFavourites,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}
