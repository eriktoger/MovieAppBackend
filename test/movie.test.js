const db = require("./memoryDB");
const request = require("supertest");
const app = require("../app");
const axios = require("axios");
const { redisClient } = require("../db/redis");
const redis = require("../db/redis");

const userCredentials = {
  name: "name",
  password: "password",
};

let token;
beforeAll(async () => {
  await db.connect();
});

beforeEach(async () => {
  const res = await request(app).post("/user/create").send(userCredentials);
  token = res.body.token;
});

afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.close());

const movie = {
  Title: "title",
  Released: "released",
  Poster: "poserUrl",
  Ratings: "ratings",
  imdbID: "imdbId",
  Plot: "plot",
};

jest.mock("axios");
jest.mock("../db/redis");

describe("Movie tests", () => {
  test("User can get movie", async () => {
    axios.get.mockResolvedValue({ data: movie });
    const res = await request(app)
      .get("/movie/title")
      .auth(token, { type: "bearer" });
    expect(res.status).toBe(200);
  });

  test("Error message on movie not found", async () => {
    redis.getAsync.mockResolvedValue(null);
    axios.get.mockResolvedValue({ data: null });
    const res = await request(app)
      .get("/movie/title")
      .auth(token, { type: "bearer" });
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({ error: "Movie not found" });
  });

  test("User cannot get movie without token", async () => {
    const res = await request(app)
      .get("/movie/title")
      .auth("wrong token", { type: "bearer" });
    expect(res.status).toBe(401);
  });

  test("User get error message if search crashes", async () => {
    axios.get.mockImplementation(() => {
      throw new Error("Movie site crashed");
    });
    const res = await request(app)
      .get("/movie/title")
      .auth(token, { type: "bearer" });
    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({ error: "Movie search failed" });
  });

  test("Get movie if it is in cache", async () => {
    redis.getAsync.mockResolvedValue(JSON.stringify(movie));
    const res = await request(app)
      .get("/movie/title")
      .auth(token, { type: "bearer" });
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(movie);
  });
});
