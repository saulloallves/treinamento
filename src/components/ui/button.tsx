
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 duration-200 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "btn-primary shadow-purple-500/25 hover:shadow-purple-500/40",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-destructive-foreground hover:from-red-600 hover:to-red-700 shadow-red-500/25 hover:shadow-red-500/40",
        outline:
          "border-2 border-purple-200 bg-white/80 backdrop-blur-sm hover:bg-purple-50 hover:border-purple-300 text-purple-700 hover:text-purple-800",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-gray-200/50",
        ghost: "hover:bg-purple-100/80 hover:text-purple-700 rounded-xl backdrop-blur-sm",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700",
        gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg hover:shadow-xl",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25 hover:shadow-green-500/40",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
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
