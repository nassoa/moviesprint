"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoviesList } from "./movies-list";
import { MovieSearch } from "./movie-search";
import { FavoriteMovies } from "./favorite-movies";
import { MovieCategories } from "./movie-categories";
import { MovieDetailsDialog } from "./movie-details-dialog";
import { StackDescription } from "./stack-description";

export function MoviesDashboard() {
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSelectMovie = (id: string) => {
    setSelectedMovieId(id);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  return (
    <div className="space-y-6">
      <StackDescription />

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-primary-50">
          <TabsTrigger
            value="popular"
            className="data-[state=active]:bg-primary-900 data-[state=active]:text-white"
          >
            Films Populaires
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-primary-900 data-[state=active]:text-white"
          >
            Catégories
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="data-[state=active]:bg-primary-900 data-[state=active]:text-white"
          >
            Recherche
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-primary-900 data-[state=active]:text-white"
          >
            Favoris
          </TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <MovieCategories onSelectMovie={handleSelectMovie} />
        </TabsContent>
        <TabsContent value="popular">
          <MoviesList onSelectMovie={handleSelectMovie} />
        </TabsContent>
        <TabsContent value="search">
          <MovieSearch onSelectMovie={handleSelectMovie} />
        </TabsContent>
        <TabsContent value="favorites">
          <FavoriteMovies onSelectMovie={handleSelectMovie} />
        </TabsContent>
      </Tabs>

      <MovieDetailsDialog
        movieId={selectedMovieId}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
