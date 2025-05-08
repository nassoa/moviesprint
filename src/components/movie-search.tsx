"use client";

import { useState } from "react";
import { useMovieSearch } from "@/hooks/use-movies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { Calendar, Search } from "lucide-react";

export function MovieSearch({
  onSelectMovie,
}: {
  onSelectMovie: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  // Bonne pratique: debounce pour éviter trop de requêtes
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const {
    data: searchResults,
    isLoading,
    error,
    isFetching,
  } = useMovieSearch(debouncedSearchTerm);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex justify-center items-center pt-8 pb-4">
          <div className="max-w-lg w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500" />
            <Input
              type="text"
              placeholder="Rechercher un film..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-primary-200 focus-visible:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {debouncedSearchTerm.length <= 2 && (
        <div className="text-center p-8 bg-primary-50 rounded-lg border border-primary-100 text-primary-700">
          Veuillez saisir au moins 3 caractères pour rechercher
        </div>
      )}

      {isLoading && <SearchResultsSkeleton />}

      {error && (
        <div className="p-8 bg-red-50 text-red-500 rounded-lg border border-red-100">
          Une erreur est survenue lors de la recherche.
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      )}

      {debouncedSearchTerm.length > 2 && !isLoading && !error && (
        <>
          {isFetching && (
            <div className="text-center text-sm text-primary-600">
              Chargement...
            </div>
          )}

          {searchResults?.length === 0 && (
            <div className="text-center p-8 bg-primary-50 rounded-lg border border-primary-100 text-primary-700">
              Aucun résultat trouvé pour "{debouncedSearchTerm}"
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults?.map((movie) => (
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
        </>
      )}
    </div>
  );
}

function SearchResultsSkeleton() {
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
