---
name: maysoulme-guide
description: Создаёт HTML-гайд/статью в фирменном стиле maysoulme (белый фон, Libre Baskerville + Inter, бордовые акценты)
---

# Скилл: Оформление текста в фирменный гайд maysoulme

Когда пользователь просит оформить текст как гайд, статью или обучающий материал — создай HTML-страницу в фирменном стиле maysoulme.

## Бренд-стиль

### Цвета
- Фон: `#ffffff` (белый)
- Текст: `#1a1a1a` (почти чёрный)
- Текст второстепенный: `#444`, `#666`
- Акцент (бордовый): `#710C04` — используется для: курсивных выделений в заголовках, нумерации, точек в списках, бейджей, заголовка промт-блока
- Серые блоки: `#f5f5f5` — без закруглений, без цветных линий слева
- Карточки: `#f9f9f9` с рамкой `#e8e8e8` — квадратные углы
- Советы внутри карточек: `#f0f0f0` — квадратные углы

### Шрифты (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800&family=DM+Sans:ital@1&display=swap" rel="stylesheet">
```
- **Заголовки**: `Libre Baskerville`, Georgia, serif — жирный, с курсивными акцентами бордовым цветом
- **Основной текст**: `Inter`, sans-serif — 17px, line-height 1.75
- **Подзаголовки**: `Libre Baskerville` — 22px, жирный
- **Нумерация**: `Libre Baskerville` — курсив, бордовый цвет

### Логотип
- Файл: `logo-ms.png` (копировать из `~/Desktop/клод/logo.png` в папку проекта)
- В навбаре слева: `<img src="logo-ms.png" alt="MS">` высота 30px

### Навбар
- Sticky, белый фон, тонкая линия снизу `#f0f0f0`
- Логотип MS **слева**, текст *maysoulme* **справа** (DM Sans, italic, `#888`)
- `justify-content: space-between` — логотип и ник на разных краях

### Бейдж
- Тонкая рамка 1px бордовая, текст капсом с разрядкой, размер 11px
- Текст бейджа зависит от контента: «ГАЙД», «УРОК», «СТАТЬЯ», «МАТЕРИАЛ»

## Структура страницы

```
1. Навбар (sticky): логотип MS слева, maysoulme справа
2. Hero: бейдж + заголовок h1 (с курсивным акцентом) + описание + мета-инфо
3. Intro: жирный тезис + обычный текст
4. Секции (01. 02. 03...): заголовок с нумерацией + контент
5. Внутри секций:
   - Серые блоки .highlight — для ключевых определений
   - Списки .guide-list — с бордовыми точками
   - Промт-блоки .prompt-box — серый фон, заголовок бордовый
   - Нумерованные списки .headline-list — курсивная нумерация
   - Карточки .scenario-card — для сценариев/кейсов/уроков
6. Футер: © год · maysoulme · Все права защищены
```

## Правила оформления

1. **Заголовки секций**: `<h2>` с нумерацией `<span>01.</span>` (бордовый) + курсивное слово `<em>` (бордовый)
2. **Подзаголовки**: `<h3>` в Libre Baskerville
3. **Серые блоки**: только `background: #f5f5f5` — БЕЗ закруглений, БЕЗ цветных линий слева
4. **Карточки**: квадратные углы, рамка `#e8e8e8`, фон `#f9f9f9`
5. **Советы**: фон `#f0f0f0`, квадратные углы, слово «Совет:» бордовым
6. **Промт-блоки**: светло-серый фон `#f5f5f5` (НЕ тёмный), заголовок бордовым
7. **На тёмном фоне НИКОГДА не использовать бордовый** — он не читается. Вместо него `#c9a07a`
8. **Адаптивность**: контейнер 740px, на мобильных — уменьшать шрифты
9. **Claude и Reels** — слова «клод» и «рилс» ВСЕГДА пишутся на английском: **Claude** и **Reels**. Никогда не писать кириллицей.

## Как использовать

1. Получи текст от пользователя
2. Разбей на логические секции с нумерацией 01, 02, 03...
3. Определи тип контента: списки → `.guide-list`, определения → `.highlight`, пошаговые инструкции → карточки `.scenario-card`, промты → `.prompt-box`
4. Скопируй `logo-ms.png` из `~/.claude/brand/` в папку проекта
5. Собери HTML по шаблону выше
6. Предложи опубликовать на GitHub Pages

## Полный CSS (копировать целиком)

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
:root { --accent: #710C04; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 17px;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 48px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
}
.nav__logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}
.nav__logo img { height: 30px; width: auto; }
.nav__logo-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  color: #888;
  letter-spacing: 0.5px;
}

