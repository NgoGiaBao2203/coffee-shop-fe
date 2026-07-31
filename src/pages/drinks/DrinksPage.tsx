import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
  Row,
  Col,
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
import type { DrinkItem, EditDrinkRequest, CategoryOption } from './types';
import { DrinkCardGrouped, type GroupedDrink } from './components/DrinkCardGrouped';
import { DrinkCreateModal } from './components/DrinkCreateModal';
import { DrinkEditModal } from './components/DrinkEditModal';

// Group drink size variants into a single object
function groupDrinks(items: DrinkItem[]): GroupedDrink[] {
  const map = new Map<string, GroupedDrink>();
  for (const it of items) {
    const key = it.drinkName || it.drinkId;
    const existing = map.get(key);
    const variant = { drinkId: it.drinkId, size: it.size, price: it.price };
    if (existing) {
      existing.variants.push(variant);
    } else {
      map.set(key, {
        drinkName: it.drinkName,
        imageUrl: it.imageUrl,
        drinkCategoryId: it.drinkCategoryId,
        id: it.drinkId,
        status: it.status,
        isDeleted: it.isDeleted,
        variants: [variant],
      } as unknown as GroupedDrink);
    }
  }
  return Array.from(map.values());
}

export function DrinksPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();

  // Check role permission (STAFF role cannot edit or delete)
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isStaff = roleName === ROLES.STAFF;

  // Custom hook for managing drinks state and API calls
  const {
    items,
    totalElements,
    loading,
    searchLoading,
    createLoading,
    editLoading,
    currentPage,
    currentPageSize,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handlePageChange,
    createDrink,
    editDrink,
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

  // Group drinks list whenever raw items change
  const grouped = useMemo(() => groupDrinks(items ?? []), [items]);

  // Leave categoryOptions empty for now until backend Category API is integrated
  const categoryOptions: CategoryOption[] = useMemo(() => {
    return [];
  }, []);

  // UI state management
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<GroupedDrink | null>(null);
  const [editingRecord, setEditingRecord] = useState<GroupedDrink | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const fallbackImage = 'https://placehold.co/600x400?text=No+Image';

  // Open detail drawer and select first variant
  const onCardClick = (g: GroupedDrink) => {
    setSelected(g);
    if (g.variants && g.variants.length > 0) {
      setSelectedVariantId(g.variants[0]?.drinkId ?? null);
    } else {
      setSelectedVariantId(null);
    }
    setDrawerOpen(true);
  };

  // Open edit modal for selected drink
  const handleOpenEdit = (g: GroupedDrink) => {
    setEditingRecord(g);
    setEditOpen(true);
  };

  // Submit edit request to API
  const handleEditSubmit = async (values: EditDrinkRequest) => {
    await editDrink(values);
    setEditOpen(false);
    setEditingRecord(null);
  };

  // Open delete confirmation modal
  const handleDeleteDrink = (g: GroupedDrink) => {
    const targetId = g.id || g.variants[0]?.drinkId;
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

  // Get price for selected size variant
  const priceForSelected = () => {
    if (!selected || !selectedVariantId) return '—';
    const v = selected.variants.find((x) => x.drinkId === selectedVariantId);
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
            placeholder={t('drinks.searchPlaceholder') || 'Tìm kiếm đồ uống...'}
          />
        </div>

        {/* Create button (Hidden for STAFF role) */}
        {!isStaff && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('form.create') || 'Tạo mới'}
          </Button>
        )}
      </div>

      {/* Drink Cards Grid */}
      <Spin spinning={loading} description={t('common.loading')}>
        {grouped.length === 0 && !loading ? (
          <div className="py-8">
            <Empty description={t('drinks.empty') || 'Không có dữ liệu đồ uống'} />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {grouped.map((g) => (
              <Col key={g.id ?? g.drinkName} xs={24} sm={12} md={8} lg={6}>
                <DrinkCardGrouped
                  record={g}
                  onClick={() => onCardClick(g)}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteDrink}
                  isStaff={isStaff}
                />
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* Pagination Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 24,
          position: 'relative',
          width: '100%',
        }}
      >
        <div style={{ flex: 1 }} />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={currentPageSize}
            total={totalElements}
            onChange={(p, ps) => handlePageChange(p, ps)}
            showSizeChanger={false}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Select
            value={currentPageSize}
            onChange={(val) => handlePageChange(1, Number(val))}
            options={[
              { value: 10, label: `10 / ${t('table.perPage') || 'trang'}` },
              { value: 15, label: `15 / ${t('table.perPage') || 'trang'}` },
              { value: 20, label: `20 / ${t('table.perPage') || 'trang'}` },
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
            <div className="w-full h-64 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
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

            <div className="flex items-center gap-2 flex-wrap">
              <Typography.Title level={4} className="mb-0!">
                {selected.drinkName}
              </Typography.Title>
              {selected?.variants?.length && (
                <Tag color="green">{selected.variants.length} size</Tag>
              )}
            </div>

            <div>
              <Typography.Text strong>{t('drinks.chooseSize') || 'Chọn kích cỡ'}</Typography.Text>
              <div className="mt-2 w-full overflow-x-auto">
                <Radio.Group
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  buttonStyle="solid"
                  className="flex flex-wrap gap-2"
                >
                  {selected.variants.map((v) => (
                    <Radio.Button key={v.drinkId} value={v.drinkId}>
                      {v.size.trim()} - {v.price}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-500">{t('drinks.price') || 'Giá'}</div>
                <div className="text-xl font-bold text-green-600">{priceForSelected()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{t('drinks.status') || 'Trạng thái'}</div>
                <Tag
                  color={selected.status === t('drinks.statusActive') ? 'green' : 'default'}
                  className="mt-1 mr-0"
                >
                  {selected.status ?? '—'}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Modal */}
      <DrinkCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createDrink}
        loading={createLoading}
        categoryOptions={categoryOptions}
      />

      {/* Edit Modal */}
      <DrinkEditModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleEditSubmit}
        loading={editLoading}
        record={editingRecord}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
