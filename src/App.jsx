import { useState, useEffect, useMemo, useRef } from "react";
import StarRating from './StarRating'
import { useMovies } from "./useMovies";


const average = (arr) =>
  arr.reduce((acc, cur) => acc + cur / arr.length, 0);

export default function App() {

  const [query, setQuery] = useState("");

  // Hydrate the watched movies from localStorage
  const [watched, setWatched] = useState(() => {
    try {
      const storedWatched = localStorage.getItem("watched");
      return storedWatched ? JSON.parse(storedWatched) : [];
    } catch (error) {
      console.error("Error parsing watched movies from localStorage:", error);
      return []; // Fallback to an empty array if parsing fails
    }
  });


  const [selectedId, setSelectedId] = useState(null);

  // Derived state using useMemo
  const isQueryValid = useMemo(() => query.length > 2, [query]);

  const { movies, isLoading, error } = useMovies(query, handleCloseMovieDetails);


  useEffect(() => {
    if (Array.isArray(watched) && watched.length > 0) localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);


  const handleMovieClick = (movieId) => {
    //this will toggle the selected movie
    setSelectedId(selectedId === movieId ? null : movieId);
  };

  // Using this function definition to allow hoisting and be able to pass it above in useMovies
  // that won't work with arrow functions... keep in mind!
  function handleCloseMovieDetails () {
    setSelectedId(null);
  };

  const handleAddToWatched = (movie) => {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));

  }

  const handleRemoveFromWatched = (movieId) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== movieId));
  }


  return (
    <>
      {/* Navbar and ListBox are an example of composition */}
      {/* by passing the child components we have uplifted the movies prop */}
      {/* and abstracted the Navbar content achieving reusability. Prop drilling has been eliminated. Similar applies to ListBox */}
      {/* Components can also be passed as props, explictly. Not preferrable, just an alternative used by React libs, like ReactRouter */}
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <ListBox>
          {isLoading && isQueryValid && <Loader />}
          {!isLoading && error && <ErrorMessage message={error.message} />}
          {!isLoading && !error && isQueryValid && <MoviesList onSelectMovie={handleMovieClick} movies={movies} />}
        </ListBox>
        <ListBox>
          {selectedId && <MovieDetails selectedId={selectedId} onAddWatched={handleAddToWatched} onCloseMovieDetails={handleCloseMovieDetails} watchedMovies={watched} />}
          {!selectedId &&
            <>
              <WatchedMoviesList watched={watched} onRemoveFromWatched={handleRemoveFromWatched} />
              <WatchedMoviesSummary watched={watched} />
            </>
          }
        </ListBox>
      </Main>
    </>
  );
}

const Loader = () => {
  return (
    <span>Loading...</span>
  );
}

const ErrorMessage = ({ message }) => {
  return (
    <p className="error">
      <span role="img">⛔</span> {message}
    </p>
  );
}

const Navbar = ({ children }) => {
  return (
    <nav className="nav-bar">
      {children}
    </nav>
  );
};

const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

const Search = ({ query, setQuery }) => {

  const inputElement = useRef(null);

  useEffect(() => {
    const callback = (e) => {
      if (e.code === "Enter" && inputElement.current !== document.activeElement) {
        inputElement.current.focus();
        setQuery("");
      }
    }

    document.addEventListener("keydown", callback);

  }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies... type at least 3 characters"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}

const NumResults = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies?.length || 0}</strong> results
    </p>
  );
}

const Main = ({ children }) => {
  return (
    <main className="main">
      {children}
    </main>
  );
}

const ListBox = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

const MoviesList = ({ movies, onSelectMovie }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

const Movie = ({ movie, onSelectMovie }) => {
  return (
    <li onClick={() => { onSelectMovie(movie.imdbID) }}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

const WatchedMoviesList = ({ watched, onRemoveFromWatched }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie key={movie.imdbID} movie={movie} onRemoveFromWatched={onRemoveFromWatched} />
      ))}
    </ul>
  );
}

const WatchedMovie = ({ movie, onRemoveFromWatched }) => {
  console.log("Key for WatchedMovie: ", movie);
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onRemoveFromWatched(movie.imdbID)}>❌</button>
      </div>
    </li>
  );
}

const WatchedMoviesSummary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}


const MovieDetails = ({ selectedId, onAddWatched, onCloseMovieDetails, watchedMovies }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null); // Default to null
  const [userRating, setUserRating] = useState(0);

  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) {
      countRef.current++;
    }
  }, [userRating]

  );


  const isWatched = watchedMovies.some((movie) => movie.imdbID === selectedId);
  const userExistingRating = watchedMovies.find((movie) => movie.imdbID === selectedId)?.userRating ?? null;

  useEffect(() => {

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseMovieDetails();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup, otherwise the event listener will be added each time the component re-renders
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [onCloseMovieDetails])

  useEffect(() => {
    if (movieDetails) document.title = `${movieDetails.Title} | Details`;

    return () => {
      document.title = "usePopCorn React Demo";
    };

  }, [movieDetails]);


  useEffect(() => {


    const fetchMovieDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${APIKEY}&i=${selectedId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setMovieDetails(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [selectedId]);

  // If movieDetails is null or loading, show a loader or fallback UI
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!movieDetails) {
    return <p>No details available for this movie.</p>;
  }

  // Destructure the movie details only after confirming that movieDetails is not null
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Director: director,
    Actors: actors,
    Genre: genre,
    Language: language,
    Country: country,
    Awards: awards,
    Production: production,
    Website: website,
  } = movieDetails;

  const handleAddToWatched = () => {
    onAddWatched({
      imdbID: selectedId,
      Title: title,
      Year: year,
      Poster: poster,
      runtime: parseInt(runtime),
      imdbRating: parseFloat(imdbRating),
      userRating: userRating,
      countRatingChanges: countRef.current,
    });

    onCloseMovieDetails();

  }


  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovieDetails}>&larr;</button>
        <img src={poster} alt={`${title} poster`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            <span>🗓</span>
            <span>{year}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{runtime}</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{imdbRating}</span>
          </p>
        </div>
      </header>

      <section>
        <div className="rating">

          {!isWatched && (
            <>
              <StarRating maxRating={10} size={24} rating={imdbRating} onRating={(rating) => setUserRating(rating)} />
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAddToWatched}>
                  Add to watched
                </button>)
              }
            </>
          )}

          {isWatched && (
            <p>
              <StarRating maxRating={10} size={24} rating={userExistingRating} />
              <span>{userExistingRating}</span>
            </p>
          )}

        </div>
        <p>{plot}</p>
        <p>
          <span>🎬</span>
          <span>{director}</span>
        </p>
        <p>
          <span>👥</span>
          <span>{actors}</span>
        </p>
        <p>
          <span>🎭</span>
          <span>{genre}</span>
        </p>
        <p>
          <span>🗣</span>
          <span>{language}</span>
        </p>
        <p>
          <span>🌍</span>
          <span>{country}</span>
        </p>
        <p>
          <span>🏆</span>
          <span>{awards}</span>
        </p>
        <p>
          <span>🎥</span>
          <span>{production}</span>
        </p>
        <p>
          <span>🔗</span>
          <a href={website} target="_blank" rel="noopener noreferrer">
            {website}
          </a>
        </p>
      </section>
    </div>

  );
}