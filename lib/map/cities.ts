export type MapCity = {
  slug: string;
  nameUk: string;
  aliases: string[];
  /** Normalized SVG coordinates on viewBox 0 0 1000 680 */
  x: number;
  y: number;
  /** Optional oblast id for hover sync */
  oblastId?: string;
};

/** Major administrative centres projected from WGS84 onto ukraine-oblasts viewBox. */
export const MAP_CITIES: MapCity[] = [
  {
    slug: "kyiv",
    nameUk: "Київ",
    aliases: ["київ","киев","kyiv","kiev"],
    x: 467.5,
    y: 179.1,
    oblastId: "kyiv",
  },
  {
    slug: "lviv",
    nameUk: "Львів",
    aliases: ["львів","львов","lviv"],
    x: 146.8,
    y: 224.4,
    oblastId: "lviv",
  },
  {
    slug: "kharkiv",
    nameUk: "Харків",
    aliases: ["харків","харьков","kharkiv","kharkov"],
    x: 749.2,
    y: 213,
    oblastId: "kharkiv",
  },
  {
    slug: "odesa",
    nameUk: "Одеса",
    aliases: ["одеса","одесса","odesa","odessa"],
    x: 477.3,
    y: 473.5,
    oblastId: "odesa",
  },
  {
    slug: "dnipro",
    nameUk: "Дніпро",
    aliases: ["дніпро","днепр","dnipro","dnipropetrovsk","дніпропетровськ"],
    x: 690.8,
    y: 326.4,
    oblastId: "dnipro",
  },
  {
    slug: "vinnytsia",
    nameUk: "Вінниця",
    aliases: ["вінниця","винница","vinnytsia","vinnitsa"],
    x: 366,
    y: 269.4,
    oblastId: "vinnytsia",
  },
  {
    slug: "ivano-frankivsk",
    nameUk: "Івано-Франківськ",
    aliases: ["івано-франківськ","ивано-франковск","ivano-frankivsk"],
    x: 180.5,
    y: 292.5,
    oblastId: "ivano-frankivsk",
  },
  {
    slug: "zaporizhzhia",
    nameUk: "Запоріжжя",
    aliases: ["запоріжжя","запорожье","zaporizhzhia"],
    x: 695.4,
    y: 372.9,
    oblastId: "zaporizhzhia",
  },
  {
    slug: "ternopil",
    nameUk: "Тернопіль",
    aliases: ["тернопіль","тернополь","ternopil"],
    x: 224.1,
    y: 245.7,
    oblastId: "ternopil",
  },
  {
    slug: "lutsk",
    nameUk: "Луцьк",
    aliases: ["луцьк","луцк","lutsk"],
    x: 211.7,
    y: 157.1,
    oblastId: "volyn",
  },
  {
    slug: "rivne",
    nameUk: "Рівне",
    aliases: ["рівне","ровно","rivne"],
    x: 256.5,
    y: 166.5,
    oblastId: "rivne",
  },
  {
    slug: "uzhhorod",
    nameUk: "Ужгород",
    aliases: ["ужгород","uzhhorod","uzhgorod"],
    x: 61.1,
    y: 314.9,
    oblastId: "zakarpatia",
  },
  {
    slug: "chernivtsi",
    nameUk: "Чернівці",
    aliases: ["чернівці","черновцы","chernivtsi"],
    x: 241.2,
    y: 339.3,
    oblastId: "chernivtsi",
  },
  {
    slug: "khmelnytskyi",
    nameUk: "Хмельницький",
    aliases: ["хмельницький","хмельницкий","khmelnytskyi"],
    x: 292.9,
    y: 255.3,
    oblastId: "khmelnytskyi",
  },
  {
    slug: "zhytomyr",
    nameUk: "Житомир",
    aliases: ["житомир","zhytomyr"],
    x: 375.4,
    y: 193.6,
    oblastId: "zhytomyr",
  },
  {
    slug: "chernihiv",
    nameUk: "Чернігів",
    aliases: ["чернігів","чернигов","chernihiv"],
    x: 505.3,
    y: 101.4,
    oblastId: "chernihiv",
  },
  {
    slug: "sumy",
    nameUk: "Суми",
    aliases: ["суми","сумы","sumy"],
    x: 678.5,
    y: 145.2,
    oblastId: "sumy",
  },
  {
    slug: "cherkasy",
    nameUk: "Черкаси",
    aliases: ["черкаси","черкассы","cherkasy"],
    x: 543.4,
    y: 253.7,
    oblastId: "cherkasy",
  },
  {
    slug: "poltava",
    nameUk: "Полтава",
    aliases: ["полтава","poltava"],
    x: 666.3,
    y: 243.1,
    oblastId: "poltava",
  },
  {
    slug: "kropyvnytskyi",
    nameUk: "Кропивницький",
    aliases: ["кропивницький","кіровоград","кировоград","kropyvnytskyi","kirovohrad"],
    x: 553.5,
    y: 323.2,
    oblastId: "kirovohrad",
  },
  {
    slug: "mykolaiv",
    nameUk: "Миколаїв",
    aliases: ["миколаїв","николаев","mykolaiv"],
    x: 540.1,
    y: 437,
    oblastId: "mykolaiv",
  },
  {
    slug: "kherson",
    nameUk: "Херсон",
    aliases: ["херсон","kherson"],
    x: 570.8,
    y: 462.2,
    oblastId: "kherson",
  },
  {
    slug: "donetsk",
    nameUk: "Донецьк",
    aliases: ["донецьк","донецк","donetsk"],
    x: 826.9,
    y: 359.7,
    oblastId: "donetsk",
  },
  {
    slug: "luhansk",
    nameUk: "Луганськ",
    aliases: ["луганськ","луганск","luhansk"],
    x: 901.2,
    y: 318.3,
    oblastId: "luhansk",
  },
  {
    slug: "simferopol",
    nameUk: "Сімферополь",
    aliases: ["сімферополь","симферополь","simferopol"],
    x: 644.6,
    y: 587.1,
    oblastId: "crimea",
  }
];

function normalizeCityLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveCity(cityLabel: string | null | undefined): MapCity | null {
  if (!cityLabel?.trim()) return null;
  const normalized = normalizeCityLabel(cityLabel);
  return (
    MAP_CITIES.find(
      (city) =>
        city.aliases.includes(normalized) ||
        normalizeCityLabel(city.nameUk) === normalized,
    ) ?? null
  );
}

/** Map oblast polygon id → primary city for list selection. */
const OBLAST_CITY_FALLBACK: Record<string, string> = {
  "kyiv-oblast": "kyiv",
  sevastopol: "simferopol",
};

export function cityByOblastId(oblastId: string): MapCity | undefined {
  const direct = MAP_CITIES.find((city) => city.oblastId === oblastId);
  if (direct) return direct;
  const fallbackSlug = OBLAST_CITY_FALLBACK[oblastId];
  return fallbackSlug
    ? MAP_CITIES.find((city) => city.slug === fallbackSlug)
    : undefined;
}