.container { max-width: 740px; margin: 0 auto; padding: 0 24px; }

.hero { padding: 60px 0 48px; }
.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 5px 16px;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.hero h1 {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 16px;
}
.hero h1 em { font-style: italic; color: var(--accent); }
.hero__desc { font-size: 18px; color: #666; line-height: 1.7; }
.hero__meta { font-size: 14px; color: #999; margin-top: 16px; letter-spacing: 1px; }

.intro-bold {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.65;
  color: #1a1a1a;
  padding: 40px 0 16px;
}
.intro-text {
  font-size: 17px;
  color: #444;
  line-height: 1.75;
  padding-bottom: 48px;
}

.section-heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  padding: 56px 0 24px;
  border-top: 1px solid #e8e8e8;
}
.section-heading span { color: var(--accent); margin-right: 8px; }
.section-heading em { font-style: italic; color: var(--accent); }

.highlight {
  background: #f5f5f5;
  padding: 20px 24px;
  margin: 24px 0;
  font-size: 16px;
  line-height: 1.75;
  color: #444;
}

.sub-heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  padding: 36px 0 16px;
}

.text { font-size: 17px; color: #444; line-height: 1.75; margin-bottom: 16px; }

.guide-list { list-style: none; margin: 16px 0 24px; }
.guide-list li {
  font-size: 16px; line-height: 1.75; color: #444;
  padding: 8px 0 8px 20px; position: relative;
  border-bottom: 1px solid #f0f0f0;
}
.guide-list li:last-child { border-bottom: none; }
.guide-list li::before {
  content: ''; position: absolute; left: 0; top: 16px;
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
}
.guide-list li strong { color: #1a1a1a; }

.prompt-box {
  background: #f5f5f5;
  padding: 36px;
  margin: 32px 0;
}
.prompt-box__title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 20px; font-weight: 700;
  color: var(--accent);
  margin-bottom: 6px;
}
.prompt-box__subtitle { font-size: 13px; color: #888; margin-bottom: 20px; }
.prompt-box__text { font-size: 15px; line-height: 1.8; color: #444; }

.headline-list { list-style: none; margin: 16px 0 32px; }
.headline-list li {
  display: flex; gap: 16px; padding: 16px 0;
  border-bottom: 1px solid #f0f0f0; align-items: baseline;
}
.headline-list li:first-child { border-top: 1px solid #f0f0f0; }
.headline-num {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-style: italic; font-size: 15px;
  color: var(--accent); min-width: 28px; flex-shrink: 0;
}
.headline-text { font-size: 17px; line-height: 1.6; color: #1a1a1a; font-weight: 500; }

.scenario-card {
  border: 1px solid #e8e8e8;
  padding: 32px; margin: 24px 0; background: #f9f9f9;
}
.scenario-card__num {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-style: italic; font-size: 14px;
  color: var(--accent); letter-spacing: 1px; margin-bottom: 8px;
}
.scenario-card__title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 20px; font-weight: 700; line-height: 1.4; margin-bottom: 20px;
}
.scenario-card__point { margin-bottom: 14px; }
.scenario-card__point-label { font-weight: 600; font-size: 16px; color: #1a1a1a; }
.scenario-card__point-text { font-size: 15px; color: #666; line-height: 1.7; }
.scenario-card__ending {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 17px; font-style: italic; color: #1a1a1a;
  padding-top: 16px; margin-top: 16px; border-top: 1px solid #e0e0e0;
}
.scenario-card__tip {
  background: #f0f0f0; padding: 14px 18px; margin-top: 16px;
  font-size: 14px; color: #555; line-height: 1.65;
}
.scenario-card__tip strong { color: var(--accent); }

.footer {
  text-align: center; padding: 64px 24px;
  border-top: 1px solid #e8e8e8; margin-top: 64px;
  color: #999; font-size: 14px;
}
.footer .tiny {
  font-size: 12.5px; color: #bbb; max-width: 52ch;
  margin: 12px auto 0; line-height: 1.6; letter-spacing: 0;
}
.footer-note {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 18px; font-style: italic; color: #444;
  text-align: center; padding: 48px 24px 0;
}
.footer-note em { color: var(--accent); }

@media (max-width: 768px) {
  .nav { padding: 16px 20px; }
  .hero h1 { font-size: 28px; }
  .section-heading { font-size: 24px; }
  .scenario-card { padding: 20px; }
  .prompt-box { padding: 24px; }
}
```
