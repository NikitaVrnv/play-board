import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { API } from "@/services/api";

const JWTAuthDemo = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await API.getProfile();
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const decodeJWT = (token: string): any => {
    try {
      // JWT structure is: header.payload.signature
      // We need the payload (second part)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      // decode base64 string to JSON and parse
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return { error: "Invalid token format" };
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Only show decoded token if authenticated
  const decodedToken = isAuthenticated && token ? decodeJWT(token) : null;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>JWT Authentication Demo</CardTitle>
        <CardDescription>
          Explore how JWT authentication works in the application
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAuthenticated ? (
          <>
            <div className="rounded-md bg-muted p-4">
              <div className="font-medium">Authentication Status</div>
              <div className="mt-1 flex items-center">
                <Badge variant="success" className="mr-2 bg-green-500">
                  Authenticated
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Logged in as {user?.username}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Your JWT Token</h3>
              <div className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                <code className="whitespace-pre-wrap break-all">{token}</code>
              </div>
            </div>

            {decodedToken && (
              <div>
                <h3 className="text-lg font-medium mb-2">Decoded Token</h3>
                <div className="bg-muted p-3 rounded-md overflow-x-auto">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(decodedToken).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <div className="font-medium">{key}:</div>
                        <div>
                          {key === "exp" || key === "iat"
                            ? formatTimestamp(value as number)
                            : String(value)}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Test API with Token</h3>
              <div className="flex items-center gap-2">
                <Button onClick={fetchProfile} disabled={loading}>
                  {loading ? "Loading..." : "Fetch Profile"}
                </Button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              {profile && (
                <div className="mt-4 bg-muted p-3 rounded-md">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-xl font-semibold mb-2">Not Authenticated</div>
            <p className="text-muted-foreground mb-4">
              Please log in to see JWT authentication in action
            </p>
            <Button asChild>
              <a href="/login">Log In</a>
            </Button>
          </div>
        )}
      </CardContent>

      {isAuthenticated && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button variant="destructive" onClick={logout}>
            Log Out
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default JWTAuthDemo;