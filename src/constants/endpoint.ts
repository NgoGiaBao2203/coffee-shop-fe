export const ENDPOINT = {
  // Auth / Profile
  GET_PROFILE: '/common/get-profile',

  // Staffs
  GET_STAFFS: '/staffs',
  CREATE_STAFF: '/staff/create',
  EDIT_STAFF: '/staff/edit',
  DELETE_STAFF: '/staff/delete',

  // Dropdowns
  GET_DROPDOWN_ROLES: '/dropdown/role',
  GET_DROPDOWN_SHOP_NAMES: '/dropdown/shop-name',
  GET_DROPDOWN_CATEGORIES: '/dropdown/category',

  // Categories
  GET_CATEGORIES: '/categories',
  CREATE_CATEGORY: '/category/create',
  EDIT_CATEGORY: '/category/edit',
  DELETE_CATEGORY: '/category/delete',

  // Drinks
  GET_DRINKS: '/drinks',
  GET_DRINK_DETAIL: '/drink/detail',
  CREATE_DRINK: '/drink/create',
  EDIT_DRINK: '/drink/edit',
  DELETE_DRINK: '/drink/delete',

  // Drink Details
  CREATE_DRINK_DETAIL: '/drink-detail/create',
  EDIT_DRINK_DETAIL: '/drink-detail/edit',
  DELETE_DRINK_DETAIL: '/drink-detail/delete',

  // Revenue
  GET_REVENUES: '/revenues',
  EXPORT_REVENUES: '/revenues/export',

  // Invoices
  GET_INVOICES: '/invoices',
  CREATE_INVOICE: '/invoice/create',
  EDIT_INVOICE: '/invoice/edit',
  PAY_INVOICE: '/invoice/pay',
  CANCEL_INVOICE: '/invoice/cancel',
  PRINT_INVOICE: '/invoices/print',

  // Tables (create is plural on the backend)
  GET_TABLES: '/tables',
  CREATE_TABLE: '/tables/create',
  EDIT_TABLE: '/table/edit',
  DELETE_TABLE: '/table/delete',

  // Shops (edit takes shopId on the path: /shop/{shopId})
  GET_SHOPS: '/shops',
  CREATE_SHOP: '/shop/create',
  EDIT_SHOP: '/shop',
  DELETE_SHOP: '/shop/delete',
} as const;
