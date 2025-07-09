import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, Zap, Minimize2 } from "lucide-react";

interface DocumentTemplateSelectorProps {
  documentType: "invoice" | "quote";
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  disabled?: boolean;
}

export default function DocumentTemplateSelector({
  documentType,
  selectedTemplate,
  onTemplateChange,
  disabled = false,
}: DocumentTemplateSelectorProps) {
  const templates = [
    {
      id: "standard",
      name: "Standard",
      description: "Professional layout with all standard elements",
      icon: FileText,
      preview: "/images/template-standard.jpg",
      features: ["Company logo", "Line items", "Tax calculation", "Payment terms"],
    },
    {
      id: "modern",
      name: "Modern",
      description: "Clean, contemporary design with color accents",
      icon: Zap,
      preview: "/images/template-modern.jpg",
      features: ["Brand colors", "Modern typography", "Visual hierarchy", "Professional footer"],
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Simple, clean layout focusing on essential information",
      icon: Minimize2,
      preview: "/images/template-minimal.jpg",
      features: ["Essential info only", "Clean lines", "Compact layout", "Easy to read"],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {documentType === "invoice" ? "Invoice" : "Quote"} Template
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && onTemplateChange(template.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                
                {/* Template Preview */}
                <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
                
                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {isSelected && (
                  <Badge className="w-full justify-center bg-orange-600 hover:bg-orange-700">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>
          Templates can be customized with your company branding, colors, and preferences 
          in the Advanced Settings section.
        </p>
      </div>
    </div>
  );
}