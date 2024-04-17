interface Menu {
  name: string;
  chip: number;
}

export const menus: Menu[] = [
  {
    name: 'All',
    chip: 29,
  },
  {
    name: 'Drinks',
    chip: 12,
  },
  {
    name: 'Dessert',
    chip: 8,
  },
  {
    name: 'Breakfast',
    chip: 6,
  },
];
interface PreviewStyles {
  container?: string;
  textContainer?: string;
  imageClass?: string;
  imageContainer?: string;
  divider?: boolean;
  text3?: string;
  main?: string;
}

export const togglePreview = (activeTile: string): PreviewStyles => {
  const previewStyles: { [key: string]: PreviewStyles } = {
    'List left': {
      container: '',
      textContainer: 'ml-3',
      imageClass: 'h-[60px] w-[60px]',
      divider: true,
      text3: 'Founded in 1743, in italy...',
    },
    'List Right': {
      container: 'justify-between',
      textContainer: 'mr-3',
      imageClass: 'h-[60px] w-[60px]',
      divider: true,
      text3: 'Founded in 1743, in italy...',
    },
    'Single column 1': {
      container: 'flex-col ',
      textContainer: 'm-0',
      imageClass: 'w-full h-[200px] mb-3',
      divider: false,
      text3:
        "Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.",
    },
    'Single column 2': {
      container: 'flex-col justify-center item-center',
      textContainer: 'm-0 text-center',
      imageClass: 'w-[150px] h-[150px] mb-3',
      imageContainer: 'w-full flex items-center justify-center',
      divider: false,
      text3:
        "Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.",
      main: 'w-full ',
    },
    'Double column': {
      container: 'flex-col w-[calc(50%-5px)]',
      main: 'flex flex-wrap gap-2',
      textContainer: 'm-0',
      imageClass: 'w-full h-[150px] mb-3',
      divider: false,
      text3: '',
    },
  };

  return previewStyles[activeTile] || {};
};
