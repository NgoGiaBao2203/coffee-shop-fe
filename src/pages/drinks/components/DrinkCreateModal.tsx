import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile, UploadProps } from 'antd';
import type { CreateDrinkRequest, CategorySelectOption } from '../types';

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

  // Update initial form values whenever the modal opens or shopId/categories load
  useEffect(() => {
    if (open) {
      const defaultCategory = categoryOptions[0];
      form.setFieldsValue({
        status: 1,
        size: 'M',
        shopId: shopId || defaultCategory?.shopId,
        drinkCategoryId: defaultCategory?.value,
      });
    }
  }, [open, shopId, categoryOptions, form]);

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      let imageUrl = 'https://placehold.co/400x300?text=Drink';
      const file = fileList[0];
      const imageFile = file?.originFileObj as File | undefined;

      if (fileList.length > 0 && file) {
        // Prioritize `url`; if unavailable, use `thumbUrl` (Base64)
        imageUrl = file.url || file.thumbUrl || imageUrl;
      }

      await onSubmit(
        {
          ...values,
          imageUrl,
          status: Number(values.status ?? 1),
          isDeleted: false,
          drinkDetailId: crypto.randomUUID(),
        },
        imageFile,
      );

      form.resetFields();
      setFileList([]);
      onClose();
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

  return (
    <Modal
      open={open}
      title={t('form.titleCreate')}
      okText={t('form.create')}
      cancelText={t('form.cancel')}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        setFileList([]);
        onClose();
      }}
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
        <Form.Item name="status" label={t('drinks.status')}>
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
