
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          twoFactorToken: requiresTwoFactor ? twoFactorToken : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setError("");
        } else {
          login(data.user);
          setLocation("/dashboard");
        }
      } else {
        setError(data.error || "Login failed");
        if (data.error === "Invalid 2FA token") {
          setTwoFactorToken("");
        }
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {requiresTwoFactor ? "Two-Factor Authentication" : "Login to Baseless"}
          </CardTitle>
          <p className="text-gray-600">
            {requiresTwoFactor 
              ? "Enter the 6-digit code from your authenticator app"
              : "Access your hosting control panel"
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!requiresTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="twoFactorToken">Authentication Code</Label>
                <Input
                  id="twoFactorToken"
                  name="twoFactorToken"
                  type="text"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-gray-500 text-center">
                  Check your authenticator app for the current code
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : requiresTwoFactor ? "Verify Code" : "Sign In"}
            </Button>

            {requiresTwoFactor && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setRequiresTwoFactor(false);
                  setTwoFactorToken("");
                  setError("");
                }}
              >
                Back to Login
              </Button>
            )}

            {!requiresTwoFactor && (
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/register")}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
