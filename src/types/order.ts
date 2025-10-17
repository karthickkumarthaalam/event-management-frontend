export interface Order {
  id: string;
  orderId: string;
  purchaser: {
    name: string;
    email: string;
    mobile: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  orderDetails: {
    totalAmount: string;
    discountedAmount: string;
    paymentStatus: string;
    paymentMode: string | null;
    paymentGateway: string | null;
    gatewayTransactionId: string | null;
    purchasedOn: string;
    updatedAt: string;
  };
  items: Array<{
    ticketId: string;
    ticketRefId: string;
    ticketClass: string;
    quantity: number;
    price: string;
    totalAmount: string;
    status: string;
    taxes: Array<{
      taxRefId: string;
      taxName: string;
      taxRate: string;
      taxAmount: string;
    }>;
    addons: any[];
  }>;
  addons: Array<{
    addonRefId: string;
    addonName: string;
    price: string;
    quantity: number;
    totalAmount: string;
  }>;
}

export interface TicketType {
  ticketId: string;
  ticketClass: string;
  quantity: number;
  price: string;
  totalAmount: string;
  status: string;
  checkedIn: boolean;
  taxes?: { taxName: string; taxAmount: string }[];
  qrCode?: string;
}

export interface AddonType {
  id: string;
  addonName: string;
  description?: string;
  price: string;
  quantity: string;
  totalAmount: string;
}
