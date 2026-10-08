import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import { Pagination, Empty, Spin, Button, Typography, Select } from 'antd';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { useDrinks } from './hooks/useDrinks';
import { getDrinkDetailApi } from './api/drinksAPI';
import type { DrinkItem } from './types';
import { DrinkCardGrouped } from './components/DrinkCardGrouped';
import { DrinkCreateModal } from './components/DrinkCreateModal';
import { DrinkEditModal } from './components/DrinkEditModal';
import { DrinkDetailDrawer } from './components/DrinkDetailDrawer';

const SEARCH_REGEX = /^[\p{L}\p{N}\s\-&/(),.']*$/u;

export function DrinksPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();
  const { confirm: confirmDelete } = useConfirmModal();

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
    deleteLoading,
    showEmptyModal,
    closeEmptyModal,
    currentPage,
    currentPageSize,
    currentShopId,
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

  const handleDrinkSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue.length > 100) {
      showError(t('responses.EV005'), t('common.error'));
      return;
    }
    if (trimmedValue && !SEARCH_REGEX.test(trimmedValue)) {
      showError(t('responses.EV007'), t('common.error'));
      return;
    }
    handleSearch(value);
  };

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

    confirmDelete({
      title: t('table.deleteConfirmTitle'),
      content: t('table.deleteConfirmDesc'),
      okText: t('table.deleteOk'),
      cancelText: t('table.deleteCancel'),
      okDanger: true,
      onConfirm: () => deleteDrink(targetId),
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
      <Typography.Title level={4} className="mb-0!">
        {t('drinks.title')}
      </Typography.Title>

      {/* Action Bar: Search input, shop filter for OWNER, and create button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="w-full min-w-0 sm:flex-1">
          <SearchInput
            onSearch={handleDrinkSearch}
            loading={searchLoading}
            placeholder={t('drinks.searchPlaceholder')}
          />
        </div>

        {/* Shop Select Filter (OWNER role only) */}
        {isOwner && (
          <Select
            allowClear
            placeholder={t('staffs.filterShop')}
            options={shopOptions}
            loading={optionsLoading}
            value={currentShopId || undefined}
            onChange={(val) => handleShopFilter(val ?? '')}
            className="w-full sm:w-52"
          />
        )}

        {/* Create Drink Button (hidden for STAFF) */}
        {!isStaff && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            className="w-full sm:w-auto"
          >
            {t('form.create')}
          </Button>
        )}
      </div>

      {/* Grid container with drinks list */}
      <div className="relative h-[calc(100dvh-360px)] min-h-[320px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/30 p-2 sm:h-[calc(100vh-295px)] sm:min-h-[460px] sm:p-3">
        {(loading || deleteLoading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <Spin description={t('common.loading')} />
          </div>
        )}
        {items.length === 0 && !loading ? (
          <div className="py-16 flex justify-center items-center w-full min-h-[400px]">
            <Empty description={t('drinks.empty')} />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 items-stretch justify-start gap-3 px-1 pt-1 pb-3 min-[380px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
      <div className="mt-1 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 max-w-full overflow-x-auto sm:flex-1">
          <Pagination
            current={currentPage}
            pageSize={currentPageSize}
            total={totalElements}
            onChange={(p, ps) => handlePageChange(p, ps)}
            showSizeChanger={false}
            className="flex justify-center"
          />
        </div>

        <div className="flex justify-end sm:flex-1">
          <Select
            value={currentPageSize}
            onChange={(val) => handlePageChange(1, Number(val))}
            options={[
              { value: 10, label: `10 / ${t('table.perPage')}` },
              { value: 15, label: `15 / ${t('table.perPage')}` },
              { value: 20, label: `20 / ${t('table.perPage')}` },
            ]}
            className="w-full sm:w-[120px]"
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
