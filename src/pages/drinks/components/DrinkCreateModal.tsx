import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile, UploadProps } from 'antd';
import type { CreateDrinkRequest } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateDrinkRequest) => Promise<void>;
  loading: boolean;
  categoryOptions?: { value: string; label: string }[];
  shopId?: string;
}

// Maximum length limit for image URLs/Base64 strings
const MAX_IMAGE_URL_LENGTH = 500;

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
      form.setFieldsValue({
        status: 1,
        size: 'M',
        shopId: shopId,
        drinkCategoryId: categoryOptions[0]?.value,
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
      if (fileList.length > 0) {
        const file = fileList[0];
        // Prioritize `url`; if unavailable, use `thumbUrl` (Base64)
        imageUrl = file.url || file.thumbUrl || imageUrl;
      }

      // Check if the image path exceeds the database string length limit
      if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
        message.error(
          `Image URL is too long (${imageUrl.length} characters). Please select a smaller file or provide a shorter URL.`,
        );
        return;
      }

      await onSubmit({
        ...values,
        imageUrl,
        status: Number(values.status ?? 1),
        isDeleted: false,
        drinkDetailId: crypto.randomUUID(),
      });

      form.resetFields();
      setFileList([]);
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      open={open}
      title={t('form.titleCreate') || 'Tạo mới'}
      okText={t('form.create') || 'Tạo mới'}
      cancelText={t('form.cancel') || 'Huỷ'}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        setFileList([]);
        onClose();
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {/* Drink Name Field */}
        <Form.Item
          name="drinkName"
          label={t('drinks.name') || 'Tên'}
          rules={[{ required: true, message: 'Vui lòng nhập tên đồ uống!' }]}
        >
          <Input placeholder="Nhập tên..." />
        </Form.Item>

        {/* Category Selection - Fetched dynamically from DB */}
        <Form.Item
          name="drinkCategoryId"
          label={t('sidebar.categories') || 'Danh Mục'}
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
        >
          <Select
            placeholder="Chọn danh mục"
            options={categoryOptions}
            notFoundContent={categoryOptions.length === 0 ? 'Chưa có dữ liệu danh mục' : undefined}
          />
        </Form.Item>

        {/* Price & Size Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="price"
            label={t('drinks.price') || 'Giá'}
            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
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
            label={t('drinks.size') || 'Kích cỡ'}
            rules={[{ required: true, message: 'Vui lòng chọn size!' }]}
          >
            <Select
              options={[
                { value: 'S', label: 'Size S' },
                { value: 'M', label: 'Size M' },
                { value: 'L', label: 'Size L' },
              ]}
            />
          </Form.Item>
        </div>

        {/* Image Upload Component */}
        <Form.Item label={t('drinks.image') || 'Hình ảnh'}>
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
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* Status Selection */}
        <Form.Item name="status" label={t('drinks.status') || 'Trạng thái'}>
          <Select
            options={[
              { value: 1, label: 'Đang bán' },
              { value: 0, label: 'Ngừng bán' },
            ]}
          />
        </Form.Item>

        {/* Hidden Shop ID - Populated dynamically from props */}
        <Form.Item name="shopId" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
