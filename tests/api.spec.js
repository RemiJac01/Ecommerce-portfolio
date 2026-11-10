import { test, expect } from "@playwright/test";
import { testUser } from "../test_data/data";

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

test("PUT update account returns success", async ({ request }) => {
  const response = await request.put("/api/updateAccount", {
    form: {
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
    },
  });
  const body = await response.json();
  expect(body.responseCode).toBe(200);
  expect(body.message).toBe("User updated!");
});

test("Delete to verify Login", async ({ request }) => {
  const response = await request.delete("/api/verifyLogin");
  const body = await response.json();
  expect(body.responseCode).toBe(405);
  expect(body.message).toBe("This request method is not supported.");
});
