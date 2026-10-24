import { useEffect, useState } from 'react';
import { Form, Input, Upload, type UploadFile, type UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CreateDrinkRequest, CategorySelectOption } from '../types';
import { DrinkFormModal } from './DrinkFormModal';
import {
  DrinkCategoryField,
  DrinkNameField,
  DrinkPriceField,
  DrinkStatusField,
  DrinkUploadAction,
} from './DrinkFormFields';
import { setDrinkNameConflictError } from '../utils/utils';
import { DEFAULT_DRINK_SIZE } from '../constants';

const FALLBACK_DRINK_IMAGE = 'https://placehold.co/400x300?text=Drink';

interface DrinkCreateFormValues {
  drinkName: string;
  drinkCategoryId: string;
  shopId: string;
  price: string;
  status: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateDrinkRequest, imageFile?: File) => Promise<void>;
  loading: boolean;
  categoryOptions?: CategorySelectOption[];
  shopId?: string;
}

export function DrinkCreateModal({
  open,
  onClose,
  onSubmit,
  loading,
  categoryOptions = [],
  shopId,
}: Props) {
  const { t } = useTranslation();

  const [form] = Form.useForm<DrinkCreateFormValues>();

  // Store selected drink image before submitting
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Set default form values when opening the create modal
  useEffect(() => {
    if (!open) return;

    const defaultCategory = categoryOptions[0];

    form.setFieldsValue({
      status: 1,
      shopId: shopId || defaultCategory?.shopId,
      drinkCategoryId: defaultCategory?.value,
    });
  }, [open, shopId, categoryOptions, form]);

  // Update selected image file
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Reset form data when closing the modal
  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  // Build create drink request and submit form
  const handleSubmit = async (values: DrinkCreateFormValues) => {
    try {
      const file = fileList[0];

      const payload: CreateDrinkRequest = {
        shopId: values.shopId,
        drinkCategoryId: values.drinkCategoryId,
        drinkName: values.drinkName.trim(),
        imageUrl: file?.url || FALLBACK_DRINK_IMAGE,
        status: values.status,
        size: DEFAULT_DRINK_SIZE,
        price: Number(values.price),
      };

      await onSubmit(payload, file?.originFileObj as File | undefined);

      handleClose();
    } catch (error: unknown) {
      // Show drink name conflict error on the form
      setDrinkNameConflictError(error, form, t('drinks.nameConflict'));
    }
  };

  // Update shop ID based on selected category
  const handleCategoryChange = (
    _value: string,
    option?: CategorySelectOption | CategorySelectOption[],
  ) => {
    const selectedOption = Array.isArray(option) ? option[0] : option;

    if (selectedOption?.shopId) {
      form.setFieldValue('shopId', selectedOption.shopId);
    }
  };

  return (
    <DrinkFormModal<DrinkCreateFormValues>
      open={open}
      onClose={handleClose}
      form={form}
      onFinish={handleSubmit}
      loading={loading}
      title={t('form.titleCreate')}
      submitLabel={t('form.create')}
    >
      {/* Drink name */}
      <DrinkNameField />

      {/* Drink category */}
      <DrinkCategoryField options={categoryOptions} onChange={handleCategoryChange} />

      {/* Default drink price and size */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DrinkPriceField />

        <Form.Item label={t('drinks.size')}>
          <Input value={t('drinks.sizeOptions.M')} disabled />
        </Form.Item>
      </div>

      {/* Drink image upload */}
      <Form.Item label={t('drinks.image')}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          beforeUpload={() => false}
          onChange={handleUploadChange}
          maxCount={1}
          accept="image/*"
        >
          {fileList.length < 1 && <DrinkUploadAction />}
        </Upload>
      </Form.Item>
      <DrinkStatusField />

      {/* Hidden shop ID resolved from selected category */}
      <Form.Item name="shopId" hidden>
        <Input />
      </Form.Item>
    </DrinkFormModal>
  );
}
