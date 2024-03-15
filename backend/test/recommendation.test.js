import request from "supertest";
import bcrypt from "bcrypt";
import { closeDatabaseConnection } from "../db.js";

import { app, server } from "../index.js";
import User from "../models/user.js";


let token;
let userId;
const mockUser = {
    username: "testuser",
    password: "testpassword",
};

beforeAll(async () => {
    try {
        const res = await request(app)
        .post('/auth/register')
        .send(mockUser);
        userId = res.body.user.id;
        token = res.body.token;
        
    } catch (error) {
      console.log(error);
    }
}, 10000);

afterAll(async () => {
    // Disconnect from the database after all tests
    try {
        await User.deleteOne({ username: mockUser.username });
    } catch (error) {
      console.log(error);
    } finally {
      server.close();
      closeDatabaseConnection();
    }
}, 10000);

describe("Recomendation Routes", () => {
    describe("GET /api/recommend/", () => {
      it("should get recommendations for user", async () => {
        // Make authenticated request to /info with token
        const loginRes = await request(app).post("/auth/login").send({
          username: mockUser.username,
          password: mockUser.password,
        });
  
        // Make authenticated request to /info with token
        const res = await request(app)
          .get("/auth/login/info")
          .set({ Authorization: `${loginRes.body.token}` });
  
        const recommendationResponse = await request(app)
          .post(`/api/recommend/${loginRes.body.user_id}`)
          .set({ Authorization: `${loginRes.body.token}` });
  
        expect(recommendationResponse.statusCode).toBe(200);
        expect(recommendationResponse.body.length === 0).toBeTruthy();
      }, 300000);
    });
  });
  
  describe("GET /api/recommend/", () => {
    it("should get recommendations for user", async () => {
      // Make authenticated request to /info with token
      const loginRes = await request(app).post("/auth/login").send({
        username: mockUser.username,
        password: mockUser.password,
      });
  
      const updateUserRes = await request(app)
        .patch(`/api/user/set/${loginRes.body.user_id}`)
        .send({
          name: "Test user",
          genrePrefs: ["fiction"],
        })
        .set({ Authorization: `${loginRes.body.token}` });
  
      expect(updateUserRes.statusCode).toBe(201);
  
      const recommendationResponse = await request(app)
        .post(`/api/recommend/${loginRes.body.user_id}`)
        .set({ Authorization: `${loginRes.body.token}` });
  
      expect(recommendationResponse.statusCode).toBe(200);
      expect(recommendationResponse.body.length > 0).toBeTruthy();
    }, 300000);
  });




