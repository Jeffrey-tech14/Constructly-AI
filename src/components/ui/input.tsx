import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  (
    { className, type, onChange, onBlur, value, defaultValue, ...props },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = React.useState(
      value ?? defaultValue ?? "",
    );

    // Auto-round number inputs whenever value changes (including initial load)
    React.useEffect(() => {
      if (type === "number" && displayValue) {
        const numValue = parseFloat(displayValue.toString());
        if (!isNaN(numValue)) {
          const rounded = Math.round(numValue * 10000) / 10000;
          const roundedStr = rounded.toString();
          if (roundedStr !== displayValue.toString()) {
            setDisplayValue(roundedStr);
          }
        }
      } else {
        setDisplayValue(value ?? defaultValue ?? "");
      }
    }, [value, defaultValue, type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Round number inputs to 4 decimal places on blur
      if (type === "number" && e.target.value) {
        const numValue = parseFloat(e.target.value);
        if (!isNaN(numValue)) {
          const rounded = Math.round(numValue * 10000) / 10000;
          const roundedStr = rounded.toString();
          e.target.value = roundedStr;
          setDisplayValue(roundedStr);
          // Trigger onChange with rounded value
          onChange?.(e as any);
        }
      }
      onBlur?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-3xl border border-input bg-white dark:bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-sm",
          className,
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
export { Input };
