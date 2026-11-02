import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { RESPONSE_CODE } from '@/constants/messages';
import { ORDER_MAX_QUANTITY } from '@/constants/order';
import { getDrinkDetailApi, getDrinksApi } from '@/pages/drinks/api/drinksAPI';
import { isDrinkActive } from '@/pages/drinks/constants';
import type { DrinkItem, DrinkVariantItem } from '@/pages/drinks/types';
import { getTablesApi } from '@/pages/tables/api/tablesApi';
import type { TableItem } from '@/pages/tables/types';
import type { OrderCartLine, OrderInitialValues, OrderPayload } from '@/types/order';
import { getOrderItemErrors } from '@/utils/orderItemErrors';
import { getResponseMessage } from '@/utils/getResponseMessage';

// Table status 1 = available (matches the backend check when saving an invoice)
const TABLE_AVAILABLE_STATUS = 1;

// Convert a price that may be formatted with commas into a number
function toNumber(value: number | string): number {
  return Number(String(value).replaceAll(',', ''));
}

// Shared state of the order forms: menu, tables, cart and the payload sent to the invoice APIs
export function useOrderEditor(open: boolean, shopId: string, initialOrder?: OrderInitialValues) {
  const toast = useToast();
  const { t } = useTranslation();

  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [cart, setCart] = useState<OrderCartLine[]>(() => initialOrder?.lines ?? []);
  const [variantsByDrink, setVariantsByDrink] = useState<Record<string, DrinkVariantItem[]>>({});
  const [variantLoadingIds, setVariantLoadingIds] = useState<string[]>([]);
  const [orderShopId, setOrderShopId] = useState('');
  const [tableId, setTableId] = useState<string | undefined>(initialOrder?.tableId);
  const [loading, setLoading] = useState(false);
  // Quantity errors returned by the backend, keyed by drinkDetailId
  const [serverItemErrors, setServerItemErrors] = useState<Record<string, string>>({});

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
        if (isMounted) toast.error(t('order.loadError'));
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
        if (isMounted) toast.error(t('order.loadError'));
      }

      if (isMounted) setLoading(false);
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [open, shopId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Table options; the table of an edited order is busy, so it is added back to the list
  const tableOptions = useMemo(() => {
    const options = tables.map(({ tableId: value, tableNumber }) => ({
      value,
      label: `${t('order.table')} ${tableNumber}`,
    }));

    if (initialOrder && !tables.some((table) => table.tableId === initialOrder.tableId)) {
      options.unshift({
        value: initialOrder.tableId,
        label: `${t('order.table')} ${initialOrder.tableNumber}`,
      });
    }

    return options;
  }, [tables, initialOrder, t]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart],
  );

  // Quantity error per cart line: backend error first, otherwise the max check
  // (an old invoice may still hold more than the max and must be reduced before saving)
  const itemErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    cart.forEach(({ drinkDetailId, quantity }) => {
      const error =
        serverItemErrors[drinkDetailId] ??
        (quantity > ORDER_MAX_QUANTITY
          ? t('order.quantityMax', { max: ORDER_MAX_QUANTITY })
          : undefined);

      if (error) errors[drinkDetailId] = error;
    });

    return errors;
  }, [cart, serverItemErrors, t]);

  const clearServerItemError = (drinkDetailId: string) => {
    setServerItemErrors((prev) => {
      if (!(drinkDetailId in prev)) return prev;

      const next = { ...prev };
      delete next[drinkDetailId];
      return next;
    });
  };

  // Load sizes and prices of a drink via the drink detail API (cached per drink)
  const loadVariants = async (drinkId: string) => {
    if (variantsByDrink[drinkId] || variantLoadingIds.includes(drinkId)) return;

    setVariantLoadingIds((prev) => [...prev, drinkId]);

    try {
      const response = await getDrinkDetailApi(drinkId);

      setVariantsByDrink((prev) => ({ ...prev, [drinkId]: response.item?.variants ?? [] }));
    } catch (error) {
      console.error('Failed to load drink variants:', error);
      toast.error(t('order.loadError'));
    } finally {
      setVariantLoadingIds((prev) => prev.filter((id) => id !== drinkId));
    }
  };

  // Add one cup of the chosen drink size, or increase its quantity (up to the max per line)
  const handleAddItem = (drink: DrinkItem, variant: DrinkVariantItem) => {
    const existingLine = cart.find((line) => line.drinkDetailId === variant.drinkDetailId);

    if (existingLine && existingLine.quantity >= ORDER_MAX_QUANTITY) {
      toast.warning(t('order.quantityMax', { max: ORDER_MAX_QUANTITY }));
      return;
    }

    clearServerItemError(variant.drinkDetailId);

    setCart((prev) => {
      const existing = prev.find((line) => line.drinkDetailId === variant.drinkDetailId);

      if (existing) {
        return prev.map((line) =>
          line.drinkDetailId === variant.drinkDetailId
            ? { ...line, quantity: Math.min(line.quantity + 1, ORDER_MAX_QUANTITY) }
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

  // Update one field of a cart line
  const updateLine = (drinkDetailId: string, changes: Partial<OrderCartLine>) => {
    setCart((prev) =>
      prev.map((line) => (line.drinkDetailId === drinkDetailId ? { ...line, ...changes } : line)),
    );
  };

  const handleQuantityChange = (drinkDetailId: string, quantity: number) => {
    clearServerItemError(drinkDetailId);
    updateLine(drinkDetailId, { quantity });
  };

  const handleNoteChange = (drinkDetailId: string, note: string) =>
    updateLine(drinkDetailId, { note });

  const handleRemoveItem = (drinkDetailId: string) => {
    clearServerItemError(drinkDetailId);
    setCart((prev) => prev.filter((line) => line.drinkDetailId !== drinkDetailId));
  };

  const reset = () => {
    setCart(initialOrder?.lines ?? []);
    setTableId(initialOrder?.tableId);
    setServerItemErrors({});
  };

  // Show items[i].quantity errors (ER008) on their cart lines; returns true when handled
  const handleItemErrors = (error: unknown): boolean => {
    const errors = getOrderItemErrors(error);

    if (errors.length === 0) return false;

    const next: Record<string, string> = {};

    errors.forEach(({ index, code }) => {
      const line = cart[index];

      if (!line) return;

      next[line.drinkDetailId] =
        code === RESPONSE_CODE.SIZE_MAX
          ? t('order.quantityMax', { max: ORDER_MAX_QUANTITY })
          : getResponseMessage(code);
    });

    setServerItemErrors(next);
    toast.error(t('order.itemsInvalid'));
    return true;
  };

  // Validate the form and build the invoice payload; returns null (with a warning) when invalid
  const buildOrderPayload = (): OrderPayload | null => {
    if (!tableId) {
      toast.warning(t('order.tableRequired'));
      return null;
    }

    if (cart.length === 0 || !orderShopId) {
      toast.warning(t('order.itemsRequired'));
      return null;
    }

    if (Object.keys(itemErrors).length > 0) {
      toast.warning(t('order.itemsInvalid'));
      return null;
    }

    return {
      shopId: orderShopId,
      tableId,
      items: cart.map(({ drinkDetailId, quantity, unitPrice, note }) => ({
        drinkDetailId,
        quantity,
        unitPrice,
        note: note?.trim() || undefined,
      })),
    };
  };

  return {
    drinks,
    variantsByDrink,
    variantLoadingIds,
    tableOptions,
    cart,
    tableId,
    loading,
    totalAmount,
    itemErrors,
    // Order can be submitted once it has a table and at least one item
    canSubmit: cart.length > 0 && !!tableId,
    setTableId,
    loadVariants,
    handleAddItem,
    handleQuantityChange,
    handleNoteChange,
    handleRemoveItem,
    reset,
    buildOrderPayload,
    handleItemErrors,
  };
}

export type OrderEditorState = ReturnType<typeof useOrderEditor>;
