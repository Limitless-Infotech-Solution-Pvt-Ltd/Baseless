import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function TwoFactorSetup() {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [manualKey, setManualKey] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, checkAuth } = useAuth();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setManualKey(data.manualEntryKey);
        setStep('verify');
      } else {
        const error = await response.json();
        toast({
          title: "Setup failed",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "Failed to setup 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, secret }),
      });

      if (response.ok) {
        toast({
          title: "2FA enabled successfully",
          description: "Two-factor authentication is now active on your account",
        });
        await checkAuth();
        // Redirect or update UI
        window.location.href = '/';
      } else {
        const error = await response.json();
        toast({
          title: "Verification failed",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Failed to verify 2FA token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt("Enter your password to disable 2FA:");
    if (!password) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        toast({
          title: "2FA disabled",
          description: "Two-factor authentication has been disabled",
        });
        await checkAuth();
      } else {
        const error = await response.json();
        toast({
          title: "Failed to disable 2FA",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to disable 2FA",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.twoFactorEnabled) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-shield-alt text-green-600 mr-2"></i>
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Two-factor authentication is currently enabled on your account.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleDisable2FA} 
              variant="destructive" 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-shield-alt text-blue-600 mr-2"></i>
            Setup Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'setup' && (
            <>
              <Alert>
                <AlertDescription>
                  Two-factor authentication adds an extra layer of security to your account.
                  You'll need an authenticator app like Google Authenticator or Authy.
                </AlertDescription>
              </Alert>
              <Button onClick={handleSetup} disabled={loading} className="w-full">
                {loading ? "Setting up..." : "Setup 2FA"}
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app:
                </p>
                {qrCode && (
                  <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-4" />
                )}
                <p className="text-xs text-gray-500 mb-4">
                  Can't scan? Enter this key manually: <br />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{manualKey}</code>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Enter the 6-digit code from your app:</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => setStep('setup')} 
                  variant="outline" 
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerify} 
                  disabled={loading || token.length !== 6} 
                  className="flex-1"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}