import { useEffect, useRef, useState } from 'react';
import { Modal, Form, InputNumber, Button, Divider, Table, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { InvoiceItem, CreateInvoiceDetailItem, EditInvoiceRequest } from '../types';

interface InvoiceEditModalProps {
  open: boolean;
  onClose: () => void;
  record: InvoiceItem | null;
  onSubmit: (values: EditInvoiceRequest) => Promise<void> | void;
  loading?: boolean;
}

export function InvoiceEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
}: InvoiceEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [items, setItems] = useState<CreateInvoiceDetailItem[]>([]);
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }

    if (!isOpenedRef.current && record) {
      isOpenedRef.current = true;
      form.resetFields();
      form.setFieldsValue({
        tableNumber: record.tableNumber,
      });

      setItems(
        record.items && record.items.length > 0
          ? record.items.map((i) => ({
              drinkDetailId: i.drinkDetailId || (i as unknown as { drinkId: string }).drinkId || '',
              drinkName: i.drinkName,
              size: i.size,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              note: i.note,
            }))
          : [],
      );
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    setItems([]);
    onClose();
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        drinkDetailId: '',
        size: 'M',
        quantity: 1,
        unitPrice: 0,
        note: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof CreateInvoiceDetailItem,
    value: string | number,
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const calculateTotal = () => {
    return items.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0);
  };

  const handleSubmit = async () => {
    if (!record) return;
    try {
      const values = await form.validateFields();

      // Format payload to strictly match Backend DTO
      const payload: EditInvoiceRequest = {
        invoiceId: record.invoiceId,
        tableNumber: values.tableNumber,
        items: items.map((i) => ({
          drinkDetailId: i.drinkDetailId,
          quantity: i.quantity,
          note: i.note || '',
        })),
      };

      await onSubmit(payload);
      handleClose();
    } catch {
      // Form validation error
    }
  };

  const columns = [
    {
      title: t('invoices.drinkId'),
      dataIndex: 'drinkDetailId',
      key: 'drinkDetailId',
      render: (val: string, _: unknown, idx: number) => (
        <Input
          placeholder="UUID drinkDetailId"
          value={val}
          onChange={(e) => handleItemChange(idx, 'drinkDetailId', e.target.value)}
        />
      ),
    },
    {
      title: t('invoices.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (val: number, _: unknown, idx: number) => (
        <InputNumber
          min={1}
          value={val}
          onChange={(value) => handleItemChange(idx, 'quantity', value ?? 1)}
        />
      ),
    },
    {
      title: t('invoices.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 140,
      render: (val: number, _: unknown, idx: number) => (
        <InputNumber
          min={0}
          value={val}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          onChange={(value) => handleItemChange(idx, 'unitPrice', value ?? 0)}
        />
      ),
    },
    {
      title: t('invoices.note'),
      dataIndex: 'note',
      key: 'note',
      render: (val: string, _: unknown, idx: number) => (
        <Input value={val} onChange={(e) => handleItemChange(idx, 'note', e.target.value)} />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: unknown, __: unknown, idx: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(idx)}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('invoices.editTitle')}
      width={780}
      footer={
        <div className="flex justify-between items-center">
          <div className="text-base font-semibold">
            {t('invoices.totalAmount')}:{' '}
            <span className="text-emerald-600">{calculateTotal().toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClose}>{t('form.cancel')}</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              {t('form.save')}
            </Button>
          </div>
        </div>
      }
    >
      {record && (
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 bg-gray-50 rounded-lg px-4 py-3 mb-4 text-sm">
          <div>
            <span className="text-gray-500">{t('invoices.shopName')}: </span>
            <span className="font-medium">{record.shopName}</span>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices.staffName')}: </span>
            <span className="font-medium">{record.staffName}</span>
          </div>
          <div>
            <span className="text-gray-500">{t('invoices.status')}: </span>
            <span className="font-medium">{record.status}</span>
          </div>
        </div>
      )}

      <Divider className="my-3!" />

      <Form form={form} layout="vertical">
        <Form.Item
          name="tableNumber"
          label={t('invoices.tableNumber')}
          rules={[{ required: true, message: t('invoices.tableNumberRequired') }]}
        >
          <InputNumber min={1} className="w-48" />
        </Form.Item>
      </Form>

      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-700">{t('invoices.itemList')}</span>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem} size="small">
          {t('invoices.addItem')}
        </Button>
      </div>

      <Table
        rowKey={(_, idx) => String(idx)}
        columns={columns}
        dataSource={items}
        pagination={false}
        size="small"
        bordered
      />
    </Modal>
  );
}
