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

  // Shop branch
  GET_SHOP_BRANCHES: 'shop-branches',
  CREATE_SHOP_BRANCH: 'shop-branch/create',
  EDIT_SHOP_BRANCH: '/shop-branch/edit',
  DELETE_SHOP_BRANCH: '/shop-branch/delete',
} as const;
