import { useEffect, useMemo, useRef } from 'react';
import { Form, Input, Upload, type UploadFile } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';
import type { DrinkItem, EditDrinkRequest, CategorySelectOption } from '../types';
import { resolveImageUrl } from '@/utils/image';
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
  readonly open: boolean;
  readonly onClose: () => void;
  readonly record: DrinkItem | null;
  readonly onSubmit: (values: EditDrinkRequest, imageFile?: File) => Promise<void>;
  readonly loading: boolean;
  readonly categoryOptions?: CategorySelectOption[];
}

// Supported active status values from different API formats
const ACTIVE_STATUSES = new Set<unknown>([1, '1', 'ACTIVE', 'Active', 'Đang bán']);

// Supported inactive status values from different API formats
const INACTIVE_STATUSES = new Set<unknown>([0, '0', 'INACTIVE', 'Inactive', 'Ngừng bán']);

// Convert drink status to form value
const parseStatus = (status: unknown): number => {
  if (ACTIVE_STATUSES.has(status)) {
    return 1;
  }

  if (INACTIVE_STATUSES.has(status)) {
    return 0;
  }

  return 1;
};

// Normalize upload value for Ant Design Form
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

  // Track modal opening to prevent resetting form multiple times
  const isOpenedRef = useRef(false);

  // Filter categories by the drink shop
  const filteredCategoryOptions = useMemo(
    () =>
      record?.shopId
        ? categoryOptions.filter((category) => category.shopId === record.shopId)
        : categoryOptions,
    [categoryOptions, record],
  );

  // Load current drink data when opening the edit modal
  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }

    if (isOpenedRef.current || !record) {
      return;
    }

    isOpenedRef.current = true;
    form.resetFields();

    // Build initial upload file from current drink image
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

    // Set current drink values into the form
    form.setFieldsValue({
      drinkId: record.drinkId,
      drinkName: record.drinkName,
      drinkCategoryId: record.drinkCategoryId,
      status: parseStatus(record.status),
      fileList: initialFiles,
    });
  }, [open, record, form]);

  // Reset form data when closing the modal
  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  // Build edit drink request and submit form
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
      // Show drink name conflict error on the form
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
      {/* Drink name */}
      <DrinkNameField />

      {/* Drink category */}
      <DrinkCategoryField options={filteredCategoryOptions} />

      {/* Drink image upload */}
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

      {/* Drink selling status */}
      <DrinkStatusField required={false} />

      {/* Hidden drink ID used for update request */}
      <Form.Item name="drinkId" hidden>
        <Input />
      </Form.Item>
    </DrinkFormModal>
  );
}
