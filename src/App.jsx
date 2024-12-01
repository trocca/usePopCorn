import { useState, useEffect, useMemo } from "react";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const APIKEY = "cf98a040";

const average = (arr) =>
  arr.reduce((acc, cur) => acc + cur / arr.length, 0);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(tempWatchedData);

  // Derived state using useMemo
  const isQueryValid = useMemo(() => query.length > 2, [query]);

  useEffect(() => {
    if (isQueryValid) {
      const fetchMovies = async () => {
        setIsLoading(true);
        setError(null);

        try {
          // Catching network errors
          const response = await fetch(
            `https://www.omdbapi.com/?apikey=${APIKEY}&s=${query}`
          );

          // Fetch throws an error if the server cannot be reached, 
          // though it does not throw an error if the server returns an error status code
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log(data);
          setMovies(data.Search || []);
        } catch (error) {
          console.error("Error fetching movies:", error);
          setError(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMovies();
    } else {
      setMovies([]);
    }
  }, [isQueryValid, query]);

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
          {!isLoading && !error && isQueryValid && <MoviesList movies={movies} />}
        </ListBox>
        <ListBox>
          <WatchedMoviesList watched={watched} />
          <WatchedMoviesSummary watched={watched} />
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
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies... type at least 3 characters"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
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

const MoviesList = ({ movies }) => {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}

const Movie = ({ movie }) => {
  return (
    <li>
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

const WatchedMoviesList = ({ watched }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}

const WatchedMovie = ({ movie }) => {
  return (
    <li>
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
