// src/pages/Login.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "@/components/ui/sonner"
import { UserCredentials } from "@/types" 

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get the page they tried to visit before being redirected to login
  const from = location.state?.from?.pathname || "/"
  
  console.log("Login page: will redirect to", from, "after successful login");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      console.log("Attempting login with:", values.email);
      await login(values as UserCredentials)
      console.log("Login successful, redirecting to:", from);
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Login form error:", error);
      // AuthContext already handles error toasts
    }
  }

  const handleDemo = async () => {
    try {
      console.log("Attempting demo login with gamer@example.com");
      await login({ 
        email: "gamer@example.com", 
        password: "password",
      })
      toast.success("Demo login successful", {
        description: "Logged in as a demo user",
      })
      console.log("Demo login successful, redirecting to:", from);
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Demo login failed:", error);
      // already toasts
    }
  }

  const handleYlandsDemo = async () => {
    try {
      console.log("Attempting demo login with ylands@example.com");
      await login({ 
        email: "ylands@example.com", 
        password: "password",
      })
      toast.success("Ylands demo login successful", {
        description: "Logged in as a Ylands demo user",
      })
      console.log("Ylands demo login successful, redirecting to:", from);
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Ylands demo login failed:", error);
      // already toasts
    }
  }

  const handleAdminDemo = async () => {
    try {
      console.log("Attempting admin demo login with admin@example.com");
      await login({ 
        email: "admin@example.com", 
        password: "password",
      })
      toast.success("Admin login successful", {
        description: "Logged in as an admin user",
      })
      console.log("Admin login successful, redirecting to:", from);
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Admin login failed:", error);
      // already toasts
    }
  }

  return (
    <div className="container max-w-md py-16">
      <div className="bg-card rounded-lg shadow-md border p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Log In
            </Button>
          </form>
        </Form>

        <div className="mt-6 pt-6 border-t text-center space-y-3">
          <p className="text-xs text-muted-foreground mb-2">Quick Login Options:</p>
          <Button variant="outline" onClick={handleDemo} className="w-full">
            Demo Login (Gamer)
          </Button>
          <Button
            variant="outline"
            onClick={handleYlandsDemo}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Ylands Demo Login
          </Button>
          <Button
            variant="outline"
            onClick={handleAdminDemo}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Admin Demo Login
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
