"use client";

import { usePopularMovies, useInfiniteMovies } from "@/hooks/use-movies";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";

export function MoviesList({
  onSelectMovie,
}: {
  onSelectMovie: (id: string) => void;
}) {
  const { data: popularMovies, isLoading, error } = usePopularMovies();

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMovies();

  const { ref, inView } = useInView();

  const allMovies = useMemo(() => {
    const seenIds = new Set();
    const uniqueMovies = [];

    if (popularMovies) {
      for (const movie of popularMovies) {
        if (!seenIds.has(movie.id)) {
          seenIds.add(movie.id);
          uniqueMovies.push(movie);
        }
      }
    }

    if (infiniteData?.pages) {
      for (const page of infiniteData.pages) {
        for (const movie of page.movies) {
          if (!seenIds.has(movie.id)) {
            seenIds.add(movie.id);
            uniqueMovies.push(movie);
          }
        }
      }
    }

    return uniqueMovies;
  }, [popularMovies, infiniteData]);

  // Bonne pratique: chargement automatique des données supplémentaires
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <MoviesListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-500 rounded-lg">
        Une erreur est survenue lors du chargement des films.
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

  // const allMovies = [
  //   ...(popularMovies || []),
  //   ...(infiniteData?.pages.flatMap((page) => page.movies) || []),
  // ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allMovies.map((movie, index) => (
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
                priority={index < 4}
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

      {/* Élément de référence pour l'intersection observer */}
      <div ref={ref} className="h-10 flex justify-center">
        {isFetchingNextPage && <Skeleton className="h-8 w-32" />}
      </div>
    </div>
  );
}

function MoviesListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
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
