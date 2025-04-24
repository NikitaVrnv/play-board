import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, { message: "Username or Email is required" }),
  password: z.string().min(3, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        usernameOrEmail: values.usernameOrEmail,
        password: values.password,
      });
      navigate("/");
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const handleDemo = async () => {
    try {
      await login({ usernameOrEmail: "ylands", password: "password" });
      toast({
        title: "Demo login successful",
        description: "Logged in as a demo user",
      });
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const handleYlandsDemo = async () => {
    try {
      await login({ usernameOrEmail: "demo@example.com", password: "password" });
      toast({
        title: "Ylands demo login successful",
        description: "Logged in as a Ylands demo user",
      });
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  return (
    <div className="container max-w-md py-16">
      <div className="bg-card rounded-lg shadow-md border p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
              control={form.control}
              name="usernameOrEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username or email" {...field} />
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
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
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
          <Button onClick={handleDemo} className="w-full">
            Demo Login (Gamer)
          </Button>
          <Button onClick={handleYlandsDemo} className="w-full bg-blue-500 hover:bg-blue-600 text-white hover:text-white">
            Ylands Demo Login
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
