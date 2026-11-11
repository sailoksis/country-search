import { SearchController } from './searchController';
import { mapCountryResponse, type CountryApiResponse } from './mapCountryResponse';

const app = document.createElement('main');

const title = document.createElement('h1');
title.textContent = 'Country Search';

const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.placeholder = 'Enter a country name...';
searchInput.setAttribute('aria-label', 'Search countries');

const results = document.createElement('section');
results.setAttribute('aria-live', 'polite');

const controller = new SearchController((state) => {
  if (state.status === 'loading') {
    results.textContent = 'Loading...';
  }

  if (state.status === 'idle') {
    results.textContent = '';
  }

  if (state.status === 'empty') {
    results.textContent = 'No countries found.';
  }

  if (state.status === 'success') {
    results.replaceChildren();

    state.countries.forEach((raw) => {
      const country = mapCountryResponse(raw as CountryApiResponse);

      const card = document.createElement('article');

      const name = document.createElement('h2');
      name.textContent = `${country.flag} ${country.name}`;

      const capital = document.createElement('p');
      capital.textContent = `Capital: ${country.capital}`;

      const region = document.createElement('p');
      region.textContent = `Region: ${country.region}`;

      const population = document.createElement('p');
      population.textContent = `Population: ${country.population.toLocaleString()}`;

      card.append(name, capital, region, population);

      const details = document.createElement('div');
      details.hidden = true;

      const area = document.createElement('p');
      area.textContent = `Area: ${country.area ?? 'Unknown'} km²`;
      const languages = document.createElement('p');
      languages.textContent = `Languages: ${country.languages.join(', ')}`;

      const currencies = document.createElement('p');
      currencies.textContent = `Currencies: ${country.currencies?.join(', ') ?? 'Unknown'}`;

      const borders = document.createElement('p');
      borders.textContent = `Borders: ${country.borders?.join(', ') || 'None'}`;

      const description = document.createElement('p');
      description.textContent = `${country.name} is a country in ${country.subregion ?? country.region}.`;

      details.append(description, area, languages, currencies, borders);
      card.append(details);

      card.addEventListener('click', () => {
        details.hidden = !details.hidden;
      });

      results.append(card);
    });
  }

  if (state.status === 'error') {
    results.replaceChildren();

    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Something went wrong. Please try again.';

    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.textContent = 'Retry';

    retryButton.addEventListener('click', () => {
      controller.setQuery(searchInput.value);
    });

    results.append(errorMessage, retryButton);
  }
});

searchInput.addEventListener('input', () => {
  results.replaceChildren();
  controller.setQuery(searchInput.value);
});

app.append(title, searchInput, results);
document.body.append(app);
