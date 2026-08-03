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
      showError(
        t('drinks.emptySearch') || 'Không tìm thấy đồ uống nào phù hợp với từ khóa tìm kiếm.',
        t('common.error') || 'Lỗi',
      );
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
      title: t('table.deleteConfirmTitle') || 'Xác nhận xoá',
      icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
      content: t('table.deleteConfirmDesc') || 'Bạn có chắc muốn xoá mục này không?',
      okText: t('table.deleteOk') || 'Xoá',
      okType: 'danger',
      cancelText: t('table.deleteCancel') || 'Huỷ',
      centered: true,
      async onOk() {
        await deleteDrink(targetId);
      },
    });
  };

  // Get price for the currently selected size variant
  const priceForSelected = () => {
    if (!selected || !selected.variants || selected.variants.length === 0) return '—';
    const v = selected.variants[selectedVariantIndex];
    return v?.price ?? '—';
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('drinks.title') || 'Đồ Uống'}
      </Typography.Title>

      {/* Search Input & Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={(val) => handleSearch(val)}
            loading={searchLoading}
            placeholder={t('drinks.searchPlaceholder') || 'Search drink...'}
          />
        </div>

        {/* Create new button in the right corner; hidden for the STAFF role. */}
        {!isStaff && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('form.create') || 'Tạo mới'}
          </Button>
        )}
      </div>
      {/* Scrollable card container with fixed height to prevent layout shift during pagination */}
      <div className="w-full border border-gray-200 rounded-lg p-3 h-[calc(100vh-295px)] min-h-[460px] overflow-y-auto bg-gray-50/30">
        <Spin spinning={loading} description={t('common.loading')}>
          {items.length === 0 && !loading ? (
            <div className="py-16 flex justify-center items-center">
              <Empty description={t('drinks.empty') || 'not found any data drink'} />
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
              { value: 10, label: '10 / trang' },
              { value: 15, label: '15 / trang' },
              { value: 20, label: '20 / trang' },
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
            <Button onClick={() => setDrawerOpen(false)}>{t('form.close') || 'Đóng'}</Button>
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
              <Typography.Text strong>{t('drinks.chooseSize') || 'Chọn kích cỡ'}</Typography.Text>
              <div className="mt-2 w-full overflow-x-auto">
                <Radio.Group
                  value={selectedVariantIndex}
                  onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
                  buttonStyle="solid"
                  className="flex flex-wrap gap-2"
                >
                  {selected.variants?.map((v, idx) => (
                    <Radio.Button key={v.drinkId || idx} value={idx}>
                      {v.size.trim()} - {v.price}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </div>

            {/* Price and Status Row */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-500">{t('drinks.price') || 'Giá'}</div>
                <div className="text-xl font-bold text-green-600">{priceForSelected()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{t('drinks.status') || 'Trạng thái'}</div>
                <Tag
                  color={selected.status === 'Đang bán' ? 'green' : 'default'}
                  className="mt-1 mr-0"
                >
                  {selected.status ?? '—'}
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
