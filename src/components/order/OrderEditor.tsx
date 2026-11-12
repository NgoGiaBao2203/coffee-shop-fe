import type { OrderEditorState } from '@/hooks/useOrderEditor';
import { DrinkMenu } from './DrinkMenu';
import { OrderCart } from './OrderCart';

interface Props {
  readonly editor: OrderEditorState;
}

// Two-column order form: menu on the left, table + cart + total on the right.
// On md+ the columns take the remaining height of the parent; every list also has a max height
// and scrolls inside, so many drinks / cart lines / tables never stretch the page or the modal.
export function OrderEditor({ editor }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:min-h-0 md:flex-1 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)]">
      <DrinkMenu editor={editor} />
      <OrderCart editor={editor} />
    </div>
  );
}
