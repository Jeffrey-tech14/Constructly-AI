# Constructly AI - Testing Guide

> Comprehensive guide to testing calculators, components, hooks, and integrations

---

## 📌 Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Testing Pure Functions](#testing-pure-functions)
4. [Testing React Hooks](#testing-react-hooks)
5. [Testing Components](#testing-components)
6. [Testing Forms & User Input](#testing-forms--user-input)
7. [Testing Async Operations](#testing-async-operations)
8. [Integration Testing](#integration-testing)
9. [Snapshot Testing](#snapshot-testing)
10. [Performance Testing](#performance-testing)
11. [E2E Testing](#e2e-testing)
12. [Test Utilities & Helpers](#test-utilities--helpers)

---

## Testing Philosophy

### Principles

1. **Test Behavior, Not Implementation** - Test what the component/function does, not how it does it
2. **Use Realistic Scenarios** - Write tests that match real user workflows
3. **Keep Tests Maintainable** - Clear, simple tests that don't break with small changes
4. **Complete Coverage** - Aim for 80%+ coverage on critical paths
5. **Fast Feedback** - Unit tests run in milliseconds, not seconds

### Test Pyramid

```
        /\
       /  \  E2E Tests (Slow)
      /    \
     /______\

    /        \
   /  Component  \  Integration Tests (Medium)
  /    Tests      \
 /________________\

/                  \
   Unit/Hook Tests  \ (Fast)
/____________________\

├─ ~70% Unit Tests (fast, isolated)
├─ ~20% Integration Tests (realistic scenarios)
└─ ~10% E2E Tests (critical user journeys)
```

---

## Test Structure

### Standard Test File Layout

```typescript
// location: src/__tests__/hooks/useConcreteCalculator.test.ts

import { renderHook, act } from "@testing-library/react";
import { useConcreteCalculator } from "@/hooks/useConcreteCalculator";
import { mockMaterialPrices, createMockQuote } from "../mocks";

describe("useConcreteCalculator", () => {
  // Section 1: Component renders
  describe("rendering", () => {
    test("initializes with default values", () => {
      // ...
    });
  });

  // Section 2: State updates
  describe("state updates", () => {
    test("updates input when setInput called", () => {
      // ...
    });
  });

  // Section 3: Calculations
  describe("calculations", () => {
    test("calculates volume correctly", () => {
      // ...
    });
  });

  // Section 4: Edge cases
  describe("edge cases", () => {
    test("handles zero values gracefully", () => {
      // ...
    });
  });

  // Section 5: Integration
  describe("integration", () => {
    test("notifies parent of calculation changes", () => {
      // ...
    });
  });
});
```

### Setup File Structure

```typescript
// src/__tests__/setup.ts
import "@testing-library/jest-dom"; // Adds .toBeInTheDocument() etc
import { server } from "./mocks/server"; // MSW setup

// Mock environment variables
process.env.VITE_SUPABASE_URL = "https://test.supabase.co";
process.env.VITE_APP_URL = "https://localhost:3000";

// Start MSW server for API mocking
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mock Organization

```typescript
// src/__tests__/mocks/index.ts
export { createMockQuote } from "./quote";
export { mockMaterialPrices } from "./material";
export { mockAuthState } from "./auth";
export { mockGeometry } from "./geometry";
```

---

## Testing Pure Functions

### Test Utility Functions

```typescript
// src/utils/concreteCalculations.ts
export function calculateConcreteVolume(
  input: ConcreteInput,
): ConcreteCalculation {
  let volume = 0;
  if (input.shape === "rectangular") {
    volume = input.length * input.width * input.height;
  } else if (input.shape === "circular") {
    const radius = input.diameter / 2;
    volume = Math.PI * radius * radius * input.height;
  }

  const volumeWithWastage = volume * (1 + input.wastagePercent / 100);
  const totalWeight = volumeWithWastage * input.density;

  return {
    volume,
    categoryWastage: volumeWithWastage - volume,
    totalVolumWithWastage: volumeWithWastage,
    density: input.density,
    totalWeight,
    costKES: totalWeight * input.unitPrice,
  };
}

// Test file: src/__tests__/utils/concreteCalculations.test.ts
describe("calculateConcreteVolume", () => {
  describe("rectangular shape", () => {
    test("calculates volume correctly", () => {
      const result = calculateConcreteVolume({
        shape: "rectangular",
        length: 10,
        width: 10,
        height: 2,
        wastagePercent: 5,
        unitPrice: 100,
        density: 2400,
      });

      expect(result.volume).toBe(200); // 10 * 10 * 2
      expect(result.totalVolumWithWastage).toBe(210); // 200 * 1.05
    });

    test("calculates cost with wastage", () => {
      const result = calculateConcreteVolume({
        shape: "rectangular",
        length: 10,
        width: 10,
        height: 1,
        wastagePercent: 10,
        unitPrice: 500,
        density: 2400,
      });

      const expectedVolume = 100; // 10*10*1
      const withWastage = 110; // 100 * 1.1
      const weight = 110 * 2400; // 264,000 kg
      const cost = weight * 500;

      expect(result.totalWeight).toBe(weight);
      expect(result.costKES).toBe(cost);
    });
  });

  describe("circular shape", () => {
    test("calculates cylinder volume correctly", () => {
      const result = calculateConcreteVolume({
        shape: "circular",
        diameter: 4,
        height: 2,
        wastagePercent: 0,
        unitPrice: 100,
        density: 2400,
      });

      const expectedVolume = Math.PI * 2 * 2 * 2; // π * r² * h where r=2
      expect(result.volume).toBeCloseTo(expectedVolume, 2);
    });
  });

  describe("edge cases", () => {
    test("handles zero volume", () => {
      const result = calculateConcreteVolume({
        shape: "rectangular",
        length: 0,
        width: 10,
        height: 2,
        wastagePercent: 5,
        unitPrice: 100,
        density: 2400,
      });

      expect(result.volume).toBe(0);
      expect(result.costKES).toBe(0);
    });

    test("handles large values without overflow", () => {
      const result = calculateConcreteVolume({
        shape: "rectangular",
        length: 1000,
        width: 1000,
        height: 100,
        wastagePercent: 50,
        unitPrice: 10000,
        density: 2400,
      });

      expect(result.volume).toBe(100000000);
      expect(result.costKES).toBeGreaterThan(0);
    });
  });
});
```

---

## Testing React Hooks

### Hook Testing Template

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { useConcreteCalculator } from "@/hooks/useConcreteCalculator";

describe("useConcreteCalculator hook", () => {
  test("initializes with provided data", () => {
    const initialData = { shape: "rectangular", length: 10, width: 10, height: 2 };

    const { result } = renderHook(() =>
      useConcreteCalculator({ initialData })
    );

    expect(result.current.input).toEqual(initialData);
  });

  test("updates input state", () => {
    const { result } = renderHook(() =>
      useConcreteCalculator({ initialData: { ... } })
    );

    act(() => {
      result.current.setInput((prev) => ({
        ...prev,
        height: 3,
      }));
    });

    expect(result.current.input.height).toBe(3);
  });

  test("calculates when input changes", async () => {
    const { result } = renderHook(() =>
      useConcreteCalculator({
        initialData: { shape: "rectangular", length: 10, width: 10, height: 2 },
      })
    );

    await waitFor(() => {
      expect(result.current.calculations).toBeDefined();
      expect(result.current.calculations?.volume).toBe(200);
    });
  });

  test("fetches material prices", async () => {
    const mockPrices = [
      { material_name: "Concrete", price_kes: 500, unit: "m³" },
    ];

    const { result } = renderHook(() =>
      useConcreteCalculator({
        initialData: { ... },
        materialPrices: mockPrices,
      })
    );

    await waitFor(() => {
      expect(result.current.calculations?.costKES).toBeGreaterThan(0);
    });
  });

  test("calls callback when calculations update", () => {
    const onCalcChange = jest.fn();

    const { result } = renderHook(() =>
      useConcreteCalculator({
        initialData: { ... },
        onCalculationsChange: onCalcChange,
      })
    );

    act(() => {
      result.current.setInput((prev) => ({ ...prev, height: 5 }));
    });

    expect(onCalcChange).toHaveBeenCalled();
    expect(onCalcChange).toHaveBeenCalledWith(
      expect.objectContaining({ volume: expect.any(Number) })
    );
  });

  test("handles missing material prices gracefully", () => {
    const { result } = renderHook(() =>
      useConcreteCalculator({
        initialData: { ... },
        materialPrices: [], // Empty
      })
    );

    expect(result.current.calculations).toBeDefined();
    expect(result.current.calculations?.costKES).toBe(0); // Default price
  });
});
```

### Testing Hook Dependencies

```typescript
describe("useConcreteCalculator dependencies", () => {
  test("recalculates when materialPrices change", () => {
    const prices1 = [{ material_name: "Concrete", price_kes: 100, unit: "m³" }];
    const prices2 = [{ material_name: "Concrete", price_kes: 200, unit: "m³" }];

    const { result, rerender } = renderHook(
      ({ prices }) =>
        useConcreteCalculator({
          initialData: {
            shape: "rectangular",
            length: 10,
            width: 10,
            height: 1,
          },
          materialPrices: prices,
        }),
      { initialProps: { prices: prices1 } },
    );

    const cost1 = result.current.calculations?.costKES;

    rerender({ prices: prices2 });

    const cost2 = result.current.calculations?.costKES;

    expect(cost2).toBeGreaterThan(cost1!);
  });
});
```

---

## Testing Components

### Component Testing Template

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { ConcreteCalculatorForm } from "@/components/ConcreteCalculatorForm";

describe("ConcreteCalculatorForm", () => {
  const mockQuote = { /* ... */ };
  const mockSetQuoteData = jest.fn();
  const mockMaterialPrices = [
    { material_name: "Concrete", price_kes: 500, unit: "m³" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    test("renders all input fields", () => {
      render(
        <ConcreteCalculatorForm
          quoteData={mockQuote}
          setQuoteData={mockSetQuoteData}
          materialPrices={mockMaterialPrices}
        />
      );

      expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shape/i)).toBeInTheDocument();
    });

    test("renders calculation results", async () => {
      render(
        <ConcreteCalculatorForm
          quoteData={mockQuote}
          setQuoteData={mockSetQuoteData}
          materialPrices={mockMaterialPrices}
        />
      );

      // Wait for calculations to appear
      await screen.findByText(/total cost/i);
      expect(screen.getByText(/KES/)).toBeInTheDocument();
    });
  });

  describe("user interactions", () => {
    test("updates calculation when height changes", async () => {
      render(
        <ConcreteCalculatorForm
          quoteData={mockQuote}
          setQuoteData={mockSetQuoteData}
          materialPrices={mockMaterialPrices}
        />
      );

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: "5" } });

      // Check that parent was notified
      expect(mockSetQuoteData).toHaveBeenCalled();
    });

    test("disables inputs in readonly mode", () => {
      render(
        <ConcreteCalculatorForm
          quoteData={mockQuote}
          setQuoteData={mockSetQuoteData}
          materialPrices={mockMaterialPrices}
          readonly={true}
        />
      );

      expect(screen.getByLabelText(/height/i)).toBeDisabled();
      expect(screen.getByLabelText(/width/i)).toBeDisabled();
    });
  });

  describe("validation", () => {
    test("shows error for missing required fields", async () => {
      render(
        <ConcreteCalculatorForm
          quoteData={{ ...mockQuote, length: undefined }}
          setQuoteData={mockSetQuoteData}
          materialPrices={mockMaterialPrices}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

      await screen.findByText(/length is required/i);
    });
  });
});
```

---

## Testing Forms & User Input

### Form Input Testing

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteForm } from "@/components/QuoteForm";

describe("QuoteForm", () => {
  test("submits form with valid data", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<QuoteForm onSubmit={onSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/project name/i), "Test Project");
    await user.type(screen.getByLabelText(/client email/i), "test@example.com");

    // Submit
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          projectName: "Test Project",
          clientEmail: "test@example.com",
        })
      );
    });
  });

  test("shows validation errors", async () => {
    const user = userEvent.setup();

    render(<QuoteForm onSubmit={jest.fn()} />);

    // Submit without filling required fields
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  test("clears form after successful submission", async () => {
    const user = userEvent.setup();

    render(<QuoteForm onSubmit={jest.fn().mockResolvedValue(undefined)} />);

    const nameInput = screen.getByLabelText(/project name/i);
    await user.type(nameInput, "Test");
    expect(nameInput).toHaveValue("Test");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(nameInput).toHaveValue("");
    });
  });
});
```

---

## Testing Async Operations

### Testing Data Fetching

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { QuotesList } from "@/components/QuotesList";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
jest.mock("@/integrations/supabase/client");

describe("QuotesList", () => {
  test("loads and displays quotes", async () => {
    const mockQuotes = [
      { id: "1", projectName: "Project 1" },
      { id: "2", projectName: "Project 2" },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockQuotes,
          error: null,
        }),
      }),
    });

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText("Project 1")).toBeInTheDocument();
      expect(screen.getByText("Project 2")).toBeInTheDocument();
    });
  });

  test("shows loading state while fetching", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: [], error: null }), 100)
            )
        ),
      }),
    });

    render(<QuotesList />);

    // Should show loading skeleton initially
    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();

    // Eventually shows data
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  test("handles fetch errors gracefully", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Network error" },
        }),
      }),
    });

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Async State Updates

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuotes } from "@/hooks/useQuotes";
import { supabase } from "@/integrations/supabase/client";

