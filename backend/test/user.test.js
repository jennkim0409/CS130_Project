import request from "supertest"
import app from "../index.js"


describe("POST /auth/login", () => {
    describe("Given a username and password", () => {
        // Should successfully login a user and provide a token 
        // Should respond with a JSON object containing user details  
        // Should respond with status code 200 
        test("should respond with a 200 status code", async() => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    username: "GenrePref1",
                    password: "123"
                })
            expect(response.statusCode).toBe(200)
        });
        
    });

    describe("Username missing", ()=> {
        // If client fails to send a username to the server respond with code 401 (user error)

    });
});