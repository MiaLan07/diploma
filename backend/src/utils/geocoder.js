const geocodeAddress = async (address) => {
  if (!address) return { latitude: null, longitude: null };

  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?` +
      new URLSearchParams({
        apikey: process.env.YANDEX_GEOCODER_API_KEY,
        geocode: address,
        format: 'json',
        lang: 'ru_RU',
        results: '5',          // берём до 5 вариантов
        kind: 'house',         // просим именно дома (не улицу/район)
      });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoder HTTP ${res.status}`);

    const data = await res.json();
    const members = data.response.GeoObjectCollection.featureMember;

    if (members?.length > 0) {
      // Берём первый с самым высоким precision (если есть)
      const best = members
        .map(m => m.GeoObject)
        .sort((a, b) => {
          const pa = a.metaDataProperty?.GeocoderMetaData?.precision || 'other';
          const pb = b.metaDataProperty?.GeocoderMetaData?.precision || 'other';
          const order = ['exact', 'number', 'street', 'district', 'other'];
          return order.indexOf(pa) - order.indexOf(pb);
        })[0];

      const point = best.Point.pos;
      const [lng, lat] = point.split(' ').map(Number);

      const precision = best.metaDataProperty.GeocoderMetaData.precision;
      console.log(`Геокодирование: ${address} → [${lng}, ${lat}] (точность: ${precision})`);

      return { latitude: lat, longitude: lng, precision };
    }

    return { latitude: null, longitude: null };
  } catch (err) {
    console.error('Geocoder error:', err);
    return { latitude: null, longitude: null };
  }
};