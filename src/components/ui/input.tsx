import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-transparent",
        outlined: "border-input bg-background",
        filled: "bg-accent/5 border-input",
        flushed: "border-b border-input bg-transparent px-0",
      },
      size: {
        sm: "h-8 px-2 text-sm",
        default: "h-9 px-3 text-base",
        lg: "h-10 px-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface InputProps extends Omit<React.ComponentProps<"input">, "size">,
  VariantProps<typeof inputVariants> {
  className?: string
  /**
   * When true, shows loading state (disabled with reduced opacity)
   * Note: You should provide a loading indicator (e.g., spinner) as an adjacent element
   */
  loading?: boolean
  /**
   * Optional character count/help text to display below the input
   */
  helperText?: string
  /**
   * Optional prefix content for input groups
   */
  prefixContent?: React.ReactNode
  /**
   * Optional suffix content for input groups
   */
  suffixContent?: React.ReactNode
}

function Input({
  className,
  type,
  variant,
  size,
  loading = false,
  helperText,
  prefixContent,
  suffixContent,
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {prefixContent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-6 items-center text-muted-foreground">
          {prefixContent}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          inputVariants({ variant, size, className }),
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          loading && "opacity-50 cursor-not-allowed"
        )}
        {...props}
        style={{
          paddingLeft: prefixContent ? '2.5rem' : '0.75rem',
          paddingRight: suffixContent ? '2.5rem' : '0.75rem',
        }}
      />
      {suffixContent && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 items-center text-muted-foreground">
          {suffixContent}
        </div>
      )}
      {helperText && (
        <p className="mt-1 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
}

export { Input }
