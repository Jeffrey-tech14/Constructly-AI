# Constructly AI - Design Patterns & Best Practices

> A guide to reusable patterns, anti-patterns, and proven solutions for common problems

---

## 📌 Table of Contents

1. [Stateful Component Patterns](#stateful-component-patterns)
2. [Form Handling Patterns](#form-handling-patterns)
3. [Data Fetching Patterns](#data-fetching-patterns)
4. [Calculation Patterns](#calculation-patterns)
5. [Pricing Patterns](#pricing-patterns)
6. [UI Component Patterns](#ui-component-patterns)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Performance Patterns](#performance-patterns)
9. [Testing Patterns](#testing-patterns)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Stateful Component Patterns

### Pattern 1: Prop Drilling vs Context

**When to use Prop Drilling:**

- 2-3 levels deep
- Data is local to component subtree
- Keeps dependencies explicit

```typescript
// ✅ Good - Simple prop drill (2 levels)
<QuoteBuilder quoteData={data} setQuoteData={setData}>
  <ConcreteCalculator quoteData={data} setQuoteData={setData} />
</QuoteBuilder>
```

**When to use Context:**

- Multiple levels (>3)
- Data used in many components
- Theme, auth, global settings

```typescript
// ✅ Good - Use context for globally-needed data
const { user, profile } = useAuth();
const { theme, toggleTheme } = useTheme();
```

**Common Mistake:**

```typescript
// ❌ Bad - Prop drilling 5+ levels
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data}>
        <GreatGrandChild data={data} />
      </GrandChild>
    </Child>
  </Parent>
</GrandParent>
```

### Pattern 2: Local vs Global State

```typescript
// ✅ Local state for calculator form inputs
const [concreteInput, setConcreteInput] = useState(initialInput);

// ✅ Global state only for user auth
const { user, profile } = useAuth();

// ❌ Don't: Global state for every form
const [globalConcreteInput, setGlobalConcreteInput] = useState(initialInput);
// This creates unnecessary re-renders across entire app
```

### Pattern 3: Lifting State Up

```typescript
// Structure: QuoteBuilder holds state, passes setters to children
export function EnhancedQuoteBuilder() {
  const [quoteData, setQuoteData] = useState<Quote>(initialQuote);

  const handleConcreteUpdate = useCallback((calcs: ConcreteCalculation) => {
    setQuoteData((prev) => ({
      ...prev,
      concrete_totals: calcs,
    }));
  }, []);

  return (
    <>
      <ConcreteCalculator
        quoteData={quoteData}
        onUpdate={handleConcreteUpdate}
      />
      <MasonryCalculator
        quoteData={quoteData}
        onUpdate={handleMasonryUpdate}
      />
      <QuoteSummary quoteData={quoteData} />
    </>
  );
}
```

---

## Form Handling Patterns

### Pattern 1: Controlled Input Pattern

```typescript
// ✅ All form state in component
const [formData, setFormData] = useState({
  projectName: "",
  clientEmail: "",
});

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

return (
  <input
    name="projectName"
    value={formData.projectName}
    onChange={handleChange}
  />
);
```

### Pattern 2: Form Validation Pattern

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.projectName) {
    newErrors.projectName = "Project name is required";
  }
  if (!formData.clientEmail || !formData.clientEmail.includes("@")) {
    newErrors.clientEmail = "Valid email required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  // Submit form
};

return (
  <div>
    <input {...} />
    {errors.projectName && (
      <span className="text-red-500">{errors.projectName}</span>
    )}
  </div>
);
```

### Pattern 3: Multi-Step Form Pattern

```typescript
const [step, setStep] = useState<"info" | "details" | "review">("info");
const [formData, setFormData] = useState({});

const handleNextStep = () => {
  if (validateStep(step)) {
    setStep("details");
  }
};

const handlePrevStep = () => {
  setStep("info");
};

return (
  <>
    {step === "info" && (
      <ProjectInfoStep
        data={formData}
        onChange={setFormData}
        onNext={handleNextStep}
      />
    )}
    {step === "details" && (
      <ProjectDetailsStep
        data={formData}
        onChange={setFormData}
        onNext={() => setStep("review")}
        onPrev={handlePrevStep}
      />
    )}
    {step === "review" && (
      <ReviewStep
        data={formData}
        onSubmit={handleSubmit}
        onEdit={() => setStep("info")}
      />
    )}
  </>
);
```

---

## Data Fetching Patterns

### Pattern 1: useEffect + useState for Fetching

```typescript
// ✅ Standard fetch pattern
const [data, setData] = useState<Quote[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  let isMounted = true; // Cancel previous request if component unmounts

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      if (isMounted) {
        setData(data || []);
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchQuotes();

  return () => {
    isMounted = false; // Cleanup
  };
}, [userId]);

// Usage in JSX
if (loading) return <Skeleton />;
if (error) return <ErrorCard error={error} />;
return <QuotesList quotes={data} />;
```

### Pattern 2: Real-time Subscriptions

```typescript
useEffect(() => {
  // Subscribe to changes
  const subscription = supabase
    .from(`quotes:user_id=eq.${userId}`)
    .on("*", (payload) => {
      setData((prev) => [
        ...prev.filter((q) => q.id !== payload.new.id),
        payload.new,
      ]);
    })
    .subscribe();

  // Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

### Pattern 3: Cached Data Pattern

```typescript
// Cache data in component to avoid refetching
const [cache, setCache] = useState<Record<string, Quote>>({});

const fetchQuote = async (id: string): Promise<Quote> => {
  // Return cached if available
  if (cache[id]) {
    return cache[id];
  }

  const { data } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (data) {
    setCache((prev) => ({ ...prev, [id]: data }));
  }

  return data;
};
```

---

## Calculation Patterns

### Pattern 1: Calculation Hook Template

Every calculation hook follows this structure:

```typescript
export interface UseCalculatorProps {
  // Input data
  initialData?: InputType;
  materialPrices?: Material[];
  quote?: Quote;

  // Callbacks
  onCalculationsChange?: (calcs: CalculationType) => void;
}

export function useCalculator({
  initialData,
  materialPrices = [],
  quote,
  onCalculationsChange,
}: UseCalculatorProps) {
  // 1. State initialization
  const [input, setInput] = useState<InputType>(initialData || DEFAULT_INPUT);
  const [calculations, setCalculations] = useState<CalculationType | null>(
    null,
  );

  // 2. Fetch dependencies (prices, constants)
  const [dependencies, setDependencies] = useState<DepsType | null>(null);

  useEffect(() => {
    // Load prices, constants, etc.
    loadDependencies().then(setDependencies);
  }, [materialPrices, quote]);

  // 3. Execute calculations
  useEffect(() => {
    if (!dependencies) return;

    const result = calculateFunction(input, dependencies);
    setCalculations(result);
  }, [input, dependencies]);

  // 4. Notify parent of changes
  useEffect(() => {
    if (onCalculationsChange && calculations) {
      onCalculationsChange(calculations);
    }
  }, [calculations]); // ⚠️ onCalculationsChange NOT in deps

  // 5. Return stable API
  return {
    input,
    setInput,
    calculations,
    loading: !dependencies,
  };
}
```

### Pattern 2: Dependent Calculations

When one calculator depends on another:

```typescript
// Painting calculator depends on wall geometry
export function usePaintingCalculator({
  // Get wall dimensions from quote
  quote,
  onPaintingsChange,
}: Props) {
  // Internal wall dimensions auto-populate paint calculator
  const internalWalls = quote?.masonry_walls?.filter((w) => w.isInternal) || [];

  const totalPerimeter = internalWalls.reduce((sum, w) => sum + w.perimeter, 0);
  const totalHeight = quote?.qsSettings?.wallHeight || 2.4;

  const surfaceArea = totalPerimeter * totalHeight;

  // Now use surfaceArea for paint calculations
  const calculations = useMemo(() => {
    return calculatePaintCoverage(surfaceArea, paintLayers);
  }, [surfaceArea, paintLayers]);

  return { surfaceArea, calculations };
}
```

### Pattern 3: Cascading Calculations

When calculations feed into summary:

```typescript
// Quote Builder aggregates all calculators
const { calculations: concrete } = useConcreteCalculator({ ... });
const { calculations: masonry } = useMasonryCalculator({ ... });
const { calculations: painting } = usePaintingCalculator({ ... });

// Aggregate into totals
const totals = useMemo(() => {
  return {
    materials: (concrete?.cost || 0) + (masonry?.cost || 0),
    labor: (concrete?.labor || 0) + (masonry?.labor || 0),
    painting: painting?.cost || 0,
  };
}, [concrete, masonry, painting]);

// Then calculate final
const final = useMemo(() => {
  const subtotal = totals.materials + totals.labor + totals.painting;
  const contingency = subtotal * 0.1; // 10% contingency

  return {
    ...totals,
    subtotal,
    contingency,
    total: subtotal + contingency,
  };
}, [totals]);
```

---

## Pricing Patterns

### Pattern 1: Material Price Lookup

```typescript
// Safe price lookup with fallbacks
export function getPriceWithFallback(
  materialName: string,
  variant: string | undefined,
  materials: Material[],
  defaultPrice: number = 0,
): number {
  const material = materials.find((m) => m.material_name === materialName);

  if (!material) {
    console.warn(`Material not found: ${materialName}, using default`);
    return defaultPrice;
  }

  if (variant && material.type) {
    const variantMatch = material.type.find((t) =>
      Object.values(t).includes(variant),
    );
    return variantMatch?.price_kes || material.price_kes || defaultPrice;
  }

  return material.price_kes || defaultPrice;
}
```

### Pattern 2: Regional Price Adjustment

```typescript
// Get user's regional multiplier and apply
const getAdjustedPrice = (
  basePrice: number,
  region: string | undefined,
  multipliers: RegionalMultiplier[],
): number => {
  const regionMult = multipliers.find((m) => m.region === region);
  return basePrice * (regionMult?.multiplier || 1.0);
};

// In hook
const userMultiplier = useMemo(() => {
  return (
    multipliers.find((m) => m.region === profile?.region)?.multiplier || 1.0
  );
}, [multipliers, profile?.region]);

const adjustedPrice = getMaterialPrice(name, type, materials) * userMultiplier;
```

### Pattern 3: User Price Override

```typescript
// Check user overrides first, fall back to base price
export function getEffectivePrice(
  materialId: string,
  basePrice: number,
  userOverrides: Record<string, number>,
): number {
  return userOverrides[materialId] ?? basePrice;
}

// Usage
const effectivePrice = getEffectivePrice(
  material.id,
  material.price_kes,
  userMaterialOverrides,
);
```

---

## UI Component Patterns

### Pattern 1: Controlled Checkbox with Dependent Content

```typescript
// Always used for optional features
const [includeFeature, setIncludeFeature] = useState(false);

return (
  <>
    <Checkbox
      checked={includeFeature}
      onCheckedChange={setIncludeFeature}
    />

    {/* Dependent content only visible when checked */}
    {includeFeature && (
      <div className="mt-4 p-4 border rounded">
        <FeatureContent />
      </div>
    )}
  </>
);
```

### Pattern 2: Disabled State Pattern

```typescript
// Input disabled when:
// 1. Parent component is in read-only mode
// 2. Parent feature checkbox is unchecked
<Input
  disabled={
    readonly || // Parent is read-only
    !parentFeatureEnabled // Parent feature must be enabled
  }
/>
```

### Pattern 3: Tab-based Organization

```typescript
// Use tabs for organizing large forms
<Tabs defaultValue="basic">
  <TabsList>
    <TabsTrigger value="basic">Basic Info</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>

  <TabsContent value="basic">
    {/* Show when basic selected */}
  </TabsContent>

  <TabsContent value="advanced">
    {/* Show when advanced selected */}
  </TabsContent>
</Tabs>
```

### Pattern 4: Loading Skeleton Pattern

```typescript
// While data loading, show skeleton
if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// When error, show error state
if (error) {
  return (
    <Card className="border-red-200">
      <CardContent>
        <p className="text-red-600">Failed to load: {error.message}</p>
        <Button onClick={retry}>Try Again</Button>
      </CardContent>
    </Card>
  );
}

// When ready, show content
return <DataContent data={data} />;
```

---

## Error Handling Patterns

### Pattern 1: Try-Catch with Specific Error Types

```typescript
async function saveQuote(quote: Quote) {
  try {
    const { error } = await supabase.from("quotes").upsert(quote);

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("Quote with this name already exists");
      } else if (error.code === "42P01") {
        // Table doesn't exist
        throw new Error("Database schema error");
      } else {
        throw error;
      }
    }

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Save failed:", message);
    return { success: false, error: message };
  }
}
```

### Pattern 2: Error Boundaries for Components

```typescript
class CalculatorErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service
    logToSentry(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200">
          <CardContent>
            <h3>Calculator Error</h3>
            <p>{this.state.error?.message}</p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

### Pattern 3: Form Validation with User Feedback

```typescript
const validateAndSave = async (data: Quote) => {
  // 1. Validate
  const validation = quoteSchema.safeParse(data);
  if (!validation.success) {
    // Show specific field errors
    validation.error.errors.forEach((err) => {
      toast.error(`${err.path.join(".")}: ${err.message}`, { duration: 3000 });
    });
    return;
  }

  // 2. Save
  try {
    await saveQuote(validation.data);
    toast.success("Quote saved successfully!");
  } catch (err) {
    toast.error("Failed to save quote. Please try again.");
  }
};
```

---

## Performance Patterns

### Pattern 1: Memoization for Expensive Calculations

```typescript
// Memoize complex calculations
const totals = useMemo(() => {
  // This runs ONLY when dependencies change
  return {
    materials: calculateMaterials(input, prices),
    labor: calculateLabor(input, rates),
    equipment: calculateEquipment(input),
  };
}, [input, prices, rates]); // Only re-calc when these change
```

### Pattern 2: Callback Stabilization

```typescript
// Wrap callbacks in useCallback to prevent re-renders
const handleInputChange = useCallback((value: string) => {
  setInput((prev) => ({ ...prev, value }));
}, []); // Empty deps = same reference always

<Calculator onChange={handleInputChange} />;
// Calculator won't re-render even if parent re-renders
```

### Pattern 3: Lazy Component Loading

```typescript
// Load heavy calculator only when needed
const ConcreteCalculator = lazy(() =>
  import("./ConcreteCalculator").then((m) => ({
    default: m.ConcreteCalculator,
  }))
);

<Suspense fallback={<Skeleton />}>
  <ConcreteCalculator />
</Suspense>;
// Component loads asynchronously, shows skeleton while loading
```

### Pattern 4: Debounced Saves

```typescript
// Wait 2 seconds after user stops typing before saving
const debouncedSave = useCallback(
  debounce(async (data: Quote) => {
    await supabase.from("quotes").upsert(data);
  }, 2000),
  [],
);

useEffect(() => {
  debouncedSave(quoteData);
}, [quoteData, debouncedSave]);
// Saves only after user stops making changes for 2 seconds
```

---

## Testing Patterns

### Pattern 1: Calculator Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react";
import { useConcreteCalculator } from "@/hooks/useConcreteCalculator";

describe("useConcreteCalculator", () => {
  test("updates calculations when input changes", () => {
    const { result } = renderHook(() =>
      useConcreteCalculator({
        initialData: { shape: "rectangular", length: 10, width: 10, height: 2 },
      })
    );

    act(() => {
      result.current.setInput((prev) => ({ ...prev, height: 3 }));
    });

    expect(result.current.calculations?.volume).toBe(300);
  });

  test("applies material prices correctly", () => {
    const materials = [
      { material_name: "Concrete", price_kes: 100, unit: "m³" },
    ];

    const { result } = renderHook(() =>
      useConcreteCalculator({
        initialData: { ... },
        materialPrices: materials,
      })
    );

    expect(result.current.calculations?.costKES).toBeGreaterThan(0);
  });
});
```

### Pattern 2: Component Rendering Test

```typescript
import { render, screen } from "@testing-library/react";
import { ConcreteCalculatorForm } from "@/components/ConcreteCalculatorForm";

test("renders form with all inputs", () => {
  render(
    <ConcreteCalculatorForm
      quoteData={mockQuote}
      setQuoteData={jest.fn()}
      materialPrices={[]}
    />
  );

  expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
});
```

### Pattern 3: Integration Testing Quote Flow

```typescript
test("complete quote creation workflow", async () => {
  const { user } = await loginUser();

  const newQuote = await createQuote(user.id, {
    projectName: "Test Project",
  });

  // Add concrete calculation
  const updated = await updateQuote(newQuote.id, {
    concrete_input: { shape: "rectangular", length: 10, width: 10, height: 2 },
  });

  expect(updated.concrete_totals).toBeDefined();
  expect(updated.concrete_totals.costKES).toBeGreaterThan(0);
});
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Missing useCallback Causes Infinite Loops

**Problem:**

```typescript
// ❌ Parent creates new callback every render
<Calculator
  onCalculate={(result) => setData((prev) => ({ ...prev, result }))}
/>

// ❌ In hook, callback in deps = infinite loop
useEffect(() => {
  onCalculate(calculations);
}, [calculations, onCalculate]); // onCalculate changes every render!
```

**Solution:**

```typescript
// ✅ Wrap callback in useCallback at call site
const handleCalcChange = useCallback(
  (result) => setData((prev) => ({ ...prev, result })),
  []
);

<Calculator onCalculate={handleCalcChange} />;

// ✅ In hook, only data in deps
useEffect(() => {
  if (onCalculate) onCalculate(calculations);
}, [calculations]); // Not onCalculate!
```

### ❌ Anti-Pattern 2: Storing Derived Data

**Problem:**

```typescript
// ❌ Never store calculated values directly
const [input, setInput] = useState(initialInput);
const [calculations, setCalculations] = useState(null);

useEffect(() => {
  const calcs = calculateValue(input);
  setCalculations(calcs); // Separate state = sync issues
}, [input]);

// Now if input changes but effect hasn't run, calculations is stale
```

**Solution:**

```typescript
// ✅ Derive calculations without storing
const [input, setInput] = useState(initialInput);

const calculations = useMemo(() => {
  return calculateValue(input);
}, [input]); // Calculated, not stored
```

### ❌ Anti-Pattern 3: Global State for Everything

**Problem:**

```typescript
// ❌ Don't put local form state in global context
const globalAuthContext {
  concreteInput: {},      // Why global?
  setConcreteInput: () => {},
  masonryInput: {},       // Why global?
  setMasonryInput: () => {},
}

// This causes every component to re-render when any form changes
```

**Solution:**

```typescript
// ✅ Keep local state local
function EnhancedQuoteBuilder() {
  const [concreteInput, setConcreteInput] = useState({}); // Local
  const [masonryInput, setMasonryInput] = useState({}); // Local

  // Only use global for auth, theme, etc.
  const { user } = useAuth(); // Global
  const { theme } = useTheme(); // Global
}
```

### ❌ Anti-Pattern 4: Missing Dependency Arrays

**Problem:**

```typescript
// ❌ Effect runs every render
useEffect(() => {
  fetchData();
  // Missing dependency array = runs on every render
});

// ❌ Dependency array too small
useEffect(() => {
  const result = calculate(input, price);
  // Uses input and price but doesn's list them
}, []); // Will use stale values
```

**Solution:**

```typescript
// ✅ Always include dependencies
useEffect(() => {
  fetchData();
}, [userId]); // Runs when userId changes

// ✅ Include all dependencies
useEffect(() => {
  const result = calculate(input, price);
  setResult(result);
}, [input, price]); // Runs when either changes
```

### ❌ Anti-Pattern 5: Long Component Files

**Problem:**

```typescript
// ❌ 2000 line component with everything
export function EnhancedQuoteBuilder() {
  // Concrete calculations (200 lines)
  // Masonry calculations (200 lines)
  // Paint calculations (200 lines)
  // Rendering (1200 lines)
  // Testing becomes impossible
}
```

**Solution:**

```typescript
// ✅ Extract into separate components
export function EnhancedQuoteBuilder() {
  return (
    <>
      <ConcreteSection />
      <MasonrySection />
      <PaintSection />
      <SummarySection />
    </>
  );
}

// Each section is ~300 lines, testable, understandable
```

---

**Next Steps:**

- Reference these patterns when designing new features
- Use pattern linting to catch anti-patterns early
- Document any new patterns discovered during development
