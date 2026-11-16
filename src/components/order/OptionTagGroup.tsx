import type { ReactNode } from 'react';
import { Tag } from 'antd';

interface OptionTagGroupOption {
  value: string;
  label: ReactNode;
}

interface Props {
  readonly options: OptionTagGroupOption[];
  readonly value?: string | null;
  // Called with null when the selected tag is clicked again
  readonly onChange: (value: string | null) => void;
  // chip: rounded pill in a scrolling row (categories); tile: box in a grid (tables)
  readonly variant: 'chip' | 'tile';
  // Layout of the group (flex row, grid...)
  readonly className?: string;
}

// antd checkable tags have no border and a transparent background, so the unselected / selected
// look is set here once for every tag group of the order form
const ITEM_BASE =
  'm-0! flex! items-center! justify-center! text-center! border! text-sm! font-medium transition-colors ' +
  '[&:not(.ant-tag-checkable-checked)]:border-gray-300! [&:not(.ant-tag-checkable-checked)]:bg-white! ' +
  '[&:not(.ant-tag-checkable-checked)]:text-gray-700! ' +
  '[&:not(.ant-tag-checkable-checked):hover]:border-emerald-400! ' +
  '[&:not(.ant-tag-checkable-checked):hover]:text-emerald-600! ' +
  '[&.ant-tag-checkable-checked]:border-emerald-500! [&.ant-tag-checkable-checked]:bg-emerald-500! ' +
  '[&.ant-tag-checkable-checked]:text-white!';

const ITEM_VARIANT = {
  chip: 'h-8 shrink-0 rounded-full! px-3!',
  tile: 'h-9 rounded-md! px-1!',
};

// Single-select group of tags (category chips, table picker) built on antd Tag.CheckableTagGroup
export function OptionTagGroup({ options, value, onChange, variant, className }: Props) {
  return (
    <Tag.CheckableTagGroup
      value={value ?? null}
      onChange={onChange}
      options={options}
      classNames={{ root: className, item: `${ITEM_BASE} ${ITEM_VARIANT[variant]}` }}
    />
  );
}
