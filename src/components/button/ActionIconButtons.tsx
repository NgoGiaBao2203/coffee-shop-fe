import type { ComponentType, CSSProperties, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';

interface ActionIconButtonProps {
  readonly onClick: (event: MouseEvent<HTMLElement>) => void;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly size?: ButtonProps['size'];
  readonly shape?: ButtonProps['shape'];
  // Per-screen look (background, hover, opacity...)
  readonly className?: string;
  readonly iconClassName?: string;
  readonly iconSize?: number;
}

interface IconConfig {
  readonly Icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  readonly labelKey: string;
  readonly danger?: boolean;
}

// Shared text-style icon button; edit/delete only differ by icon, label and danger color.
// Exported for row actions without a preset below (e.g. pay / cancel / print an invoice)
export function ActionIconButton({
  Icon,
  labelKey,
  danger,
  size = 'small',
  shape = 'circle',
  iconClassName,
  iconSize,
  ...props
}: ActionIconButtonProps & IconConfig) {
  const { t } = useTranslation();

  return (
    <Button
      danger={danger}
      type="text"
      size={size}
      shape={shape}
      aria-label={t(labelKey)}
      icon={<Icon className={iconClassName} style={{ fontSize: iconSize }} />}
      {...props}
    />
  );
}

// "Edit" icon button for table rows, cards and lists
export function EditIconButton(props: ActionIconButtonProps) {
  return <ActionIconButton Icon={EditOutlined} labelKey="form.edit" {...props} />;
}

// Danger "Delete" icon button for table rows, cards and lists
export function DeleteIconButton(props: ActionIconButtonProps) {
  return <ActionIconButton Icon={DeleteOutlined} labelKey="form.delete" danger {...props} />;
}
