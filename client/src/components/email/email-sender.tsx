import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Paperclip, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Customer, type Settings } from "@shared/schema";

interface EmailSenderProps {
  customer: Customer;
  settings: Settings;
  documentType: "invoice" | "quote";
  documentNumber: string;
  subject?: string;
  onSend?: (emailData: EmailData) => void;
}

interface EmailData {
  to: string;
  subject: string;
  message: string;
  attachPDF: boolean;
}

export default function EmailSender({ 
  customer, 
  settings, 
  documentType, 
  documentNumber, 
  subject: defaultSubject,
  onSend 
}: EmailSenderProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    to: customer.email || "",
    subject: defaultSubject || `${documentType === "invoice" ? "Invoice" : "Quote"} ${documentNumber} from ${settings.companyName}`,
    message: generateDefaultMessage(),
    attachPDF: true,
  });

  function generateDefaultMessage(): string {
    const docType = documentType === "invoice" ? "invoice" : "quote";
    const greeting = `Dear ${customer.name},`;
    
    let body = "";
    if (documentType === "invoice") {
      body = `Please find attached ${docType} ${documentNumber} for the work completed.

Payment is due within ${settings.paymentTerms || "30 days"}.`;
    } else {
      body = `Please find attached ${docType} ${documentNumber} for your review.

This quote is valid for 30 days. Please let me know if you have any questions.`;
    }

    const signature = settings.emailSignature || `Best regards,\n${settings.companyName}`;

    return `${greeting}\n\n${body}\n\n${signature}`;
  }

  const handleSend = async () => {
    if (!emailData.to.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // In a real implementation, this would send the email
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Email Sent",
        description: `${documentType === "invoice" ? "Invoice" : "Quote"} sent successfully to ${emailData.to}`,
      });
      
      onSend?.(emailData);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePreview = () => {
    // In a real implementation, this would show a preview of the email
    toast({
      title: "Email Preview",
      description: "This would show a preview of the email with the PDF attachment.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send {documentType === "invoice" ? "Invoice" : "Quote"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recipient</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <Badge variant="outline">
                  {customer.customerType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Email Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="customer@email.com"
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
                disabled={isSending}
              />
            </div>

            {/* Attachment Info */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">
                  {documentType === "invoice" ? "Invoice" : "Quote"} {documentNumber}.pdf
                </span>
                <Badge variant="secondary" className="text-xs">
                  PDF
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                disabled={isSending}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>

            {/* Warning for demo */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Demo Mode</p>
                <p className="text-yellow-700">
                  This is a demonstration. In production, this would integrate with your email service.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                {documentType === "invoice" ? "Invoice" : "Quote"} will be attached as PDF
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !emailData.to.trim()}
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}