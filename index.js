const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const windowSize = 10;
let numbers = [];

const accessToken =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE1MTUyNTQyLCJpYXQiOjE3MTUxNTIyNDIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijc4ZDM0Y2JlLTljYzYtNDIyYS05MGE3LWU5MThkYzkwMGExYiIsInN1YiI6IjIxMDUwNDJAa2lpdC5hYy5pbiJ9LCJjb21wYW55TmFtZSI6ImFmZm9yZG1lZCIsImNsaWVudElEIjoiNzhkMzRjYmUtOWNjNi00MjJhLTkwYTctZTkxOGRjOTAwYTFiIiwiY2xpZW50U2VjcmV0IjoiRFpEU0xuV012T09oSU1CdyIsIm93bmVyTmFtZSI6Ik5lZXNoaWthbnQgTmFuZGEiLCJvd25lckVtYWlsIjoiMjEwNTA0MkBraWl0LmFjLmluIiwicm9sbE5vIjoiMjEwNTA0MiJ9.oZfmKl3YxaXV7zD1Oo6GNw4pmM8rZN25BHLTyzlhPUQ";

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`http://20.244.56.144/test/${type}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.numbers;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error("Conflict fetching numbers:", error.response.data);
    } else {
      console.error("Error fetching numbers:", error.message);
    }
    return [];
  }
};

const calculateAverage = (arr) => {
  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  return sum / arr.length;
};

app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;

  let newNumbers;
  switch (numberid) {
    case "p":
      newNumbers = await fetchNumbers("primes");
      break;
    case "f":
      newNumbers = await fetchNumbers("fibo");
      break;
    case "e":
      newNumbers = await fetchNumbers("even");
      break;
    case "r":
      newNumbers = await fetchNumbers("random");
      break;
    default:
      return res.status(400).json({ error: "Invalid number ID" });
  }

  numbers = [...new Set([...numbers, ...newNumbers])];

  if (numbers.length > windowSize) {
    numbers = numbers.slice(numbers.length - windowSize);
  }

  let avg = null;
  if (numbers.length === windowSize) {
    avg = calculateAverage(numbers);
  }

  const response = {
    windowPrevState: numbers.slice(0, numbers.length - newNumbers.length),
    windowCurrState: numbers,
    numbers: newNumbers,
    avg: avg,
  };

  res.json(response);
});

app.listen(9876, () => { console.log("Server running on port");

});