export type PayloadType = "csrf" | "xss";

export type PayloadRecord = {
  id: string;
  type: PayloadType;
  payload: string;
  tag: string | null;
  userId: string | null;
  createdAt: string;
};

const records: PayloadRecord[] = [];

export function addPayloadRecord(input: {
  type: PayloadType;
  payload: string;
  tag?: string | null;
  userId?: string | null;
}): PayloadRecord {
  const record: PayloadRecord = {
    id: crypto.randomUUID(),
    type: input.type,
    payload: input.payload,
    tag: input.tag ?? null,
    userId: input.userId ?? null,
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);
  return record;
}

export function listPayloadRecords(type: PayloadType, limit = 50): PayloadRecord[] {
  return records.filter((r) => r.type === type).slice(0, limit);
}
