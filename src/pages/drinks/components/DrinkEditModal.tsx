import { useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Upload, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import { RESPONSE_CODE } from '@/constants/messages';
import type { DrinkItem, EditDrinkRequest, CategorySelectOption } from '../types';
import { resolveImageUrl } from '@/utils/image';
import { formatPrice } from '@/utils/formatPrice';

const DRINK_NAME_PATTERN = /^[\p{L}\p{N}\s&/(),.'-]+$/u;

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

// Helper to normalize status values to 1 or 0
const parseStatus = (status: unknown): number => {
  if (
    status === 1 ||
    status === '1' ||
    status === 'ACTIVE' ||
    status === 'Active' ||
    status === 'Đang bán'
  ) {
    return 1;
  }
  if (
    status === 0 ||
    status === '0' ||
    status === 'INACTIVE' ||
    status === 'Inactive' ||
    status === 'Ngừng bán'
  ) {
    return 0;
  }
  return 1;
};

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

  // Synchronize form fields only once when transitioning from closed -> open
  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }

    if (!isOpenedRef.current && record) {
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
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: DrinkEditFormValues) => {
    try {
      const file = values.fileList?.[0];
      const imageFile = file?.originFileObj as File | undefined;

      await onSubmit(
        {
          drinkId: record?.drinkId || values.drinkId || '',
          drinkName: values.drinkName,
          drinkCategoryId: values.drinkCategoryId,
          imageUrl: record?.imageUrl ?? undefined,
          status: Number(values.status ?? 1),
        },
        imageFile,
      );

      handleClose();
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) return;

      const response = error.response?.data;
      const errorDetails: { errorCode?: string }[] = Array.isArray(response?.errorDetails)
        ? response.errorDetails
        : [];
      const isNameConflict =
        response?.code === RESPONSE_CODE.CONFLICT ||
        response?.code === 'ER011' ||
        errorDetails.some(
          ({ errorCode }) => errorCode === RESPONSE_CODE.CONFLICT || errorCode === 'ER011',
        );

      if (isNameConflict) {
        form.setFields([{ name: 'drinkName', errors: [t('drinks.nameConflict')] }]);
      }
    }
  };

  // Normalize files array from AntD Upload event
  const normFile = (e: UploadChangeParam) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('form.titleEdit')}
      width="min(520px, calc(100vw - 24px))"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {t('form.save')}
          </Button>
        </div>
      }
      destroyOnHidden
    >
      <Divider className="my-3!" />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues) => {
          if ('drinkName' in changedValues) {
            form.setFields([{ name: 'drinkName', errors: [] }]);
          }
        }}
      >
        {/* Drink Name Field */}
        <Form.Item
          name="drinkName"
          label={t('drinks.name')}
          rules={[
            { required: true, whitespace: true, message: t('drinks.validation.nameRequired') },
            { max: 100, message: t('drinks.validation.nameMaxLength') },
            {
              pattern: DRINK_NAME_PATTERN,
              message: t('drinks.validation.nameInvalid'),
            },
          ]}
        >
          <Input placeholder={t('form.inputNamePlaceholder')} maxLength={100} />
        </Form.Item>

        {/* Category Selection */}
        <Form.Item
          name="drinkCategoryId"
          label={t('sidebar.categories')}
          rules={[{ required: true, message: t('drinks.validation.categoryRequired') }]}
        >
          <Select
            placeholder={t('form.selectCategoryPlaceholder')}
            options={categoryOptions}
            notFoundContent={categoryOptions.length === 0 ? t('drinks.noCategory') : undefined}
          />
        </Form.Item>

        {/* Variant editing is not supported by the backend yet. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Form.Item label={t('drinks.price')}>
            <Input value={formatPrice(record?.variants?.[0]?.price)} readOnly />
          </Form.Item>

          <Form.Item label={t('drinks.size')}>
            <Input value={record?.variants?.[0]?.size ?? '—'} disabled />
          </Form.Item>
        </div>

        {/* Image Upload Component managed directly by Form */}
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.fileList !== currentValues.fileList
          }
        >
          {({ getFieldValue }) => {
            const currentFileList: UploadFile[] = getFieldValue('fileList') || [];
            return (
              <Form.Item
                name="fileList"
                label={t('drinks.image')}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {currentFileList.length < 1 && (
                    <div className="flex flex-col items-center justify-center">
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>{t('drinks.uploadImage')}</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            );
          }}
        </Form.Item>

        {/* Status Selection */}
        <Form.Item name="status" label={t('drinks.status')}>
          <Select
            options={[
              { value: 1, label: t('drinks.statusActive') },
              { value: 0, label: t('drinks.statusInactive') },
            ]}
          />
        </Form.Item>

        {/* Hidden Fields */}
        <Form.Item name="drinkId" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
