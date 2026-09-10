import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  logout,
  expectLoginPage,
  expectHomePage,
} from "../fixtures/auth";

test.describe("authentication", () => {
  test("redirects to /login when visiting a protected route while logged out", async ({ page }) => {
    await page.goto("/");

    await expectLoginPage(page);
  });

  test("logging in with valid admin credentials redirects to / and shows authenticated UI", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await expectHomePage(page);
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("session persists after a full page reload", async ({ page }) => {
    await loginAsAdmin(page);

    await page.reload();

    await expectHomePage(page);
  });

  test("signing out clears the session and protected routes redirect to /login again", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await logout(page);

    await page.goto("/");
    await expectLoginPage(page);
  });

  test("admin can access the admin-only /users route", async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole("link", { name: "Users" }).click();

    await expect(page).toHaveURL("/users");
  });

  test("redirects to /login when visiting the admin-only /users route while logged out", async ({
    page,
  }) => {
    await page.goto("/users");

    await expectLoginPage(page);
  });

  test("navigating to an unknown route while authenticated redirects to /", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/some-nonexistent-page");

    await expectHomePage(page);
  });

  test("navigating to an unknown route while logged out redirects to /login", async ({
    page,
  }) => {
    await page.goto("/some-nonexistent-page");

    await expectLoginPage(page);
  });

  test("navigating to /login while already logged in redirects to /", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/login");

    await expectHomePage(page);
  });
});
