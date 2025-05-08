"use client";

import { useMoviesByGenre } from "@/hooks/use-movies";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Calendar } from "lucide-react";

export function GenreMoviesList({
  genre,
  onSelectMovie,
}: {
  genre: string;
  onSelectMovie: (id: string) => void;
}) {
  const { data: movies, isLoading, error } = useMoviesByGenre(genre);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-primary-100">
            <CardContent className="p-0">
              <Skeleton className="w-full h-48" />
            </CardContent>
            <CardFooter className="flex flex-col items-start p-4">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-500 rounded-lg border border-red-100">
        Une erreur est survenue lors du chargement des films {genre}.
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center p-8 bg-primary-50 rounded-lg border border-primary-100 text-primary-700">
        Aucun film {genre} trouvé. Essayez une autre catégorie.
      </div>
    );
  }

  // Limiter à 20 films maximum
  const limitedMovies = movies.slice(0, 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {limitedMovies.map((movie) => (
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
            <Button
              variant="ghost"
              className="p-0 h-auto mt-2 text-primary-600 hover:text-primary-700 hover:bg-transparent"
              onClick={() => onSelectMovie(movie.id)}
            >
              Voir les détails
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
