import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
  Pagination,
  Empty,
  Spin,
  Button,
  Typography,
  Tag,
  Drawer,
  Radio,
  Select,
  Modal,
} from 'antd';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { useDrinks } from './hooks/useDrinks';
import type { DrinkItem } from './types';
import { DrinkCardGrouped } from './components/DrinkCardGrouped';
import { DrinkCreateModal } from './components/DrinkCreateModal';

export function DrinksPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();

  // Check role permission (STAFF role cannot see create/delete buttons)
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isStaff = roleName === ROLES.STAFF;

  // Fetch drinks data and handlers from custom hook
  const {
    items,
    totalElements,
    loading,
    searchLoading,
    createLoading,
    currentPage,
    currentPageSize,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handlePageChange,
    createDrink,
    deleteDrink,
  } = useDrinks(1, 10);

  // Show error modal when user search returns no results
  useEffect(() => {
    if (showEmptyModal) {
      showError(t('drinks.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drawer and variant selection states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<DrinkItem | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  const fallbackImage = 'https://placehold.co/600x400?text=No+Image';

  // Open detail drawer and select the first size variant by default
  const onCardClick = (g: DrinkItem) => {
    setSelected(g);
    setSelectedVariantIndex(0);
    setDrawerOpen(true);
  };

  // Open central delete confirmation modal matching the staff page style
  const handleDeleteDrink = (g: DrinkItem) => {
    const targetId = g.drinkId;
    if (!targetId) return;

    Modal.confirm({
      title: t('table.deleteConfirmTitle'),
      icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
      content: t('table.deleteConfirmDesc'),
      okText: t('table.deleteOk'),
      okType: 'danger',
      cancelText: t('table.deleteCancel'),
      centered: true,
      async onOk() {
        await deleteDrink(targetId);
      },
    });
  };

  // Get price for the currently selected size variant
  const priceForSelected = () => {
    if (!selected || !selected.variants || selected.variants.length === 0) return 0;
    const v = selected.variants[selectedVariantIndex];
    return v?.price ?? 0;
  };

  // Helper format currency
  const formatCurrency = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null || amount === '—') return '—';
    const num = Number(String(amount).replace(/[^0-9.-]+/g, '')) || 0;
    return `${num.toLocaleString('vi-VN')}đ`;
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('drinks.title')}
      </Typography.Title>

      {/* Search Input & Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={(val) => handleSearch(val)}
            loading={searchLoading}
            placeholder={t('drinks.searchPlaceholder')}
          />
        </div>

        {/* Create new button in the right corner; hidden for the STAFF role. */}
        {!isStaff && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('form.create')}
          </Button>
        )}
      </div>

      {/* Scrollable card container with fixed height to prevent layout shift during pagination */}
      <div className="w-full border border-gray-200 rounded-lg p-3 h-[calc(100vh-295px)] min-h-[460px] overflow-y-auto bg-gray-50/30">
        <Spin spinning={loading} description={t('common.loading')}>
          {items.length === 0 && !loading ? (
            <div className="py-16 flex justify-center items-center">
              <Empty description={t('drinks.empty')} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 items-start justify-start">
              {items.map((g) => (
                <DrinkCardGrouped
                  key={g.drinkId}
                  record={g}
                  onClick={() => onCardClick(g)}
                  onDelete={handleDeleteDrink}
                  isStaff={isStaff}
                />
              ))}
            </div>
          )}
        </Spin>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-1 w-full">
        <div className="flex-1" />

        <div className="flex-1 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={currentPageSize}
            total={totalElements}
            onChange={(p, ps) => handlePageChange(p, ps)}
            showSizeChanger={false}
          />
        </div>

        <div className="flex-1 flex justify-end">
          <Select
            value={currentPageSize}
            onChange={(val) => handlePageChange(1, Number(val))}
            options={[
              { value: 10, label: `10 / ${t('table.perPage')}` },
              { value: 15, label: `15 / ${t('table.perPage')}` },
              { value: 20, label: `20 / ${t('table.perPage')}` },
            ]}
            style={{ width: 120 }}
          />
        </div>
      </div>

      {/* Drink Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        title={selected?.drinkName}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setDrawerOpen(false)}>{t('form.close')}</Button>
          </div>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Drink Image */}
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
              <img
                src={selected.imageUrl || fallbackImage}
                alt="drink"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (el.src !== fallbackImage) {
                    el.src = fallbackImage;
                  }
                }}
              />
            </div>

            {/* Drink Title & Size Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Typography.Title level={4} className="mb-0!">
                {selected.drinkName}
              </Typography.Title>
              {selected?.variants?.length && (
                <Tag color="green">{selected.variants.length} size</Tag>
              )}
            </div>

            {/* Variant Selector */}
            <div>
              <Typography.Text strong>{t('drinks.chooseSize')}</Typography.Text>
              <div className="mt-2 w-full overflow-x-auto">
                <Radio.Group
                  value={selectedVariantIndex}
                  onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
                  buttonStyle="solid"
                  className="flex flex-wrap gap-2"
                >
                  {selected.variants?.map((v, idx) => (
                    <Radio.Button key={v.drinkId || idx} value={idx}>
                      {v.size.trim()} - {formatCurrency(v.price)}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </div>

            {/* Price and Status Row */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-500">{t('drinks.price')}</div>

                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(priceForSelected())}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">{t('drinks.status')}</div>
                <Tag
                  color={
                    selected?.status === 'Đang bán' || selected?.status === t('drinks.statusActive')
                      ? 'green'
                      : 'default'
                  }
                  className="mt-1 mr-0"
                >
                  {selected?.status ?? '—'}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create drink Modal */}
      <DrinkCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createDrink}
        loading={createLoading}
      />
    </div>
  );
}
