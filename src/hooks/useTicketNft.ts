export interface MintResult {
  txHash: `0x${string}`;
  ticketId: bigint;
}

export function useTicketNft() {
  async function mint(eventId: bigint, metadataHash: `0x${string}`): Promise<MintResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    void eventId;
    void metadataHash;
    return { txHash: "0xmockhash", ticketId:  1n};
  }

  return { mint };
}