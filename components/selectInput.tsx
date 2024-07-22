import { Select, SelectItem } from '@nextui-org/react';

export const selectClassNames = {
  label: 'text-[#000] bg-transparent font-[500] text-[14px]',
  base: 'bg-white',

  value: 'text-[14px] text-[#000]',

  trigger:
    'bg-none rounded-[6px] shadow-none  hover:border-[#C3ADFF] focus:border-[#C3ADFF]',
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
  selectedKeys,
  defaultSelectedKeys,
}: any) => {
  return (
    <Select
      labelPlacement='outside'
      key='outside'
      variant={'bordered'}
      label={label}
      size='lg'
      name={name}
      defaultSelectedKeys={defaultSelectedKeys}
      selectedKeys={selectedKeys}
      value={value}
      isDisabled={disabled}
      errorMessage={errorMessage}
      isInvalid={errorMessage && true}
      onChange={onChange}
      radius='lg'
      placeholder={placeholder}
      classNames={selectClassNames}
    >
      {contents.map((content: any) => (
        <SelectItem
          className='text-black text-small'
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
