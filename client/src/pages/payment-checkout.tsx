import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Invoice {
  id: number;
  invoiceNumber: string;
  total: string;
  status: string;
  customer: {
    name: string;
    email: string;
  };
  projectDescription: string;
  dueDate: string;
}

const CheckoutForm = ({ invoice }: { invoice: Invoice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: paymentIntent.id,
          invoiceId: invoice.id,
        });

        setPaymentSucceeded(true);
        toast({
          title: "Payment Successful",
          description: `Payment of $${invoice.total} processed successfully!`,
        });

        // Redirect to success page after a short delay
        setTimeout(() => {
          setLocation(`/payment-success?invoice=${invoice.id}`);
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-semibold text-green-600">Payment Successful!</h2>
        <p className="text-gray-600">
          Your payment of ${invoice.total} has been processed successfully.
        </p>
        <p className="text-sm text-gray-500">
          You will be redirected shortly...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Details</h3>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${invoice.total}
          </>
        )}
      </Button>
    </form>
  );
};

export default function PaymentCheckout() {
  const [match, params] = useRoute("/payment-checkout/:invoiceId");
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", params?.invoiceId],
    enabled: !!params?.invoiceId,
  });

  useEffect(() => {
    if (invoice && invoice.status !== 'paid') {
      // Create PaymentIntent as soon as the page loads
      apiRequest("POST", "/api/create-payment-intent", {
        invoiceId: invoice.id,
        amount: invoice.total,
      })
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [invoice]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invoice Not Found</CardTitle>
            <CardDescription>
              The invoice you're trying to pay could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/invoices")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invoice.status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Already Paid</CardTitle>
            <CardDescription>
              This invoice has already been paid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/invoices")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Setting up payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/invoices")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
          <h1 className="text-3xl font-bold contractor-text-slate-900">
            Pay Invoice
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Invoice Number:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Customer:</span>
                <span className="font-medium">{invoice.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Project:</span>
                <span className="font-medium">{invoice.projectDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Due Date:</span>
                <span className="font-medium">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="contractor-text-primary-600">${invoice.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Complete your payment securely using Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <CheckoutForm invoice={invoice} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}