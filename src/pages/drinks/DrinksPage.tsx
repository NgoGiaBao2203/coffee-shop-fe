import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Pagination, Empty, Spin, Button, Typography, Select, Modal } from 'antd';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { useDrinks } from './hooks/useDrinks';
import { getDrinkDetailApi } from './api/drinksAPI';
import type { DrinkItem } from './types';
import { DrinkCardGrouped } from './components/DrinkCardGrouped';
import { DrinkCreateModal } from './components/DrinkCreateModal';
import { DrinkEditModal } from './components/DrinkEditModal';
import { DrinkDetailDrawer } from './components/DrinkDetailDrawer';

export function DrinksPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();

  // Role authorization checks
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isStaff = roleName === ROLES.STAFF;
  const isOwner = roleName === ROLES.OWNER;

  // Custom hook retrieving drink data, options, and actions
  const {
    items,
    totalElements,
    loading,
    searchLoading,
    createLoading,
    editLoading,
    showEmptyModal,
    closeEmptyModal,
    currentPage,
    currentPageSize,
    currentBranchShopId,
    shopOptions,
    categoryOptions,
    optionsLoading,
    handleSearch,
    handleShopFilter,
    handlePageChange,
    createDrink,
    editDrink,
    deleteDrink,
  } = useDrinks(1, 10);

  // Trigger error modal on empty search results
  useEffect(() => {
    if (showEmptyModal) {
      showError(t('drinks.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Modal and drawer control states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<DrinkItem | null>(null);
  const [selectedEditRecord, setSelectedEditRecord] = useState<DrinkItem | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  // Open detail drawer and fetch variants
  const onCardClick = async (g: DrinkItem) => {
    setSelected(g);
    setSelectedVariantIndex(0);
    setDrawerOpen(true);
    setDetailLoading(true);

    try {
      const res = await getDrinkDetailApi(g.drinkId);
      if (res?.item) {
        setSelected(res.item);
      }
    } catch (err) {
      console.error('Failed to fetch drink detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Trigger edit modal opening
  const handleOpenEdit = (record: DrinkItem) => {
    setSelectedEditRecord(record);
    setEditOpen(true);
  };

  // Confirm soft deletion
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

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('drinks.title')}
      </Typography.Title>

      {/* Action Bar: Search input, Branch filter for OWNER, and Create button */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={(val) => handleSearch(val)}
            loading={searchLoading}
            placeholder={t('drinks.searchPlaceholder')}
          />
        </div>

        {/* Branch Shop Select Filter (OWNER role only) */}
        {isOwner && (
          <Select
            allowClear
            placeholder={t('staffs.filterShop')}
            options={shopOptions}
            loading={optionsLoading}
            value={currentBranchShopId || undefined}
            onChange={(val) => handleShopFilter(val ?? '')}
            className="w-52"
          />
        )}

        {/* Create Drink Button (hidden for STAFF) */}
        {!isStaff && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('form.create')}
          </Button>
        )}
      </div>

      {/* Grid container with drinks list */}
      <div className="w-full border border-gray-200 rounded-lg p-3 h-[calc(100vh-295px)] min-h-[460px] overflow-y-auto bg-gray-50/30 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <Spin tip={t('common.loading')} />
          </div>
        )}
        {items.length === 0 && !loading ? (
          <div className="py-16 flex justify-center items-center w-full min-h-[400px]">
            <Empty description={t('drinks.empty')} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 items-stretch justify-start pt-1 px-1 pb-3 w-full">
            {items.map((g) => (
              <DrinkCardGrouped
                key={g.drinkId}
                record={g}
                onClick={() => onCardClick(g)}
                onDelete={handleDeleteDrink}
                onEdit={handleOpenEdit}
                isStaff={isStaff}
              />
            ))}
          </div>
        )}
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

      {/* Drink Details Drawer */}
      <DrinkDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selected={selected}
        detailLoading={detailLoading}
        selectedVariantIndex={selectedVariantIndex}
        onSelectedVariantIndexChange={setSelectedVariantIndex}
      />

      {/* Create Drink Modal */}
      <DrinkCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createDrink}
        loading={createLoading}
        categoryOptions={categoryOptions}
      />

      {/* Edit Drink Modal */}
      <DrinkEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        record={selectedEditRecord}
        onSubmit={editDrink}
        loading={editLoading}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
