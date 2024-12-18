export default function TermsOfUse() {
  const items: string[] = [
    'Welcome to Hobwise',
    'Acceptance of Terms',
    'Eligibility',
    'Permitted Use',
    'Prohibited Conduct',
    'Fees and Payments',
    'Intellectual Property',
    'Limitation of Liability',
    'Termination',
    'Changes to Terms',
    'Contact Us',
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
      <div className="w-[80%] pt-8 space-y-8 pl-8">
        <div className="space-y-2" id={items[0]}>
          <h1 className="text-xl font-bold">{items[0]}</h1>
          <p className="text-sm">
            These Terms of Use govern your access to and use of our hospitality web app. By using the Hobwise, you agree to these Terms.
          </p>
        </div>

        <div className="space-y-2" id={items[1]}>
          <h1 className="text-xl font-bold">{items[1]}</h1>
          <div className="text-sm space-y-2.5">
            <p>By creating an account or using the App, you agree to comply with these Terms and our Privacy Policy.</p>
          </div>
        </div>

        <div className="space-y-2" id={items[2]}>
          <h1 className="text-xl font-bold">{items[2]}</h1>
          <div className="text-sm space-y-2.5">
            <p>You must be at least 18 years old or the age of majority in your jurisdiction to use the App. </p>
            <p>You are responsible for:</p>
            <ul className="space-y-2.5">
              <li>&#8226; Maintaining the confidentiality of your account credentials.</li>
              <li>&#8226; All activities under your account.</li>
              <li>&#8226; Providing accurate and up-to-date information</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[3]}>
          <h1 className="text-xl font-bold">{items[3]}</h1>
          <div className="text-sm space-y-2.5">
            <p>
              The App may only be used to manage hospitality operations, such as hotel bookings, menu management, and reservations. Any unauthorised use, such
              as fraudulent activity, is prohibited.
            </p>
          </div>
        </div>

        <div className="space-y-2" id={items[4]}>
          <h1 className="text-xl font-bold">{items[4]}</h1>
          <div className="text-sm space-y-2.5">
            <p>You agree not to: </p>

            <ul className="space-y-2.5">
              <li>&#8226; Misuse or disrupt the App’s functionality.</li>
              <li>&#8226; Attempt to gain unauthorised access to other accounts.</li>
              <li>&#8226; Use the App for illegal or harmful activities.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[5]}>
          <h1 className="text-xl font-bold">{items[5]}</h1>
          <div className="text-sm space-y-2.5">
            <p>
              If your use of the App involves fees, you agree to pay all applicable charges. Failure to pay may result in account suspension or termination.{' '}
            </p>
          </div>
        </div>

        <div className="space-y-2" id={items[6]}>
          <h1 className="text-xl font-bold">{items[6]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">
              All content, trademarks, and materials provided through the App are owned by Hobwise. You may not copy, distribute, or exploit them without prior
              permission.
            </p>
          </div>
        </div>

        <div className="space-y-2" id={items[7]}>
          <h1 className="text-xl font-bold">{items[7]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">Hobwise is not responsible for:</p>

            <ul className="space-y-2.5">
              <li>&#8226; Losses caused by unauthorised access to your account.</li>
              <li>&#8226; Interruptions or errors in the App.</li>
              <li>&#8226; Issues resulting from third-party services.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2" id={items[8]}>
          <h1 className="text-xl font-bold">{items[8]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">We reserve the right to suspend or terminate your account if you violate these Terms.</p>
          </div>
        </div>

        <div className="space-y-2" id={items[9]}>
          <h1 className="text-xl font-bold">{items[9]}</h1>
          <div className="text-sm space-y-2.5">
            <p className="">For questions or concerns about these Terms, contact us at:</p>
            <a href="mailto: hello@hobwise.com" target="_blank" className="text-primaryColor underline">
              hello@hobwise.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
