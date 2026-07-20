export const ENV = {
  API_HOST: import.meta.env.VITE_API_HOST as string,
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === 'true',
};
