import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Empty, Input, InputNumber, Select, Spin, Typography } from 'antd';
import { ORDER_MAX_QUANTITY, ORDER_MIN_QUANTITY } from '@/constants/order';
import { formatPrice } from '@/utils/formatPrice';
import { resolveImageUrl } from '@/utils/image';
import type { OrderEditorState } from '@/hooks/useOrderEditor';

interface Props {
  readonly editor: OrderEditorState;
  // Extra rows shown above the total (e.g. payment method)
  readonly footerExtra?: ReactNode;
}

const FALLBACK_DRINK_IMAGE = 'https://placehold.co/80x80?text=Drink';

// Two-column order form: menu on the left, table + cart + total on the right
export function OrderEditor({ editor, footerExtra }: Props) {
  const { t } = useTranslation();

  const {
    drinks,
    variantsByDrink,
    variantLoadingIds,
    tableOptions,
    cart,
    tableId,
    loading,
    totalAmount,
    itemErrors,
    setTableId,
    loadVariants,
    handleAddItem,
    handleQuantityChange,
    handleNoteChange,
    handleRemoveItem,
  } = editor;

  const [categoryId, setCategoryId] = useState<string | undefined>();

  // Chosen variant (size) per drink, defaults to the first variant
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Category options built from the loaded drinks
  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();

    drinks.forEach((drink) => {
      if (drink.drinkCategoryId) {
        categories.set(drink.drinkCategoryId, drink.categoryName ?? drink.drinkCategoryId);
      }
    });

    return Array.from(categories, ([value, label]) => ({ value, label }));
  }, [drinks]);

  // Filter menu by selected category
  const visibleDrinks = useMemo(
    () => (categoryId ? drinks.filter((drink) => drink.drinkCategoryId === categoryId) : drinks),
    [drinks, categoryId],
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Menu: choose drink and size */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Typography.Text strong>{t('order.menu')}</Typography.Text>
          <Select
            allowClear
            size="small"
            value={categoryId}
            onChange={setCategoryId}
            placeholder={t('order.categoryPlaceholder')}
            options={categoryOptions}
            className="w-40"
          />
        </div>
        <Spin spinning={loading}>
          {/* Fixed row height (72px) so the list shows 6 rows (6 * 72 + 5 * 8 gap) then scrolls */}
          <div className="flex max-h-[472px] min-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
            {visibleDrinks.length === 0 && !loading ? (
              <Empty description={t('order.menuEmpty')} />
            ) : (
              visibleDrinks.map((drink) => {
                const variants = variantsByDrink[drink.drinkId] ?? [];
                const selectedId = selectedVariants[drink.drinkId];
                const selectedVariant = variants.find((v) => v.drinkDetailId === selectedId);

                return (
                  <div
                    key={drink.drinkId}
                    className="flex h-[72px] shrink-0 items-center justify-between gap-2 rounded-lg border border-gray-200 px-2"
                  >
                    <Avatar
                      shape="square"
                      size={56}
                      src={resolveImageUrl(drink.imageUrl) || FALLBACK_DRINK_IMAGE}
                      className="shrink-0"
                    />
                    <Typography.Text className="min-w-0 flex-1 truncate">
                      {drink.drinkName}
                    </Typography.Text>
                    <Select
                      size="small"
                      value={selectedId}
                      loading={variantLoadingIds.includes(drink.drinkId)}
                      onOpenChange={(isOpen) => isOpen && loadVariants(drink.drinkId)}
                      onChange={(value) =>
                        setSelectedVariants((prev) => ({ ...prev, [drink.drinkId]: value }))
                      }
                      placeholder={t('drinks.chooseSize')}
                      options={variants.map((variant) => ({
                        value: variant.drinkDetailId,
                        label: `${variant.size} · ${formatPrice(variant.price)}`,
                      }))}
                      className="w-36 shrink-0"
                    />
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlusOutlined />}
                      disabled={!selectedVariant}
                      onClick={() => selectedVariant && handleAddItem(drink, selectedVariant)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </Spin>
      </div>

      {/* Cart: table, items, total */}
      <div className="flex flex-col gap-2">
        <Typography.Text strong>{t('order.cart')}</Typography.Text>
        <Select
          showSearch
          value={tableId}
          onChange={setTableId}
          loading={loading}
          placeholder={t('order.tablePlaceholder')}
          optionFilterProp="label"
          options={tableOptions}
        />

        <div className="flex max-h-[520px] min-h-[200px] flex-col gap-2 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <Empty description={t('order.cartEmpty')} />
          ) : (
            cart.map((line) => (
              <div
                key={line.drinkDetailId}
                className="flex flex-col gap-1 rounded-lg border border-gray-200 p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Typography.Text className="truncate">
                      {line.drinkName} ({line.size})
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {formatPrice(line.unitPrice)}
                    </Typography.Text>
                  </div>
                  <InputNumber
                    min={ORDER_MIN_QUANTITY}
                    max={ORDER_MAX_QUANTITY}
                    precision={0}
                    value={line.quantity}
                    status={itemErrors[line.drinkDetailId] ? 'error' : undefined}
                    onChange={(value) =>
                      handleQuantityChange(line.drinkDetailId, value ?? ORDER_MIN_QUANTITY)
                    }
                    className="w-20"
                  />
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(line.drinkDetailId)}
                  />
                </div>
                {itemErrors[line.drinkDetailId] && (
                  <Typography.Text type="danger" className="text-xs">
                    {itemErrors[line.drinkDetailId]}
                  </Typography.Text>
                )}
                <Input
                  size="small"
                  maxLength={255}
                  value={line.note}
                  placeholder={t('order.notePlaceholder')}
                  onChange={(event) => handleNoteChange(line.drinkDetailId, event.target.value)}
                />
              </div>
            ))
          )}
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-gray-200 pt-2">
          {footerExtra}
          <div className="flex items-center justify-between">
            <Typography.Text strong>{t('order.total')}</Typography.Text>
            <Typography.Text strong>{formatPrice(totalAmount)}</Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
}
