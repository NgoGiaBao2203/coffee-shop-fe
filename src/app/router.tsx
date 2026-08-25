import { createHashRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/login/LoginPage';
import { DrinksPage } from '@/pages/drinks/DrinksPage';
import { StaffsPage } from '@/pages/staffs/StaffsPage';
import { CategoriesPage } from '@/pages/categories/CategoriesPage';
import { RevenuesPage } from '@/pages/revenue/RevenuesPage';
import { ShopBranchPage } from '@/pages/shop-branches/ShopBranchPage';

export const router = createHashRouter([
  // Public routes — login wrapped in AuthLayout
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },

  // Protected routes — guarded by ProtectedRoute, wrapped in MainLayout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <DrinksPage />,
          },
          {
            path: '/staff',
            element: <StaffsPage />,
          },
          {
            path: '/categories',
            element: <CategoriesPage />,
          },
          {
            path: '/revenue',
            element: <RevenuesPage />,
          },
          {
            path: '/shop-branches',
            element: <ShopBranchPage />,
          },
        ],
      },
    ],
  },

  // Catch-all — redirect unknown URLs to home (prevents custom URL bypass)
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
