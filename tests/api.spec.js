import { test, expect } from "@playwright/test";

test("GET products list returns valid product data", async ({ request }) => {
  const response = await request.get("/api/productsList");
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body.responseCode).toBe(200);
  expect(body.products.length).toBeGreaterThan(0);
  expect(body.products[0].name).toBe("Blue Top");
});
