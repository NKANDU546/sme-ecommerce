import {
  connectPaystackSubaccount,
  getPaymentSettings,
  initializeOrderPayment,
  listPaystackBanks,
  updatePaymentSettings,
} from "@/apis/payments";
import {
  STORE_SLUG,
  errorEnvelope,
  jsonResponse,
  successEnvelope,
} from "@/apis/__tests__/test-helpers";

const WORKSPACE_ID = "ws_1";
const TOKEN = "token";

const mockSettings = {
  payoutBusinessName: "Bridge Labs",
  payoutBankCode: "058",
  payoutAccountNumber: "0123456789",
  payoutAccountName: null,
  paystackSubaccountCode: null,
  paystackSubaccountStatus: "not_connected" as const,
  platformFeePercent: null,
  publicKey: "pk_test_x",
};

describe("payments API", () => {
  const fetchMock = jest.fn<
    Promise<Response>,
    [RequestInfo | URL, RequestInit?]
  >();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("GETs payment settings", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(successEnvelope(mockSettings)),
    );
    const result = await getPaymentSettings(WORKSPACE_ID, TOKEN);
    expect(result).toEqual({ ok: true, data: mockSettings });
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      `/workspaces/${WORKSPACE_ID}/payments/settings`,
    );
  });

  it("PUTs payment settings", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(successEnvelope(mockSettings)),
    );
    const result = await updatePaymentSettings(WORKSPACE_ID, TOKEN, {
      payoutBusinessName: "Bridge Labs",
      payoutBankCode: "058",
      payoutAccountNumber: "0123456789",
    });
    expect(result.ok).toBe(true);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PUT");
  });

  it("POSTs connect", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        successEnvelope({
          ...mockSettings,
          paystackSubaccountCode: "ACCT_1",
          paystackSubaccountStatus: "active",
        }),
      ),
    );
    const result = await connectPaystackSubaccount(WORKSPACE_ID, TOKEN);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.paystackSubaccountStatus).toBe("active");
    }
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });

  it("lists banks", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(successEnvelope([{ name: "Test Bank", code: "058" }])),
    );
    const result = await listPaystackBanks(TOKEN, "ZA");
    expect(result).toEqual({
      ok: true,
      data: [{ name: "Test Bank", code: "058" }],
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/payments/paystack/banks?country=ZA",
    );
  });

  it("unwraps nested banks payloads", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(successEnvelope({ banks: [{ name: "GTBank", code: "058" }] })),
    );
    const result = await listPaystackBanks(TOKEN, "NG");
    expect(result).toEqual({
      ok: true,
      data: [{ name: "GTBank", code: "058" }],
    });
  });

  it("initializes public order payment", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        successEnvelope({
          authorizationUrl: "https://checkout.paystack.com/x",
          accessCode: "code",
          reference: "ref_1",
          publicKey: "pk_test_x",
        }),
      ),
    );
    const result = await initializeOrderPayment(STORE_SLUG, "order_1", {
      callbackUrl: "http://localhost:3000/s/demo/order/order_1",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.authorizationUrl).toContain("paystack");
    }
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      `/public/storefronts/${STORE_SLUG}/checkout/order_1/pay`,
    );
    expect(fetchMock.mock.calls[0][1]?.body).toContain("callbackUrl");
  });

  it("returns API error from pay init", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        errorEnvelope("PAYMENT_NOT_CONFIGURED", "Connect payments first"),
        400,
      ),
    );
    const result = await initializeOrderPayment(STORE_SLUG, "order_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorCode).toBe("PAYMENT_NOT_CONFIGURED");
    }
  });
});
