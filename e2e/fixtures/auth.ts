import { expect, type Page } from "@playwright/test";

export const TEST_USERS = {
  admin: {
    email: "admin@penn.com",
    password: "password123",
  },
} as const;

export async function login(
  page: Page,
  credentials: { email: string; password: string },
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

export async function loginAsAdmin(page: Page) {
  await login(page, TEST_USERS.admin);
  await expect(page).toHaveURL("/");
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");
}

export async function expectLoginPage(page: Page) {
  await expect(page).toHaveURL("/login");
}

export async function expectHomePage(page: Page) {
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}
