  import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Calendar, DollarSign, Tag, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const Billing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [promoCode, setPromoCode] = useState("");
    const [applyingPromo, setApplyingPromo] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("");

    const plans = [
        { id: "pri_01kajn4vpt4ekb0vaydrwncsn5", name: "Starter", price: "$29/month" },
        { id: "pri_01kajn5yaxtef1ysmhz7hyqa40", name: "Professional", price: "$79/month" },
        { id: "pri_01kajn6jypbvk8g5g6r0qywwaj", name: "Scale", price: "$149/month" },
    ];

    // Initialise Paddle once
    useEffect(() => {
        if (window.Paddle && import.meta.env.VITE_PADDLE_CLIENT_TOKEN) {
            window.Paddle.Initialize({
                token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
                eventCallback: (data: any) => {
                    if (data.event === "checkout.completed") {
                        toast.success("Checkout completed!");
                        fetchSubscription();
                    }
                },
            });
        }
    }, []);

    // Fetch current subscription for the logged‑in user
    const fetchSubscription = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", user.id)
                .single();
            if (error && error.code !== "PGRST116") throw error;
            setSubscription(data);
        } catch (e) {
            console.error("Error fetching subscription", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    const handleApplyPromo = async () => {
        if (!promoCode || !selectedPlan) {
            toast.error("Please enter a promo code and select a plan");
            return;
        }
        setApplyingPromo(true);
        try {
            // Normalize the code: trim whitespace and uppercase for consistent storage
            const normalizedCode = promoCode.trim().toUpperCase();

            // Try local DB first
            let promo, promoErr;
            const localResult = await supabase
                .from("promo_codes")
                .select("*")
                .ilike("code", normalizedCode)
                .maybeSingle();
            promo = localResult.data;
            promoErr = localResult.error;

            // If not found locally, check Paddle discounts via API
            if (!promo) {
                const res = await fetch(`/api/check-paddle-discount?code=${encodeURIComponent(normalizedCode)}`);
                if (res.ok) {
                    const { discount } = await res.json();
                    if (discount && discount.code) {
                        promo = {
                            code: discount.code,
                            discount_type: discount.type || "percent", // adjust as needed
                            discount_value: discount.amount || discount.value || 0,
                            status: discount.status || "active",
                            expires_at: discount.expires_at || null,
                            paddle_discount_id: discount.id || null,
                        };
                    }
                }
            }

            if (promoErr) {
                console.error("Promo fetch error", promoErr);
                toast.error("Promo code not found or invalid");
                return;
            }
            if (!promo) {
                // No promo found
                toast.error("Promo code not found or invalid");
                return;
            }

            // Validate promo status, expiry and usage limits
            if (promo.status && promo.status !== "active") {
                toast.error("Promo code is not active");
                return;
            }
            if (promo.expires_at) {
                const expires = new Date(promo.expires_at);
                const now = new Date();
                if (expires < now) {
                    toast.error("Promo code has expired");
                    return;
                }
            }
            if (promo.max_uses && typeof promo.current_uses === "number") {
                if (promo.current_uses >= promo.max_uses) {
                    toast.error("Promo code has reached its usage limit");
                    return;
                }
            }

            // Helper to convert price string to cents
            const priceCents = (price: string) => {
                const num = parseFloat(price.replace(/[^0-9.]/g, ""));
                return Math.round(num * 100);
            };
            const plan = plans.find((p) => p.id === selectedPlan);

            // --- If discount is 100%, skip Paddle checkout and activate subscription directly ---
            let isFree = false;
            if (plan) {
                if (promo.discount_type === "percent" && promo.discount_value === 100) {
                    isFree = true;
                } else if (promo.discount_type === "fixed" && priceCents(plan.price) <= promo.discount_value * 100) {
                    isFree = true;
                }
            }

            if (isFree) {
                // Directly activate subscription for free plan
                const { error: fnErr } = await supabase.functions.invoke("activate-free-subscription", {
                    body: {
                        user_id: user?.id,
                        plan_id: selectedPlan,
                        paddle_discount_id: promo.paddle_discount_id,
                        promo_code: normalizedCode,
                    },
                });
                if (fnErr) {
                    console.error("Edge function error", fnErr);
                    toast.error("Failed to activate free subscription");
                    return;
                }
                toast.success("Free subscription activated! No payment required.");
                await fetchSubscription();
                return;
            }

            // Otherwise, open Paddle checkout with discount code
            toast.success("Opening checkout with promo code...");
            if (window.Paddle) {
                window.Paddle.Checkout.open({
                    items: [{ priceId: selectedPlan, quantity: 1 }],
                    customer: { email: user?.email },
                    customData: { user_id: user?.id, promo_code: promoCode },
                    discountCode: promoCode,
                });
            }
        } catch (e) {
            console.error("Apply promo error", e);
            toast.error(`Failed to apply promo: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setApplyingPromo(false);
        }
    };

    const handleManageSubscription = () => {
        toast.info("Customer portal not implemented yet");
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <PageHeader title="Billing" description="Manage your subscription and payment methods" />
                <div className="p-6">
                    <p className="text-muted-foreground">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader title="Billing" description="Manage your subscription and payment methods" />
            <div className="p-6 space-y-6 max-w-4xl">
                {/* Current Subscription */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" /> Current Subscription
                        </CardTitle>
                        <CardDescription>Your current plan and billing information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{subscription.plan_id}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Status: <Badge variant={subscription.status === "active" ? "default" : "secondary"}>{subscription.status}</Badge>
                                        </p>
                                    </div>
                                    <Button onClick={handleManageSubscription}>Manage Subscription</Button>
                                </div>
                                {subscription.current_period_end && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                                <Button onClick={() => navigate("/pricing")}>View Plans</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" /> Payment Methods
                        </CardTitle>
                        <CardDescription>Manage your payment methods</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Payment methods are managed through Paddle.</p>
                        <Button variant="outline" className="mt-4" onClick={handleManageSubscription}>Update Payment Method</Button>
                    </CardContent>
                </Card>

                {/* Promo Code section hidden as promo codes are now entered in Paddle checkout */}

                {/* Billing History placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>View your past invoices and payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">(History not implemented yet)</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
