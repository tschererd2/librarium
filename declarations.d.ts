declare module "*.png";

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const src: string;
  export default src;
}

interface Mendable {
  initialize: () => void;
  // Add other methods or properties as needed
}

// Extend the global Window interface
declare global {
  interface Window {
    Mendable: Mendable;
  }
}
