# English Trainer — Implementation Plan

Персональный тренажёр разговорного английского: 2000 предложений (Русский → English → Подробное объяснение) + мобильное PWA-приложение.

## Размещение

- Репозиторий: `maysoulme-assets` (GitHub Pages, домен anketa.mayasoul.ru).
- Исходники: `english-trainer/` (React + TypeScript + Vite).
- Собранная версия: `trainer/` в корне репозитория → открывается как сайт по адресу `https://anketa.mayasoul.ru/trainer/`.
- Vite `base: './'` — относительные пути, работает по любому URL.

## Архитектура

### Данные

- `src/data/sentences.json` — весь dataset: `{ "datasetVersion": 1, "sentences": [...] }`.
- Схема записи: `id` (1–2000, стабильный), `russian`, `english`, `explanation`, `level` (A1–B2), `grammarTags[]`, `topicTags[]`.
- Dataset загружается отдельным fetch-запросом (не в JS-бандле) и кэшируется service worker'ом.
- Словари допустимых тегов зафиксированы в `src/lib/tags.ts` и в validation-скрипте.

### Progress (отдельно от dataset)

- Хранение: `localStorage`, ключ `english-trainer:progress:v1`.
- Структура `ProgressState`: `datasetVersion`, `currentRound`, `currentSentenceId`, `completedIds[]`, `roundStartedAt`, `roundHistory[]` (`{round, completedCount, total, status: "completed"|"restarted", startedAt, endedAt}`).
- Вся логика — чистые функции в `src/lib/progress.ts` (легко тестировать): `markCompleted`, `unmarkCompleted`, `setPosition`, `startNewRound`, `loadProgress`, `saveProgress`, `parseImportedProgress`.
- Сохранение немедленно после каждого изменения (не при закрытии страницы).
- Никогда не вызывать `localStorage.clear()` / `indexedDB.deleteDatabase` в startup/update flow. Единственный путь очистки completed-state — «Учить заново» + код 12345 + подтверждение; при этом старый круг уходит в `roundHistory`, история не уничтожается.
- Explanations в progress не хранятся — только id.

### UI (экраны)

1. **Карточка** (главный): header (название, круг, N/2000, %, тонкий progress bar), номер + русское предложение, «Показать перевод» → English + «Почему так?» + explanation → «✓ Выучено» / «↻ Оставить на повтор» / ← →. Reveal — локальный state карточки, сбрасывается при смене предложения, на progress не влияет.
2. **Показать все**: компактный список `✓/○ № Русский` (English не спойлерится), поиск (по russian/english/id/explanation — результаты всё равно без English), «Перейти к №», фильтры (статус / грамматика / темы) под кнопкой «Фильтры». Клик по строке открывает карточку (English скрыт). Прогресс не трогает. Производительность: `content-visibility: auto` на строках, полный текст только по клику.
3. **История**: список кругов со статусами.
4. **Меню**: Все предложения, История, Экспорт, Импорт, Учить заново (визуально отделена как опасная).
5. **Reset-modal**: код 12345 + отдельное подтверждение. Неверный код — ничего не меняется. Код — защита от случайного сброса, не пароль, без backend.

### PWA / offline

- `manifest.webmanifest` (standalone, иконки, theme color), `apple-touch-icon`.
- Собственный service worker (`public/sw.js`): navigation — network-first с fallback на кэш; статика и dataset — cache-first с фоновым обновлением. Обновление SW не трогает localStorage → прогресс переживает деплой.
- После первого открытия offline работают: база, карточки, перевод, explanation, progress, search, filters, rounds, history.

### Тесты

- Vitest, `tests/progress.test.ts` + `tests/flows.test.ts` — все 17 сценариев из ТЗ (reveal не меняет progress, mark/unmark, persistence, show all/search/filters не трогают progress, неверный код, новый круг, история, export/import, deploy не стирает progress, reveal скрыт на следующей карточке).

### Validation

- `scripts/validate-dataset.mjs`: ровно 2000 записей, ID 1–2000 уникальны, нет пустых полей, нет точных дублей russian/english, минимальная длина explanation, ≥35% вопросов, есть отрицания, покрытие времён / -ing / to+V1 / prepositions / modals / conditionals / Perfect / Continuous / indirect questions / articles / phrasal verbs, тематическое разнообразие, теги из фиксированных словарей.

## Порядок работ

1. ✅ Документы: implementation-plan, grammar-coverage, topic-coverage.
2. Scaffold Vite + React + TS, дизайн-система (clean/premium/editorial, mobile-first, safe areas, кнопки ≥44px).
3. Тестовый dataset на 16 предложений, полная реализация всех функций на нём.
4. Тесты + validation-скрипт, проверка persistence/rounds.
5. Генерация dataset пакетами по 50 записей (ID-диапазоны закреплены за пакетами; каждому пакету — свой микс уровней, тем и грамматики из coverage-карт). После каждого пакета — validation.
6. Полный final validation, сборка в `trainer/`, acceptance-checklist.md, сверка с ТЗ.

## Генерация базы

- 40 пакетов × 50 записей. Диапазоны и уровни: 1–300 A1–A2, 301–800 A2–B1, 801–1400 B1, 1401–1800 B1–B2, 1801–2000 B2.
- Каждому пакету назначаются: доля вопросов (~35% в среднем), обязательные грамматические квоты и конкретные тематические сценарии (чтобы не было дублей содержания между пакетами).
- Контрасты времён распределяются по разным пакетам → в итоговой базе перемешаны.
- После каждого пакета: grammar review, natural English review, duplicate check, explanation review, coverage update, сохранение.
