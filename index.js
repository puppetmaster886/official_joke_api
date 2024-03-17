const express = require("express");
const LimitingMiddleware = require("limiting-middleware");
const {
  jokes,
  randomJoke,
  randomTen,
  randomSelect,
  jokeByType,
  jokeById,
  tenByPage,
  lastJokeId,
} = require("./handler");

const app = express();

app.use(new LimitingMiddleware().limitByIp());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("Try /random_joke, /random_ten, /jokes/random, or /jokes/ten");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/random_joke", (req, res) => {
  res.json(randomJoke());
});

app.get("/random_ten", (req, res) => {
  res.json(randomTen());
});

app.get("/jokes/random", (req, res) => {
  res.json(randomJoke());
});

// TODO: Needs fixing
app.get("/jokes/random(/*)?", (req, res) => {
  let num;

  try {
    num = parseInt(req.path.substring(14, req.path.length));
  } catch (err) {
    res.send("The passed path is not a number.");
  } finally {
    const count = Object.keys(jokes).length;

    if (num > Object.keys(jokes).length) {
      res.send(`The passed path exceeds the number of jokes (${count}).`);
    } else {
      res.json(randomSelect(num));
    }
  }
});

app.get("/jokes/ten", (req, res) => {
  res.json(randomTen());
});

app.get("/jokes/paginated", (req, res) => {
  try {
    const { page = "0", sort = "" } = req.query;
    console.log(page, sort);
    const sortCriteriaArray = sort.split(",").map((criteria) => {
      const [field, order] = criteria.split(":");
      return { field, order };
    });
    console.log(sortCriteriaArray);
    const paginatedJokes = tenByPage(page, sortCriteriaArray);
    res.json({ jokes: paginatedJokes, totalJokes: lastJokeId });
  } catch (e) {
    return "error";
  }
});

app.get("/jokes/types", (req, res) => {
  const types = jokes.reduce((acc, joke) => {
    if (!acc.includes(joke.type)) {
      acc.push(joke.type);
    }
    return acc;
  }, []);
  res.json(types);
});

app.get("/jokes/:type/random", (req, res) => {
  res.json(jokeByType(req.params.type, 1)[0]);
});

app.get("/jokes/:type/ten", (req, res) => {
  res.json(jokeByType(req.params.type, 10));
});

app.get("/jokes/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const joke = jokeById(+id);
    if (!joke) return next({ statusCode: 404, message: "joke not found" });
    return res.json(joke);
  } catch (e) {
    return next(e);
  }
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    type: "error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
