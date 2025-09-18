
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 duration-200",
  {
    variants: {
      variant: {
        default: "bg-brand-blue text-brand-white hover:bg-blue-600 shadow-clean hover:shadow-clean-md",
        destructive: "bg-red-500 text-brand-white hover:bg-red-600 shadow-clean hover:shadow-clean-md",
        outline: "border border-gray-300 bg-brand-white text-brand-gray-dark hover:bg-gray-50 shadow-clean",
        secondary: "bg-brand-blue-light text-brand-blue hover:bg-blue-100 shadow-clean",
        ghost: "hover:bg-gray-100 text-brand-gray-dark hover:text-brand-black",
        link: "text-brand-blue underline-offset-4 hover:underline hover:text-blue-600",
        success: "bg-green-500 text-brand-white hover:bg-green-600 shadow-clean hover:shadow-clean-md",
        modern: "modern-button",
        "modern-secondary": "modern-button-secondary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
