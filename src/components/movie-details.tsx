"use client";

import { useMovieDetails, useFavoriteMovies } from "@/hooks/use-movies";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/use-movies";

export function MovieDetails({ movieId }: { movieId: string }) {
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

  if (isLoading) {
    return <MovieDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-500 rounded-lg">
        Une erreur est survenue lors du chargement des détails du film.
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        Aucun film sélectionné
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {movie.title}
            <span className="text-sm font-normal text-muted-foreground">
              ({movie.year})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {movie.imDbRating}
            </Badge>
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
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isFavorite ? "fill-current" : ""}`}
              />
              {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-[200px_1fr] gap-6">
        <div className="relative">
          <Image
            src={movie.image || "/placeholder.svg"}
            alt={movie.title}
            width={200}
            height={300}
            className="rounded-md object-cover"
          />
          {isFetching && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Synopsis</h3>
            <p className="text-sm">{movie.plot}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Réalisateur</h3>
              <p className="text-sm">{movie.directors}</p>
            </div>
            <div>
              <h3 className="font-semibold">Acteurs</h3>
              <p className="text-sm">{movie.stars}</p>
            </div>
            <div>
              <h3 className="font-semibold">Genres</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {movie.genres.split(", ").map((genre: any) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Informations</h3>
              <p className="text-sm">
                {movie.runtime} • {movie.contentRating}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // Bonne pratique: invalidation manuelle du cache
            queryClient.invalidateQueries({
              queryKey: queryKeys.movieDetails(movieId),
            });
          }}
        >
          Rafraîchir les données
        </Button>
      </CardFooter>
    </Card>
  );
}

function MovieDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-2/3" />
      </CardHeader>
      <CardContent className="grid md:grid-cols-[200px_1fr] gap-6">
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
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
