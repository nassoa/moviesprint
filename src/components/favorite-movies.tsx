"use client";

import { useFavoriteMovies } from "@/hooks/use-movies";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart } from "lucide-react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/use-movies";

export function FavoriteMovies({
  onSelectMovie,
}: {
  onSelectMovie: (id: string) => void;
}) {
  const { favorites, removeFavorite, isRemoving } = useFavoriteMovies();
  const queryClient = useQueryClient();

  if (favorites.length === 0) {
    return (
      <div className="text-center p-8 bg-primary-50 rounded-lg border border-primary-100 text-primary-700">
        Vous n'avez pas encore de films favoris.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-700">
          Vos films favoris
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="border-primary-200 hover:bg-primary-50 hover:text-primary-500 text-primary-700"
          onClick={() => {
            // Bonne pratique: invalidation manuelle du cache
            queryClient.invalidateQueries({
              queryKey: queryKeys.favoriteMovies,
            });
          }}
        >
          Rafraîchir
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((movie) => (
          <Card
            key={movie.id}
            className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-primary-100"
          >
            <CardContent className="p-0 relative">
              <Image
                src={movie.image || "/placeholder.svg"}
                alt={movie.title}
                width={628}
                height={676}
                className="w-full h-[32rem] object-cover"
                unoptimized
              />
              <div className="absolute top-2 right-2 bg-secondary-100 text-secondary-800 px-2 py-1 rounded-md text-sm">
                {movie.imDbRating}
              </div>
              <div className="absolute bottom-2 left-2 bg-white/90 text-primary-700 px-2 py-1 rounded-md text-xs flex items-center shadow-sm">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="text-secondary-900">{movie.year}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start p-4">
              <h3 className="font-semibold">{movie.title}</h3>
              <div className="flex justify-between w-full mt-2">
                <Button
                  variant="ghost"
                  className="p-0 h-auto mt-2 text-primary-600 hover:text-primary-700 hover:bg-transparent"
                  onClick={() => onSelectMovie(movie.id)}
                >
                  Voir les détails
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFavorite(movie.id)}
                  disabled={isRemoving}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
