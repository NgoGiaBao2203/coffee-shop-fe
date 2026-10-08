import { Drawer, Button, Descriptions } from 'antd';
import type { Rule } from 'antd/lib/form';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

export type FormFieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'password';

export interface FormFieldOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  /** Field key — must match the record property name */
  name: string;
  label: string;
  type?: FormFieldType;
  options?: FormFieldOption[];
  rules?: Rule[];
  /** Hidden in edit/create form (e.g. createdAt, id) */
  readOnly?: boolean;
  /** Custom display renderer in the detail drawer */
  render?: (value: unknown) => ReactNode;
}

export interface AppFormDrawerProps<T extends object> {
  open: boolean;
  onClose: () => void;
  record?: Partial<T> | null;
  fields: FormFieldConfig[];
  contentActions?: ReactNode;
  width?: number;
}

export function AppFormDrawer<T extends object>({
  open,
  onClose,
  record,
  fields,
  contentActions,
  width = 480,
}: AppFormDrawerProps<T>) {
  const { t } = useTranslation();
  const recordMap = record as Record<string, unknown> | null | undefined;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('form.titleView')}
      size={width}
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>{t('form.close')}</Button>
        </div>
      }
    >
      <Descriptions column={1} bordered size="small">
        {fields.map((field) => (
          <Descriptions.Item key={field.name} label={field.label}>
            {field.render
              ? field.render(recordMap?.[field.name])
              : ((recordMap?.[field.name] as ReactNode) ?? '—')}
          </Descriptions.Item>
        ))}
      </Descriptions>
      {contentActions}
    </Drawer>
  );
}
