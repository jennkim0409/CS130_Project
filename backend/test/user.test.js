import request from "supertest";
import { closeDatabaseConnection } from "../db.js";

import { app, server } from "../index.js";
import User from "../models/user.js";

beforeAll(async () => {
  try {
    await User.deleteOne({ username: mockUser.username });
    await User.deleteOne({ username: mockRegisterUser.username });

    const hashedPassword = await bcrypt.hash(mockUser.password, 10);
    await User.create({
      username: mockUser.username,
      passwordHash: hashedPassword,
    });
  } catch (error) {
    console.log(error);
  }
}, 10000);

afterAll(async () => {
  // Disconnect from the database after all tests
  try {
    await User.deleteOne({ username: mockUser.username });
    await User.deleteOne({ username: mockRegisterUser.username });
  } catch (error) {
    console.log(error);
  } finally {
    server.close();
    closeDatabaseConnection();
  }
}, 10000);

// beforeEach(async () => {
//   // Remove all users from the database before each test
// });

// Mock user data for testing
const mockUser = {
  username: "testuser",
  password: "testpassword",
};

const mockRegisterUser = {
  username: "testregisteruser",
  password: "testpassword",
};

describe("Authentication Routes", () => {
  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send(mockUser);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("username");
      expect(res.body.user.username).toBe(mockUser.username);

      // Verify that the user is saved in the database
      const savedUser = await User.findOne({ username: mockUser.username });
      expect(savedUser).toBeTruthy();
    });
  });

  describe("POST /login", () => {
    it("should log in an existing user", async () => {
      const res = await request(app).post("/auth/login").send({
        username: mockUser.username,
        password: mockUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.username).toBe(mockUser.username);


    });
  });

  describe("GET /info", () => {
    it("should get user info for authenticated user", async () => {
      // Login to get the token
      const loginRes = await request(app).post("/auth/login").send({
        username: mockUser.username,
        password: mockUser.password,
      });

      // Make authenticated request to /info with token
    //   console.log(loginRes.body)
      const res = await request(app)
        .get("/auth/login/info")
        .set({Authorization: `${loginRes.body.token}` });
        // console.log(res.body)
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe(mockUser.username);
    });
  });
}, 10000);