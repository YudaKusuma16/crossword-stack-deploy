import * as React from "react"

import { Toast } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastActions = {
  toasts: [],
  subscribers: new Set(),

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  },

  addToast(toast) {
    const id = genId()
    const newToast = { ...toast, id }
    this.toasts = [newToast, ...this.toasts].slice(0, TOAST_LIMIT)
    this.subscribers.forEach(cb => cb(this.toasts))
    return id
  },

  updateToast(id, updates) {
    this.toasts = this.toasts.map(t => t.id === id ? { ...t, ...updates } : t)
    this.subscribers.forEach(cb => cb(this.toasts))
  },

  dismissToast(id) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.subscribers.forEach(cb => cb(this.toasts))
  }
}

export function useToast() {
  const [toasts, setToasts] = React.useState([])

  React.useEffect(() => {
    return toastActions.subscribe(setToasts)
  }, [])

  return {
    toasts,
    toast: (props) => toastActions.addToast(props),
    dismiss: (id) => toastActions.dismissToast(id),
    update: (id, updates) => toastActions.updateToast(id, updates)
  }
}

export { toastActions as toast }
