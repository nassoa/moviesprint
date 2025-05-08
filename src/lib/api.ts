export interface Movie {
  id: string
  title: string
  year: string
  image: string
  imDbRating: string
}

export interface MovieDetail extends Movie {
  plot: string
  directors: string
  stars: string
  genres: string
  runtime: string
  contentRating: string
}

export interface SearchResult {
  results: Movie[]
  expression: string
}

// Configuration de l'API TMDB
const TMDB_API_KEY = "63033b0a8116e4740d6bb199d06c5a9d" // Votre clé API TMDB
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

// Fonction pour récupérer les films populaires
export async function getPopularMovies() {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Transformer les données pour correspondre à notre interface
    const items = data.results.slice(0, 10).map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? movie.release_date.substring(0, 4) : "N/A",
      image: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg?height=176&width=128",
      imDbRating: (movie.vote_average / 2).toFixed(1), // TMDB utilise une échelle de 10, IMDb utilise 10
      plot: movie.overview,
      directors: "À récupérer", // Sera complété par getMovieDetails
      stars: "À récupérer", // Sera complété par getMovieDetails
      genres: "À récupérer", // Sera complété par getMovieDetails
      runtime: "À récupérer", // Sera complété par getMovieDetails
      contentRating: "À récupérer", // Sera complété par getMovieDetails
    }))

    return {
      items,
    }
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    throw error
  }
}

// Fonction pour rechercher des films
export async function searchMovies(query: string) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1&include_adult=false`,
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Transformer les données pour correspondre à notre interface
    const results = data.results.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? movie.release_date.substring(0, 4) : "N/A",
      image: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg?height=176&width=128",
      imDbRating: (movie.vote_average / 2).toFixed(1),
    }))

    return {
      results,
      expression: query,
    }
  } catch (error) {
    console.error("Error searching movies:", error)
    throw error
  }
}

// Fonction pour récupérer les détails d'un film
export async function getMovieDetails(movieId: string) {
  try {
    // Récupérer les informations principales du film
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=credits,release_dates`,
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Extraire les réalisateurs
    const directors =
      data.credits?.crew
        ?.filter((person: any) => person.job === "Director")
        .map((director: any) => director.name)
        .join(", ") || "N/A"

    // Extraire les acteurs principaux (3 premiers)
    const stars =
      data.credits?.cast
        ?.slice(0, 3)
        .map((actor: any) => actor.name)
        .join(", ") || "N/A"

    // Extraire les genres
    const genres = data.genres?.map((genre: any) => genre.name).join(", ") || "N/A"

    // Trouver la classification d'âge (contentRating)
    let contentRating = "N/A"
    if (data.release_dates && data.release_dates.results) {
      const usRating = data.release_dates.results.find((r: any) => r.iso_3166_1 === "US")
      if (usRating && usRating.release_dates && usRating.release_dates.length > 0) {
        contentRating = usRating.release_dates[0].certification || "N/A"
      }
    }

    return {
      id: movieId,
      title: data.title || "N/A",
      year: data.release_date ? data.release_date.substring(0, 4) : "N/A",
      image: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : "/placeholder.svg?height=176&width=128",
      imDbRating: (data.vote_average / 2).toFixed(1),
      plot: data.overview || "N/A",
      directors,
      stars,
      genres,
      runtime: data.runtime ? `${data.runtime} min` : "N/A",
      contentRating,
    }
  } catch (error) {
    console.error("Error fetching movie details:", error)
    throw error
  }
}

// Fonction pour récupérer les films par genre/catégorie
export async function getMoviesByGenre(genreName: string) {
  try {
    // D'abord, récupérer l'ID du genre à partir de son nom
    const genresResponse = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=fr-FR`)

    if (!genresResponse.ok) {
      throw new Error(`API error: ${genresResponse.status}`)
    }

    const genresData = await genresResponse.json()
    let genre = genresData.genres.find((g: any) => g.name.toLowerCase() === genreName.toLowerCase())

    if (!genre) {
      // Si le genre n'est pas trouvé, essayer de trouver une correspondance partielle
      const partialMatch = genresData.genres.find(
        (g: any) =>
          g.name.toLowerCase().includes(genreName.toLowerCase()) ||
          genreName.toLowerCase().includes(g.name.toLowerCase()),
      )

      if (!partialMatch) {
        return [] // Aucun genre correspondant trouvé
      }

      genre = partialMatch
    }

    // Récupérer les films pour ce genre
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${genre.id}`,
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Transformer les données pour correspondre à notre interface
    const movies = data.results.slice(0, 20).map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? movie.release_date.substring(0, 4) : "N/A",
      image: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg?height=176&width=128",
      imDbRating: (movie.vote_average / 2).toFixed(1),
      plot: movie.overview,
      directors: "N/A", // Ces détails ne sont pas disponibles dans cette requête
      stars: "N/A",
      genres: genreName,
      runtime: "N/A",
      contentRating: "N/A",
    }))

    return movies
  } catch (error) {
    console.error(`Error fetching movies by genre ${genreName}:`, error)
    return []
  }
}

// Fonction pour récupérer les catégories disponibles
export async function getAvailableGenres() {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=fr-FR`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Retourner les noms des genres
    return data.genres.map((genre: any) => genre.name)
  } catch (error) {
    console.error("Error fetching available genres:", error)
    // Retourner quelques genres courants en cas d'erreur
    return [
      "Action",
      "Aventure",
      "Animation",
      "Comédie",
      "Crime",
      "Documentaire",
      "Drame",
      "Famille",
      "Fantastique",
      "Histoire",
      "Horreur",
      "Musique",
      "Mystère",
      "Romance",
      "Science-Fiction",
      "Thriller",
      "Guerre",
      "Western",
    ]
  }
}
