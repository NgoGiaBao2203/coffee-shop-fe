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

  // Drinks
  GET_DRINKS: '/drinks',
  CREATE_DRINK: '/drink/create',
  DELETE_DRINK: '/drink/delete',
} as const;
