import { createContext, useContext } from "react"

const FormFieldContext = createContext({})

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  return fieldContext
} 