export interface CountryApiResponse {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: { name: string }[];
}

export interface Country {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
}

export function mapCountryResponse(raw: CountryApiResponse): Country {
  return {
    name: raw.name,
    flag: raw.flag,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    languages: raw.languages.map((language) => language.name),
  };
}
