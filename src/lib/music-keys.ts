export const musicalKeyOptions = [
  { value: "", label: "Seleccionar tono" },
  { value: "C Major", label: "C Major / Do Mayor" },
  { value: "C# Major / Db Major", label: "C# Major / Db Major / Do# / Reb Mayor" },
  { value: "D Major", label: "D Major / Re Mayor" },
  { value: "D# Major / Eb Major", label: "D# Major / Eb Major / Re# / Mib Mayor" },
  { value: "E Major", label: "E Major / Mi Mayor" },
  { value: "F Major", label: "F Major / Fa Mayor" },
  { value: "F# Major / Gb Major", label: "F# Major / Gb Major / Fa# / Solb Mayor" },
  { value: "G Major", label: "G Major / Sol Mayor" },
  { value: "G# Major / Ab Major", label: "G# Major / Ab Major / Sol# / Lab Mayor" },
  { value: "A Major", label: "A Major / La Mayor" },
  { value: "A# Major / Bb Major", label: "A# Major / Bb Major / La# / Sib Mayor" },
  { value: "B Major", label: "B Major / Si Mayor" },
  { value: "C Minor", label: "C Minor / Do Menor" },
  { value: "C# Minor / Db Minor", label: "C# Minor / Db Minor / Do# / Reb Menor" },
  { value: "D Minor", label: "D Minor / Re Menor" },
  { value: "D# Minor / Eb Minor", label: "D# Minor / Eb Minor / Re# / Mib Menor" },
  { value: "E Minor", label: "E Minor / Mi Menor" },
  { value: "F Minor", label: "F Minor / Fa Menor" },
  { value: "F# Minor / Gb Minor", label: "F# Minor / Gb Minor / Fa# / Solb Menor" },
  { value: "G Minor", label: "G Minor / Sol Menor" },
  { value: "G# Minor / Ab Minor", label: "G# Minor / Ab Minor / Sol# / Lab Menor" },
  { value: "A Minor", label: "A Minor / La Menor" },
  { value: "A# Minor / Bb Minor", label: "A# Minor / Bb Minor / La# / Sib Menor" },
  { value: "B Minor", label: "B Minor / Si Menor" }
] as const;

const allowed = new Set(musicalKeyOptions.map((item) => item.value));

export function normalizeMusicalKey(value?: string | null) {
  const key = value?.trim() ?? "";
  return allowed.has(key as (typeof musicalKeyOptions)[number]["value"]) ? key : "";
}
