import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Palette, FileText, CreditCard, Mail, Globe, Calendar, DollarSign, Building } from "lucide-react";
import { type Settings as SettingsType } from "@shared/schema";
import DocumentTemplateSelector from "@/components/templates/document-template-selector";

interface AdvancedSettingsProps {
  settings: SettingsType;
  onSettingsChange: (field: string, value: any) => void;
  isLoading: boolean;
}

export default function AdvancedSettings({ settings, onSettingsChange, isLoading }: AdvancedSettingsProps) {
  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "CAD", label: "CAD ($)" },
    { value: "AUD", label: "AUD ($)" },
    { value: "JPY", label: "JPY (¥)" },
  ];

  const dateFormats = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
    { value: "MMM DD, YYYY", label: "MMM DD, YYYY" },
  ];

  const timeZones = [
    { value: "America/New_York", label: "Eastern (US)" },
    { value: "America/Chicago", label: "Central (US)" },
    { value: "America/Denver", label: "Mountain (US)" },
    { value: "America/Los_Angeles", label: "Pacific (US)" },
    { value: "UTC", label: "UTC" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Asia/Tokyo", label: "Tokyo" },
  ];

  const paymentMethods = [
    { value: "Check", label: "Check" },
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "PayPal", label: "PayPal" },
    { value: "Venmo", label: "Venmo" },
    { value: "Zelle", label: "Zelle" },
  ];

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Extended Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourcompany.com"
                value={settings.companyWebsite || ""}
                onChange={(e) => onSettingsChange("companyWebsite", e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Default Payment Method</Label>
              <Select 
                value={settings.defaultPaymentMethod || "Check"} 
                onValueChange={(value) => onSettingsChange("defaultPaymentMethod", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailSignature">Email Signature</Label>
            <Textarea
              id="emailSignature"
              placeholder="Best regards,&#10;Your Name&#10;Your Company"
              value={settings.emailSignature || ""}
              onChange={(e) => onSettingsChange("emailSignature", e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization & Formatting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization & Formatting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={settings.currency || "USD"} 
                onValueChange={(value) => onSettingsChange("currency", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={settings.dateFormat || "MM/DD/YYYY"} 
                onValueChange={(value) => onSettingsChange("dateFormat", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select 
                value={settings.timeZone || "America/New_York"} 
                onValueChange={(value) => onSettingsChange("timeZone", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Numbering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Numbering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="autoGenerate"
              checked={settings.autoGenerateNumbers}
              onCheckedChange={(checked) => onSettingsChange("autoGenerateNumbers", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="autoGenerate">Auto-generate document numbers</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                placeholder="INV"
                value={settings.invoicePrefix || "INV"}
                onChange={(e) => onSettingsChange("invoicePrefix", e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Next: {settings.invoicePrefix || "INV"}-{String(settings.nextInvoiceNumber || 1).padStart(3, '0')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotePrefix">Quote Prefix</Label>
              <Input
                id="quotePrefix"
                placeholder="QUO"
                value={settings.quotePrefix || "QUO"}
                onChange={(e) => onSettingsChange("quotePrefix", e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Next: {settings.quotePrefix || "QUO"}-{String(settings.nextQuoteNumber || 1).padStart(3, '0')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nextInvoiceNumber">Next Invoice Number</Label>
              <Input
                id="nextInvoiceNumber"
                type="number"
                min="1"
                value={settings.nextInvoiceNumber || 1}
                onChange={(e) => onSettingsChange("nextInvoiceNumber", parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextQuoteNumber">Next Quote Number</Label>
              <Input
                id="nextQuoteNumber"
                type="number"
                min="1"
                value={settings.nextQuoteNumber || 1}
                onChange={(e) => onSettingsChange("nextQuoteNumber", parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="brandColor"
                  type="color"
                  value={settings.brandColor || "#2563eb"}
                  onChange={(e) => onSettingsChange("brandColor", e.target.value)}
                  disabled={isLoading}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.brandColor || "#2563eb"}
                  onChange={(e) => onSettingsChange("brandColor", e.target.value)}
                  disabled={isLoading}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={settings.accentColor || "#10b981"}
                  onChange={(e) => onSettingsChange("accentColor", e.target.value)}
                  disabled={isLoading}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.accentColor || "#10b981"}
                  onChange={(e) => onSettingsChange("accentColor", e.target.value)}
                  disabled={isLoading}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Document Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showLineItemTotals"
                checked={settings.showLineItemTotals}
                onCheckedChange={(checked) => onSettingsChange("showLineItemTotals", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="showLineItemTotals">Show individual line item totals</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requireProjectDescription"
                checked={settings.requireProjectDescription}
                onCheckedChange={(checked) => onSettingsChange("requireProjectDescription", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="requireProjectDescription">Require project description</Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
              <Textarea
                id="invoiceFooter"
                placeholder="Thank you for your business!"
                value={settings.invoiceFooter || ""}
                onChange={(e) => onSettingsChange("invoiceFooter", e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quoteFooter">Quote Footer Text</Label>
              <Textarea
                id="quoteFooter"
                placeholder="This quote is valid for 30 days"
                value={settings.quoteFooter || ""}
                onChange={(e) => onSettingsChange("quoteFooter", e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <DocumentTemplateSelector
              documentType="invoice"
              selectedTemplate={settings.invoiceTemplate || "standard"}
              onTemplateChange={(template) => onSettingsChange("invoiceTemplate", template)}
              disabled={isLoading}
            />

            <DocumentTemplateSelector
              documentType="quote"
              selectedTemplate={settings.quoteTemplate || "standard"}
              onTemplateChange={(template) => onSettingsChange("quoteTemplate", template)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Banking Information
            <Badge variant="secondary">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="First National Bank"
              value={settings.bankName || ""}
              onChange={(e) => onSettingsChange("bankName", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="****1234"
                value={settings.accountNumber || ""}
                onChange={(e) => onSettingsChange("accountNumber", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                placeholder="123456789"
                value={settings.routingNumber || ""}
                onChange={(e) => onSettingsChange("routingNumber", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}