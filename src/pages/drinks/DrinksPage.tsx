import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import { Pagination, Empty, Spin, Button, Typography, Select } from 'antd';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { useDrinks } from './hooks/useDrinks';
import { useDrinkDetails } from './hooks/useDrinkDetails';
import { getDrinkDetailApi } from './api/drinksAPI';
import { DRINK_SIZES, isDrinkActive, type DrinkSize } from './constants';
import type { DrinkItem, DrinkVariantItem } from './types';
import { DrinkCardGrouped } from './components/DrinkCardGrouped';
import { DrinkCreateModal } from './components/DrinkCreateModal';
import { DrinkEditModal } from './components/DrinkEditModal';
import { DrinkDetailDrawer } from './components/DrinkDetailDrawer';
import { DrinkDetailFormModal } from './components/DrinkDetailFormModal';

const SEARCH_REGEX = /^[\p{L}\p{N}\s\-&/(),.']*$/u;

interface DrinkDetailFormSubmitValues {
  size: DrinkSize;
  price: number;
}

export function DrinksPage() {
  const { t } = useTranslation();

  const { showError } = useNotifyModal();
  const { confirm: confirmDelete } = useConfirmModal();

  // Role authorization checks
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);

  const isStaff = roleName === ROLES.STAFF;
  const isOwner = roleName === ROLES.OWNER;

  // Custom hook retrieving drink data, options, and CRUD actions
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
    refresh,
  } = useDrinks(1, 10);

  // Custom hook managing drink detail CRUD actions
  const {
    createDetailLoading,
    editDetailLoading,
    deleteDetailLoading,
    createDrinkDetail,
    editDrinkDetail,
    deleteDrinkDetail,
  } = useDrinkDetails();

  // Show error modal when search returns no result
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
  const [createDetailOpen, setCreateDetailOpen] = useState(false);
  const [editDetailOpen, setEditDetailOpen] = useState(false);

  // Selected drink and drink detail states
  const [selected, setSelected] = useState<DrinkItem | null>(null);
  const [selectedEditRecord, setSelectedEditRecord] = useState<DrinkItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DrinkVariantItem | null>(null);

  const canManageDetails = !isStaff && isDrinkActive(selected?.status) && !detailLoading;

  // Get sizes that are not currently used by the selected drink
  const availableDetailSizes = useMemo(() => {
    const existingSizes = new Set(
      (selected?.variants ?? []).map((variant) => variant.size.trim().toUpperCase()),
    );

    return DRINK_SIZES.filter((size) => !existingSizes.has(size));
  }, [selected?.variants]);

  // Validate search keyword before sending request
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

  // Open drink detail drawer and fetch latest drink data
  const onCardClick = async (drink: DrinkItem) => {
    setSelected(drink);
    setDrawerOpen(true);
    setDetailLoading(true);

    try {
      const response = await getDrinkDetailApi(drink.drinkId);

      if (response?.item) {
        setSelected(response.item);
      }
    } catch (error) {
      console.error('Failed to fetch drink detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Refresh selected drink detail and drink list after detail CRUD
  const refreshSelectedDrink = async (drinkId: string) => {
    setDetailLoading(true);

    try {
      const [detailResponse] = await Promise.all([getDrinkDetailApi(drinkId), refresh()]);

      if (detailResponse.item) {
        setSelected(detailResponse.item);
      }
    } catch (error) {
      console.error('Failed to refresh drink detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open drink edit modal
  const handleOpenEdit = (record: DrinkItem) => {
    setSelectedEditRecord(record);
    setEditOpen(true);
  };

  // Confirm drink soft deletion
  const handleDeleteDrink = (drink: DrinkItem) => {
    const targetId = drink.drinkId;

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

  // Open create detail modal when another size is available
  const handleOpenCreateDetail = () => {
    if (!canManageDetails || availableDetailSizes.length === 0) {
      return;
    }

    setCreateDetailOpen(true);
  };

  // Open edit modal for selected drink detail
  const handleOpenEditDetail = (record: DrinkVariantItem) => {
    if (!canManageDetails) return;

    setSelectedDetail(record);
    setEditDetailOpen(true);
  };

  // Create a new size and price variant for selected drink
  const handleCreateDetail = async (values: DrinkDetailFormSubmitValues) => {
    if (!canManageDetails) {
      throw new Error(t('drinkDetails.inactiveNotice'));
    }

    if (!selected?.drinkId) {
      return;
    }

    await createDrinkDetail({
      drinkId: selected.drinkId,
      size: values.size,
      price: values.price,
    });

    await refreshSelectedDrink(selected.drinkId);
  };

  // Update selected drink detail
  const handleEditDetail = async (values: DrinkDetailFormSubmitValues) => {
    if (!canManageDetails) {
      throw new Error(t('drinkDetails.inactiveNotice'));
    }

    if (!selected?.drinkId || !selectedDetail?.drinkDetailId) {
      return;
    }

    await editDrinkDetail({
      drinkDetailId: selectedDetail.drinkDetailId,
      size: values.size,
      price: values.price,
    });

    await refreshSelectedDrink(selected.drinkId);
  };

  // Confirm drink detail deletion
  const handleDeleteDetail = (record: DrinkVariantItem) => {
    if (!selected?.drinkId || !record.drinkDetailId) {
      return;
    }

    const drinkId = selected.drinkId;

    confirmDelete({
      title: t('drinkDetails.deleteConfirmTitle'),
      content: t('drinkDetails.deleteConfirmDesc', {
        size: record.size,
      }),
      okText: t('form.delete'),
      cancelText: t('form.cancel'),
      okDanger: true,
      onConfirm: async () => {
        await deleteDrinkDetail({
          drinkDetailId: record.drinkDetailId,
        });

        await refreshSelectedDrink(drinkId);
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
      {/* Page title */}
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
            onChange={(value) => handleShopFilter(value ?? '')}
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
      <div className="relative min-h-0 w-full flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/30 p-2 sm:p-3">
        {/* Loading overlay while fetching or deleting drinks */}
        {(loading || deleteLoading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <Spin description={t('common.loading')} />
          </div>
        )}

        {/* Empty state or drink card grid */}
        {items.length === 0 && !loading ? (
          <div className="flex min-h-[400px] w-full items-center justify-center py-16">
            <Empty description={t('drinks.empty')} />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 items-stretch justify-start gap-3 px-1 pt-1 pb-3 min-[380px]:grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {items.map((drink) => (
              <DrinkCardGrouped
                key={drink.drinkId}
                record={drink}
                onClick={() => onCardClick(drink)}
                onDelete={handleDeleteDrink}
                onEdit={handleOpenEdit}
                isStaff={isStaff}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-2 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="hidden sm:block sm:w-[120px]" />

        <div className="flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={currentPageSize}
            total={totalElements}
            onChange={(page, pageSize) => handlePageChange(page, pageSize)}
            showSizeChanger={false}
          />
        </div>

        {/* Page size selection */}
        <div className="flex w-full justify-end sm:w-[120px]">
          <Select
            value={currentPageSize}
            onChange={(value) => handlePageChange(1, Number(value))}
            options={[
              {
                value: 10,
                label: `10 / ${t('table.perPage')}`,
              },
              {
                value: 15,
                label: `15 / ${t('table.perPage')}`,
              },
              {
                value: 20,
                label: `20 / ${t('table.perPage')}`,
              },
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
        detailLoading={detailLoading || deleteDetailLoading}
        isStaff={isStaff}
        onAdd={handleOpenCreateDetail}
        onEdit={handleOpenEditDetail}
        onDelete={handleDeleteDetail}
      />

      {/* Create Drink Detail Modal */}
      <DrinkDetailFormModal
        open={createDetailOpen}
        mode="create"
        availableSizes={availableDetailSizes}
        loading={createDetailLoading}
        onClose={() => setCreateDetailOpen(false)}
        onSubmit={handleCreateDetail}
      />

      {/* Edit Drink Detail Modal */}
      <DrinkDetailFormModal
        open={editDetailOpen}
        mode="edit"
        record={selectedDetail}
        availableSizes={DRINK_SIZES}
        loading={editDetailLoading}
        onClose={() => {
          setEditDetailOpen(false);
          setSelectedDetail(null);
        }}
        onSubmit={handleEditDetail}
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
