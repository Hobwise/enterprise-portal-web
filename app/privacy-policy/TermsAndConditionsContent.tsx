import React from "react";

export const termsItems: string[] = [
  "Welcome to Hobwise",
  "Acceptance of Terms",
  "Eligibility",
  "Permitted Use",
  "Prohibited Conduct",
  "Fees and Payments",
  "Intellectual Property",
  "Limitation of Liability",
  "Termination",
  "Changes to Terms",
];

export function TermsAndConditionsContent() {
  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-primaryColor">
          HOBWISE TERMS OF USE
        </h1>
      </div>

      <div className="space-y-2" id={termsItems[0]}>
        <h1 className="text-xl font-bold">{termsItems[0]}</h1>
        <p className="text-sm leading-relaxed">
          These Terms of Use govern your access to and use of our hospitality
          web app. By using the Hobwise, you agree to these Terms.
        </p>
      </div>

      <div className="space-y-2" id={termsItems[1]}>
        <h1 className="text-xl font-bold">{termsItems[1]}</h1>
        <p className="text-sm leading-relaxed">
          By creating an account or using the App, you agree to comply with
          these Terms and our Privacy Policy.
        </p>
      </div>

      <div className="space-y-2" id={termsItems[2]}>
        <h1 className="text-xl font-bold">{termsItems[2]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            You must be at least 18 years old or the age of majority in your
            jurisdiction to use the App.
          </p>
          <p>You are responsible for:</p>
          <ul className="space-y-2.5">
            <li>&#8226; Maintaining the confidentiality of your account credentials.</li>
            <li>&#8226; All activities under your account.</li>
            <li>&#8226; Providing accurate and up-to-date information.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2" id={termsItems[3]}>
        <h1 className="text-xl font-bold">{termsItems[3]}</h1>
        <p className="text-sm leading-relaxed">
          The App may only be used to manage hospitality operations, such as
          hotel bookings, menu management, and reservations. Any unauthorised
          use, such as fraudulent activity, is prohibited.
        </p>
      </div>

      <div className="space-y-2" id={termsItems[4]}>
        <h1 className="text-xl font-bold">{termsItems[4]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>You agree not to:</p>
          <ul className="space-y-2.5">
            <li>&#8226; Misuse or disrupt the App&apos;s functionality.</li>
            <li>&#8226; Attempt to gain unauthorised access to other accounts.</li>
            <li>&#8226; Use the App for illegal or harmful activities.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2" id={termsItems[5]}>
        <h1 className="text-xl font-bold">{termsItems[5]}</h1>
        <p className="text-sm leading-relaxed">
          If your use of the App involves fees, you agree to pay all applicable
          charges. Failure to pay may result in account suspension or
          termination.
        </p>
      </div>

      <div className="space-y-2" id={termsItems[6]}>
        <h1 className="text-xl font-bold">{termsItems[6]}</h1>
        <p className="text-sm leading-relaxed">
          All content, trademarks, and materials provided through the App are
          owned by Hobwise. You may not copy, distribute, or exploit them
          without prior permission.
        </p>
      </div>

      <div className="space-y-2" id={termsItems[7]}>
        <h1 className="text-xl font-bold">{termsItems[7]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>Hobwise is not responsible for:</p>
          <ul className="space-y-2.5">
            <li>&#8226; Losses caused by unauthorised access to your account.</li>
            <li>&#8226; Interruptions or errors in the App.</li>
            <li>&#8226; Issues resulting from third-party services.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2" id={termsItems[8]}>
        <h1 className="text-xl font-bold">{termsItems[8]}</h1>
        <p className="text-sm leading-relaxed">
          We reserve the right to suspend or terminate your account if you
          violate these Terms.
        </p>
      </div>

      <div className="space-y-2 pb-4" id={termsItems[9]}>
        <h1 className="text-xl font-bold">{termsItems[9]}</h1>
        <p className="text-sm leading-relaxed">
          For questions or concerns about these Terms, contact us at:{" "}
          <a
            href="mailto:hello@hobwise.com"
            className="font-medium text-primaryColor hover:underline"
          >
            hello@hobwise.com
          </a>
        </p>
      </div>
    </>
  );
}
