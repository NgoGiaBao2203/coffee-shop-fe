import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import type { UploadFile, UploadProps } from 'antd';
import { RESPONSE_CODE } from '@/constants/messages';
import type { CreateDrinkRequest, CategorySelectOption } from '../types';
import { DrinkPriceInput } from './DrinkPriceInput';

const DRINK_NAME_PATTERN = /^[\p{L}\p{N}\s&/(),.'-]+$/u;
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Update initial form values whenever the modal opens or shopId/categories load
  useEffect(() => {
    if (open) {
      const defaultCategory = categoryOptions[0];
      form.setFieldsValue({
        status: 1,
        shopId: shopId || defaultCategory?.shopId,
        drinkCategoryId: defaultCategory?.value,
      });
    }
  }, [open, shopId, categoryOptions, form]);

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const handleSubmit = async (values: DrinkCreateFormValues) => {
    try {
      const file = fileList[0];
      const imageFile = file?.originFileObj as File | undefined;

      const payload: CreateDrinkRequest = {
        shopId: values.shopId,
        drinkCategoryId: values.drinkCategoryId,
        drinkName: values.drinkName.trim(),
        imageUrl: file?.url || FALLBACK_DRINK_IMAGE,
        status: values.status,
        size: 'M',
        price: Number(values.price),
      };

      await onSubmit(payload, imageFile);

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

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('form.titleCreate')}
      width="min(520px, calc(100vw - 24px))"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {t('form.create')}
          </Button>
        </div>
      }
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

        {/* Category Selection - Fetched dynamically from DB */}
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

        {/* A drink currently has one fixed-size variant. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Form.Item
            name="price"
            label={t('drinks.price')}
            rules={[
              { required: true, message: t('drinks.validation.priceRequired') },
              {
                validator: (_, value: string | null) => {
                  if (value == null || value.trim() === '') {
                    return Promise.resolve();
                  }
                  if (Number.isFinite(Number(value)) && Number(value) > 1) {
                    return Promise.resolve();
                  }
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

        {/* Image Upload Component */}
        <Form.Item label={t('drinks.image')}>
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleUploadChange}
            maxCount={1}
            accept="image/*"
          >
            {fileList.length < 1 && (
              <div className="flex flex-col items-center justify-center">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>{t('drinks.uploadImage')}</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* Status Selection */}
        <Form.Item name="status" label={t('drinks.status')} rules={[{ required: true }]}>
          <Select
            options={[
              { value: 1, label: t('drinks.statusActive') },
              { value: 0, label: t('drinks.statusInactive') },
            ]}
          />
        </Form.Item>

        {/* Hidden Shop ID - Populated dynamically from props or category selection */}
        <Form.Item name="shopId" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
