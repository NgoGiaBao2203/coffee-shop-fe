import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Empty, Input, InputNumber, Typography } from 'antd';
import type { OrderEditorState } from '@/hooks/useOrderEditor';
import { formatPrice } from '@/utils/formatPrice';
import { TablePicker } from './TablePicker';

// Quantity range of one line (items[].quantity in POST /invoice/create, PUT /invoice/edit)
const ORDER_MIN_QUANTITY = 1;
const ORDER_MAX_QUANTITY = 100;
// The quantity has at most 3 digits ("100")
const QUANTITY_MAX_DIGITS = 3;
// Keys still allowed in the quantity box besides digits
const QUANTITY_EDIT_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Enter',
  'Home',
  'End',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
]);

// Block letters and symbols in the quantity box (copy / paste shortcuts still work)
function blockNonDigitKey(event: KeyboardEvent<HTMLInputElement>) {
  const isShortcut = event.ctrlKey || event.metaKey;

  if (!isShortcut && !/^\d$/.test(event.key) && !QUANTITY_EDIT_KEYS.has(event.key)) {
    event.preventDefault();
  }
}

// Keep only the first 3 digits of a typed or pasted value (empty box = NaN, not 0)
function parseQuantity(text?: string): number {
  const digits = (text ?? '').replaceAll(/\D/g, '').slice(0, QUANTITY_MAX_DIGITS);

  return digits ? Number(digits) : Number.NaN;
}

interface Props {
  readonly editor: OrderEditorState;
}

// Order panel: table picker and cart lines (quantity stepper + note); the total is OrderTotal
export function OrderCart({ editor }: Props) {
  const { t } = useTranslation();
  const {
    tableOptions,
    cart,
    tableId,
    loading,
    itemErrors,
    setTableId,
    handleQuantityChange,
    handleNoteChange,
    handleRemoveItem,
  } = editor;

  return (
    // Left border separates the order panel from the menu on md+ (stacked on small screens)
    <div className="flex min-h-0 flex-col gap-2 border-t border-gray-200 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-4">
      <div className="flex items-center justify-between">
        <Typography.Text strong>{t('order.cart')}</Typography.Text>
        <Typography.Text type="secondary" className="text-xs">
          {t('order.tableAvailableCount', { count: tableOptions.length })}
        </Typography.Text>
      </div>
      <TablePicker options={tableOptions} value={tableId} loading={loading} onChange={setTableId} />

      <div className="flex max-h-[45dvh] min-h-[120px] flex-1 flex-col gap-1.5 overflow-y-auto pr-1 md:min-h-0">
        {cart.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('order.cartEmpty')} />
        ) : (
          cart.map((line) => {
            const error = itemErrors[line.drinkDetailId];

            return (
              <div
                key={line.drinkDetailId}
                className="flex shrink-0 flex-col gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5"
              >
                {/* One row: name + unit price, quantity stepper, line total, delete */}
                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <Typography.Text strong className="truncate">
                      {line.drinkName} ({line.size})
                    </Typography.Text>
                    <Typography.Text type="secondary" className="text-xs">
                      {formatPrice(line.unitPrice)}
                    </Typography.Text>
                  </div>
                  {/* antd spinner mode: built-in − / + buttons around the number */}
                  <InputNumber
                    mode="spinner"
                    size="small"
                    min={ORDER_MIN_QUANTITY}
                    max={ORDER_MAX_QUANTITY}
                    maxLength={QUANTITY_MAX_DIGITS}
                    precision={0}
                    value={line.quantity}
                    formatter={(val) =>
                      `${val ?? ''}`.replace(/\D/g, '').slice(0, QUANTITY_MAX_DIGITS)
                    }
                    parser={parseQuantity}
                    onKeyDown={blockNonDigitKey}
                    status={error ? 'error' : undefined}
                    onChange={(value) =>
                      handleQuantityChange(line.drinkDetailId, value ?? ORDER_MIN_QUANTITY)
                    }
                    // `!` beats antd's spinner `width: auto`; min-w-0 lets the inner <input> shrink;
                    // smaller − / + padding; 80px still shows "100" in full
                    className="w-20! shrink-0 [&_.ant-input-number-action]:px-1! [&_input]:min-w-0 [&_input]:px-0! [&_input]:text-center"
                  />
                  <Typography.Text
                    strong
                    className="shrink-0 whitespace-nowrap text-right sm:min-w-24"
                  >
                    {formatPrice(line.unitPrice * line.quantity)}
                  </Typography.Text>
                  <Button
                    danger
                    size="small"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(line.drinkDetailId)}
                    className="shrink-0"
                  />
                </div>

                {error && (
                  <Typography.Text type="danger" className="text-xs">
                    {error}
                  </Typography.Text>
                )}
                <Input
                  size="small"
                  maxLength={255}
                  value={line.note}
                  placeholder={t('order.notePlaceholder')}
                  onChange={(event) => handleNoteChange(line.drinkDetailId, event.target.value)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
