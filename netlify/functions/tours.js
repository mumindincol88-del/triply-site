exports.handler = async function(event, context) {
  const city = event.queryStringParameters?.city || 'd585';
  const lang = event.queryStringParameters?.lang || 'en';
  
  const VIATOR_KEY = 'f4dda2f4-998e-44a3-a085-52ce8f4ada6f';
  const PARTNER_ID = 'P00299057';

  try {
    const response = await fetch('https://api.viator.com/partner/products/search', {
      method: 'POST',
      headers: {
        'exp-api-key': VIATOR_KEY,
        'Accept-Language': lang,
        'Content-Type': 'application/json',
        'Accept': 'application/json;version=2.0'
      },
      body: JSON.stringify({
        filtering: {
          destination: city,
          rating: { minimum: 4 }
        },
        sorting: { sort: 'TRAVELER_RATING', order: 'DESC' },
        pagination: { start: 1, count: 6 },
        currency: 'EUR'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: data.message || 'API error' })
      };
    }

    const tours = (data.products || []).map(t => ({
      title: t.title,
      rating: t.reviews?.combinedAverageRating || null,
      reviewCount: t.reviews?.totalReviews || 0,
      price: t.pricing?.summary?.fromPrice || null,
      image: t.images?.[0]?.variants?.find(v => v.width >= 400)?.url || null,
      url: t.productUrl ? t.productUrl + '?pid=' + PARTNER_ID : null,
      duration: t.duration?.fixedDurationInMinutes 
        ? Math.round(t.duration.fixedDurationInMinutes / 60) + ' saat'
        : null
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify({ tours, city, count: tours.length })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
