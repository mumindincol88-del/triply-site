exports.handler = async (event) => {
  // Netlify otomatik olarak ziyaretçinin ülkesini header'a ekler
  const country = event.headers['x-country'] || '';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country, lang: country === 'TR' ? 'tr' : 'en' })
  };
};
