export interface SupplierItem {
    id: string;
    name: string;
}

export interface Supplier {
    id: string;
    supplierId: string;
    name: string;
    companyName: string;
    email: string;
    address: string;
    phoneNumber: string;
    items: SupplierItem[];
    status: 'active' | 'inactive';
}
