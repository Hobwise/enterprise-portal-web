import React from "react";

export const items: string[] = [
  'Introduction',
  'Some quick definitions',
  'Who can use this',
  'How a payment moves',
  'Getting paid',
  'What we expect from you',
  'Disputed payments and refunds',
  'Your data',
  'Pausing or ending access',
  'Where our responsibility ends',
  'Working with Paystack',
  'Staying on the right side of the law',
  'Updates to these terms',
  'Governing law',
  'Contact us',
  'By accepting, you confirm that:',
];

export function OnlinePaymentsTermsContent() {
  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-primaryColor">HOBWISE ONLINE PAYMENTS TERMS OF USE</h1>
        <p className="text-sm font-semibold">Effective date: Aug 1, 2026</p>
      </div>

      <div className="space-y-2" id={items[0]}>
        <h1 className="text-xl font-bold">{items[0]}</h1>
        <p className="text-sm leading-relaxed">
          These Terms of Use explain how the Hobwise Online Payments feature works, what we expect
          from you as a business or a merchant, and what you can expect from us. By turning on Online
          Payments for your business, you agree to everything below. If any part of this doesn't work for
          you, please don't activate the feature until we've talked it through.
        </p>
      </div>

      <div className="space-y-2" id={items[1]}>
        <h1 className="text-xl font-bold">{items[1]}</h1>
        <ul className="text-sm space-y-2.5 leading-relaxed">
          <li>&#8226; <span className="font-semibold text-primaryColor">Hobwise / we/us (Hobwise Limited):</span> The company behind this platform.</li>
          <li>&#8226; <span className="font-semibold text-primaryColor">You/merchant:</span> The business using Hobwise Online Payments to collect money from customers.</li>
          <li>&#8226; <span className="font-semibold text-primaryColor">Paystack:</span> Our licensed payment processing partner, regulated by the CBN, who actually moves the money.</li>
          <li>&#8226; <span className="font-semibold text-primaryColor">Payout account:</span> The Nigerian bank account you register to receive your money.</li>
        </ul>
      </div>

      <div className="space-y-2" id={items[2]}>
        <h1 className="text-xl font-bold">{items[2]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            The Online Payment Service is available to businesses and sole proprietors that are legally
            authorised to operate in Nigeria and are eligible to receive electronic payments.
          </p>
          <p>By activating or using this service, you confirm that:</p>
          <ul className="space-y-2.5">
            <li>&#8226; Your business is registered and operating in accordance with applicable Nigerian laws.</li>
            <li>&#8226; You hold all licences, permits, and approvals required to conduct your business and accept customer payments.</li>
            <li>&#8226; The individual enabling or managing this feature is authorised to act on behalf of the business.</li>
            <li>&#8226; The business information, contact details, and bank account information you provide are accurate, complete, and kept up to date.</li>
          </ul>
          <p>
            HobWise reserves the right to verify the information you provide at any time. Where we
            reasonably believe that any information is inaccurate, incomplete, misleading, or that you no
            longer meet the eligibility requirements, we may suspend or restrict your access to the Online
            Payment Service until the issue has been resolved.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[3]}>
        <h1 className="text-xl font-bold">{items[3]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <div className="space-y-2">
            <h2 className="font-bold text-primaryColor">a. Payment Processed Via Paystack</h2>
            <p>
              When a customer pays through the Paystack checkout, the money goes through
              Paystack, not through Hobwise. We don't touch or hold your funds at any point. To
              make this possible, Hobwise sets up a Paystack sub-account for your business using
              the bank details you give us, this happens automatically once you turn the feature on.
            </p>
            <p>Two fees come off every successful payment before it reaches you:</p>
            <ul className="space-y-2.5">
              <li>&#8226; Paystack's processing fee: Currently 1.5% of the amount, capped at ₦2,000.</li>
              <li>&#8226; Hobwise's service fee: Currently a flat ₦5 per payment, non-refundable.</li>
            </ul>
            <p className="bg-gray-50 p-4 rounded-md border border-gray-100">
              Example: For a customer payment of ₦50,000, Paystack deducts a Gateway Fee of
              ₦750 (1.5%), while HobWise deducts its ₦5 Platform Fee, leaving the merchant
              with a net settlement of ₦49,245.
            </p>
            <p className="font-semibold">Breakdown:</p>
            <ul className="space-y-2.5">
              <li>&#8226; Customer Payment: ₦50,000</li>
              <li>&#8226; Paystack Gateway Fee (1.5%): ₦750</li>
              <li>&#8226; HobWise Platform Fee: ₦5</li>
              <li>&#8226; <span className="font-bold">Net Settlement: ₦49,245</span></li>
            </ul>
          </div>
          
          <div className="space-y-2 mt-8">
            <h2 className="font-bold text-primaryColor">b. Direct Bank Transfer to your configured Bank Account</h2>
            <p>
              As an alternative to the Paystack payment gateway, HobWise allows customers to
              make payments directly to the merchant's preferred business or personal bank account
              configured on the HobWise Platform.
            </p>
            <p>
              When this payment option is selected, the customer transfers the payment directly into
              the merchant's registered bank account. Since the transaction does not pass through
              the Paystack gateway, no Paystack Gateway Fee or HobWise Platform Fee is charged.
              The merchant receives the full payment amount.
            </p>
            <p>
              The merchant is solely responsible for ensuring that the configured bank account
              details are accurate and up to date.
            </p>
            <p className="font-semibold">Breakdown:</p>
            <ul className="space-y-2.5">
              <li>&#8226; Customer Payment: ₦50,000</li>
              <li>&#8226; Paystack Gateway Fee: ₦0</li>
              <li>&#8226; HobWise Platform Fee: ₦0</li>
              <li>&#8226; <span className="font-bold">Net Settlement: ₦50,000</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-2" id={items[4]}>
        <h1 className="text-xl font-bold">{items[4]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            Paystack settles your funds to your registered bank account, usually the next business day.
            Timing can shift because of holidays, bank processing, or checks on Paystack's side, and this is
            outside our control.
          </p>
          <p>
            You can update your payout account, but only the authorised manager on your account can
            request it, and we'll send a one-time code to confirm it's really you. For your protection, payout
            details can only be changed once every 30 days, and we may briefly pause settlements while
            an update is being verified.
          </p>
          <p>
            You are responsible for making sure the account details you give us are correct. We can't
            reverse a payout that was sent correctly to the account you registered.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[5]}>
        <h1 className="text-xl font-bold">{items[5]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <ul className="space-y-2.5">
            <li>&#8226; Only request payment for real orders, for the actual order amount.</li>
            <li>&#8226; Tell customers what they owe before they pay.</li>
            <li>&#8226; Keep clear order records in case of a dispute or audit.</li>
            <li>&#8226; Only use this feature for your own registered business, not on behalf of anyone else.</li>
            <li>&#8226; Never share OTPs or login access with anyone outside your business.</li>
            <li>&#8226; Follow Nigerian law, including CBN rules on payments and anti-money-laundering regulations.</li>
          </ul>
          <p className="font-semibold italic">
            Note: If we find you're using the feature outside of these expectations, or trying to get around
            any security step, we can suspend access without warning.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[6]}>
        <h1 className="text-xl font-bold">{items[6]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            If a customer disputes a charge with their bank (a chargeback), Paystack deducts the disputed
            amount and any related fee from your balance.
          </p>
          <p>
            You're responsible for responding with evidence, order records, and receipts within the window
            Paystack sets, usually 5 business days. We'll let you know when a chargeback comes in, but
            the outcome and any loss sit with you as the merchant. A pattern of frequent chargebacks may
            lead to suspension.
          </p>
          <p>
            Refunds come out of your Paystack balance. Our ₦5 service fee on the original payment isn't
            refunded; whether Paystack refunds its own fee depends on their policy at the time.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[7]}>
        <h1 className="text-xl font-bold">{items[7]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            We keep records of your transactions and account activity to run the service, reconcile
            payments, and meet regulatory record-keeping rules, generally for at least 7 years, as Nigerian
            financial regulation requires.
          </p>
          <p>
            We only share this with Paystack, your bank, and regulators or law enforcement where the law
            requires it. Your customers' card and bank details are handled entirely by Paystack under their
            own privacy and security standards. We never see or store them. Our full Privacy Policy is at
            hobwise.com/privacy.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[8]}>
        <h1 className="text-xl font-bold">{items[8]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            We can suspend or close your access to Online Payments immediately if you breach these
            terms, your subscription lapses, we or Paystack spot suspicious activity, your chargeback rate
            gets too high, or you become subject to legal or regulatory action.
          </p>
          <p>
            If that happens, pending payment sessions are cancelled, but Paystack will still settle
            completed transactions to your last registered account, and you remain responsible for any
            disputes tied to earlier transactions.
          </p>
          <p>
            You're free to stop using the feature at any time by removing your payout account, though this
            doesn't erase obligations from before that point.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[9]}>
        <h1 className="text-xl font-bold">{items[9]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            Our total liability to you for anything related to Online Payments is capped at whatever service
            fees you've paid us over the previous 3 months.
          </p>
          <p>
            We're not responsible for lost profit or business, delays caused by Paystack, your bank, or
            NIBSS, losses from incorrect account details you provided, fraud or chargebacks on your
            transactions, or outages beyond our reasonable control. This doesn't limit responsibility for
            fraud on our part or anything the law doesn't allow us to limit.
          </p>
          <p>
            You agree to cover us for any claims, costs, or losses that come from your use of the service,
            your breach of these terms, or disputes tied to your transactions.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[10]}>
        <h1 className="text-xl font-bold">{items[10]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            Because Paystack processes transactions, your use of the service also means agreeing to
            Paystack's own terms, available at paystack.com/terms.
          </p>
          <p>
            We aren't responsible for outages or changes on Paystack's or NIBSS's side.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[11]}>
        <h1 className="text-xl font-bold">{items[11]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            You agree not to use this feature for money laundering, terrorism financing, or any other
            unlawful purpose, and to comply with applicable Nigerian laws, including the Money
            Laundering (Prevention and Prohibition) Act 2022 and the Nigeria Data Protection Act 2023.
          </p>
          <p>
            Hobwise and Paystack are legally required to report suspicious activity to the NFIU, and we
            may freeze or hold an account under investigation, or request further documents from you to
            meet these obligations.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[12]}>
        <h1 className="text-xl font-bold">{items[12]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            We may update these terms from time to time. If we do, we'll notify you by email or in-app at
            least 14 days before the change takes effect.
          </p>
          <p>
            Continuing to use the service after that means you accept the update. If you don't agree, you'll
            need to stop using Online Payments before the new terms apply.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[13]}>
        <h1 className="text-xl font-bold">{items[13]}</h1>
        <div className="text-sm space-y-4 leading-relaxed">
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria. If a disagreement
            comes up, we'll first try to resolve it directly with our support team, then through mediation if
            needed. Anything unresolved falls under the jurisdiction of the courts of Lagos State.
          </p>
        </div>
      </div>

      <div className="space-y-2" id={items[14]}>
        <h1 className="text-xl font-bold">{items[14]}</h1>
        <div className="text-sm space-y-2 leading-relaxed">
          <p><span className="font-semibold">Email:</span> hello@hobwise.com</p>
          <p><span className="font-semibold">Address:</span> Bouvardia Court, Ota Iku Street, Off Gbangbala Street, Ikate, Lekki</p>
          <p><span className="font-semibold">Phone:</span> +234 816 225 5803</p>
        </div>
      </div>

      <div className="space-y-2 pb-12" id={items[15]}>
        <h1 className="text-xl font-bold">{items[15]}</h1>
        <ul className="text-sm space-y-2.5 leading-relaxed">
          <li>&#8226; You've read and understood these terms.</li>
          <li>&#8226; You're authorised to accept them on behalf of your business.</li>
          <li>&#8226; You agree to a Paystack sub-account being created for you.</li>
          <li>&#8226; You understand how fees and payouts work.</li>
          <li>&#8226; You take responsibility for transactions made through your account.</li>
        </ul>
      </div>
    </>
  );
}
