import { createContext, useContext } from "react"

const SidebarContext = createContext({})

export const useSidebar = () => {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar should be used within <Sidebar>")
  }

  return context
} 