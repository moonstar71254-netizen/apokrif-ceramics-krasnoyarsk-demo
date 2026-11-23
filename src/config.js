const DEFAULT_CONFIG = {
  brand: 'Апокриф',
  subtitle: 'мастерская керамики и фарфора',
  master: 'Екатерина Замкова',
  dog: 'Шлёпа',
  city: 'Красноярск',
  addressShort: 'ул. Ломоносова, 50/1, 2 этаж',
  addressFull: 'Красноярск, ул. Ломоносова, 50/1, 2 этаж',
  landmark: 'Железнодорожный район, 2 мин от ост. «Вагонное депо»',
  hours: 'по предварительной записи, с 10:00',
  rating: '5.0 ★',
  reviewsNote: '10 оценок, 9 отзывов на 2ГИС',
  phoneDisplay: '+7 (913) 108-08-35',
  whatsappUrl: 'https://wa.me/79131080835',
  telegramUrl: 'https://t.me/+79131080835',
  telegramChannelUrl: 'https://t.me/ezamkova',
  telegramChannelLabel: '@ezamkova',
  vkUrl: 'https://vk.ru/ezamkova',
  giftNote: 'Подарочный сертификат на лепку или фарфор — оформим в переписке',
  formats: [
    {
      num: '01',
      title: 'Индивидуальный МК по лепке',
      status: 'По записи',
      note: 'Спокойный темп без спешки, подходит с нуля',
      focus: 'wheel-amphora',
    },
    {
      num: '02',
      title: 'Парный и камерный МК',
      status: 'По записи',
      note: 'Лепка кружек и тарелок вдвоём или мини-компанией',
      focus: 'piala-duet',
    },
    {
      num: '03',
      title: 'Выездной мастер-класс',
      status: 'По записи',
      note: 'Камерная лепка на вашей площадке, как в Дивнолесье',
      focus: 'collection',
    },
    {
      num: '04',
      title: 'Авторская керамика и фарфор',
      status: 'В наличии',
      note: 'Готовые кружки, тарелки и вазы ручной работы',
      focus: 'mug-plate',
    },
    {
      num: '05',
      title: 'Керамические пуговицы и брелоки',
      status: 'В наличии',
      note: 'Миниатюры для творчества и брелоки из бусин',
      focus: 'buttons-fan',
    },
    {
      num: '06',
      title: 'Изделие на заказ',
      status: 'Под заказ',
      note: 'По вашей идее с советами по уходу за керамикой',
      focus: 'collection-orbit',
    },
  ],
};

export function getSiteConfig() {
  if (typeof window !== 'undefined' && window.APOKRIF_CONFIG) {
    return {
      ...DEFAULT_CONFIG,
      ...window.APOKRIF_CONFIG,
      formats:
        Array.isArray(window.APOKRIF_CONFIG.formats) && window.APOKRIF_CONFIG.formats.length > 0
          ? window.APOKRIF_CONFIG.formats
          : DEFAULT_CONFIG.formats,
    };
  }
  return DEFAULT_CONFIG;
}

export function buildWhatsappLink(baseUrl, message) {
  const cleanBase = (baseUrl || DEFAULT_CONFIG.whatsappUrl).replace(/\?.*$/, '');
  if (!message) return cleanBase;
  return `${cleanBase}?text=${encodeURIComponent(message)}`;
}
