# Скилл: Презентация maysoulme — полная ширина (для ChatGPT)

> **ЭТО ОБЯЗАТЕЛЬНЫЕ ИНСТРУКЦИИ. СЛЕДУЙ ИМ ДОСЛОВНО. НЕ ИМПРОВИЗИРУЙ.**

## Что это

Этот скилл создаёт **HTML-файл** с презентацией на всю ширину экрана — **БЕЗ пустого места справа**. Это обычные слайды, где контент занимает всю ширину. **НЕ PowerPoint. НЕ PPTX. Только HTML.**

Используй этот формат, когда пользователь просит обычную презентацию, слайды или материал **без видео**, **без места под видео**, **на полную ширину**.

> **Если нужна презентация с пустым местом справа (60/40 split для видеоуроков) — используй другой скилл: `chatgpt-presentation.md`.**

## КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА (нарушение = провал)

1. **Формат = HTML-файл.** Не PPTX, не Google Slides, не PDF. Один файл `.html` со встроенными `<style>`.
2. **Полная ширина.** Контент занимает всю ширину слайда. НИКАКОГО разделения 60/40, НИКАКОГО пустого места справа, НИКАКОГО вертикального разделителя.
3. **Каждый слайд = 100vh** (один экран на всю высоту).
4. **Навбар на КАЖДОМ слайде** — логотип MS слева, текст *maysoulme* курсивом справа. Навбар на всю ширину.
5. **Контент вертикально по центру** (используй flexbox).
6. **Квадратные углы ВЕЗДЕ** — никаких border-radius.
7. **БЕЗ нумерации** в заголовках слайдов — никаких «01.», «02.», «Слайд 1» и т.д.
8. **БЕЗ номеров страниц** — никаких «1/10» внизу.
9. **Белый фон** `#ffffff` — никаких бежевых, серых или цветных фонов для слайдов.
10. **Акцентный цвет** = `#710C04` (тёмно-бордовый). Только он.
11. **Claude и Reels** — слова «клод» и «рилс» ВСЕГДА пишутся на английском: **Claude** и **Reels**. Никогда кириллицей.

## Шрифты

Подключи через Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800&family=DM+Sans:ital@1&display=swap" rel="stylesheet">
```

- **Заголовки**: `Libre Baskerville`, Georgia, serif — жирный
- **Основной текст**: `Inter`, sans-serif — 17px
- **Ник maysoulme в навбаре**: `DM Sans`, italic, цвет `#888`
- **Декоративные цифры**: `Libre Baskerville`, italic, opacity 0.25

**Других шрифтов НЕ использовать. Никаких Playfair Display, Montserrat, Arial и т.д.**

## Логотип (ОБЯЗАТЕЛЬНО на каждом слайде)

Логотип MS лежит здесь:
```
https://maiyamaiya19999-bit.github.io/maysoulme-assets/logo-ms.png
```

Логотип должен быть в навбаре **на каждом слайде**, слева, высотой 30px.

**Для PDF-рендера в песочнице ChatGPT:**
1. **Скачай** логотип в рабочую папку: `urllib.request.urlretrieve(url, "logo-ms.png")`
2. В HTML используй **относительный путь**: `<img src="logo-ms.png" alt="MS">`
3. Либо встрой как **base64 data URI** прямо в `src`.

## Полная структура HTML-файла

Ниже — **готовый шаблон**. Копируй его целиком и заполняй слайды контентом.

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Название презентации — maysoulme</title>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800&family=DM+Sans:ital@1&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
:root { --accent: #710C04; }

@page {
  size: 1280px 720px;
  margin: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 17px;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

/* === СЛАЙД === */
.slide {
  width: 100%; height: 100vh;
  display: flex; flex-direction: column;
  page-break-after: always; position: relative;
}

/* === НАВБАР (полная ширина) === */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 48px; border-bottom: 1px solid #f0f0f0;
  background: #fff; z-index: 10; flex-shrink: 0;
}
.nav__logo { text-decoration: none; display: flex; align-items: center; }
.nav__logo img { height: 30px; width: auto; }
.nav__logo-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 400; font-style: italic;
  color: #888; letter-spacing: 0.5px; margin-right: 8px;
}

/* === ТЕЛО СЛАЙДА (контент по центру) === */
.slide__body {
  flex: 1; display: flex; align-items: center;
  justify-content: center; padding: 0 48px;
}
.slide__inner { width: 100%; max-width: 740px; }