jest.mock("@/integrations/supabase/client");

describe("useQuotes", () => {
  test("fetches quotes on mount", async () => {
    const mockQuotes = [{ id: "1", projectName: "Test" }];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockQuotes }),
      }),
    });

    const { result } = renderHook(() => useQuotes());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.quotes).toEqual(mockQuotes);
    });
  });

  test("handles save operation", async () => {
    const newQuote = { projectName: "New Quote" };

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ data: newQuote }),
    });

    const { result } = renderHook(() => useQuotes());

    act(() => {
      result.current.saveQuote(newQuote);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });
  });
});
```

---

## Integration Testing

### Testing Complete Features

```typescript
// Test a complete feature workflow
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { mockMaterialPrices } from "../mocks";

describe("Quote Builder Integration", () => {
  test("complete workflow: create, edit, save", async () => {
    const user = userEvent.setup();

    render(
      <QuoteBuilder
        initialQuote={undefined}
        materialPrices={mockMaterialPrices}
      />
    );

    // Step 1: Fill project info
    await user.type(
      screen.getByLabelText(/project name/i),
      "Integration Test Project"
    );
    await user.type(
      screen.getByLabelText(/client name/i),
      "Test Client"
    );

    // Step 2: Add concrete calculation
    await user.type(screen.getByLabelText(/length/i), "10");
    await user.type(screen.getByLabelText(/width/i), "10");
    await user.type(screen.getByLabelText(/height/i), "2");

    // Step 3: Verify calculations updated
    await waitFor(() => {
      const totalElement = screen.getByText(/total.*cost/i);
      expect(totalElement).toBeInTheDocument();
      expect(totalElement).not.toHaveTextContent("0");
    });

    // Step 4: Save quote
    await user.click(screen.getByRole("button", { name: /save/i }));

    // Step 5: Verify save success
    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });
});
```

---

## Snapshot Testing

### When To Use Snapshots

```typescript
// ✅ Good: Complex UI structure that rarely changes
test("renders quote summary correctly", () => {
  const { container } = render(
    <QuoteSummary quote={mockQuote} />
  );

  expect(container.firstChild).toMatchSnapshot();
});

