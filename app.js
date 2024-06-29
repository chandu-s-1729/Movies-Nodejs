const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let dataBase = null;

const initializeDBAndServer = async (request, response) => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app;

//API 1 - GET Retrieving All Movie names
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
        SELECT 
            movie_name
        FROM 
            movie
        ORDER BY 
            movie_id;`;

  const convertDBObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };

  const dbResponse = await dataBase.all(getMovieNamesQuery);

  response.send(
    dbResponse.map((eachMovieName) =>
      convertDBObjectToResponseObject(eachMovieName)
    )
  );
});

//API 2 - POST Creating a New Movie into the table
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const createAMovieQuery = `
        INSERT INTO 
            movie (director_id, movie_name, lead_actor)
        VALUES 
            (
                ${directorId},
               '${movieName}',
               '${leadActor}'
            );`;

  const addMovie = await dataBase.run(createAMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3 - Retrieve A Movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getAMovieQuery = `
        SELECT 
            *
        FROM 
            movie
        WHERE 
            movie_id = ${movieId};`;

  const convertDBObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };

  const dbResponse = await dataBase.get(getAMovieQuery);

  response.send(convertDBObjectToResponseObject(dbResponse));
});

//API 4 - PUT Updating Movie Details
app.put("/movies/:movieId/", async (request, response) => {
    const { movieId } = request.params;
    const movieDetails = request.body;

    const { directorId, movieName, leadActor } = movieDetails;

    const updateMovieDetailsQuery = `
        UPDATE
            movie
        SET
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE
            movie_id = ${movieId};`;
    
    await dataBase.run(updateMovieDetailsQuery);
    response.send("Movie Details Updated");
});

//API 5 - DELETE Deleting A Movie
app.delete("/movies/:movieId/", async (request, response) => {
    const { movieId } = request.params;

    const deleteAMovieQuery = `
        DELETE FROM
            movie
        WHERE 
            movie_id = ${movieId};`;
    
    await dataBase.run(deleteAMovieQuery);
    response.send("Movie Removed");
});

//API 6 - GET Retrieving All Directors
app.get("/directors/", async (request, response) => {
    
    const getDirectorsQuery = `
        SELECT 
            *
        FROM 
            director
        ORDER BY 
            director_id;`;

    const convertDBObjectToResponseObject = (dbObject) => {
        return {
            directorId: dbObject.director_id,
            directorName: dbObject.director_name,
        };
    };

    const dbResponse = await dataBase.all(getDirectorsQuery);

    response.send(dbResponse.map((eachDirector) => 
        convertDBObjectToResponseObject(eachDirector)
    )
    );
});

//API 7 - GET Retrieving All Movie Names by director_id
app.get("/directors/:directorId/movies/", async (request, response) => {
    const { directorId } = request.params;

    const getDirectorMoviesQuery = `
        SELECT 
            movie_name
        FROM 
            movie
        WHERE
            director_id = ${directorId};`;

    const convertDBObjectToResponseObject = (dbObject) => {
        return {
            movieName: dbObject.movie_name,
        };
    };

    const dbResponse = await dataBase.all(getDirectorMoviesQuery);

    response.send(dbResponse.map( (eachDirectorMovies) =>
        convertDBObjectToResponseObject(eachDirectorMovies)
    )
    );
});