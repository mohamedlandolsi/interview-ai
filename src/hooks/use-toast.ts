import { useState, useCallback } from 'react'

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback((props: ToastProps) => {
    // For now, we'll just log the toast
    // In a real implementation, you'd want to show a proper toast UI
    console.log('Toast:', props)
    
    // You can also use window.alert for immediate feedback
    if (props.variant === 'destructive') {
      console.error(`${props.title}: ${props.description}`)
    } else {
      console.log(`${props.title}: ${props.description}`)
    }
  }, [])

  return { toast }
}
