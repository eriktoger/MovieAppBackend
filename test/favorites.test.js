const db = require("./memoryDB");
const request = require("supertest");
const app = require("../app");

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

const favorite = { title: "title", imdbID: "imdbID" };
jest.mock("../db/redis");
describe("Favorite tests", () => {
  test("User cannot add favorite without token", async () => {
    const res = await request(app)
      .post("/favorites")
      .auth("wrong token", { type: "bearer" })
      .set("Content-Type", "application/json")
      .send(favorite);
    expect(res.status).toBe(401);
  });

  test("User can add favorite", async () => {
    const res = await request(app)
      .post("/favorites")
      .auth(token, { type: "bearer" })
      .set("Content-Type", "application/json")
      .send(favorite);
    expect(res.status).toBe(200);
  });

  test("User can get favorite", async () => {
    await request(app)
      .post("/favorites")
      .auth(token, { type: "bearer" })
      .set("Content-Type", "application/json")
      .send(favorite);
    const res = await request(app)
      .get("/favorites")
      .auth(token, { type: "bearer" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([favorite]);
  });

  test("User cannot get favorite without token", async () => {
    const res = await request(app)
      .get("/favorites")
      .auth("wrong token", { type: "bearer" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(401);
  });

  test("User can delete favorite", async () => {
    await request(app)
      .post("/favorites")
      .auth(token, { type: "bearer" })
      .set("Content-Type", "application/json")
      .send(favorite);
    await request(app)
      .delete("/favorites")
      .auth(token, { type: "bearer" })
      .set("Content-Type", "application/json")
      .send(favorite);
    const res = await request(app)
      .get("/favorites")
      .auth(token, { type: "bearer" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  test("User cannot delete favorite without token", async () => {
    const res = await request(app)
      .delete("/favorites")
      .auth("wrong token", { type: "bearer" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(401);
  });
});
