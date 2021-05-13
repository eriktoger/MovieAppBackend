const db = require("./memoryDB");
const request = require("supertest");
const app = require("../app");

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.close());

const userCredentials = {
  name: "name",
  password: "password",
};

describe("User tests", () => {
  test("User can sign up", async () => {
    console.log("here");
    const res = await request(app).post("/user/create").send(userCredentials);
    expect(res.body?.name).toBe("name");
    expect(res.body?.token).toBeDefined();
    expect(res.status).toBe(200);
  });

  test("Two users cannot have the same name", async () => {
    await request(app).post("/user/create").send(userCredentials);
    const res = await request(app).post("/user/create").send(userCredentials);
    expect(res.body).toStrictEqual({ error: "Username not available" });
    expect(res.status).toBe(400);
  });

  test("Existing user can login", async () => {
    await request(app).post("/user/create").send(userCredentials);
    const res = await request(app).post("/user/login").send(userCredentials);
    expect(res.body?.name).toBe("name");
    expect(res.body?.token).toBeDefined();
    expect(res.status).toBe(200);
  });

  test("Wrong password gives login error", async () => {
    await request(app).post("/user/create").send(userCredentials);
    const res = await request(app).post("/user/login").send({
      name: "name",
      password: "Wrong password",
    });
    expect(res.body).toStrictEqual({ error: "Invalid Credentials" });
    expect(res.status).toBe(400);
  });

  test("No user gives login error", async () => {
    const res = await request(app).post("/user/login").send(userCredentials);
    expect(res.body).toStrictEqual({ error: "Invalid Credentials" });
    expect(res.status).toBe(400);
  });
});
