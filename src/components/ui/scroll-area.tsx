'use client'

import { ScrollArea as RadixScrollArea } from '@radix-ui/react-scroll-area'
import { cn } from '@/lib/utils'

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof RadixScrollArea> {
  className?: string
}

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <RadixScrollArea
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div className="h-full w-full rounded-[inherit]">
        {children}
      </div>
    </RadixScrollArea>
  )
}
