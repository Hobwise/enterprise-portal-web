interface Menu {
  name: string;
  chip: number;
}

export const menus: Menu[] = [
  {
    name: "All",
    chip: 29,
  },
  {
    name: "Drinks",
    chip: 12,
  },
  {
    name: "Dessert",
    chip: 8,
  },
  {
    name: "Breakfast",
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
  chipPosition?: string;
}

export const togglePreview = (activeTile: string): PreviewStyles => {
  const previewStyles: {
    [key: string]: PreviewStyles;
  } = {
    "List left": {
      container: "flex items-start gap-3 w-full bg-white rounded-xl p-3 shadow-sm",
      // desktop: 3 columns, mobile: 1 column
      main: "relative px-4 grid grid-cols-1 md:grid-cols-3 gap-3",
      imageContainer:
        "w-[60px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden",
      textContainer: "flex-1 min-w-0",
      imageClass: "h-[60px] w-[60px] rounded-lg",
      divider: false,
      text3: "Chinese fried rice served with fresh vegetable salad",
      chipPosition: "top-3 right-3",
    },
    "List Right": {
      container:
        "flex flex-row-reverse items-start gap-3 w-full bg-white rounded-xl p-3 shadow-sm",
      // desktop: 3 columns, mobile: 1 column
      main: "relative px-4 grid grid-cols-1 md:grid-cols-3 gap-3",
      imageContainer:
        "w-[60px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden",
      textContainer: "flex-1 min-w-0",
      imageClass: "h-[60px] w-[60px] rounded-lg",
      divider: false,
      text3: "Chinese fried rice served with fresh vegetable salad",
      chipPosition: "top-2 right-2",
    },
    "Single column 1": {
      container: "flex-col bg-white rounded-2xl overflow-hidden shadow-sm pb-14",
      textContainer: "p-4",
      // desktop: 2 columns, mobile: 1 column
      main: "grid grid-cols-1 md:grid-cols-2 gap-6 px-4",
      imageClass: "w-full h-[220px]",
      imageContainer: "w-full",
      divider: false,
      text3: "Chinese fried rice served with fresh vegetable salad",
      chipPosition: "top-4 left-4",
    },
    "Single column 2": {
      container: "flex-col bg-white rounded-xl overflow-hidden shadow-sm",
      textContainer: "p-3 text-left",
      imageClass: "w-full h-[120px] rounded-t-xl",
      imageContainer: "w-full",
      // desktop: 3 columns, mobile: 2 columns
      main: "grid grid-cols-2 md:grid-cols-3 gap-3 px-4",
      divider: false,
      text3: "Chinese fried rice served with fresh vegetable salad",
      chipPosition: "top-2 left-2",
    },
    "Double column": {
      container: "flex-col bg-white rounded-xl overflow-hidden shadow-sm",
      // desktop: 6 columns, mobile: 3 columns
      main: "grid grid-cols-3 md:grid-cols-6 gap-4 px-4",
      textContainer: "p-3",
      imageClass: "w-full h-[160px] rounded-t-xl",
      imageContainer: "w-full",
      divider: false,
      text3: "Chinese fried rice served with fresh vegetable salad",
      chipPosition: "top-2 right-2",
    },
  };

  return previewStyles[activeTile] || {};
};
