import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { getPhoneNumberRule, normalizePhoneNumber } from '@/utils/formRules';

// Shop name, phone and address inputs shared by the create and edit modals
export function ShopFormFields() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-x-4">
      <Form.Item
        name="shopName"
        label={t('shops.shopName')}
        rules={[
          { required: true, whitespace: true, message: t('responses.EV001') },
          { max: 100, message: t('responses.EV005') },
          {
            // Letters, digits, spaces and . , & ' -
            pattern: /^[\p{L}0-9\s.,&'-]+$/u,
            message: t('responses.EV007'),
          },
        ]}
      >
        <Input placeholder={t('shops.shopNamePlaceholder')} />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label={t('shops.phoneNumber')}
        normalize={normalizePhoneNumber}
        rules={[
          { required: true, whitespace: true, message: t('responses.EV001') },
          getPhoneNumberRule(t),
        ]}
      >
        <Input placeholder={t('shops.phoneNumberPlaceholder')} maxLength={11} />
      </Form.Item>

      <div className="col-span-2">
        <Form.Item
          name="address"
          label={t('shops.address')}
          rules={[
            { required: true, whitespace: true, message: t('responses.EV001') },
            { max: 255, message: t('responses.EV005') },
            {
              // Letters, digits, spaces and / . , # -
              pattern: /^[\p{L}0-9\s/.,#-]+$/u,
              message: t('responses.EV007'),
            },
          ]}
        >
          <Input.TextArea rows={3} placeholder={t('shops.addressPlaceholder')} />
        </Form.Item>
      </div>
    </div>
  );
}
