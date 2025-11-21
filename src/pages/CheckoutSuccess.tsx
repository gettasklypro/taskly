import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const transactionId = searchParams.get('_ptxn');

    useEffect(() => {
        // Simulate a brief loading period to allow webhook to process
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

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
                        <h1 className="text-2xl font-bold">Welcome to Taskly Pro!</h1>
                        <p className="text-muted-foreground">
                            Your subscription has been activated successfully. You now have access to all premium features.
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
