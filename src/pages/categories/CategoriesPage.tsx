import { useEffect, useState } from 'react';
import { Typography, Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { CategoryCreateModal } from './components/CategoryCreateModal';
import { CategoryEditModal } from './components/CategoryEditModal';
import { useCategories } from './hooks/useCategories';
import type { CategoryItem } from './types';

export function CategoriesPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isStaff = roleName === ROLES.STAFF;
  const isOwner = roleName === ROLES.OWNER;

  const {
    items,
    pagination,
    currentPage,
    currentPageSize,
    loading,
    searchLoading,
    searchKeyword,
    currentBranchShopId,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handleShopFilter,
    handlePageChange,
    createCategory,
    createLoading,
    editCategory,
    editLoading,
    deleteCategory,
    deleteLoading,
    shopOptions,
    optionsLoading,
  } = useCategories();

  const { confirm: confirmDelete } = useConfirmModal();

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CategoryItem | null>(null);

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('categories.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: AppColumnType<CategoryItem>[] = [
    {
      key: 'categoryName',
      dataIndex: 'categoryName',
      title: t('categories.name'),
      width: 260,
    },
    {
      key: 'shopId',
      dataIndex: 'shopId',
      title: t('staffs.shopName'),
      render: (shopId: string) => shopOptions.find((s) => s.value === shopId)?.label ?? shopId,
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('categories.title')}
      </Typography.Title>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={handleSearch}
            loading={searchLoading}
            placeholder={t('categories.searchPlaceholder')}
          />
        </div>
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
        {!isStaff && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('form.create')}
          </Button>
        )}
      </div>

      <TableGrid<CategoryItem>
        rowKey="categoryId"
        columns={columns}
        dataSource={items}
        loading={loading || deleteLoading}
        emptyText={searchKeyword.trim() ? t('table.emptySearch') : t('table.emptyData')}
        total={pagination?.totalElements}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        onPageChange={handlePageChange}
        {...(!isStaff && {
          onEdit: (record) => {
            setSelectedRecord(record);
            setEditOpen(true);
          },
          onDeleteClick: (record) => {
            confirmDelete({
              title: t('table.deleteConfirmTitle'),
              content: t('table.deleteConfirmDesc'),
              okText: t('table.deleteOk'),
              cancelText: t('table.deleteCancel'),
              okDanger: true,
              onConfirm: () => deleteCategory(record.categoryId),
            });
          },
        })}
      />

      <CategoryEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        record={selectedRecord}
        onSubmit={(values) => editCategory(selectedRecord!.categoryId, values)}
        loading={editLoading}
      />

      <CategoryCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createCategory}
        loading={createLoading}
        shopOptions={shopOptions}
        optionsLoading={optionsLoading}
      />
    </div>
  );
}
