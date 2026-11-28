import { App, ConfigProvider, type ThemeConfig } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { store, persistor } from '@/store/store';
import { AuthProvider } from './AuthProvider';
import { router } from './router';

// Tooltips use the header's slate color instead of antd's default near-black
const APP_THEME: ThemeConfig = {
  components: {
    Tooltip: { colorBgSpotlight: '#1e293b' },
  },
};

export function AppProvider() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={APP_THEME}>
          <App>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </App>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}
