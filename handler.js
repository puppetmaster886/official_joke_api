const jokes = require("./jokes/index.json");

let lastJokeId = 0;
jokes.forEach((jk) => (jk.id = ++lastJokeId));

const randomJoke = () => {
  return jokes[Math.floor(Math.random() * jokes.length)];
};

/**
 * Get N random jokes from a jokeArray
 */
const randomN = (jokeArray, n) => {
  const limit = jokeArray.length < n ? jokeArray.length : n;
  const randomIndicesSet = new Set();

  while (randomIndicesSet.size < limit) {
    const randomIndex = Math.floor(Math.random() * jokeArray.length);
    if (!randomIndicesSet.has(randomIndex)) {
      randomIndicesSet.add(randomIndex);
    }
  }

  return Array.from(randomIndicesSet).map((randomIndex) => {
    return jokeArray[randomIndex];
  });
};

const tenByPage = (page, sortC) => {
  const start = Number(page) * 10;
  const end = (Number(page) + 1) * 10;
  const sortedJokes = jokes.sort((a, b) => {
    return sortC.reduce((acc, sortCriteria) => {
      const { field, order } = sortCriteria;
      if (acc !== 0) return acc;
      if (a[field] < b[field]) return order === "asc" ? -1 : 1;
      if (a[field] > b[field]) return order === "asc" ? 1 : -1;
      return 0;
    }, 0);
  });
  console.log(start, end);
  return sortedJokes.slice(start, end);
};

const randomTen = () => randomN(jokes, 10);

const randomSelect = (number) => randomN(jokes, number);

const jokeByType = (type, n) => {
  return randomN(
    jokes.filter((joke) => joke.type === type),
    n
  );
};

/**
 * @param {Number} id - joke id
 * @returns a single joke object or undefined
 */
const jokeById = (id) => jokes.filter((jk) => jk.id === id)[0];

module.exports = {
  jokes,
  randomJoke,
  randomN,
  randomTen,
  randomSelect,
  jokeById,
  jokeByType,
  tenByPage,
  lastJokeId,
};
