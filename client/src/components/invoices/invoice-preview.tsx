import { Customer } from "@shared/schema";

interface InvoicePreviewProps {
  invoiceNumber: string;
  customer?: Customer;
  projectDescription: string;
  issueDate: string;
  lineItems: Array<{
    description: string;
    quantity: string;
    rate: string;
    amount: string;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  showLineItems: boolean;
  showLogo: boolean;
  showPaymentTerms: boolean;
}

export default function InvoicePreview({
  invoiceNumber,
  customer,
  projectDescription,
  issueDate,
  lineItems,
  subtotal,
  taxRate,
  taxAmount,
  total,
  notes,
  showLineItems,
  showLogo,
  showPaymentTerms,
}: InvoicePreviewProps) {
  return (
    <div className="bg-white border contractor-border-slate-200 rounded-lg p-6 text-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          {showLogo && (
            <div className="w-12 h-12 contractor-bg-primary-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold">DC</span>
            </div>
          )}
          <h3 className="font-bold contractor-text-slate-900">Doe Construction</h3>
          <p className="contractor-text-slate-600 text-xs">
            123 Main Street<br />
            Anytown, ST 12345<br />
            (555) 123-4567
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold contractor-text-slate-900">INVOICE</h2>
          <p className="contractor-text-slate-600">{invoiceNumber}</p>
          <p className="contractor-text-slate-600">
            {new Date(issueDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {customer && (
        <div className="border-t contractor-border-slate-200 pt-4 mb-6">
          <h4 className="font-semibold contractor-text-slate-900 mb-2">Bill To:</h4>
          <p className="contractor-text-slate-700">
            {customer.name}<br />
            {customer.address && `${customer.address}<br />`}
            {customer.city && customer.state && `${customer.city}, ${customer.state} ${customer.zipCode}`}
          </p>
        </div>
      )}

      {projectDescription && (
        <div className="border-t contractor-border-slate-200 pt-4 mb-6">
          <h4 className="font-semibold contractor-text-slate-900 mb-2">
            Project: {projectDescription}
          </h4>
        </div>
      )}

      {showLineItems && lineItems.length > 0 && (
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b contractor-border-slate-200">
              <th className="text-left py-2 contractor-text-slate-700">Description</th>
              <th className="text-right py-2 contractor-text-slate-700">Qty</th>
              <th className="text-right py-2 contractor-text-slate-700">Rate</th>
              <th className="text-right py-2 contractor-text-slate-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td className="py-2 contractor-text-slate-700">{item.description}</td>
                <td className="py-2 text-right contractor-text-slate-700">{item.quantity}</td>
                <td className="py-2 text-right contractor-text-slate-700">
                  ${parseFloat(item.rate).toFixed(2)}
                </td>
                <td className="py-2 text-right contractor-text-slate-700">
                  ${parseFloat(item.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="border-t contractor-border-slate-200 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="contractor-text-slate-700">Subtotal:</span>
          <span className="contractor-text-slate-700">${subtotal.toFixed(2)}</span>
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="contractor-text-slate-700">Tax ({taxRate}%):</span>
            <span className="contractor-text-slate-700">${taxAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-lg">
          <span className="contractor-text-slate-900">Total:</span>
          <span className="contractor-text-slate-900">${total.toFixed(2)}</span>
        </div>
      </div>

      {notes && (
        <div className="border-t contractor-border-slate-200 pt-4 mt-6">
          <h4 className="font-semibold contractor-text-slate-900 mb-2">Notes:</h4>
          <p className="text-xs contractor-text-slate-600">{notes}</p>
        </div>
      )}

      {showPaymentTerms && (
        <div className="border-t contractor-border-slate-200 pt-4 mt-6">
          <p className="text-xs contractor-text-slate-600">Payment Terms: Net 30 days</p>
        </div>
      )}
    </div>
  );
}
