export default function PrivacyPolicy() {
  const items: string[] = [
    'Welcome to Hobwise',
    'Information we collect',
    'How we use your information',
    'Sharing information',
    'Data security',
    'Your rights',
    'Cookies & tracking',
    'Update to this privacy policy',
    'Contact us',
  ];
  return (
    <div className="w-full flex space-x-4 px-10 font-satoshi">
      <div className="w-[20%] border-r border-r-[#C4C4C480] py-8 space-y-8">
        {items.map((each) => (
          <a href={`#${each}`} className="py-8">
            <p className="text-sm cursor-pointer py-3" key={each}>
              {each}
            </p>
          </a>
        ))}
      </div>
      <div className="w-[80%] py-8 space-y-8 pl-8">
        <div className="space-y-2" id={items[0]}>
          <h1 className="text-xl font-bold">{items[0]}</h1>
          <p className="text-sm">
            Hobwise is a modern hospitality management app designed to streamline operations for hotels, restaurants, bars, lounges, clubs, and coffee shops. It
            offers features like reservations, menu management, bookings, business analytics, and customer engagement tools, making it easier for businesses to
            enhance efficiency and provide exceptional service.  Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose,
            and protect your information when you use our hospitality web app ( HOBWISE ). By accessing or using the App, you agree to the terms outlined below.
          </p>
        </div>

        <div className="space-y-2" id={items[1]}>
          <h1 className="text-xl font-bold">Information We Collect</h1>
          <div className="text-sm space-y-2.5">
            <p>We collect the following types of information: </p>
            <ul className="space-y-2.5">
              <li>
                <span className="font-medium">&#8226; Personal Information:</span> Name, email address, phone number, business details provided during account
                registration or usage.
              </li>
              <li>
                <span className="font-medium">&#8226; Usage Data:</span> Information about how you interact with the App, including IP address, device
                information, browser type, and pages viewed.
              </li>
              <li>
                <span className="font-medium">&#8226; Transactional Data:</span> Details related to reservations, menu orders, bookings, and payments processed
                through the App.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[2]}>
          <h1 className="text-xl font-bold">How We Use Your Information</h1>
          <div className="text-sm space-y-2.5">
            <p>We use your information to: </p>
            <ul className="space-y-2.5">
              <li>&#8226; Facilitate account registration, authentication, and access.</li>
              <li>&#8226; Manage bookings, reservations, menus, and other hospitality-related operations.</li>
              <li>&#8226; Process payments securely.</li>
              <li>&#8226; Provide customer support.</li>
              <li>&#8226; Send notifications about updates, features, or changes to the App.</li>
              <li>&#8226; Improve the App’s functionality and user experience.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[3]}>
          <h1 className="text-xl font-bold">Sharing Your Information</h1>
          <div className="text-sm space-y-2.5">
            <p>We do not sell or rent your personal information. However, we may share your information with: </p>
            <ul className="space-y-2.5">
              <li>
                <span className="font-medium">&#8226; Service Provider:</span> Technical support.
              </li>
              <li>
                <span className="font-medium">&#8226; Legal Authorities:</span> If required by law or to enforce our terms and policies.
              </li>
              <li>
                <span className="font-medium">&#8226; Affiliates:</span> For business operations, where applicable.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[4]}>
          <h1 className="text-xl font-bold">Data Security</h1>
          <div className="text-sm space-y-2.5">
            <p>We implement security measures to protect your information from unauthorised access, alteration, disclosure, or destruction. </p>
          </div>
        </div>

        <div className="space-y-2" id={items[5]}>
          <h1 className="text-xl font-bold">Your Rights</h1>
          <div className="text-sm space-y-2.5">
            <p>Depending on your location, you may have the following rights: </p>
            <ul className="space-y-2.5">
              <li>&#8226; Access and update your personal information.</li>
              <li>&#8226; Request deactivation of your account.</li>
              <li>&#8226; Opt-out of promotional communications</li>
            </ul>
            <p className="underline">
              To exercise these rights, contact us at{' '}
              <span>
                <a href="mailto: hello@hobwise.com" target="_blank" className="text-primaryColor underline">
                  hello@hobwise.com
                </a>
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-2" id={items[6]}>
          <h1 className="text-xl font-bold">Cookies & Tracking</h1>
          <div className="text-sm space-y-2.5">
            <p className="">
              We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings.
            </p>
          </div>
        </div>

        <div className="space-y-2" id={items[7]}>
          <h1 className="text-xl font-bold">Updates To This Privacy Policy</h1>
          <div className="text-sm space-y-2.5">
            <p className="">We may update this Privacy Policy periodically. Changes will be effective upon posting to the App.</p>
          </div>
        </div>

        <div className="space-y-2" id={items[8]}>
          <h1 className="text-xl font-bold">Contact Us</h1>
          <div className="text-sm space-y-2.5">
            <p className="">If you have questions about this Privacy Policy, contact us at:</p>
            <a href="mailto: hello@hobwise.com" target="_blank" className="text-primaryColor underline">
              hello@hobwise.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
