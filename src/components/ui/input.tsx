import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#4c4c6d] bg-[#252538] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-gray-500 hover:border-[#4c4c6d]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffc3] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