// ⚠️ Use with caution: Snapshots of dynamic data

// ❌ Bad: Snapshot includes timestamps or IDs
test("renders list item", () => {
  // Don't snapshot if it includes Date.now(), UUIDs, etc.
  const { container } = render(
    <ListItem item={{ id: randomId(), createdAt: now() }} />
  );

  expect(container).toMatchSnapshot(); // Will fail randomly
});
```

### Snapshot Testing Best Practices

```typescript
describe("Snapshot Tests", () => {
  test("snapshots only include relevant structure", () => {
    const quote = {
      id: "should-not-snapshot-id", // Will change
      projectName: "Test",
      clientName: "Client",
    };

    const { container } = render(<QuoteCard quote={quote} />);

    // Snapshot only the readable parts, not IDs
    expect(container.querySelector(".project-name")).toMatchSnapshot();
    expect(container.querySelector(".client-name")).toMatchSnapshot();
  });

  test("update snapshots intentionally", () => {
    // Run with: npm test -- -u
    // This intentionally creates/updates snapshot
    const { container } = render(<Component />);
    expect(container).toMatchSnapshot();
  });
});
```

---

## Performance Testing

### Testing Calculation Performance

```typescript
describe("Calculation Performance", () => {
  test("concrete calculator performs under 10ms", () => {
    const startTime = performance.now();

    // Run calculation 1000 times
    for (let i = 0; i < 1000; i++) {
      calculateConcreteVolume({
        shape: "rectangular",
        length: 10,
        width: 10,
        height: i % 10,
        wastagePercent: 5,
        unitPrice: 100,
        density: 2400,
      });
    }

    const endTime = performance.now();
    const timePerCalculation = (endTime - startTime) / 1000;

    expect(timePerCalculation).toBeLessThan(10); // 10ms per calculation
  });
});
```

### Testing Component Render Count

```typescript
import { renderHook } from "@testing-library/react";

