export interface CountryApiResponse {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: { name: string }[];
  flagImage?: string;
  flags?: {
    svg: string;
    png: string;
  };

  area?: number;
  borders?: string[];
  currencies?: {
    code: string;
    name: string;
    symbol: string;
  }[];
  subregion?: string;
}

export interface Country {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
  flagImage?: string;

  area?: number;
  borders?: string[];
  currencies?: string[];
  subregion?: string;
}

export function mapCountryResponse(raw: CountryApiResponse): Country {
  return {
    name: raw.name,
    flag: raw.flag,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    languages: raw.languages.map((language) => language.name),
    area: raw.area,
    borders: raw.borders,
    currencies: raw.currencies?.map((currency) => currency.name),
    subregion: raw.subregion,
    flagImage: raw.flags?.svg,
  };
}
