// One drink size added to an order, shared by the create order and edit invoice forms
export interface OrderCartLine {
  drinkDetailId: string;
  drinkName: string;
  size: string;
  unitPrice: number;
  quantity: number;
  note?: string;
}

// Values prefilled when an existing order (invoice) is edited
export interface OrderInitialValues {
  tableId: string;
  tableNumber: number | null;
  lines: OrderCartLine[];
}

// Order data ready to send to the invoice APIs
export interface OrderPayload {
  shopId: string;
  tableId: string;
  items: {
    drinkDetailId: string;
    quantity: number;
    unitPrice: number;
    note?: string;
  }[];
}
