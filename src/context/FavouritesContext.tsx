'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [favourites, setFavourites] = useState<Listing[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const getStorageKey = () => (user?.email ? `ivy_favs_${user.email}` : 'ivy_favs_guest');

  useEffect(() => {
    loadFavourites();
  }, [user?.email, token]);

  const loadFavourites = async () => {
    setIsLoading(true);
    try {
      const storageKey = getStorageKey();
      const localData = localStorage.getItem(storageKey);
      let localFavs: Listing[] = [];
      if (localData) {
        try {
          localFavs = JSON.parse(localData);
        } catch (e) {}
      }

      if (token) {
        const serverFavs = await api.getFavourites(token);
        if (serverFavs && serverFavs.length > 0) {
          const mergedMap = new Map<string, Listing>();
          [...localFavs, ...serverFavs].forEach((item) => mergedMap.set(item.listing_id, item));
          const merged = Array.from(mergedMap.values());
          setFavourites(merged);
          setFavouriteIds(new Set(merged.map((f) => f.listing_id)));
          localStorage.setItem(storageKey, JSON.stringify(merged));
          return;
        }
      }

      setFavourites(localFavs);
      setFavouriteIds(new Set(localFavs.map((f) => f.listing_id)));
    } catch (e) {
      console.error('Failed to load favourites', e);
    } finally {
      setIsLoading(false);
    }
  };

  const isFavourite = (id: string) => favouriteIds.has(id);

  const toggleFavourite = async (listing: Listing) => {
    const storageKey = getStorageKey();
    const id = listing.listing_id;

    if (favouriteIds.has(id)) {
      const updated = favourites.filter((f) => f.listing_id !== id);
      setFavourites(updated);
      setFavouriteIds(new Set(updated.map((f) => f.listing_id)));
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (token) {
        await api.removeFavourite(id, token);
      }
    } else {
      const updated = [listing, ...favourites];
      setFavourites(updated);
      setFavouriteIds(new Set(updated.map((f) => f.listing_id)));
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (token) {
        await api.addFavourite(id, token);
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
