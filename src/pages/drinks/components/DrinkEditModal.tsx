import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile, UploadProps } from 'antd';
import type { GroupedDrink } from './DrinkCardGrouped';
import type { EditDrinkRequest, CategoryOption } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EditDrinkRequest) => Promise<void>;
  loading: boolean;
  record: GroupedDrink | null;
  categoryOptions?: CategoryOption[];
}

export function DrinkEditModal({
  open,
  onClose,
  onSubmit,
  loading,
  record,
  categoryOptions = [],
}: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm<EditDrinkRequest>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Load initial values into form fields when modal opens
  useEffect(() => {
    if (open && record) {
      const firstVariant = record.variants?.[0];
      const currentPrice = firstVariant
        ? Number(String(firstVariant.price).replace(/[^0-9.-]+/g, ''))
        : 0;
      const currentSize = firstVariant?.size?.trim() || 'M';

      // Safely parse status value
      const isInactive =
        record.status === t('drinks.statusInactive') ||
        record.status === '0' ||
        Number(record.status) === 0;

      // Populate form fields
      form.setFieldsValue({
        drinkId: record.id || firstVariant?.drinkId,
        drinkName: record.drinkName,
        drinkCategoryId: record.drinkCategoryId || categoryOptions[0]?.value,
        status: isInactive ? 0 : 1,
        price: currentPrice,
        size: currentSize,
        imageUrl: record.imageUrl || '',
      });

      // Preview existing drink image
      if (record.imageUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: record.imageUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [open]); // Only run when open state changes to prevent infinite loop

  // Handle image upload change
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Submit edit form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      let imageUrl = record?.imageUrl || 'https://placehold.co/400x300?text=Drink';
      if (fileList.length > 0) {
        const file = fileList[0];
        imageUrl = file.url || file.thumbUrl || imageUrl;
      }

      await onSubmit({
        ...values,
        imageUrl,
        status: Number(values.status ?? 1),
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
      title={t('form.titleEdit') || 'Chỉnh sửa'}
      okText={t('form.save') || 'Lưu'}
      cancelText={t('form.cancel') || 'Huỷ'}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        setFileList([]);
        onClose();
      }}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        {/* Hidden drink ID */}
        <Form.Item name="drinkId" hidden>
          <Input />
        </Form.Item>

        {/* Info header displaying original drink name */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm text-gray-600 flex gap-4">
          <div>
            Tên gốc: <span className="font-semibold text-gray-800">{record?.drinkName}</span>
          </div>
        </div>

        {/* Drink name input */}
        <Form.Item
          name="drinkName"
          label={t('drinks.name') || 'Tên'}
          rules={[
            {
              required: true,
              message: t('drinks.validation.nameRequired') || 'Vui lòng nhập tên đồ uống!',
            },
          ]}
        >
          <Input placeholder={t('form.inputNamePlaceholder') || 'Nhập tên...'} />
        </Form.Item>

        {/* Category selection */}
        <Form.Item
          name="drinkCategoryId"
          label={t('sidebar.categories') || 'Danh Mục'}
          rules={[
            {
              required: true,
              message: t('drinks.validation.categoryRequired') || 'Vui lòng chọn danh mục!',
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder={t('form.selectCategoryPlaceholder') || 'Chọn danh mục'}
            options={categoryOptions}
            notFoundContent={
              categoryOptions.length === 0
                ? t('drinks.noCategory') || 'Chưa có dữ liệu danh mục'
                : undefined
            }
          />
        </Form.Item>

        {/* Price and size inputs */}
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="price"
            label={t('drinks.price') || 'Giá'}
            rules={[
              {
                required: true,
                message: t('drinks.validation.priceRequired') || 'Vui lòng nhập giá!',
              },
            ]}
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
            rules={[
              {
                required: true,
                message: t('drinks.validation.sizeRequired') || 'Vui lòng chọn kích cỡ!',
              },
            ]}
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

        {/* Status selection */}
        <Form.Item name="status" label={t('drinks.status') || 'Trạng thái'}>
          <Select
            options={[
              { value: 1, label: t('drinks.statusActive') || 'Đang bán' },
              { value: 0, label: t('drinks.statusInactive') || 'Ngừng bán' },
            ]}
          />
        </Form.Item>

        {/* Image upload area */}
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
                <div style={{ marginTop: 8 }}>{t('drinks.uploadImage') || 'Tải ảnh lên'}</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
