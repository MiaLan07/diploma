// backend/utils/geocoder.js
const geocodeAddress = async (address) => {
  if (!address?.trim()) {
    console.warn('Geocode: адрес пустой или не указан');
    return { latitude: null, longitude: null, precision: 'none' };
  }

  try {
    const apiKey = process.env.YANDEX_GEOCODER_API_KEY;
    if (!apiKey) {
      console.error('YANDEX_GEOCODER_API_KEY не задан в .env');
      return { latitude: null, longitude: null, precision: 'error' };
    }

    const url = `https://geocode-maps.yandex.ru/1.x/?${new URLSearchParams({
      apikey: apiKey,
      geocode: address.trim(),
      format: 'json',
      lang: 'ru_RU',
      results: '10',          // больше вариантов — больше шансов на точный
      kind: 'house',          // приоритет — дома/здания
    })}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoder HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const collection = data.response?.GeoObjectCollection;

    if (!collection || collection.metaDataProperty.GeocoderResponseMetaData.found === '0') {
      console.warn(`Geocode: ничего не найдено для "${address}"`);
      return { latitude: null, longitude: null, precision: 'not_found' };
    }

    const members = collection.featureMember || [];

    // Сортировка по точности (лучшие значения precision по документации Яндекса 2025–2026)
    // Порядок от самого точного к менее точному:
    const precisionOrder = [
      'exact',       // точный адрес (дом, строение)
      'number',      // номер дома
      'near',        // рядом с домом
      'street',      // улица
      'district',    // район
      'locality',    // населённый пункт
      'other',       // всё остальное
    ];

    const best = members
      .map(m => m.GeoObject)
      .filter(geo => geo?.Point?.pos) // только с координатами
      .sort((a, b) => {
        const pa = a.metaDataProperty?.GeocoderMetaData?.precision || 'other';
        const pb = b.metaDataProperty?.GeocoderMetaData?.precision || 'other';
        return precisionOrder.indexOf(pa) - precisionOrder.indexOf(pb);
      })[0];

    if (!best) {
      console.warn(`Geocode: нет подходящих результатов с координатами для "${address}"`);
      return { latitude: null, longitude: null, precision: 'no_coords' };
    }

    const [lng, lat] = best.Point.pos.split(' ').map(Number);
    const precision = best.metaDataProperty.GeocoderMetaData.precision;

    console.log(
      `Геокодирование "${address}" → lat: ${lat}, lng: ${lng} ` +
      `(точность: ${precision}, найденных вариантов: ${members.length})`
    );

    return { latitude: lat, longitude: lng, precision };
  } catch (err) {
    console.error(`Geocode error для "${address}":`, err.message);
    return { latitude: null, longitude: null, precision: 'error' };
  }
};

module.exports = { geocodeAddress };