describe("Component Render Optimization", () => {
  test("quote builder doesn't re-render calculator unnecessarily", () => {
    let calculatorRenderCount = 0;

    const MockCalculator = ({ quoteData }: any) => {
      calculatorRenderCount++;
      return <div>{quoteData.projectName}</div>;
    };

    const { rerender } = renderHook(
      ({ projectName }) => ({
        quoteData: { projectName },
      }),
      { initialProps: { projectName: "Test" } }
    );

    const initialRenders = calculatorRenderCount;

    // Change projectName - calculator should only re-render once
    rerender({ projectName: "Test Updated" });

    expect(calculatorRenderCount).toBe(initialRenders + 1);
  });
});
```

---

## E2E Testing

### Example Cypress Test

```typescript
// cypress/e2e/quote-creation.cy.ts
describe("Quote Creation E2E", () => {
  beforeEach(() => {
    cy.login("test@example.com", "password");
    cy.visit("/dashboard");
  });

  it("creates a complete quote", () => {
    // Navigate to quote builder
    cy.contains("Create Quote").click();

    // Fill project info
    cy.get("input[name=projectName]").type("E2E Test Project");
    cy.get("input[name=clientName]").type("Test Client");
    cy.get("input[name=clientEmail]").type("client@test.com");

    // Add concrete calculation
    cy.contains("Concrete Calculator").click();
    cy.get("input[name=length]").type("10");
    cy.get("input[name=width]").type("10");
    cy.get("input[name=height]").type("2");

    // Verify calculation result
    cy.contains(/KES.*\d+/).should("be.visible");

    // Save quote
    cy.contains("button", "Save Quote").click();

    // Verify success
    cy.contains("Quote saved").should("be.visible");

    // Verify saved to list
    cy.visit("/dashboard/quotes");
    cy.contains("E2E Test Project").should("be.visible");
  });

  it("exports quote as PDF", () => {
    cy.contains("E2E Test Project").click();

    cy.contains("Export as PDF").click();

    cy.readFile("cypress/downloads/quote.pdf").should("exist");
  });
});
```

---

## Test Utilities & Helpers

### Mock Factories

```typescript
// src/__tests__/mocks/factories.ts

