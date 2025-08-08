
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 duration-200 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "btn-primary shadow-brand-yellow/25 hover:shadow-brand-yellow/40",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-brand-white hover:from-red-600 hover:to-red-700 shadow-red-500/25 hover:shadow-red-500/40",
        outline:
          "border-2 border-brand-yellow/30 bg-white/90 backdrop-blur-sm hover:bg-brand-yellow/10 hover:border-brand-yellow/50 text-brand-brown hover:text-brand-brown",
        secondary:
          "bg-gradient-to-r from-brand-blue/10 to-brand-blue/20 text-brand-brown hover:from-brand-blue/20 hover:to-brand-blue/30 shadow-brand-blue/20",
        ghost: "hover:bg-brand-yellow/10 hover:text-brand-brown rounded-xl backdrop-blur-sm",
        link: "text-brand-blue underline-offset-4 hover:underline hover:text-brand-blue/80",
        gradient: "bg-gradient-to-r from-brand-yellow via-brand-orange to-brand-blue text-brand-white shadow-lg hover:shadow-xl",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-brand-white shadow-green-500/25 hover:shadow-green-500/40",
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
