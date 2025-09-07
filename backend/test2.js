import axios from "axios";
import { Cheerio } from "cheerio";

(async () => {
  const url = 'https://www.cdc.gov/global-health/topics-programs/index.html';
  const diseases = {};

  try {
    const { data } = await axios.get(url);
    const $ = Cheerio.load(data);

    // Select each section with class .az-section (A-Z headings)
    $('.az-section').each((i, section) => {
      const heading = $(section).find('h2').text().trim();
      const items = [];

      // Collect list items (diseases) under each heading
      $(section).find('ul li').each((j, li) => {
        const text = $(li).text().trim();
        if (text) items.push(text);
      });

      if (heading && items.length > 0) {
        diseases[heading] = items;
      }
    });

    console.log(diseases);
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
  }
})();
