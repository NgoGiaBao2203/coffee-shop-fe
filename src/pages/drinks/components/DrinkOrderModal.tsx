import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, InputNumber, Modal, Select, Spin, Tag, Typography } from 'antd';
import { formatPrice } from '@/utils/formatPrice';
import { useDrinkOrder } from '../hooks/useDrinkOrder';

interface Props {
  readonly open: boolean;
  readonly shopId: string;
  readonly onClose: () => void;
  readonly onCreated: () => void;
}

export function DrinkOrderModal({ open, shopId, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  // Chosen variant (size) per drink, defaults to the first variant
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const {
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
  } = useDrinkOrder(open, shopId, () => {
    setSelectedVariants({});
    setCategoryId(undefined);
    onCreated();
  });

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

  const handleClose = () => {
    setCategoryId(undefined);
    handleReset();
    setSelectedVariants({});
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t('drinks.orderTitle')}
      onCancel={handleClose}
      width={900}
      destroyOnHidden
      maskClosable={!createLoading}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={createLoading}>
          {t('form.cancel')}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={createLoading}
          disabled={cart.length === 0 || !tableId}
          onClick={handleCreateOrder}
        >
          {t('drinks.orderConfirm')}
        </Button>,
      ]}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Menu: choose drink and size */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Typography.Text strong>{t('drinks.orderMenu')}</Typography.Text>
            <Select
              allowClear
              size="small"
              value={categoryId}
              onChange={setCategoryId}
              placeholder={t('drinks.orderCategoryPlaceholder')}
              options={categoryOptions}
              className="w-40"
            />
          </div>
          <Spin spinning={loading}>
            {/* Fixed row height (48px) so the list shows 5 rows (5 * 48 + 4 * 8 gap) then scrolls */}
            <div className="flex max-h-[272px] min-h-[200px] flex-col gap-2 overflow-y-auto pr-1">
              {visibleDrinks.length === 0 && !loading ? (
                <Empty description={t('drinks.orderMenuEmpty')} />
              ) : (
                visibleDrinks.map((drink) => {
                  const variants = variantsByDrink[drink.drinkId] ?? [];
                  const selectedId = selectedVariants[drink.drinkId];
                  const selectedVariant = variants.find((v) => v.drinkDetailId === selectedId);

                  return (
                    <div
                      key={drink.drinkId}
                      className="flex h-12 shrink-0 items-center justify-between gap-2 rounded-lg border border-gray-200 px-2"
                    >
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

        {/* Cart: table, items, total, cash payment */}
        <div className="flex flex-col gap-2">
          <Typography.Text strong>{t('drinks.orderCart')}</Typography.Text>
          <Select
            showSearch
            value={tableId}
            onChange={setTableId}
            loading={loading}
            placeholder={t('drinks.orderTablePlaceholder')}
            optionFilterProp="label"
            options={tables.map((table) => ({
              value: table.tableId,
              label: `${t('drinks.orderTable')} ${table.tableNumber}`,
            }))}
          />

          <div className="flex max-h-[300px] min-h-[120px] flex-col gap-2 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <Empty description={t('drinks.orderCartEmpty')} />
            ) : (
              cart.map((line) => (
                <div
                  key={line.drinkDetailId}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Typography.Text className="truncate">
                      {line.drinkName} ({line.size})
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {formatPrice(line.unitPrice)}
                    </Typography.Text>
                  </div>
                  <InputNumber
                    min={1}
                    max={999}
                    precision={0}
                    value={line.quantity}
                    onChange={(value) => handleQuantityChange(line.drinkDetailId, value ?? 1)}
                    className="w-20"
                  />
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(line.drinkDetailId)}
                  />
                </div>
              ))
            )}
          </div>

          <div className="mt-auto flex flex-col gap-1 border-t border-gray-200 pt-2">
            <div className="flex items-center justify-between">
              <Typography.Text>{t('drinks.orderPaymentMethod')}</Typography.Text>
              <Tag color="green" className="mr-0!">
                {t('drinks.orderPaymentCash')}
              </Tag>
            </div>
            <div className="flex items-center justify-between">
              <Typography.Text strong>{t('drinks.orderTotal')}</Typography.Text>
              <Typography.Text strong>{formatPrice(totalAmount)}</Typography.Text>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
