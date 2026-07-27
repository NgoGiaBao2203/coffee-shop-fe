import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
} from 'antd';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useDrinks } from './hooks/useDrinks';
import type { DrinkItem } from './types';
import { DrinkCardGrouped, type GroupedDrink } from './components/DrinkCardGrouped';

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

  const {
    items,
    loading,
    searchLoading,
    currentPage,
    currentPageSize,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handlePageChange,
  } = useDrinks(1, 10);

  useEffect(() => {
    if (showEmptyModal) {
      showError(
        t('drinks.emptySearch') || 'Không tìm thấy đồ uống nào phù hợp với từ khóa tìm kiếm.',
        t('common.error') || 'Lỗi',
      );
      closeEmptyModal();
    }
  }, [showEmptyModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => groupDrinks(items ?? []), [items]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<GroupedDrink | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const fallbackImage = 'https://placehold.co/600x400?text=No+Image';

  const onCardClick = (g: GroupedDrink) => {
    setSelected(g);
    if (g.variants && g.variants.length > 0) {
      setSelectedVariantId(g.variants[0]?.drinkId ?? null);
    } else {
      setSelectedVariantId(null);
    }
    setDrawerOpen(true);
  };

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

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={(val) => handleSearch(val)}
            loading={searchLoading}
            placeholder={t('drinks.searchPlaceholder') || 'Search drink...'}
          />
        </div>
      </div>

      <Spin spinning={loading} description={t('common.loading')}>
        {grouped.length === 0 && !loading ? (
          <div className="py-8">
            <Empty description={t('drinks.empty') || 'not found any data drink'} />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {grouped.map((g) => (
              <Col key={g.id ?? g.drinkName} xs={24} sm={12} md={8} lg={6}>
                <DrinkCardGrouped record={g} onClick={() => onCardClick(g)} />
              </Col>
            ))}
          </Row>
        )}
      </Spin>

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
            total={grouped.length}
            onChange={(p, ps) => handlePageChange(p, ps)}
            showSizeChanger={false}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
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

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        style={{ width: 520 }}
        title={selected?.drinkName}
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <img
              src={selected.imageUrl || fallbackImage}
              alt="drink"
              style={{
                width: '100%',
                height: 320,
                objectFit: 'cover',
                borderRadius: 8,
              }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (el.src !== fallbackImage) {
                  el.src = fallbackImage;
                }
              }}
            />

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

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
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

            <div className="flex justify-end pt-2">
              <Button type="primary" onClick={() => setDrawerOpen(false)}>
                {t('form.close') || 'Đóng'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
