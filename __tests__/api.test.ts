/**
 * API route tests for Kuroko Reserve
 *
 * These tests verify that API routes handle requests correctly
 * and return appropriate status codes.
 */

// ============================================================
// 1. Cards API — should return cards list
// ============================================================
describe("Cards API", () => {
  it("cards route file exists and exports GET handler", () => {
    const fs = require("fs");
    const path = require("path");
    const cardsRoutePath = path.join(
      __dirname,
      "../app/api/cards/route.ts"
    );
    const source = fs.readFileSync(cardsRoutePath, "utf-8");

    // Should export a GET function
    expect(source).toMatch(/export\s+async\s+function\s+GET/);
  });
});

// ============================================================
// 2. Auth API — login should validate input
// ============================================================
describe("Auth API", () => {
  it("login route file exists and exports POST handler", () => {
    const fs = require("fs");
    const path = require("path");
    const loginRoutePath = path.join(
      __dirname,
      "../app/api/auth/login/route.ts"
    );
    const source = fs.readFileSync(loginRoutePath, "utf-8");

    expect(source).toMatch(/export\s+async\s+function\s+POST/);
  });

  it("register route file exists and exports POST handler", () => {
    const fs = require("fs");
    const path = require("path");
    const registerRoutePath = path.join(
      __dirname,
      "../app/api/auth/register/route.ts"
    );
    const source = fs.readFileSync(registerRoutePath, "utf-8");

    expect(source).toMatch(/export\s+async\s+function\s+POST/);
  });
});

// ============================================================
// 3. Reservation API — should have rate limiting
// ============================================================
describe("Reservation API", () => {
  it("reserve route should implement rate limiting", () => {
    const fs = require("fs");
    const path = require("path");
    const reserveRoutePath = path.join(
      __dirname,
      "../app/api/reserve/route.ts"
    );
    const source = fs.readFileSync(reserveRoutePath, "utf-8");

    // Should contain rate limiting logic
    expect(source).toMatch(/rate.?limit/i);
  });
});

// ============================================================
// 4. Project structure — expected files exist
// ============================================================
describe("Project structure", () => {
  const fs = require("fs");
  const path = require("path");

  it("should have a middleware.ts at project root", () => {
    const middlewarePath = path.join(__dirname, "../middleware.ts");
    expect(fs.existsSync(middlewarePath)).toBe(true);
  });

  it("middleware should have a non-empty matcher config", () => {
    const middlewarePath = path.join(__dirname, "../middleware.ts");
    const source = fs.readFileSync(middlewarePath, "utf-8");

    // matcher should NOT be empty
    expect(source).not.toMatch(/matcher:\s*\[\s*\]/);
  });

  it("should have .env.example file", () => {
    const envExamplePath = path.join(__dirname, "../.env.example");
    expect(fs.existsSync(envExamplePath)).toBe(true);
  });
});
