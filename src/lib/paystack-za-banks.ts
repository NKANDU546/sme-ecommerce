import type { PaystackBank } from "@/types/payments";

/**
 * South Africa banks for Paystack payouts (MVP).
 * Codes are SA universal branch codes commonly accepted for electronic payouts.
 * Selecting a bank in Settings stores this `code` as `payoutBankCode`.
 */
export const PAYSTACK_ZA_BANKS: PaystackBank[] = [
  { name: "ABSA", code: "632005", country: "ZA", currency: "ZAR" },
  { name: "Capitec Bank", code: "470010", country: "ZA", currency: "ZAR" },
  { name: "Discovery Bank", code: "679000", country: "ZA", currency: "ZAR" },
  { name: "FNB", code: "250655", country: "ZA", currency: "ZAR" },
  { name: "Investec", code: "580105", country: "ZA", currency: "ZAR" },
  { name: "Nedbank", code: "198765", country: "ZA", currency: "ZAR" },
  { name: "Standard Bank", code: "051001", country: "ZA", currency: "ZAR" },
  { name: "TymeBank", code: "678910", country: "ZA", currency: "ZAR" },
];

export const PAYSTACK_PAYOUT_COUNTRY = "ZA";
