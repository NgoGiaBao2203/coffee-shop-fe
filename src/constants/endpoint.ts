export const ENDPOINT = {
  // Auth / Profile
  GET_PROFILE: '/common/get-profile',

  // Staffs
  GET_STAFFS: '/staffs',
  EDIT_STAFF: '/staff/edit',
  DELETE_STAFF: '/staff/delete',
  CREATE_STAFF: '/staff/create',

  // Dropdowns
  GET_ROLES: '/dropdown/role',
  GET_SHOP_NAMES: '/dropdown/shop-name',
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
  DELETE_DRINK: '/drink/delete',
  UPDATE_DRINK: '/drink/edit',

  // Revenue
  GET_REVENUES: '/revenues',

  // Invoices
  GET_INVOICES: '/invoices',
  CREATE_INVOICE: '/invoice/create',
  EDIT_INVOICE: '/invoice/edit',
  PAY_INVOICE: '/invoice/pay',
  CANCEL_INVOICE: '/invoice/cancel',

  // Tables
  GET_TABLES: '/tables',
  CREATE_TABLE: '/tables/create',
  EDIT_TABLE: 'table/edit',
  DELETE_TABLE: '/table/delete',

  // Shop
  GET_SHOPES: '/shops',
  CREATE_SHOP: 'shop/create',
  EDIT_SHOP: '/shop',
  DELETE_SHOP: '/shop/delete',
} as const;
