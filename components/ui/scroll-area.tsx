'use client'

import * as React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { cn } from '@/lib/utils'

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className={cn('h-full w-full rounded-[inherit]')}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar orientation='vertical' className={cn('flex select-none p-0.5 bg-transparent')}>
      <ScrollAreaPrimitive.Thumb className={cn('flex-1 bg-muted-foreground/30 rounded-full')} />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner className='bg-transparent' />
  </ScrollAreaPrimitive.Root>
))

ScrollArea.displayName = 'ScrollArea'
