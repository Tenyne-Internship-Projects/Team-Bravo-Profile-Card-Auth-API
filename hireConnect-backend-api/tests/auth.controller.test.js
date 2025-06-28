// External
import request from "supertest";
import bcrypt from "bcrypt";

// Internal
import { prisma } from "../src/prisma/prismaClient.js";

// Mocks
import { jest } from "@jest/globals";

//  Setup mock BEFORE importing anything else
jest.unstable_mockModule("../src/utils/mailer.js", () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(true),
  transporter: {}, // 👈 export it to avoid crash
}));

//  Dynamically import after mocks are set
const { sendOTPEmail } = await import("../src/utils/mailer.js");
const app = (await import("../server.js")).default || (await import("../server.js")).app;



describe("Auth Register & OTP Flow", () => {
  const testEmail = `testuser+${Date.now()}@mail.com`;
  const testPassword = "testPassword123";

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "testuser+" } } });
    await prisma.$disconnect();
  });

  it("should register a new user and send OTP", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/OTP sent/i);
    expect(res.body.user).toBeDefined();
  });

  it("should resend OTP to the registered user", async () => {
    const res = await request(app).post("/api/auth/resend-otp").send({
      email: testEmail,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should fail to register again with the same email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Again",
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // Note: Skipping verify-otp test due to OTP not being persisted in-memory.
});


describe("Login & Token Flow", () => {
  const loginEmail = `loginuser+${Date.now()}@mail.com`;
  const rawPassword = "loginTest123";

  beforeAll(async () => {
    const hashed = await bcrypt.hash(rawPassword, 10);
    await prisma.user.create({
      data: {
        name: "Login User",
        email: loginEmail,
        password: hashed,
        is_account_verified: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: loginEmail } });
    await prisma.$disconnect();
  });

  it("should login successfully and return access token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: loginEmail,
      password: rawPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(loginEmail);
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: loginEmail,
      password: "wrongPassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should logout successfully", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/logged out/i);
  });
});
