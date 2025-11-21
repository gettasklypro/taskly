import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Calendar, DollarSign, Tag, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    const fetchSubscription = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            setSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode || !selectedPlan) {
            toast.error("Please enter a promo code and select a plan");
            return;
        }

        setApplyingPromo(true);
        try {
            // Here you would validate the promo code with Paddle
            // For now, we'll just show a success message
            toast.success("Promo code applied! Redirecting to checkout...");

            // Open Paddle checkout with the promo code
            if (window.Paddle) {
                window.Paddle.Checkout.open({
                    items: [
                        {
                            priceId: selectedPlan,
                            quantity: 1
                        }
                    ],
                    customer: {
                        email: user?.email
                    },
                    customData: {
                        user_id: user?.id,
                        promo_code: promoCode
                    },
                    discountCode: promoCode
                });
            }
        } catch (error) {
            console.error('Error applying promo:', error);
            toast.error("Failed to apply promo code");
        } finally {
            setApplyingPromo(false);
        }
    };

    const handleManageSubscription = () => {
        // This would open Paddle's customer portal
        toast.info("Opening subscription management...");
        // You would need to implement Paddle's customer portal here
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Billing"
                    description="Manage your subscription and payment methods"
                />
                <div className="p-6">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Billing"
                description="Manage your subscription and payment methods"
            />

            <div className="p-6 space-y-6 max-w-4xl">
                {/* Current Subscription */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Subscription
                        </CardTitle>
                        <CardDescription>
                            Your current plan and billing information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{subscription.plan_id}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Status: <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                                {subscription.status}
                                            </Badge>
                                        </p>
                                    </div>
                                    <Button onClick={handleManageSubscription}>
                                        Manage Subscription
                                    </Button>
                                </div>

                                {subscription.current_period_end && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                                <Button onClick={() => navigate('/pricing')}>
                                    View Plans
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Payment Methods
                        </CardTitle>
                        <CardDescription>
                            Manage your payment methods
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Payment methods are managed through Paddle's secure checkout.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={handleManageSubscription}
                        >
                            Update Payment Method
                        </Button>
                    </CardContent>
                </Card>

                {/* Promo Code */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Apply Promo Code
                        </CardTitle>
                        <CardDescription>
                            Have a promo code? Apply it to your next purchase
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Promo Code</label>
                            <Input
                                placeholder="Enter promo code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Plan</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {plans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={`cursor-pointer transition-all ${selectedPlan === plan.id
                                                ? 'border-primary ring-2 ring-primary'
                                                : 'hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedPlan(plan.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{plan.name}</p>
                                                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                                                </div>
                                                {selectedPlan === plan.id && (
                                                    <CheckCircle className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleApplyPromo}
                            disabled={!promoCode || !selectedPlan || applyingPromo}
                            className="w-full"
                        >
                            {applyingPromo ? 'Applying...' : 'Apply Promo Code & Checkout'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Billing History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>
                            View your past invoices and payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            No billing history available yet.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
