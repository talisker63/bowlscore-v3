export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TCaJPhsB5CqJa2',
    priceId: 'price_1SGB8fDconJ5fBaNmUVyvk3E',
    name: 'Bowlscore (Annual)',
    description: 'Full access to all Premium Drills and the Premium Scorecard. Features include saving session or score history, emailing session details and more.',
    price: 25.00,
    currency: 'aud',
    currencySymbol: 'A$',
    mode: 'subscription'
  },
  {
    id: 'prod_TCaIkuWekC0rZM',
    priceId: 'price_1SGB85DconJ5fBaN1jh1Js16',
    name: 'Bowlscore (Monthly)',
    description: 'Full access to all Premium Drills and the Premium Scorecard. Features include saving session or score history, emailing session details and more.',
    price: 3.00,
    currency: 'aud',
    currencySymbol: 'A$',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};