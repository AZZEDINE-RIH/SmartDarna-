export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  isSmartTech: boolean;
  rating?: number; // facultatif, pour afficher les étoiles
  tag?: string;
}
