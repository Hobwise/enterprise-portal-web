export default function UserGuide() {
  const items: string[] = [
    'Overview',
    'Dashboard Overview',
    'Menu Management',
    'Order Management',
    'Handling Payments:',
    'QR Code Management',
    'Campaign Management',
    'Reservation Management',
    'Booking Management',
    'Payment Management',
    'Bills and Subscription',
  ];
  return (
    <div className="w-full flex space-x-4 px-4 lg:px-10 font-satoshi pt-[32%] lg:pt-[10%]">
      <div className="w-[20%] border-r border-r-[#C4C4C480] py-8 space-y-8 fixed h-screen hidden lg:block">
        {items.map((each) => (
          <a href={`#${each}`} className="py-8">
            <p className="text-sm cursor-pointer py-3" key={each}>
              {each}
            </p>
          </a>
        ))}
      </div>

      <div className="w-full lg:w-[80%] py-8 space-y-8 overflow-y-auto lg:pl-[24%] lg:h-[77vh]">
        <div className="space-y-2" id={items[0]}>
          <h1 className="text-xl font-bold">{items[0]}</h1>
          <p className="text-sm">
            This guide will help you navigate the platform and use its key features, including managing menus, processing orders, creating QR codes, running
            campaigns, managing reservations, and handling payments.
          </p>
        </div>

        <div className="space-y-2" id={items[1]}>
          <h1 className="text-xl font-bold">{items[1]}</h1>
          <div className="text-sm space-y-2.5">
            <p>
              The <span className="font-bold">Dashboard</span> is the first screen you will see after logging in. It provides real-time analytics of your
              business operations, including orders, payments, and performance metrics. You can easily switch to the Dashboard at any time by selecting the
              <span className="font-bold"> Dashboard</span> module from the side navigation panel.
            </p>

            <p className="font-bold text-xl">Key Features:</p>
            <ul className="space-y-2.5">
              <li>&#8226; View analytics on sales, orders, menu and reservations.</li>
              <li>&#8226; Access to quick performance summaries and reports.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[2]}>
          <h1 className="text-xl font-bold">{items[2]}</h1>
          <div className="text-sm space-y-4">
            <p>The Menu module allows you to create and manage your business offerings. </p>
            <div className="space-y-2.5">
              <p className="font-bold">Creating a New Menu:</p>
              <ul className="space-y-2.5">
                <li>
                  1. Navigate to the <span className="font-bold">Menu</span> module from the side panel.
                </li>
                <li>
                  2. Click on <span className="font-bold">Create a New Menu.</span>
                </li>
                <li>
                  3. Enter the <span className="font-bold">Menu Name</span> in the pop-up modal and click <span className="font-bold">Save.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold">Adding Items to the Menu:</p>
              <ul className="space-y-2.5">
                <li>1. After creating a menu, navigate to the menu list and select Add Menu Item.</li>
                <li>
                  2. On the item creation page, fill in the following details:
                  <p className="font-bold ml-4">&#8226; Item Name</p>
                  <p className="font-bold ml-4">&#8226; Item Desription</p>
                  <p className="font-bold ml-4">&#8226; Item Price</p>
                  <p>
                    Select the <span className="font-bold">Menu</span> to map the item to.
                  </p>
                  <p>
                    Upload an <span className="font-bold">item image.</span>
                  </p>
                </li>
                <li>
                  3. Click <span className="font-bold">Save</span> to create the item and map it to the selected menu.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2" id={items[3]}>
          <h1 className="text-xl font-bold">{items[3]}</h1>
          <div className="text-sm space-y-2.5">
            <p>
              The <span className="font-bold">Order</span> module helps you manage and track customer orders efficiently.
            </p>
            <p className="font-bold">Creating a New Order:</p>
            <ul className="space-y-2.5">
              <li>
                1. Access the <span className="'font-bold">Order</span> module.
              </li>
              <li>
                2. Click on <span className="font-bold">Create Order.</span>
              </li>
              <li>
                3. Select the customer's items from the <span className="font-bold">Menu.</span>
              </li>
              <li>
                4. Enter the customer’s details:
                <p className="font-bold ml-4">
                  &#8226; <span className="font-fold">Name</span>
                </p>
                <p className="font-bold ml-4">
                  &#8226; <span className="font-fold">Phone Number</span>
                </p>
                <p className="font-bold ml-4">
                  &#8226; Select a <span className="font-fold">Table</span>
                </p>
                <p className="font-bold ml-4">
                  &#8226; Add a <span className="font-fold">Comment</span> (optional).
                </p>
              </li>
              <li>
                5. Proceed to <span className="font-bold">Checkout.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[4]}>
          <h1 className="text-xl font-bold">{items[4]}</h1>
          <div className="text-sm space-y-2.5">
            <div className="space-y-1.5">
              <p>
                &#8226; Click the Payment Method you prefer from the <span className="font-bold">payment method</span> modal
              </p>
              <p>
                &#8226; Enter a <span className="font-bold">Payment Reference Number</span> (if available).
              </p>
              <p>
                &#8226; Click <span className="font-bold">Confirm Payment.</span>
              </p>
              <p>
                &#8226; If the Pay Later option is selected, the order remains <span className="font-bold">Open</span>, meaning the customer can add more items
                before the final payment is confirmed.
              </p>
            </div>
            <ul className="space-y-2.5">
              <p className="font-bold">Managing Open Orders:</p>
              <li>
                &#8226; <span className="font-bold">Update Order:</span> Add more items to an open order.
              </li>
              <li>
                &#8226; <span className="font-bold">Generate Receipt:</span> Issue a receipt for open orders.
              </li>
              <li>
                &#8226; <span className="font-bold">Cancel:</span> Cancel an order.
              </li>
            </ul>
            <p className="font-bold">Note: Closed orders are confirmed payments and can no longer be modified.</p>
          </div>
        </div>

        <div className="space-y-2" id={items[5]}>
          <h1 className="text-xl font-bold">{items[5]}</h1>
          <div className="text-sm space-y-2.5">
            <p>
              The <span className="font-bold">QR Code</span> feature allows you to generate QR codes and map them to tables.
            </p>
            <div className="">
              <p className="font-bold">Creating a QR Code:</p>
              <p>
                1. Navigate to the <span className="font-bold">QR</span> module.
              </p>
              <p>
                2. Click on <span className="font-bold">Create a QR.</span>
              </p>
              <p>
                3. Input the <span className="font-bold">Name</span> for the QR code and save it.
              </p>
              <p>
                4. You can choose to <span className="font-bold">Download</span> the generated QR code or create another one.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2" id={items[6]}>
          <h1 className="text-xl font-bold">{items[6]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">
              The <span className="font-bold">Campaign</span> module lets you create and manage campaigns related to your business
            </p>

            <ul className="space-y-2.5">
              <p className="font-bold">Creating a Campaign:</p>
              <li>
                1. Go to the <span className="font-bold">Campaign</span> module.
              </li>
              <li>
                2. Click <span className="font-bold">Add Campaign.</span>
              </li>
              <li>3. Fill in the campaign details:</li>
              <li className="ml-4">
                <p className="font-bold">
                  &#8226; <span className="font-fold">Time</span>
                </p>
                <p className="font-bold">
                  &#8226; <span className="font-fold">Description</span>
                </p>
                <p className="font-bold">
                  &#8226; <span className="font-fold">Start Date</span> and <span className="font-bold">End Date</span>
                </p>
                <p className="font-bold">
                  &#8226; Upload an <span className="font-fold">Image.</span>
                </p>
              </li>
              <li>
                5. Click <span className="font-bold">Schedule Campaign.</span> to finalize
              </li>
            </ul>

            <div className="space-y-2.5">
              <p className="font-bold">Viewing Campaigns:</p>
              <p>
                You can view all campaigns, both ongoing and completed, from the <span className="font-bold">Campaign</span> module.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2" id={items[7]}>
          <h1 className="text-xl font-bold">{items[7]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">
              The <span className="font-bold">Reservation</span> module allows you to create and manage reservations for your restaurant.
            </p>
            <p className="font-bold">Creating a Reservation:</p>
            <ul className="space-y-2.5">
              <li>
                1. Go to the <span className="font-bold">Reservation</span> module.
              </li>
              <li>
                2. Click on <span className="font-bold">Add Reservation.</span>
              </li>
              <li>3. Fill out the following details:</li>
              <div className="ml-4">
                <p>
                  &#8226; <span className="font-bold">Reservation Name</span>
                </p>
                <p>
                  &#8226; <span className="font-bold">Description</span>
                </p>
                <p>
                  &#8226; <span className="font-bold">Fee</span> and <span className="font-bold">Minimum Spend</span>
                </p>
                <p>
                  &#8226; <span className="font-bold">Quantity of Reservations</span>
                </p>
                <p>
                  &#8226; Upload an <span className="font-bold">Image.</span>
                </p>
              </div>
              <li>
                4. Click <span className="font-bold">Add Reservation</span> to save.
              </li>
              <li>5. Users will always see these reservation when they are trying to place a booking.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[8]}>
          <h1 className="text-xl font-bold">{items[8]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">Manage customer bookings from the Booking module.</p>
            <div className="space-y-2.5">
              <p className="font-bold">Creating a Booking:</p>
              <p>
                1. Access the <span className="font-bold">Booking</span> module.
              </p>
              <p>2. Enter the following details</p>
              <ul className="ml-4">
                <li className="font-bold">&#8226; Customer Name</li>
                <li className="font-bold">&#8226; Email Address</li>
                <li className="font-bold">
                  &#8226; Select the <span className="font-bold">Reservation</span> type.
                </li>
                <li className="font-bold">
                  &#8226; Enter <span className="font-bold">Phone Number</span> and <span className="font-bold">Booking Date.</span>
                </li>
              </ul>
              <p>
                3. Click <span className="font-bold">Create Booking.</span>
              </p>
            </div>
            <div className="space-y-2.5">
              <p className="font-bold">Confirming a Booking:</p>
              <p>
                1. On the booking page, enter the <span className="font-bold">Booking Reference Number</span> and click{' '}
                <span className="font-bold">Search.</span>
              </p>
              <p>
                2. The ticket details will appear. Click <span className="font-bold">Confirm.</span>
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-bold">Admitting and Closing Bookings:</p>
              <p>
                &#8226; To <span className="font-bold">Admit</span> a customer, click the <span className="font-bold">More</span> button and select{' '}
                <span className="font-bold">Admit.</span>
              </p>
              <p>
                &#8226; To <span className="font-bold">Close</span> a booking, select the <span className="font-bold">More</span> button and click Close{' '}
                <span className="font-bold">Booking.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2" id={items[9]}>
          <h1 className="text-xl font-bold">{items[9]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">
              Handle payments via the <span className="font-bold">Payments</span> module
            </p>
            <div className="space-y-1.5">
              <p className="font-bold">Confirming Payment:</p>
              <p>
                1. Once an order is created and payment is pending confirmation, go to the <span className="font-bold">More</span> options icon on the order.
              </p>
              <p>
                2. Click <span className="font-bold">Confirm Payment</span> to complete the process
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2" id={items[10]}>
          <h1 className="text-xl font-bold">{items[10]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">Choosing a plan will allow you manage the feature you want for your business</p>
            <div className="space-y-1.5">
              <p>1. After login, You can navigate to the account settings page</p>
              <p>2. Click on the Bills & Subscription to view all plan</p>
              <p>3. Select plan of your choice and make payment through the gateway</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
