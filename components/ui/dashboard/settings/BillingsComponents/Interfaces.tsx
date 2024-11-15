export interface TabContentProps {
  id: string;
  label: string;
  // content: JSX.Element;
}

export interface PlanDetails {
  maxUsers: number;
  monthlyFee: number;
  yearlyFee: number;
  canAccessDashboard: boolean;
  canAccessMenu: boolean;
  canAccessReservations: boolean;
  canAccessNotifications: boolean;
  canAccessOrders: boolean;
  canAccessPayments: boolean;
  canAccessBookings: boolean;
  canAccessCampaigns: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
  canAccessQR: boolean;
  canAccessMultipleLocations: boolean;
}

export interface Plans {
  Starter: PlanDetails;
  Professional: PlanDetails;
  Premium: PlanDetails;
  
}

export interface PlansFromParent {
  plans: Plans | null;
  disableButtons?: boolean;
}

export interface PaymentDetails {
  businessID: string;
  cooperateID: string;
  userId: string;
  emailAddress: string;
  amount: number;
  plan: number;
  paymentPeriod: number;
}



export const PAYMENT_PLAN = {
  PREMIUM: 0,
  PROFESSIONAL: 1,
  STARTER: 2
};

export interface SubscriptionData {
  subscription: any | null;
  nextPaymentDate: string | null;
  subscriptionHistories: any | null;
  plans: Plans;
  status: string | null;
  authorization: any | null;
}

export interface CardDetails {
  status : string | null;
  last4: string | null;
  exp_Month: string | null;
  exp_Year: string | null;
  card_type: string | null;
  brand: string | null;
}

export interface CurrentSubscriptionDetails {
  
    cooperateID: string;
    businessID: string;
    subcribedByID: string;
    subcriptionCode: string;
    subcriptionCustomerCode: string;
    subcriptionPlanCode: string;
    subcriptionEmailToken: string;
    reference: string;
    subcribedByName: string;
    message: string;
    plan: number;
    paymentPeriod: number;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    totalAmount: number;
    perAmount: number;
    isActive: boolean;
    checkSum: string;
    isExpired: boolean;
    id: string;
    nextPaymentDate: string | null
  }

  export interface PaidCardsData {
    cardDetails: CardDetails | null,
    currentSubscriptionDetails: CurrentSubscriptionDetails | null
  }

  export interface SubscriptionHistory {
    cooperateID: string; 
    businessID: string; 
    subcribedByID: string; 
    plan: number; 
    paymentPeriod: number; 
    subscriptionStartDate: string; 
    subscriptionEndDate: string; 
    isActive: boolean; 
    isExpired: boolean;
    id: string; 
  }

  export interface SubscriptionTableProps {
    subscriptions: SubscriptionHistory[] | null;
    searchQuery?: string;
  }
  
  

//   {
//     "data": {
//         "subscription": {
//             "cooperateID": "9467e040-39ae-44c8-80ae-be79c403d0f1",
//             "businessID": "79254411-a3b6-47d2-a0ae-f1916fe5bf1f",
//             "subcribedByID": "39a6dd90-f7af-41fb-ae39-eed63fb05442",
//             "subcriptionCode": "SUB_fgsktmo64nkmeoy",
//             "subcriptionCustomerCode": "",
//             "subcriptionPlanCode": "",
//             "subcriptionEmailToken": "",
//             "reference": "f1c54575-6a93-47dd-a2e2-48662c87194c-79254411-a3b6-47d2-a0ae-f1916fe5bf1f20241113200942-Subscription",
//             "subcribedByName": "Alex Jide",
//             "message": "Subscription Initialised and pending payment",
//             "plan": 3,
//             "paymentPeriod": 0,
//             "subscriptionStartDate": "0001-01-01T00:00:00",
//             "subscriptionEndDate": "2024-11-14T19:09:00",
//             "totalAmount": 3000,
//             "perAmount": 0,
//             "isActive": false,
//             "checkSum": "63df881bcef02d6f3fe607c98e1857f23dd3e4e4a6eb9dc2d5941a4ce65414a5",
//             "isExpired": false,
//             "id": "dcb3adae-2a83-4a69-acf8-d47b9d4ac3db"
//         },
//         "nextPaymentDate": "2024-11-14T19:09:00Z",
//         "status": "active",
//         "subscriptionHistories": [],
       
//         "authorization": {
//             "last4": "4081",
//             "exp_Month": "12",
//             "exp_Year": "2030",
//             "card_Type": "visa ",
//             "bank": "TEST BANK",
//             "country_Code": "NG",
//             "brand": "visa",
//             "account_Name": null,
//             "reusable": true
//         }
//     },
//     "isLoading": false,
//     "isError": false
// }