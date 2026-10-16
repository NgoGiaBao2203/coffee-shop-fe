import { useEffect, useState } from 'react';
import { Form, Input, Upload, type UploadFile, type UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CreateDrinkRequest, CategorySelectOption } from '../types';
import { DrinkFormModal } from './DrinkFormModal';
import {
  DrinkCategoryField,
  DrinkNameField,
  DrinkPriceInput,
  DrinkStatusField,
  DrinkUploadAction,
} from './DrinkFormFields';
import { setDrinkNameConflictError } from '../utils/utils';

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
  const [form] = Form.useForm<CreateDrinkRequest>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!open) return;
    const defaultCategory = categoryOptions[0];
    form.setFieldsValue({
      status: 1,
      shopId: shopId || defaultCategory?.shopId,
      drinkCategoryId: defaultCategory?.value,
    });
  }, [open, shopId, categoryOptions, form]);

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      let imageUrl = 'https://placehold.co/400x300?text=Drink';
      const file = fileList[0];
      const payload: CreateDrinkRequest = {
        shopId: values.shopId,
        drinkCategoryId: values.drinkCategoryId,
        drinkName: values.drinkName.trim(),
        imageUrl: file?.url || FALLBACK_DRINK_IMAGE,
        status: values.status,
        size: 'M',
        price: Number(values.price),
      };

      await onSubmit(payload, file?.originFileObj as File | undefined);
      handleClose();
    } catch (error: unknown) {
      setDrinkNameConflictError(error, form, t('drinks.nameConflict'));
    }
  };

  const handleCategoryChange = (
    _value: string,
    option?: CategorySelectOption | CategorySelectOption[],
  ) => {
    const selectedOption = Array.isArray(option) ? option[0] : option;
    if (selectedOption?.shopId) form.setFieldValue('shopId', selectedOption.shopId);
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
      <DrinkNameField />
      <DrinkCategoryField options={categoryOptions} onChange={handleCategoryChange} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Form.Item
          name="price"
          label={t('drinks.price')}
          rules={[
            { required: true, message: t('drinks.validation.priceRequired') },
            {
              validator: (_, value: string | null) => {
                if (value == null || value.trim() === '') return Promise.resolve();
                if (Number.isFinite(Number(value)) && Number(value) > 1) return Promise.resolve();
                return Promise.reject(new Error(t('drinks.validation.priceInvalid')));
              },
            },
          ]}
        >
          <DrinkPriceInput />
        </Form.Item>

        <Form.Item label={t('drinks.size')}>
          <Input value={t('drinks.sizeOptions.M')} disabled />
        </Form.Item>
      </div>

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
      <Form.Item name="shopId" hidden>
        <Input />
      </Form.Item>
    </DrinkFormModal>
  );
}
