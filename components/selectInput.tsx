import { Select, SelectItem } from '@nextui-org/react';
import React from 'react';
import { ExtendedInput as Input } from '@/utilities/ui-config/extendVariant';
const SelectInput = ({ label, contents, placeholder }) => {
  return (
    // <div className='flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4'>
    <Select
      labelPlacement='outside'
      key='outside'
      variant={'bordered'}
      label={label}
      size='lg'
      radius='lg'
      placeholder={placeholder}
      className='w-full text-black '
    >
      {contents.map((content) => (
        <SelectItem
          className='text-black text-small '
          key={content.value}
          value={content.value}
        >
          {content.label}
        </SelectItem>
      ))}
    </Select>
    // </div>
  );
};

export default SelectInput;
