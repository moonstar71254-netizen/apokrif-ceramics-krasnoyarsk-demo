Апокриф — 3D WebGL-сайт мастерской керамики и фарфора (Красноярск)

Стек: React 18, Three.js (@react-three/fiber + @react-three/drei), GSAP + Observer, Vite.

Что внутри:
- 5 сцен с поэлементными GSAP-переходами и 3D-композицией (амфора + пиала без коллизий)
- Процедурные PBR-текстуры 1024x1024 (Тёмный шамот, Молочный фарфор, Медная печь)
- Интерактивное переключение глазурей (600ms) и drag-to-rotate амфоры на 3-й сцене
- Контакты и форматы вынесены в public/site-config.js (можно менять без пересборки)

Локальный запуск:
  npm install
  npm run dev

Сборка:
  npm run build                                 -> dist/
  npx vite build --config vite.ghpages.config.js -> dist-ghpages/

Данные мастерской:
  Красноярск, ул. Ломоносова, 50/1, 2 этаж · с 10:00 по записи
  WhatsApp: +7 (913) 108-08-35 · Telegram: @ezamkova · VK: vk.ru/ezamkova
