import { App } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { store, persistor } from '@/store/store';
import { AuthProvider } from './AuthProvider';
import { router } from './router';

export function AppProvider() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </App>
      </PersistGate>
    </Provider>
  );
}
