import { useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import type { DrinkItem, EditDrinkRequest, CategorySelectOption } from '../types';

interface DrinkEditFormValues extends Omit<EditDrinkRequest, 'imageUrl'> {
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

      // Get first variant details if available
      const defaultVariant =
        record.variants && record.variants.length > 0 ? record.variants[0] : null;

      const initialFiles: UploadFile[] = record.imageUrl
        ? [
            {
              uid: '-1',
              name: 'current_image.png',
              status: 'done',
              url: record.imageUrl,
            },
          ]
        : [];

      form.setFieldsValue({
        drinkId: record.drinkId,
        drinkName: record.drinkName,
        drinkCategoryId: record.drinkCategoryId,
        shopId: record.shopId,
        status: parseStatus(record.status),
        price: defaultVariant ? Number(defaultVariant.price) : 0,
        size: defaultVariant?.size || 'M',
        fileList: initialFiles,
      });
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      let imageUrl = record?.imageUrl || 'https://placehold.co/400x300?text=Drink';
      const file = values.fileList?.[0];
      const imageFile = file?.originFileObj as File | undefined;

      if (file) {
        imageUrl = file.url || file.thumbUrl || imageUrl;
      }

      await onSubmit(
        {
          drinkId: record?.drinkId || values.drinkId || '',
          drinkName: values.drinkName,
          drinkCategoryId: values.drinkCategoryId,
          shopId: values.shopId,
          price: values.price,
          size: values.size,
          imageUrl,
          status: Number(values.status ?? 1),
          isDeleted: false,
        },
        imageFile,
      );

      handleClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Handle category selection to assign both drinkCategoryId and shopId
  const handleCategoryChange = (
    _value: string,
    option?: CategorySelectOption | CategorySelectOption[],
  ) => {
    const selectedOpt = Array.isArray(option) ? option[0] : option;
    if (selectedOpt?.shopId) {
      form.setFieldValue('shopId', selectedOpt.shopId);
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
      title={t('form.titleEdit')}
      okText={t('form.save')}
      cancelText={t('form.cancel')}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={handleClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {/* Drink Name Field */}
        <Form.Item
          name="drinkName"
          label={t('drinks.name')}
          rules={[{ required: true, message: t('drinks.validation.nameRequired') }]}
        >
          <Input placeholder={t('form.inputNamePlaceholder')} />
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
            onChange={handleCategoryChange}
            notFoundContent={categoryOptions.length === 0 ? t('drinks.noCategory') : undefined}
          />
        </Form.Item>

        {/* Price & Size Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="price"
            label={t('drinks.price')}
            rules={[{ required: true, message: t('drinks.validation.priceRequired') }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              step={1000}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              placeholder="35,000"
            />
          </Form.Item>

          <Form.Item
            name="size"
            label={t('drinks.size')}
            rules={[{ required: true, message: t('drinks.validation.sizeRequired') }]}
          >
            <Select
              options={[
                { value: 'S', label: t('drinks.sizeOptions.S') },
                { value: 'M', label: t('drinks.sizeOptions.M') },
                { value: 'L', label: t('drinks.sizeOptions.L') },
              ]}
            />
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
        <Form.Item name="shopId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="drinkId" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
