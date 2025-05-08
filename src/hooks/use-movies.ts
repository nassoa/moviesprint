"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  type MovieDetail,
  type SearchResult,
  getMoviesByGenre,
  getAvailableGenres,
} from "@/lib/api";
import { useLocalStorage } from "./use-local-storage";

// Clés de requête pour TanStack Query
export const queryKeys = {
  popularMovies: ["popularMovies"],
  movieSearch: (query: string) => ["movieSearch", query],
  movieDetails: (id: string) => ["movieDetails", id],
  favoriteMovies: ["favoriteMovies"],
  moviesByGenre: (genre: string) => ["moviesByGenre", genre],
  availableGenres: ["availableGenres"],
};

// Fonction utilitaire pour trier les films par année (les plus récents d'abord)
export const sortMoviesByYear = (movies: any[]) => {
  return [...movies].sort((a, b) => {
    // Convertir les années en nombres pour la comparaison
    const yearA = Number.parseInt(a.year) || 0;
    const yearB = Number.parseInt(b.year) || 0;
    return yearB - yearA; // Ordre décroissant (les plus récents d'abord)
  });
};

// Hook pour récupérer les films populaires
export function usePopularMovies() {
  return useQuery({
    queryKey: queryKeys.popularMovies,
    queryFn: getPopularMovies,
    // Augmenter le staleTime pour réduire les requêtes
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Bonne pratique: sélecteur pour transformer les données et les trier par année
    select: (data) => sortMoviesByYear(data.items),
  });
}

// Hook pour rechercher des films
export function useMovieSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.movieSearch(query),
    queryFn: () => searchMovies(query),
    // Bonne pratique: désactiver la requête si la requête est vide
    enabled: query.length > 2,
    // Bonne pratique: staleTime plus court pour les recherches
    staleTime: 30 * 1000, // 30 secondes
    // Trier les résultats par année
    select: (data: SearchResult) => sortMoviesByYear(data.results),
  });
}

// Hook pour récupérer les détails d'un film
export function useMovieDetails(movieId: string | null) {
  return useQuery({
    queryKey: queryKeys.movieDetails(movieId || ""),
    queryFn: () => getMovieDetails(movieId || ""),
    // Bonne pratique: désactiver la requête si l'ID est null
    enabled: !!movieId,
    // Bonne pratique: staleTime plus long pour les détails
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour gérer les films favoris
export function useFavoriteMovies() {
  const queryClient = useQueryClient();
  const [favorites, setFavorites] = useLocalStorage<MovieDetail[]>(
    "favoriteMovies",
    []
  );

  // Trier les favoris par année
  const sortedFavorites = sortMoviesByYear(favorites);

  // Bonne pratique: utiliser useMutation pour les opérations d'écriture
  const addFavoriteMutation = useMutation({
    mutationFn: async (movie: MovieDetail) => {
      // Simuler une opération asynchrone
      await new Promise((resolve) => setTimeout(resolve, 300));
      return movie;
    },
    onSuccess: (movie) => {
      // Bonne pratique: mettre à jour le cache après une mutation réussie
      setFavorites((prev) => {
        if (prev.some((m) => m.id === movie.id)) return prev;
        return [...prev, movie];
      });

      // Bonne pratique: invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: queryKeys.favoriteMovies });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (movieId: string) => {
      // Simuler une opération asynchrone
      await new Promise((resolve) => setTimeout(resolve, 300));
      return movieId;
    },
    onSuccess: (movieId) => {
      setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
      queryClient.invalidateQueries({ queryKey: queryKeys.favoriteMovies });
    },
  });

  return {
    favorites: sortedFavorites,
    addFavorite: (movie: MovieDetail) => addFavoriteMutation.mutate(movie),
    removeFavorite: (movieId: string) => removeFavoriteMutation.mutate(movieId),
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
  };
}

// Hook pour la pagination infinie
export function useInfiniteMovies() {
  return useInfiniteQuery({
    queryKey: ["infiniteMovies"],
    queryFn: async ({ pageParam = 1 }) => {
      // Appel à l'API TMDB pour la pagination
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=63033b0a8116e4740d6bb199d06c5a9d&language=fr-FR&page=${pageParam}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const movies = data.results.map((movie: any) => ({
        id: movie.id.toString(),
        title: movie.title,
        year: movie.release_date ? movie.release_date.substring(0, 4) : "N/A",
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/placeholder.svg?height=176&width=128",
        imDbRating: (movie.vote_average / 2).toFixed(1),
      }));

      // Trier les films par année
      const sortedMovies = sortMoviesByYear(movies);

      return {
        movies: sortedMovies,
        nextPage: pageParam < data.total_pages ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    // Bonne pratique: prefetch des données
    refetchOnMount: true,
  });
}

// Ajouter un hook pour récupérer les films par genre
export function useMoviesByGenre(genre: string) {
  return useQuery({
    queryKey: queryKeys.moviesByGenre(genre),
    queryFn: () => getMoviesByGenre(genre),
    // Augmenter le staleTime pour réduire les requêtes
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Limiter les tentatives de nouvelle requête
    retry: 1,
    // Trier les films par année
    select: (data) => sortMoviesByYear(data),
  });
}

// Ajouter un hook pour récupérer les genres disponibles
export function useAvailableGenres() {
  return useQuery({
    queryKey: queryKeys.availableGenres,
    queryFn: getAvailableGenres,
    // Garder les genres en cache plus longtemps
    staleTime: 24 * 60 * 60 * 1000, // 24 heures
  });
}
