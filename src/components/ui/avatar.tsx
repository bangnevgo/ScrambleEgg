"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  status,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  status?: 'online' | 'offline' | 'away'
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        "hover:scale-[1.05] active:scale-[0.95] transition-transform duration-200",
        className
      )}
      {...props}
    >
      {status && (
        <div className="absolute bottom-0 right-0 -translate-x-1/2 -translate-y-1/2 flex h-2 w-2 items-center justify-center">
          <div className={cn(
            "flex h-1.5 w-1.5 rounded-full bg-background ring-2",
            status === 'online' && 'ring-green-500',
            status === 'offline' && 'ring-gray-500',
            status === 'away' && 'ring-yellow-500'
          )} />
        </div>
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
