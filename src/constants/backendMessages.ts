// Backend error messages (English, matched case-insensitively by substring) mapped to vn.json keys.
// Order matters: the first match wins, so specific messages come before generic ones.
// `field` binds the message to a form field; `reload` means the list is stale and must be refetched.
export interface BackendMessageRule {
  match: string[];
  key: string;
  field?: string;
  reload?: boolean;
}

export const BACKEND_MESSAGE_RULES: BackendMessageRule[] = [
  // Invoices
  {
    match: ['current table is unavailable'],
    key: 'invoices.editErrors.currentTableUnavailable',
    reload: true,
  },
  {
    match: ['previous table cannot be released', 'table cannot be released'],
    key: 'invoices.editErrors.releaseTableFailed',
    reload: true,
  },
  { match: ['table is unavailable'], key: 'invoices.editErrors.tableUnavailable', reload: true },
  { match: ['invoice does not belong'], key: 'invoices.editErrors.notBelongToShop' },
  { match: ['permission to edit this invoice'], key: 'invoices.editErrors.noPermission' },
  { match: ['permission to change this invoice'], key: 'apiMessages.invoiceChangeNoPermission' },
  { match: ['permission to create invoices'], key: 'apiMessages.invoiceCreateNoPermission' },
  {
    match: ['already completed or cancelled'],
    key: 'invoices.editErrors.notEditable',
    reload: true,
  },
  { match: ['invoice cannot be edited'], key: 'invoices.editErrors.reload', reload: true },
  { match: ['invoice status cannot be updated'], key: 'apiMessages.reload', reload: true },
  { match: ['invoice details could not be saved'], key: 'invoices.editErrors.saveFailed' },
  { match: ['drink is unavailable'], key: 'apiMessages.drinkUnavailable', reload: true },
  { match: ['drink price has changed'], key: 'apiMessages.drinkPriceChanged', reload: true },
  { match: ['invoice total exceeds'], key: 'apiMessages.invoiceTotalExceeded' },

  // Categories
  {
    match: ['category name is existed', 'category name already exists'],
    key: 'categories.nameConflict',
    field: 'categoryName',
  },
  { match: ['category name is required'], key: 'categories.nameRequired', field: 'categoryName' },
  {
    match: ['can not delete category with pending invoices'],
    key: 'categories.deletePendingInvoices',
  },
  {
    match: ['category does not belong'],
    key: 'drinks.categoryInvalidShop',
    field: 'drinkCategoryId',
  },

  // Shops
  {
    match: ['cannot delete shop with active staff and pending invoices'],
    key: 'shops.deleteActiveStaffAndPendingInvoices',
  },
  { match: ['cannot delete shop with active staff'], key: 'shops.deleteActiveStaff' },
  { match: ['cannot delete shop with pending invoices'], key: 'shops.deletePendingInvoices' },
  {
    match: ['shop name already exists', 'shop name is existed'],
    key: 'shops.nameConflict',
    field: 'shopName',
  },
  {
    match: ['shop address already exists', 'address is existed'],
    key: 'shops.addressConflict',
    field: 'address',
  },

  // Staffs
  {
    match: ['staff phone is existed', 'phone number exited'],
    key: 'staffs.phoneConflict',
    field: 'phoneNumber',
  },
  { match: ['staff email is existed'], key: 'staffs.emailConflict', field: 'email' },
  { match: ['staff is existed'], key: 'staffs.usernameConflict', field: 'username' },

  // Drinks / drink details
  {
    match: ['drink detail size already exists', 'drink size already exists'],
    key: 'drinks.sizeExists',
    field: 'size',
  },
  { match: ['drink name is existed'], key: 'drinks.nameConflict', field: 'drinkName' },
  { match: ['at least one active size'], key: 'apiMessages.drinkLastSize' },
  { match: ['only jpg and png', 'invalid file name'], key: 'drinks.imageTypeInvalid' },
  { match: ['image file must not exceed'], key: 'drinks.imageTooLarge' },
  { match: ['invalid image file'], key: 'drinks.imageNotValid' },
  { match: ['edit a drink from another shop'], key: 'drinks.permissionDeniedEditShop' },

  // Tables
  {
    match: ['table number already exists'],
    key: 'tables.numberConflict',
    field: 'tableNumber',
  },
  { match: ['can not delete table with pending invoices'], key: 'tables.deletePendingInvoices' },
  { match: ['table does not belong'], key: 'apiMessages.tableNotBelong', reload: true },

  // Shared
  { match: ['has already been deleted or modified'], key: 'apiMessages.staleData', reload: true },
  { match: ['not assigned to any shop'], key: 'apiMessages.notAssignedShop' },
  { match: ['do not have permission to access this shop'], key: 'apiMessages.noShopPermission' },
  { match: ['shop id is required'], key: 'invoices.shopRequired' },
];
