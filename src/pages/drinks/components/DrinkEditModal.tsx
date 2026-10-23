import { useEffect, useMemo, useRef } from 'react';
import { Form, Input, Upload, type UploadFile } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';
import type { DrinkItem, EditDrinkRequest, CategorySelectOption } from '../types';
import { resolveImageUrl } from '@/utils/image';
import { formatPrice } from '@/utils/formatPrice';
import { DrinkFormModal } from './DrinkFormModal';
import {
  DrinkCategoryField,
  DrinkNameField,
  DrinkStatusField,
  DrinkUploadAction,
} from './DrinkFormFields';
import { setDrinkNameConflictError } from '../utils/utils';

interface DrinkEditFormValues {
  drinkId: string;
  drinkName: string;
  drinkCategoryId: string;
  status: number;
  fileList?: UploadFile[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  record: DrinkItem | null;
  onSubmit: (values: EditDrinkRequest, imageFile?: File) => Promise<void>;
  loading: boolean;
  categoryOptions?: CategorySelectOption[];
}

const ACTIVE_STATUSES = new Set<unknown>([1, '1', 'ACTIVE', 'Active', 'Đang bán']);
const INACTIVE_STATUSES = new Set<unknown>([0, '0', 'INACTIVE', 'Inactive', 'Ngừng bán']);

const parseStatus = (status: unknown): number => {
  if (ACTIVE_STATUSES.has(status)) return 1;
  if (INACTIVE_STATUSES.has(status)) return 0;
  return 1;
};

const normalizeFileList = (event: UploadChangeParam | UploadFile[]) =>
  Array.isArray(event) ? event : event.fileList;

export function DrinkEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading,
  categoryOptions = [],
}: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm<DrinkEditFormValues>();
  const isOpenedRef = useRef(false);

  const filteredCategoryOptions = useMemo(
    () =>
      record?.shopId
        ? categoryOptions.filter((category) => category.shopId === record.shopId)
        : categoryOptions,
    [categoryOptions, record],
  );

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }
    if (isOpenedRef.current || !record) return;

    isOpenedRef.current = true;
    form.resetFields();
    const initialFiles: UploadFile[] = record.imageUrl
      ? [
          {
            uid: '-1',
            name: 'current_image.png',
            status: 'done',
            url: resolveImageUrl(record.imageUrl),
          },
        ]
      : [];

    form.setFieldsValue({
      drinkId: record.drinkId,
      drinkName: record.drinkName,
      drinkCategoryId: record.drinkCategoryId,
      status: parseStatus(record.status),
      fileList: initialFiles,
    });
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: DrinkEditFormValues) => {
    try {
      const file = values.fileList?.[0];
      await onSubmit(
        {
          drinkId: record?.drinkId || values.drinkId || '',
          drinkName: values.drinkName,
          drinkCategoryId: values.drinkCategoryId,
          imageUrl: record?.imageUrl ?? undefined,
          status: Number(values.status ?? 1),
        },
        file?.originFileObj as File | undefined,
      );
      handleClose();
    } catch (error: unknown) {
      setDrinkNameConflictError(error, form, t('drinks.nameConflict'));
    }
  };

  return (
    <DrinkFormModal<DrinkEditFormValues>
      open={open}
      onClose={handleClose}
      form={form}
      onFinish={handleSubmit}
      loading={loading}
      title={t('form.titleEdit')}
      submitLabel={t('form.save')}
      destroyOnHidden
    >
      <DrinkNameField />
      <DrinkCategoryField options={filteredCategoryOptions} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Form.Item label={t('drinks.price')}>
          <Input value={formatPrice(record?.variants?.[0]?.price)} readOnly />
        </Form.Item>
        <Form.Item label={t('drinks.size')}>
          <Input value={record?.variants?.[0]?.size ?? '—'} disabled />
        </Form.Item>
      </div>

      <Form.Item
        noStyle
        shouldUpdate={(previous, current) => previous.fileList !== current.fileList}
      >
        {({ getFieldValue }) => (
          <Form.Item
            name="fileList"
            label={t('drinks.image')}
            valuePropName="fileList"
            getValueFromEvent={normalizeFileList}
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              {(getFieldValue('fileList')?.length ?? 0) < 1 && <DrinkUploadAction />}
            </Upload>
          </Form.Item>
        )}
      </Form.Item>

      <DrinkStatusField required={false} />
      <Form.Item name="drinkId" hidden>
        <Input />
      </Form.Item>
    </DrinkFormModal>
  );
}
