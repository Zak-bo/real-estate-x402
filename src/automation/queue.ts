export interface PropertyQueueItem {
  address: string;
  purchase_price?: number;
  condition: "poor" | "fair" | "average" | "good" | "excellent";
}

export const PROPERTY_QUEUE: PropertyQueueItem[] = [
  {
    address: "3614 Russell Ave N, Minneapolis, MN 55412",
    purchase_price: 175000,
    condition: "average",
  },
];
