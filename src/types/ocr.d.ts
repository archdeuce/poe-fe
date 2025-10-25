export interface GemProperty {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface GemItem {
  properties?: GemProperty[];
  // Добавьте другие свойства, если они есть в item
}

export interface GemListing {
  price: {
    amount: number;
    currency: string;
  };
  indexed: string;
  // Добавьте другие свойства, если они есть в listing
}

export interface GemDetailsData {
  listing: GemListing;
  item: GemItem;
}
