import { MoviesDashboard } from "@/components/movies-dashboard";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary-700">
        TanStack Query - Bonnes pratiques
      </h1>
      <MoviesDashboard />
    </main>
  );
}
