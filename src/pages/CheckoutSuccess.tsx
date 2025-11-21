import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const transactionId = searchParams.get('_ptxn');

    useEffect(() => {
        // Check if we have a transaction ID
        if (!transactionId) {
            setError("No transaction ID found. Please try again.");
            setLoading(false);
            return;
        }

        // Simulate a brief loading period to allow webhook to process
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [transactionId]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <XCircle className="h-16 w-16 text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold">Something went wrong</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <Button
                        onClick={() => navigate('/pricing')}
                        className="w-full"
                        size="lg"
                    >
                        Back to Pricing
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {loading ? (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                        <h1 className="text-2xl font-bold">Processing your subscription...</h1>
                        <p className="text-muted-foreground">
                            Please wait while we confirm your payment.
                        </p>
                    </>
                ) : (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold">Payment Successful!</h1>
                        <p className="text-muted-foreground">
                            Your subscription has been activated. You now have access to all premium features.
                        </p>
                        {transactionId && (
                            <p className="text-xs text-muted-foreground">
                                Transaction ID: {transactionId}
                            </p>
                        )}
                        <Button
                            onClick={() => navigate('/dashboard')}
                            className="w-full"
                            size="lg"
                        >
                            Go to Dashboard
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