/* === ТИТУЛЬНЫЙ СЛАЙД === */
.badge {
  display: inline-block; font-size: 11px; font-weight: 600;
  color: var(--accent); border: 1px solid var(--accent);
  padding: 5px 16px; margin-bottom: 20px;
  letter-spacing: 2px; text-transform: uppercase;
}
.hero h1 {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 42px; font-weight: 700; line-height: 1.25; margin-bottom: 16px;
}
.hero h1 em { font-style: italic; color: var(--accent); }
.hero__desc { font-size: 18px; color: #666; line-height: 1.7; }
.hero__meta { font-size: 13px; color: #999; margin-top: 16px; letter-spacing: 1px; }

/* === ЗАГОЛОВОК СЛАЙДА === */
.section-heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 32px; font-weight: 700; line-height: 1.3; padding: 0 0 24px;
}
.section-heading em { font-style: italic; color: var(--accent); }

/* === СЕРЫЙ БЛОК === */
.highlight {
  background: #f5f5f5; padding: 20px 24px; margin: 24px 0;
  font-size: 16px; line-height: 1.75; color: #444;
}
.highlight strong { color: var(--accent); }

/* === ПОДЗАГОЛОВОК === */
.sub-heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 22px; font-weight: 700; padding: 28px 0 12px;
}

