import { useState, useEffect } from "react";

const APIKEY = "cf98a040";

export function useMovies(query, handleCloseMovieDetails) {

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movies, setMovies] = useState([]);

    // After moving the useEffect to a custom hook, we need to pass the handleCloseMovieDetails function as a parameter
    // moreover, we need to check for query validity not assuming the caller did it for us.

    useEffect(() => {

        const controller = new AbortController();

        const fetchMovies = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Catching network errors
                const response = await fetch(
                    `https://www.omdbapi.com/?apikey=${APIKEY}&s=${query}`, { signal: controller.signal } // AbortController
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

                //The AbortController will cause JS to throw an error
                //we can ignore, when the fetch is aborted
                if (error.name !== "AbortError") {
                    setError(error);
                }

            } finally {
                setIsLoading(false);
            }
        };

        handleCloseMovieDetails?.();

        if (query.lemght > 3) {
            fetchMovies();
        }

        return () => {
            controller.abort();
        }

    }, [query, handleCloseMovieDetails]);

    return { movies, isLoading, error };

}
