export type SampleTicket = {
  id: string;
  label: string;
  body: string;
};

export const samples: SampleTicket[] = [
  {
    id: "stripe",
    label: "Stripe integration",
    body: "Hi, I've been trying to connect my Stripe account for 3 days and the integration keeps failing. I'm losing sales. Please help ASAP.",
  },
  {
    id: "duplicate",
    label: "Duplicate charge",
    body: "Hello, I noticed I was charged twice for invoice INV-2041 on March 3. Could you refund the duplicate charge when you have a moment? Thank you.",
  },
  {
    id: "broken",
    label: "It's broken",
    body: "It's broken. Nothing works. Can someone look at this?",
  },
];
