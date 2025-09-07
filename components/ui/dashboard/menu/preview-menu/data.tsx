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
      container: "flex justify-between w-full",
      imageContainer: "w-[25%] flex-shrink-0",
      textContainer: "w-[73%] ml-3",
      imageClass: "h-[60px] w-[60px]",
      divider: true,
      text3: "Founded in 1743, in italy...",
      chipPosition: "bottom-0 right-2",
    },
    "List Right": {
      container: "flex justify-between w-full",
      imageContainer: "w-[25%] flex-shrink-0",
      textContainer: "w-[73%] ml-3",
      imageClass: "h-[60px] w-[60px]",
      divider: true,
      text3: "Founded in 1743, in italy...",
      chipPosition: "top-2 right-2",
    },
    "Single column 1": {
      container: "flex-col",
      textContainer: "m-0",
      imageClass: "w-full h-[200px] mb-3",
      divider: false,
      text3:
        "Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.",
      chipPosition: "top-2 left-2",
    },
    "Single column 2": {
      container: "flex-col justify-center items-center",
      textContainer: "m-0 text-center",
      imageClass: "w-[150px] h-[150px] mb-3",
      imageContainer: "w-full flex items-center justify-center",
      divider: false,
      text3:
        "Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.",
      main: "w-full",
      chipPosition: "top-2 left-2",
    },
    "Double column": {
      container: "flex-col w-[calc(50%-10px)]",
      main: "flex flex-wrap gap-5",
      textContainer: "m-0",
      imageClass: "w-full h-[150px] mb-3",
      divider: false,
      text3: "",
      chipPosition: "top-2 right-2",
    },
  };

  return previewStyles[activeTile] || {};
};
