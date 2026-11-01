import { test, expect } from "@playwright/test";

test("GET products list returns valid product data", async ({ request }) => {
  const response = await request.get("/api/productsList");
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body.responseCode).toBe(200);
  expect(body.products.length).toBeGreaterThan(0);
  expect(body.products[0].name).toBe("Blue Top");
});

test("reject with 405 test", async ({ request }) => {
  const response = await request.post("/api/productsList");
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body.responseCode).toBe(405);
  expect(body.message).toBe("This request method is not supported.");
});

test("searching for a product", async ({ request }) => {
  const response = await request.post("/api/searchProduct", {
    form: {
      search_product: "top",
    },
  });
  const body = await response.json();
  expect(body.responseCode).toBe(200);
  expect(body.products[0].id).toBe(1);
  expect(body.products[0].name).toBe("Blue Top");
});
