export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;

export const QUOTE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export const CUSTOMER_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
} as const;

export const CUSTOMER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  residential: 'bg-blue-100 text-blue-800',
  commercial: 'bg-purple-100 text-purple-800',
} as const;

export const DEFAULT_COMPANY_INFO = {
  name: 'Doe Construction',
  address: '123 Main Street',
  city: 'Anytown',
  state: 'ST',
  zipCode: '12345',
  phone: '(555) 123-4567',
  email: 'info@doeconstruction.com',
};
