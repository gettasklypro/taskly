import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      toast.error("Invalid or expired reset link");
      navigate("/login");
      return;
    }

    // Validate token with edge function
    const validateToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('validate-reset-token', {
          body: { token }
        });

        if (error || !data?.valid) {
          toast.error("Invalid or expired reset link");
          navigate("/login");
          return;
        }

        setEmail(data.email);
        setValidToken(true);
      } catch (error) {
        toast.error("Invalid or expired reset link");
        navigate("/login");
      }
    };

    validateToken();
  }, [navigate, searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = searchParams.get('token');
      
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { token, password, email }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to reset password');
      }
      
      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex items-center gap-3 mb-8">
          <Logo />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New Password<span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password<span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
};