export function createMockQuote(overrides?: Partial<Quote>): Quote {
  return {
    id: "quote-1",
    user_id: "user-1",
    projectName: "Test Project",
    clientName: "Test Client",
    clientEmail: "client@test.com",
    projectLocation: "Nairobi",
    totalCost: 50000,
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockMaterialPrice(
  overrides?: Partial<Material>,
): Material {
  return {
    id: "mat-1",
    material_name: "Concrete",
    unit: "m³",
    price_kes: 15000,
    category: "Concrete",
    type: [],
    ...overrides,
  };
}

export const mockMaterialPrices = [
  createMockMaterialPrice({ material_name: "Concrete", price_kes: 15000 }),
  createMockMaterialPrice({ material_name: "Bricks", price_kes: 10000 }),
  createMockMaterialPrice({ material_name: "Paint", price_kes: 500 }),
];
```

### Custom Test Hooks

```typescript
// src/__tests__/utils/testHooks.ts

export function renderCalculatorHook<T>(
  hook: (props: any) => T,
  initialProps?: any
) {
  return renderHook(() => hook(initialProps), {
    wrapper: ({ children }) => (
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    ),
  });
}
```

### MSW (Mock Service Worker) Setup

```typescript
// src/__tests__/mocks/server.ts
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const server = setupServer(
  // Mock quote fetch
  http.get("https://test.supabase.co/rest/v1/quotes", () => {
    return HttpResponse.json([{ id: "1", projectName: "Test Quote" }]);
  }),

  // Mock Gemini API
  http.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-vision:generateContent",
    () => {
      return HttpResponse.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    walls: [],
                    doors: [],
                  }),
                },
              ],
            },
          },
        ],
      });
    },
  ),
);
```

---

**Best Practices Summary:**

✅ Test behavior, not implementation  
✅ Use realistic scenarios  
✅ Keep tests fast and isolated  
✅ Write clear, maintainable tests  
✅ Aim for 80%+ coverage on critical paths  
✅ Use mocks for external dependencies  
✅ Test edge cases  
✅ Document complex test setup