/* === ТЕКСТ === */
.text { font-size: 17px; color: #444; line-height: 1.75; margin-bottom: 16px; }

/* === СПИСОК С БОРДОВЫМИ ТОЧКАМИ === */
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

/* === КАРТОЧКА === */
.scenario-card { border: 1px solid #e8e8e8; padding: 28px; margin: 20px 0; background: #f9f9f9; }
.scenario-card__num {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-style: italic; font-size: 14px;
  color: var(--accent); letter-spacing: 1px; margin-bottom: 8px;
}
.scenario-card__title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 20px; font-weight: 700; line-height: 1.4; margin-bottom: 18px;
}
.scenario-card__point { margin-bottom: 14px; }
.scenario-card__point-label { font-weight: 600; font-size: 16px; color: #1a1a1a; }
.scenario-card__point-text { font-size: 15px; color: #666; line-height: 1.7; }
.scenario-card__tip {
  background: #f0f0f0; padding: 14px 18px; margin-top: 16px;
  font-size: 14px; color: #555; line-height: 1.65;
}
.scenario-card__tip strong { color: var(--accent); }

/* === ФИНАЛЬНАЯ ФРАЗА === */
.footer-note {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 20px; font-style: italic; color: #444;
  text-align: center; padding: 28px 0 0;
}
.footer-note em { color: var(--accent); }

/* ===== СХЕМКА 1: ЦИТАТА-АКЦЕНТ ===== */
.quote-slide__label {
  font-size: 11px; font-weight: 600; color: #999;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px;
}
.quote-slide__mark {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 80px; color: var(--accent); line-height: 0.5;
  margin-bottom: 16px; opacity: 0.3;
}
.quote-slide__text {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 28px; font-weight: 400; font-style: italic;
  line-height: 1.5; color: #1a1a1a; max-width: 600px; margin-bottom: 28px;
}
.quote-slide__text em { color: var(--accent); }
.quote-slide__divider { width: 40px; height: 2px; background: var(--accent); margin-bottom: 20px; }
.quote-slide__source { font-size: 15px; color: #888; line-height: 1.6; }

/* ===== СХЕМКА 2: ШАГИ С ЛИНИЕЙ ===== */
.steps__heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 36px;
}
.steps__heading em { font-style: italic; color: var(--accent); }
.steps__list { position: relative; padding-left: 32px; }
.steps__list::before {
  content: ''; position: absolute; left: 7px; top: 8px; bottom: 8px;
  width: 1px; background: #e8e8e8;
}
.steps__item { position: relative; padding-bottom: 28px; }
.steps__item:last-child { padding-bottom: 0; }
.steps__dot {
  position: absolute; left: -32px; top: 4px;
  width: 15px; height: 15px; border: 2px solid var(--accent);
  background: #fff; border-radius: 50%;
}
.steps__item--active .steps__dot { background: var(--accent); }
.steps__item-title { font-weight: 600; font-size: 17px; color: #1a1a1a; margin-bottom: 4px; }
.steps__item-text { font-size: 15px; color: #666; line-height: 1.6; }

/* ===== СХЕМКА 3: НУМЕРОВАННЫЙ СПИСОК ===== */
.numlist__heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 36px;
}
.numlist__heading em { font-style: italic; color: var(--accent); }
.numlist__item {
  display: flex; gap: 24px; align-items: baseline;
  padding: 18px 0; border-bottom: 1px solid #f0f0f0;
}
.numlist__item:last-child { border-bottom: none; }
.numlist__num {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-style: italic; font-weight: 400;
  font-size: 40px; color: var(--accent); opacity: 0.25;
  min-width: 48px; text-align: right; line-height: 1; flex-shrink: 0;
}
.numlist__text { font-size: 16px; color: #1a1a1a; line-height: 1.6; }
.numlist__text strong { font-weight: 600; }
.numlist__text span { color: #666; }

/* ===== СХЕМКА 4: АКЦЕНТНАЯ ПОЛОСА СЛЕВА ===== */
.accent-bar__label {
  font-size: 11px; font-weight: 600; color: #999;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px;
}
.accent-bar__block { border-left: 3px solid var(--accent); padding-left: 28px; }
.accent-bar__title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 28px; font-weight: 700; line-height: 1.35; margin-bottom: 16px;
}
.accent-bar__title em { font-style: italic; color: var(--accent); }
.accent-bar__text { font-size: 16px; color: #444; line-height: 1.75; margin-bottom: 20px; }
.accent-bar__footer {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 16px; font-style: italic; color: #888;
  padding-top: 16px; border-top: 1px solid #f0f0f0;
}

/* ===== СХЕМКА 5: ЧЕК-ЛИСТ ===== */
.checklist__heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 32px;
}
.checklist__heading em { font-style: italic; color: var(--accent); }
.checklist__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.checklist__col-label {
  font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
  text-transform: uppercase; padding-bottom: 14px; margin-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}
.checklist__col-label--do { color: var(--accent); }
.checklist__col-label--dont { color: #999; }
.checklist__col:first-child { padding-right: 24px; border-right: 1px solid #f0f0f0; }
.checklist__col:last-child { padding-left: 24px; }
.checklist__item {
  display: flex; gap: 10px; padding: 10px 0;
  font-size: 15px; color: #444; line-height: 1.6; align-items: baseline;
}
.checklist__mark { flex-shrink: 0; font-size: 15px; font-weight: 700; width: 16px; }
.checklist__mark--do { color: var(--accent); }
.checklist__mark--dont { color: #ccc; }

/* ===== СХЕМКА 6: ТРИ МЕТРИКИ ===== */
.metrics__heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 36px;
}
.metrics__heading em { font-style: italic; color: var(--accent); }
.metrics__row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; }
.metrics__item {
  text-align: center; padding: 28px 16px;
  border-right: 1px solid #f0f0f0;
}
.metrics__item:last-child { border-right: none; }
.metrics__number {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-style: italic; font-weight: 400;
  font-size: 56px; color: var(--accent); opacity: 0.25;
  line-height: 1; margin-bottom: 10px;
}
.metrics__label {
  font-size: 12px; color: #888; text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: 10px;
}
.metrics__desc { font-size: 14px; color: #666; line-height: 1.5; }

/* ===== СХЕМКА 7: ВОПРОС-ОТВЕТ ===== */
.qa__heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 32px;
}
.qa__heading em { font-style: italic; color: var(--accent); }
.qa__item { margin-bottom: 28px; }
.qa__question {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 18px; font-style: italic; color: var(--accent);
  margin-bottom: 10px; padding-left: 36px; position: relative;
}
.qa__question::before {
  content: '?'; position: absolute; left: 0; top: -4px;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-style: italic; font-weight: 400;
  font-size: 32px; color: var(--accent); opacity: 0.25;
}
.qa__answer {
  font-size: 16px; color: #444; line-height: 1.7;
  padding-left: 36px; border-left: 1px solid #e8e8e8;
}

/* ===== СХЕМКА 8: ФОРМУЛА ===== */
.formula__heading {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 32px;
}
.formula__heading em { font-style: italic; color: var(--accent); }
.formula__row {
  display: flex; align-items: center; gap: 20px; margin-bottom: 32px;
}
.formula__step {
  flex: 1; background: #f5f5f5; padding: 22px 20px; text-align: center;
}
.formula__step-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 16px; font-weight: 700; margin-bottom: 6px;
}
.formula__step-text { font-size: 13px; color: #666; line-height: 1.5; }
.formula__arrow { color: var(--accent); font-size: 20px; flex-shrink: 0; opacity: 0.4; }
.formula__result {
  border: 1px solid var(--accent); padding: 22px 20px; text-align: center; flex: 1;
}
.formula__result .formula__step-title { color: var(--accent); }
.formula__note { font-size: 15px; color: #888; font-style: italic; margin-top: 10px; }

/* ===== ПЕЧАТЬ / PDF (1280x720, 16:9) ===== */
@media print {
  html, body { width: 1280px; }
  .slide {
    width: 1280px; height: 720px;
    page-break-after: always; page-break-inside: avoid;
  }
  .slide:last-child { page-break-after: auto; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
</head>
<body>

<!-- СЛАЙД 1: ТИТУЛЬНЫЙ -->
<div class="slide">
<nav class="nav">
  <a class="nav__logo" href="#"><img src="https://maiyamaiya19999-bit.github.io/maysoulme-assets/logo-ms.png" alt="MS"></a>
  <span class="nav__logo-name">maysoulme</span>
</nav>
<div class="slide__body">
  <div class="slide__inner">
    <div class="hero">
      <div class="badge">УРОК</div>
      <h1>Заголовок презентации с <em>акцентным словом</em></h1>
      <p class="hero__desc">Описание темы презентации в одну-две строки.</p>
      <p class="hero__meta">БЛОГИНГ &middot; КОНТЕНТ &middot; ВИДЕО</p>
    </div>
  </div>
</div>
</div>

<!-- СЛАЙД 2: КОНТЕНТНЫЙ (базовый) -->
<div class="slide">
<nav class="nav">
  <a class="nav__logo" href="#"><img src="https://maiyamaiya19999-bit.github.io/maysoulme-assets/logo-ms.png" alt="MS"></a>
  <span class="nav__logo-name">maysoulme</span>
</nav>
<div class="slide__body">
  <div class="slide__inner">
    <h2 class="section-heading">Заголовок слайда <em>акцент</em></h2>
    <div class="highlight"><strong>Важно:</strong> ключевая мысль в сером блоке.</div>
    <ul class="guide-list">
      <li><strong>Пункт первый.</strong> Пояснение к пункту.</li>
      <li><strong>Пункт второй.</strong> Пояснение к пункту.</li>
      <li><strong>Пункт третий.</strong> Пояснение к пункту.</li>
    </ul>
  </div>
</div>
</div>

<!-- ПРОДОЛЖАЙ СЛАЙДЫ ПО ЭТОМУ ШАБЛОНУ -->

</body>
</html>
```

## Типы слайдов

### 1. Титульный слайд
Используй класс `.hero` с `.badge`, `h1`, `.hero__desc`, `.hero__meta`.

### 2. Базовый слайд (текст + список)
Заголовок `.section-heading` + любая комбинация: `.text`, `.highlight`, `.guide-list`, `.sub-heading`, `.scenario-card`.

### 3-10. Схемки-вариации (для разнообразия, каждый 2-3-й слайд)

**Цитата-акцент** — для ключевых мыслей:
```html
<div class="slide__inner">
  <div class="quote-slide__label">КЛЮЧЕВАЯ МЫСЛЬ</div>
  <div class="quote-slide__mark">&ldquo;</div>
  <div class="quote-slide__text">Текст цитаты с <em>акцентом</em></div>
  <div class="quote-slide__divider"></div>
  <p class="quote-slide__source">Пояснение.</p>
</div>
```

**Шаги с вертикальной линией** — для процессов:
```html
<div class="slide__inner">
  <div class="steps__heading">Заголовок <em>акцент</em></div>
  <div class="steps__list">
    <div class="steps__item steps__item--active">
      <div class="steps__dot"></div>
      <div class="steps__item-title">Шаг 1</div>
      <div class="steps__item-text">Описание.</div>
    </div>
    <div class="steps__item">
      <div class="steps__dot"></div>
      <div class="steps__item-title">Шаг 2</div>
      <div class="steps__item-text">Описание.</div>
    </div>
  </div>
</div>
```

**Нумерованный список** — для структур:
```html
<div class="slide__inner">
  <div class="numlist__heading">Заголовок <em>акцент</em></div>
  <div class="numlist__item">
    <div class="numlist__num">1</div>
    <div class="numlist__text"><strong>Название</strong> <span>— описание.</span></div>
  </div>
</div>
```

**Акцентная полоса** — для главных правил:
```html
<div class="slide__inner">
  <div class="accent-bar__label">ПРАВИЛО</div>
  <div class="accent-bar__block">
    <div class="accent-bar__title">Заголовок <em>акцент</em></div>
    <p class="accent-bar__text">Текст пояснения.</p>
    <div class="accent-bar__footer">Курсивная подпись</div>
  </div>
</div>
```

**Чек-лист (Делай / Не делай)** — для сравнений:
```html
<div class="slide__inner">
  <div class="checklist__heading">Заголовок — <em>акцент</em></div>
  <div class="checklist__grid">
    <div class="checklist__col">
      <div class="checklist__col-label checklist__col-label--do">Делай</div>
      <div class="checklist__item"><span class="checklist__mark checklist__mark--do">&#x2713;</span>Пункт</div>
    </div>
    <div class="checklist__col">
      <div class="checklist__col-label checklist__col-label--dont">Не делай</div>
      <div class="checklist__item"><span class="checklist__mark checklist__mark--dont">&#x2717;</span>Пункт</div>
    </div>
  </div>
</div>
```

**Три метрики** — для цифр и статистики:
```html
<div class="slide__inner">
  <div class="metrics__heading">Заголовок <em>акцент</em></div>
  <div class="metrics__row">
    <div class="metrics__item">
      <div class="metrics__number">3</div>
      <div class="metrics__label">секунды</div>
      <div class="metrics__desc">Пояснение.</div>
    </div>
    <div class="metrics__item">
      <div class="metrics__number">80%</div>
      <div class="metrics__label">успеха</div>
      <div class="metrics__desc">Пояснение.</div>
    </div>
    <div class="metrics__item">
      <div class="metrics__number">2+</div>
      <div class="metrics__label">триггера</div>
      <div class="metrics__desc">Пояснение.</div>
    </div>
  </div>
</div>
```

**Вопрос-ответ** — для FAQ:
```html
<div class="slide__inner">
  <div class="qa__heading">Заголовок <em>акцент</em></div>
  <div class="qa__item">
    <div class="qa__question">Вопрос?</div>
    <div class="qa__answer">Ответ.</div>
  </div>
</div>
```

**Формула** — для визуальных уравнений:
```html
<div class="slide__inner">
  <div class="formula__heading">Заголовок <em>акцент</em></div>
  <div class="formula__row">
    <div class="formula__step">
      <div class="formula__step-title">A</div>
      <div class="formula__step-text">Описание</div>
    </div>
    <div class="formula__arrow">+</div>
    <div class="formula__step">
      <div class="formula__step-title">B</div>
      <div class="formula__step-text">Описание</div>
    </div>
    <div class="formula__arrow">=</div>
    <div class="formula__result">
      <div class="formula__step-title">Результат</div>
      <div class="formula__step-text">Описание</div>
    </div>
  </div>
</div>
```

## Обёртка каждого слайда

КАЖДЫЙ слайд (включая схемки) должен быть обёрнут в эту структуру:

```html
<div class="slide">
<nav class="nav">
  <a class="nav__logo" href="#"><img src="https://maiyamaiya19999-bit.github.io/maysoulme-assets/logo-ms.png" alt="MS"></a>
  <span class="nav__logo-name">maysoulme</span>
</nav>
<div class="slide__body">
  <div class="slide__inner">
    <!-- КОНТЕНТ СЛАЙДА ЗДЕСЬ -->
  </div>
</div>
</div>
```

**ОБРАТИ ВНИМАНИЕ:** в этом формате НЕТ `<div class="divider"></div>` — нет разделителя, контент на всю ширину.

## Главные отличия от формата с видео (60/40)

| Элемент | С видео (60/40) | Полная ширина |
|---------|-----------------|---------------|
| Навбар | `width: var(--split)` = 60% | `width: 100%` |
| Контент | `width: var(--split)` = 60% | `width: 100%`, max-width 740px, по центру |
| Разделитель | `<div class="divider">` | **НЕТ** |
| Правая часть | Пустая 40% для видео | **НЕТ** — всё занято контентом |
| Заголовок h1 | 36px | 42px |
| Section heading | 28px | 32px |
| Финальная фраза | выравнивание влево | `text-align: center` |

## Чего НЕЛЬЗЯ делать (запрещено)

- Создавать PPTX / PowerPoint
- Добавлять бежевые/цветные блоки
- Добавлять номера страниц
- Добавлять нумерацию «01.» в заголовках
- Использовать шрифты кроме Libre Baskerville, Inter, DM Sans
- Использовать border-radius
- Менять цвет акцента (только #710C04)
- Добавлять разделитель или пустое место справа (это ДРУГОЙ формат!)
- Писать «Клод» или «Рилс» кириллицей (только Claude и Reels)
- Добавлять изображения, иконки, эмодзи в слайды

## ЭКСПОРТ В PDF

Размер страницы = **1280x720px** (16:9). Один слайд = одна страница. Margin: 0. printBackground: true.

```js
await page.pdf({
  width: '1280px',
  height: '720px',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
});
```

## Как отдавать результат

Отдай HTML-файл целиком, готовый к скачиванию. Если нужен PDF — экспортируй строго по параметрам выше (1280x720px).
