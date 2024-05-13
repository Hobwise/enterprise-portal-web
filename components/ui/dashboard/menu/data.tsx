const columns = [
  { name: 'ID', uid: 'menuID' },
  { name: '', uid: 'name' },
  { name: '', uid: 'price' },
  { name: '', uid: 'desc' },
  { name: '', uid: 'actions' },
];

export const statusDataMap: Record<string, 'available' | 'out of stock'> = {
  true: 'available',
  false: 'out of stock',
};

export const statusColorMap: Record<string, 'success' | 'danger'> = {
  true: 'success',
  false: 'danger',
};
export { columns };
