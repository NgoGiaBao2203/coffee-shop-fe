import { useEffect, useMemo, useState } from 'react';
import { Alert, Form, Input, Upload, type UploadFile, type UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CreateDrinkRequest, CategorySelectOption, DrinkItem } from '../types';
import { DrinkFormModal } from './DrinkFormModal';
import {
  DrinkCategoryField,
  DrinkNameField,
  DrinkPriceField,
  DrinkSizeField,
  DrinkStatusField,
  DrinkUploadAction,
} from './DrinkFormFields';
import { useFormApiError } from '@/hooks/useFormApiError';
import { useDrinkImageUpload } from '../hooks/useDrinkImageUpload';
import { findDrinkByName } from '../utils/utils';
import { DEFAULT_DRINK_SIZE, DRINK_SIZES } from '../constants';

const FALLBACK_DRINK_IMAGE = 'https://placehold.co/400x300?text=Drink';

interface DrinkCreateFormValues {
  drinkName: string;
  drinkCategoryId: string;
  shopId: string;
  price: string;
  size: string;
  status: number;
}

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (values: CreateDrinkRequest, imageFile?: File) => Promise<void>;
  readonly loading: boolean;
  readonly categoryOptions?: CategorySelectOption[];
  readonly shopId?: string;
  readonly drinks?: readonly DrinkItem[];
}

export function DrinkCreateModal({
  open,
  onClose,
  onSubmit,
  loading,
  categoryOptions = [],
  shopId,
  drinks = [],
}: Props) {
  const { t } = useTranslation();

  const [form] = Form.useForm<DrinkCreateFormValues>();
  const handleFormError = useFormApiError();
  const imageUploadProps = useDrinkImageUpload();

  // Store selected drink image before submitting
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Detect an existing drink with the same name so the new size is merged into it
  const drinkName = Form.useWatch('drinkName', form);
  const selectedShopId = Form.useWatch('shopId', form);

  const matchedDrink = useMemo(
    () => findDrinkByName(drinks, drinkName, selectedShopId),
    [drinks, drinkName, selectedShopId],
  );

  const takenSizes = useMemo(
    () => (matchedDrink?.variants ?? []).map((variant) => variant.size),
    [matchedDrink],
  );

  // Set default form values when opening the create modal
  useEffect(() => {
    if (!open) return;

    const defaultCategory = categoryOptions[0];

    form.setFieldsValue({
      status: 1,
      size: DEFAULT_DRINK_SIZE,
      shopId: shopId || defaultCategory?.shopId,
      drinkCategoryId: defaultCategory?.value,
    });
  }, [open, shopId, categoryOptions, form]);

  // Move the size selection off a size the matched drink already has
  useEffect(() => {
    const currentSize = form.getFieldValue('size');

    if (!takenSizes.includes(currentSize)) return;

    const firstFreeSize = DRINK_SIZES.find((size) => !takenSizes.includes(size));

    if (firstFreeSize) form.setFieldValue('size', firstFreeSize);
  }, [takenSizes, form]);

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
        size: values.size,
        price: Number(values.price),
      };

      await onSubmit(payload, file?.originFileObj as File | undefined);

      handleClose();
    } catch (error) {
      // e.g. a duplicated size goes to the size field
      handleFormError(error, form);
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

      {/* Existing drink notice: category, image and status are ignored by the server */}
      {matchedDrink && (
        <Alert className="mb-4!" type="info" showIcon message={t('drinks.mergeNotice')} />
      )}

      {/* Drink category */}
      <DrinkCategoryField options={categoryOptions} onChange={handleCategoryChange} />

      {/* Drink price and size */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DrinkPriceField />

        <DrinkSizeField takenSizes={takenSizes} />
      </div>

      {/* Drink image upload */}
      <Form.Item label={t('drinks.image')}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          {...imageUploadProps}
          onChange={handleUploadChange}
          maxCount={1}
          disabled={!!matchedDrink}
        >
          {fileList.length < 1 && <DrinkUploadAction />}
        </Upload>
      </Form.Item>
      <DrinkStatusField disabled={!!matchedDrink} />

      {/* Hidden shop ID resolved from selected category */}
      <Form.Item name="shopId" hidden>
        <Input />
      </Form.Item>
    </DrinkFormModal>
  );
}
