import { Select, SelectItem } from '@nextui-org/react';

export const selectClassNames = {
  label: 'text-[#000] bg-transparent font-[500] text-[14px]',
  base: 'bg-white',
  value: 'text-[14px] text-[#000]',
  trigger:
    'bg-none rounded-[6px] shadow-none hover:border-[#C3ADFF] focus:border-[#C3ADFF] min-h-[48px] md:min-h-[40px]',
  listbox: 'max-h-[300px] overflow-y-auto',
  popoverContent: 'w-full',
};

export const mobileSelectClassNames = {
  label: 'text-[#000] bg-transparent font-[500] text-[16px] mb-2',
  base: 'bg-white w-full',
  value: 'text-[16px] text-[#000]',
  trigger:
    'bg-white rounded-[8px] shadow-none border-2 border-gray-300 hover:border-[#C3ADFF] focus:border-[#C3ADFF] min-h-[56px] px-4 data-[focus=true]:border-[#C3ADFF] data-[open=true]:border-[#C3ADFF]',
  listbox: 'max-h-[40vh] overflow-y-auto',
  popoverContent: 'w-full max-w-[95vw] max-h-[50vh] overflow-hidden',
  innerWrapper: 'text-[16px]',
};
const SelectInput = ({
  label,
  contents,
  placeholder,
  name,
  value,
  onChange,
  disabled,
  errorMessage,
  isInvalid,
  selectedKeys,
  defaultSelectedKeys,
  isMobile = false,
}: any) => {
  const handleSelectionChange = (keys: any) => {
    if (onChange) {
      // NextUI Select returns a Set of keys, convert to single value string
      const selectedValue = Array.from(keys)[0] as string;

      // Create a synthetic event object that matches the expected format
      const syntheticEvent = {
        target: {
          name: name,
          value: selectedValue || '',
        },
      };

      onChange(syntheticEvent);
    }
  };

  return (
    <Select
      labelPlacement='outside'
      key='outside'
      variant={'bordered'}
      label={label}
      size={isMobile ? 'lg' : 'lg'}
      name={name}
      defaultSelectedKeys={defaultSelectedKeys}
      selectedKeys={selectedKeys}
      value={value}
      isDisabled={disabled}
      errorMessage={errorMessage}
      isInvalid={isInvalid || (errorMessage && true)}
      onSelectionChange={handleSelectionChange}
      radius={isMobile ? 'md' : 'lg'}
      placeholder={placeholder}
      classNames={isMobile ? mobileSelectClassNames : selectClassNames}
      scrollShadowProps={{
        isEnabled: false
      }}
    >
      {contents.map((content: any) => (
        <SelectItem
          className={isMobile ? 'text-black text-base py-3 px-4' : 'text-black text-small'}
          key={content.value}
          value={content.value}
        >
          {content.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SelectInput;
