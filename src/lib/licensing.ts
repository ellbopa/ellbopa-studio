export type LicenseKey = "basic" | "premium" | "exclusive";

export type LicenseOption = {
  key: LicenseKey;
  title: string;
  price: number;
  files: string;
  featured?: boolean;
  terms: string[];
};

type LicensableProduct = {
  price: number;
  premiumPrice?: number | null;
  exclusivePrice?: number | null;
};

export function getLicenseOptions(product: LicensableProduct): LicenseOption[] {
  const basic = Number(product.price || 0);
  const premium = Number(product.premiumPrice || 0) || Math.max(basic + 1200, Math.round(basic * 1.6));
  const exclusive = Number(product.exclusivePrice || 0) || Math.max(premium + 2500, Math.round(basic * 3));

  return [
    {
      key: "basic",
      title: "Basic License",
      price: basic,
      files: "MP3",
      terms: ["Usar para grabacion musical", "Distribuir hasta 10,000 copias", "Streaming online hasta 50,000 reproducciones"]
    },
    {
      key: "premium",
      title: "Premium License",
      price: premium,
      files: "WAV, MP3",
      terms: ["Usar para grabacion musical", "Distribuir hasta 100,000 copias", "Streaming online hasta 500,000 reproducciones", "Presentaciones en vivo con fines de lucro"]
    },
    {
      key: "exclusive",
      title: "Exclusiva / Unlimited",
      price: exclusive,
      files: "WAV, STEMS, MP3",
      featured: true,
      terms: ["Keep 100% artist royalties", "Trackouts incluidos", "Copias ilimitadas", "Streams online ilimitados", "Uso en videos musicales", "Derechos de radio y presentaciones"]
    }
  ];
}

export function findLicenseOption(product: LicensableProduct, key?: string | null) {
  const options = getLicenseOptions(product);
  return options.find((option) => option.key === key) ?? options[0];
}
