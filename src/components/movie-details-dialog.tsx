"use client";

import { useMovieDetails, useFavoriteMovies } from "@/hooks/use-movies";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Star, X } from "lucide-react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/use-movies";

interface MovieDetailsDialogProps {
  movieId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovieDetailsDialog({
  movieId,
  isOpen,
  onClose,
}: MovieDetailsDialogProps) {
  const queryClient = useQueryClient();

  // Bonne pratique: utiliser le cache existant pendant le chargement
  const {
    data: movie,
    isLoading,
    error,
    isFetching,
  } = useMovieDetails(movieId);

  const { favorites, addFavorite, removeFavorite, isAdding, isRemoving } =
    useFavoriteMovies();

  const isFavorite = favorites.some((fav) => fav.id === movieId);

  // Bonne pratique: prefetch des données liées
  const prefetchRelatedMovies = () => {
    if (movie?.directors) {
      queryClient.prefetchQuery({
        queryKey: ["relatedMovies", movie.directors],
        queryFn: () => {
          // Simuler une requête pour les films du même réalisateur
          return new Promise((resolve) => setTimeout(resolve, 500));
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-primary-100">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl text-primary-800">
              {isLoading ? <Skeleton className="h-8 w-48" /> : movie?.title}
              {!isLoading && movie && (
                <span className="text-sm font-normal text-primary-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {movie.year}
                </span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <MovieDetailsSkeleton />
        ) : error ? (
          <div className="p-8 bg-red-50 text-red-500 rounded-lg border border-red-100">
            Une erreur est survenue lors du chargement des détails du film.
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        ) : movie ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-primary-50 text-primary-700 border-primary-200"
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {movie.imDbRating}
                </Badge>
                {/* {movie.contentRating !== "N/A" && (
                  <Badge
                    variant="outline"
                    className="bg-primary-50 text-primary-700 border-primary-200"
                  >
                    {movie.contentRating}
                  </Badge>
                )} */}
                <Badge
                  variant="outline"
                  className="bg-primary-50 text-primary-700 border-primary-200"
                >
                  {movie.runtime}
                </Badge>
              </div>
              <Button
                variant={isFavorite ? "destructive" : "outline"}
                size="sm"
                onClick={() => {
                  if (isFavorite) {
                    removeFavorite(movie.id);
                  } else {
                    addFavorite(movie);
                  }
                }}
                disabled={isAdding || isRemoving}
                onMouseEnter={prefetchRelatedMovies}
                className={
                  isFavorite
                    ? ""
                    : "border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-500"
                }
              >
                <Heart
                  className={`h-4 w-4 mr-1 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
            </div>

            <div className="grid md:grid-cols-[200px_1fr] gap-6">
              <div className="relative">
                <Image
                  src={movie.image || "/placeholder.svg?height=176&width=128"}
                  alt={movie.title}
                  width={200}
                  height={300}
                  className="rounded-md object-cover shadow-sm"
                />
                {isFetching && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-md">
                    <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary-700">Synopsis</h3>
                  <p className="text-sm">{movie.plot}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-primary-700">
                      Réalisateur
                    </h3>
                    <p className="text-sm">{movie.directors}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-700">Acteurs</h3>
                    <p className="text-sm">{movie.stars}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-700">Genres</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.genres.split(", ").map((genre: any) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-transparent"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-700">
                      Informations
                    </h3>
                    <p className="text-sm">
                      {movie.runtime} • {movie.contentRating}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="pt-4 border-t border-primary-100">
              <Button
                variant="outline"
                className="w-full border-primary-200 text-primary-700 hover:bg-primary-50"
                onClick={() => {
                  // Bonne pratique: invalidation manuelle du cache
                  queryClient.invalidateQueries({
                    queryKey: queryKeys.movieDetails(movie.id),
                  })
                }}
              >
                Rafraîchir les données
              </Button>
            </div> */}
          </div>
        ) : (
          <div className="text-center p-8 bg-primary-50 rounded-lg border border-primary-100 text-primary-700">
            Aucun film sélectionné
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MovieDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <Skeleton className="h-[300px] w-[200px]" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
}
