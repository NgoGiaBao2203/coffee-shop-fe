import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  onSearch: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchInput({ onSearch, loading = false, placeholder }: SearchInputProps) {
  const { t } = useTranslation();

  return (
    <Input.Search
      placeholder={placeholder ?? t('search.placeholder')}
      onSearch={(value, event) => {
        // Prevent default submit behavior on Enter
        event?.preventDefault();
        onSearch(value);
      }}
      loading={loading}
      allowClear
      size="large"
      className="w-full sm:max-w-sm"
    />
  );
}
