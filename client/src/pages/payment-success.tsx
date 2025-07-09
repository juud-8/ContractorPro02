import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Download, ArrowLeft, Mail } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/payment-success");
  
  // Get invoice ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('invoice');

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
    enabled: !!invoiceId,
  });

  // Get the most recent payment for this invoice
  const recentPayment = payments?.find((p: any) => 
    p.invoiceId === parseInt(invoiceId || "0") && p.paymentMethod === "stripe"
  );

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice || !invoiceId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Information Not Found</CardTitle>
            <CardDescription>
              Unable to find payment information.
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

  const handleDownloadReceipt = () => {
    // Generate and download PDF receipt
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  const handleEmailReceipt = () => {
    // Send email receipt (you can implement this)
    console.log('Email receipt functionality to be implemented');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your payment has been processed successfully.
            </p>
          </div>
        </div>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Receipt</CardTitle>
            <CardDescription>
              Payment confirmation for invoice {invoice.invoiceNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Invoice Number:</span>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Amount Paid:</span>
                <p className="font-medium text-green-600">${invoice.total}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Payment Method:</span>
                <p className="font-medium">Credit Card (Stripe)</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Payment Date:</span>
                <p className="font-medium">
                  {recentPayment 
                    ? new Date(recentPayment.paymentDate).toLocaleDateString()
                    : new Date().toLocaleDateString()
                  }
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Customer:</span>
                <p className="font-medium">{invoice.customer.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <p className="font-medium text-green-600">Paid</p>
              </div>
            </div>
            
            {recentPayment && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-gray-500 mb-2">Transaction Details:</div>
                <div className="text-xs text-gray-400">
                  <p>Transaction ID: {recentPayment.stripePaymentIntentId}</p>
                  {recentPayment.stripeChargeId && (
                    <p>Charge ID: {recentPayment.stripeChargeId}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Project Description:</span>
                <p className="font-medium">{invoice.projectDescription}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Customer Email:</span>
                <p className="font-medium">{invoice.customer.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            onClick={handleDownloadReceipt}
            className="flex-1"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button 
            onClick={handleEmailReceipt}
            className="flex-1"
            variant="outline"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Receipt
          </Button>
          <Button 
            onClick={() => setLocation("/invoices")}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>

        {/* Thank You Message */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Thank you for your payment!
              </h3>
              <p className="text-green-700">
                Your payment has been successfully processed. A confirmation email 
                has been sent to {invoice.customer.email}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}