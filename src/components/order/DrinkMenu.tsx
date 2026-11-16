import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Spin, Typography } from 'antd';
import { SearchInput } from '@/components/search/SearchInput';
import type { DrinkItem } from '@/pages/drinks/types';
import type { OrderEditorState } from '@/hooks/useOrderEditor';
import { formatPrice } from '@/utils/formatPrice';
import { resolveImageUrl } from '@/utils/image';
import { OptionTagGroup } from './OptionTagGroup';

interface Props {
  readonly editor: OrderEditorState;
}

const FALLBACK_DRINK_IMAGE = 'https://placehold.co/120x120?text=Drink';

// Value of the "All" category chip
const ALL_CATEGORIES = '';

// Menu: backend search, category chips and a grid of drink cards (tap a card to choose its size)
export function DrinkMenu({ editor }: Props) {
  const { t } = useTranslation();
  const {
    drinks,
    variantsByDrink,
    variantLoadingIds,
    loading,
    drinkSearch,
    searchLoading,
    loadVariants,
    handleDrinkSearch,
    handleAddItem,
  } = editor;

  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [activeDrinkId, setActiveDrinkId] = useState<string | undefined>();

  // Category chips built from the loaded drinks
  const categories = useMemo(() => {
    const map = new Map<string, string>();

    drinks.forEach((drink) => {
      if (drink.drinkCategoryId) {
        map.set(drink.drinkCategoryId, drink.categoryName ?? drink.drinkCategoryId);
      }
    });

    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [drinks]);

  // A category missing from the search results falls back to "All"
  const activeCategoryId = categories.some(({ value }) => value === categoryId)
    ? categoryId
    : undefined;

  const visibleDrinks = useMemo(
    () =>
      activeCategoryId
        ? drinks.filter((drink) => drink.drinkCategoryId === activeCategoryId)
        : drinks,
    [drinks, activeCategoryId],
  );

  const isMenuLoading = loading || searchLoading;

  // A drink with one size is added right away, otherwise its sizes show on the card
  const handleSelectDrink = async (drink: DrinkItem) => {
    setActiveDrinkId(drink.drinkId);

    const variants = await loadVariants(drink.drinkId);

    if (variants.length === 1) handleAddItem(drink, variants[0]);
  };

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <Typography.Text strong>{t('order.menu')}</Typography.Text>
      <SearchInput
        size="middle"
        onSearch={(value) => void handleDrinkSearch(value)}
        loading={searchLoading}
        placeholder={t('order.searchPlaceholder')}
      />

      <OptionTagGroup
        variant="chip"
        value={activeCategoryId ?? ALL_CATEGORIES}
        onChange={(value) => setCategoryId(value || undefined)}
        options={[{ value: ALL_CATEGORIES, label: t('order.allCategories') }, ...categories]}
        className="flex-nowrap! shrink-0 overflow-x-auto pb-1"
      />

      <div className="max-h-[55dvh] min-h-[160px] overflow-y-auto pr-1 md:min-h-0 md:flex-1">
        {isMenuLoading && (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        )}
        {!isMenuLoading && visibleDrinks.length === 0 && (
          <Empty description={t(drinkSearch ? 'order.menuEmptySearch' : 'order.menuEmpty')} />
        )}
        {!isMenuLoading && visibleDrinks.length > 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            {visibleDrinks.map((drink) => {
              const variants = variantsByDrink[drink.drinkId];
              const isActive = activeDrinkId === drink.drinkId;
              const isLoadingVariants = variantLoadingIds.includes(drink.drinkId);

              return (
                <div
                  key={drink.drinkId}
                  className={`flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow ${
                    isActive ? 'border-emerald-500 shadow-md' : 'border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void handleSelectDrink(drink)}
                    className="flex cursor-pointer items-center gap-2 p-2 text-left"
                  >
                    <img
                      src={resolveImageUrl(drink.imageUrl) || FALLBACK_DRINK_IMAGE}
                      alt={drink.drinkName}
                      className="aspect-square size-14 shrink-0 rounded-md object-cover"
                    />
                    <span className="line-clamp-2 text-sm font-medium">{drink.drinkName}</span>
                  </button>

                  {isActive && (
                    <div className="flex gap-1.5 border-t border-gray-100 p-2">
                      {isLoadingVariants && <Spin size="small" />}
                      {variants?.length === 0 && (
                        <Typography.Text type="secondary">{t('order.noSize')}</Typography.Text>
                      )}
                      {variants?.map((variant) => (
                        <Button
                          key={variant.drinkDetailId}
                          onClick={() => handleAddItem(drink, variant)}
                          className="h-auto! min-w-0 flex-1 basis-0 flex-col gap-0! px-1! py-1!"
                        >
                          <span className="text-sm font-semibold">{variant.size}</span>
                          <span className="w-full truncate text-xs">
                            {formatPrice(variant.price)}
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
