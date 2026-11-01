import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { createInvoiceApi } from '@/pages/invoices/api/invoicesAPI';
import { getTablesApi } from '@/pages/tables/api/tablesApi';
import type { TableItem } from '@/pages/tables/types';
import { getDrinkDetailApi, getDrinksApi } from '../api/drinksAPI';
import { isDrinkActive } from '../constants';
import type { DrinkItem, DrinkVariantItem, OrderCartLine } from '../types';

// Table status 1 = available (matches the backend check when creating an invoice)
const TABLE_AVAILABLE_STATUS = 1;

// Convert a price that may be formatted with commas into a number
function toNumber(value: number | string): number {
  return Number(String(value).replaceAll(',', ''));
}

// Custom hook managing the cash order flow: pick drinks, pick table, create paid invoice
export function useDrinkOrder(open: boolean, shopId: string, onCreated: () => void) {
  const toast = useToast();
  const { t } = useTranslation();

  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [cart, setCart] = useState<OrderCartLine[]>([]);
  const [variantsByDrink, setVariantsByDrink] = useState<Record<string, DrinkVariantItem[]>>({});
  const [variantLoadingIds, setVariantLoadingIds] = useState<string[]>([]);
  const [orderShopId, setOrderShopId] = useState('');
  const [tableId, setTableId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Load sellable drinks via the drinks API, then available tables of that drink's shop
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      let targetShopId = shopId;

      // 1. Menu: drinks API (shopId is empty for non-OWNER roles, the backend resolves their shop)
      try {
        const drinkResponse = await getDrinksApi({
          page: 1,
          size: 100,
          shopId,
          search: '',
          sortBy: 'drinkName',
          sortDirection: 'ASC',
        });

        // The list API does not return variants, sizes are loaded per drink on demand
        const sellableDrinks = (drinkResponse.items ?? []).filter((drink) =>
          isDrinkActive(drink.status),
        );

        targetShopId = shopId || sellableDrinks[0]?.shopId || '';

        if (!isMounted) return;

        setDrinks(sellableDrinks);
        setOrderShopId(targetShopId);
      } catch (error) {
        console.error('Failed to load order drinks:', error);
        if (isMounted) toast.error(t('drinks.orderLoadError'));
      }

      // 2. Available tables of the shop (a failure here must not hide the menu)
      try {
        const tableResponse = targetShopId
          ? await getTablesApi({
              page: 1,
              size: 100,
              shopId: targetShopId,
              status: TABLE_AVAILABLE_STATUS,
            })
          : null;

        if (isMounted) setTables(tableResponse?.items ?? []);
      } catch (error) {
        console.error('Failed to load order tables:', error);
        if (isMounted) toast.error(t('drinks.orderLoadError'));
      }

      if (isMounted) setLoading(false);
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [open, shopId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalAmount = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart],
  );

  // Load sizes and prices of a drink via the drink detail API (cached per drink)
  const loadVariants = async (drinkId: string) => {
    if (variantsByDrink[drinkId] || variantLoadingIds.includes(drinkId)) return;

    setVariantLoadingIds((prev) => [...prev, drinkId]);

    try {
      const response = await getDrinkDetailApi(drinkId);

      setVariantsByDrink((prev) => ({ ...prev, [drinkId]: response.item?.variants ?? [] }));
    } catch (error) {
      console.error('Failed to load drink variants:', error);
      toast.error(t('drinks.orderLoadError'));
    } finally {
      setVariantLoadingIds((prev) => prev.filter((id) => id !== drinkId));
    }
  };

  // Add one cup of the chosen drink size, or increase its quantity
  const handleAddItem = (drink: DrinkItem, variant: DrinkVariantItem) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.drinkDetailId === variant.drinkDetailId);

      if (existing) {
        return prev.map((line) =>
          line.drinkDetailId === variant.drinkDetailId
            ? { ...line, quantity: Math.min(line.quantity + 1, 999) }
            : line,
        );
      }

      return [
        ...prev,
        {
          drinkDetailId: variant.drinkDetailId,
          drinkName: drink.drinkName,
          size: variant.size,
          unitPrice: toNumber(variant.price),
          quantity: 1,
        },
      ];
    });
  };

  const handleQuantityChange = (drinkDetailId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((line) => (line.drinkDetailId === drinkDetailId ? { ...line, quantity } : line)),
    );
  };

  const handleRemoveItem = (drinkDetailId: string) => {
    setCart((prev) => prev.filter((line) => line.drinkDetailId !== drinkDetailId));
  };

  const handleReset = () => {
    setCart([]);
    setTableId(undefined);
  };

  // Create a paid (cash) invoice for the selected table and drinks
  const handleCreateOrder = async () => {
    if (!tableId) {
      toast.warning(t('drinks.orderTableRequired'));
      return;
    }

    if (cart.length === 0 || !orderShopId) {
      toast.warning(t('drinks.orderItemsRequired'));
      return;
    }

    setCreateLoading(true);

    try {
      await createInvoiceApi({
        shopId: orderShopId,
        tableId,
        status: 1,
        items: cart.map(({ drinkDetailId, quantity, unitPrice }) => ({
          drinkDetailId,
          quantity,
          unitPrice,
        })),
      });

      toast.success(t('drinks.orderSuccess'));
      handleReset();
      onCreated();
    } catch (error) {
      // Error notification is already shown by the response interceptor
      console.error('Failed to create order:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    drinks,
    variantsByDrink,
    variantLoadingIds,
    tables,
    cart,
    tableId,
    loading,
    createLoading,
    totalAmount,
    setTableId,
    loadVariants,
    handleAddItem,
    handleQuantityChange,
    handleRemoveItem,
    handleReset,
    handleCreateOrder,
  };
}
