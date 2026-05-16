/**
 * Security tests for Kuroko Reserve
 *
 * These tests verify that security-critical configurations
 * reject unsafe defaults in production.
 */

// ============================================================
// 1. JWT Secret — must NOT use a hardcoded fallback in production
// ============================================================
describe("JWT Secret security", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should throw an error when JWT_SECRET is missing in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;

    expect(() => {
      require("../lib/auth");
    }).toThrow("JWT_SECRET environment variable is not set");
  });

  it("should NOT throw when JWT_SECRET is set in production", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "a-very-strong-secret-key-at-least-32-chars";

    expect(() => {
      require("../lib/auth");
    }).not.toThrow();
  });

  it("should warn but not throw in development when JWT_SECRET is missing", () => {
    process.env.NODE_ENV = "development";
    delete process.env.JWT_SECRET;

    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    expect(() => {
      require("../lib/auth");
    }).not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("JWT_SECRET is not set")
    );

    warnSpy.mockRestore();
  });
});

// ============================================================
// 2. Admin PIN — must NOT default to "1234"
// ============================================================
describe("Admin PIN security", () => {
  // The auth route is a Next.js route handler, so we test its behavior
  // by verifying the source code does not contain the insecure default
  it("admin auth route source should NOT contain hardcoded '1234' as default PIN", () => {
    const fs = require("fs");
    const path = require("path");
    const authRoutePath = path.join(
      __dirname,
      "../app/api/admin/auth/route.ts"
    );
    const source = fs.readFileSync(authRoutePath, "utf-8");

    // Should not have: process.env.ADMIN_PIN || "1234"
    expect(source).not.toMatch(/ADMIN_PIN\s*\|\|\s*["']1234["']/);
  });

  it("admin auth route source should check for missing ADMIN_PIN", () => {
    const fs = require("fs");
    const path = require("path");
    const authRoutePath = path.join(
      __dirname,
      "../app/api/admin/auth/route.ts"
    );
    const source = fs.readFileSync(authRoutePath, "utf-8");

    // Should check if ADMIN_PIN is not set and return 500
    expect(source).toContain("not configured");
    expect(source).toContain("500");
  });
});

// ============================================================
// 3. No hardcoded secrets in auth module
// ============================================================
describe("No hardcoded secrets in auth module", () => {
  it("auth.ts should NOT contain a static fallback secret string", () => {
    const fs = require("fs");
    const path = require("path");
    const authPath = path.join(__dirname, "../lib/auth.ts");
    const source = fs.readFileSync(authPath, "utf-8");

    // Should NOT have a literal "fallback-secret-key" string
    expect(source).not.toContain("fallback-secret-key");
  });
});
