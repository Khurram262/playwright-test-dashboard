import type { TestRun } from "@/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const screenshot1 = PlaceHolderImages.find(img => img.id === 'test-screenshot-1');

// This file now acts as a source for initial or fallback data.
// The main data source is now managed in the page component and localStorage.
export const testRuns: TestRun[] = [
  {
    runId: "run-20240520-1",
    executionDate: "2024-05-20T10:30:00Z",
    tests: [
      {
        id: "test-001",
        name: "User Login and Authentication",
        description: "Verifies that a user can successfully log in with valid credentials.",
        duration: 2580,
        status: "passed",
      },
      {
        id: "test-002",
        name: "User Profile Update",
        description: "Checks if a user can update their profile information.",
        duration: 5120,
        status: "passed",
      },
      {
        id: "test-003",
        name: "Shopping Cart - Add Item",
        description: "Ensures items can be added to the shopping cart.",
        duration: 7340,
        status: "failed",
        error: "Timeout: Expected element 'button#add-to-cart' to be visible.",
        errorLog: `
Error: Timeout 5000ms exceeded.
=========================== logs ===========================
waiting for locator('button#add-to-cart')
  locator resolved to <button id="add-to-cart" disabled>Add to Cart</button>
attempting click action
  waiting for element to be visible, enabled and stable
    element is not enabled - waiting...
============================================================
    at /tests/shopping-cart.spec.ts:25:18
`,
        attachments: screenshot1 ? [{
          type: "screenshot",
          path: screenshot1.imageUrl,
          description: screenshot1.description,
        }] : [],
      },
      {
        id: "test-004",
        name: "Payment Gateway Integration",
        description: "Test payment processing with a mock gateway.",
        duration: 0,
        status: "skipped",
      },
       {
        id: "test-005",
        name: "Search Functionality",
        description: "Verifies search returns relevant results.",
        duration: 3200,
        status: "passed",
      },
    ],
  },
  {
    runId: "run-20240519-1",
    executionDate: "2024-05-19T18:00:00Z",
    tests: [
       {
        id: "test-101",
        name: "Homepage Load Performance",
        description: "Measures the load time of the homepage.",
        duration: 1200,
        status: "passed",
      },
      {
        id: "test-102",
        name: "API - Get User Data",
        description: "Checks the /api/user endpoint for correctness.",
        duration: 850,
        status: "passed",
      },
      {
        id: "test-103",
        name: "API - Create Post",
        description: "Verifies post creation via API.",
        duration: 1100,
        status: "passed",
      },
    ],
  },
];
