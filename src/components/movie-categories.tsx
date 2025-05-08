"use client";

import { useAvailableGenres } from "@/hooks/use-movies";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenreMoviesList } from "./genre-movies-list";
import { Skeleton } from "@/components/ui/skeleton";

export function MovieCategories({
  onSelectMovie,
}: {
  onSelectMovie: (id: string) => void;
}) {
  const { data: genres, isLoading, error } = useAvailableGenres();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-500 rounded-lg border border-red-100">
        Une erreur est survenue lors du chargement des catégories.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={genres?.[0] || "Action"} className="w-full">
        <TabsList className="flex flex-wrap h-auto py-2 gap-2 bg-primary-50">
          {genres?.map((genre: any) => (
            <TabsTrigger
              key={genre}
              value={genre}
              className="data-[state=active]:bg-primary-900 data-[state=active]:text-white"
            >
              {genre}
            </TabsTrigger>
          ))}
        </TabsList>

        {genres?.map((genre: any) => (
          <TabsContent key={genre} value={genre}>
            <h2 className="text-2xl font-bold mb-4 text-primary-700">
              Films {genre}
            </h2>
            <GenreMoviesList genre={genre} onSelectMovie={onSelectMovie} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
