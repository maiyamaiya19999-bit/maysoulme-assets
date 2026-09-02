# Гайд генерации предложений (для пакетов batch-NN)

Ты генерируешь один пакет из ровно 50 записей учебной базы тренажёра разговорного английского. Файл: `english-trainer/src/data/batches/batch-NN.json` — JSON-массив из 50 объектов.

## Формат записи

```json
{
  "id": 301,
  "russian": "…",
  "english": "…",
  "alternatives": ["…", "…"],
  "vocab": [{ "word": "look forward to", "translation": "ждать с нетерпением" }, { "word": "beforehand", "translation": "заранее" }],
  "explanation": "…",
  "level": "B1",
  "grammarTags": ["past-simple", "question"],
  "topicTags": ["travel", "small-talk"]
}
```

- `alternatives` — 1–3 ДРУГИХ естественных способа сказать то же самое по-английски (другая конструкция, другое слово, другой регистр: I'm really looking forward to meeting you → I can't wait to meet you / I'm so excited to meet you). Не повторяй english с косметическими изменениями. Каждый вариант должен быть правильным и живым.
- `vocab` — 2–6 ключевых слов или фраз предложения с переводом: словарная форма (без -s/-ed/-ing, кроме случаев, когда важна именно форма), фразовые глаголы и устойчивые сочетания целиком (pick up, look forward to, make a decision). Перевод — короткий, как в словаре, в контексте предложения. Служебные слова (the, to, do) не включай, если они не часть выражения.

- `id` — строго из диапазона твоего пакета, все 50 подряд, без пропусков.
- `level` — только уровни, разрешённые твоему пакету.
- Теги — ТОЛЬКО из словарей в `scripts/validate-dataset.mjs` (списки GRAMMAR_TAGS и TOPIC_TAGS). Ставь тег только если явление реально есть в предложении. 2–6 grammarTags, 1–3 topicTags.

## Колонка russian

Естественное, современное русское предложение — как в реальной переписке/разговоре двух взрослых. Без школьной искусственности, без грамматической подсказки (пусть придётся самой решить: I work / I'm working / I've been working / I worked…). Говорящая — женщина (я работала, я рада), собеседник чаще мужчина (ты позвонил). Используй «ё».

## Колонка english

Один основной правильный ЕСТЕСТВЕННЫЙ перевод. Приоритет: естественный современный American English > буквальный перевод. Обязательно сокращения: I'm, I've, I'll, I'd, don't, doesn't, didn't, can't, won't, isn't… Апостроф прямой ('), не типографский. Никаких калек: не «I very like it» (→ I really like it), не «I wait you» (→ I'm waiting for you), не «I want that you come» (→ I want you to come), не «I have 27 years» (→ I'm 27). Если I'd двусмысленно — объясни в explanation, что это здесь (would или had).

## Колонка explanation — главная ценность проекта

По-русски, одним абзацем 350–1100 символов. Отвечает на вопрос «почему предложение построено именно так». Разбирай ВСЕ важные элементы, которые реально есть: время и причину выбора, формулу времени, вспомогательные глаголы, -ing/герундий/инфинитив, типы to (инфинитивное/предлог/направление), предлоги и почему именно они, артикли (включая нулевой), порядок слов, модальные, фразовые глаголы и их значение в контексте, collocations, отличие от русской кальки, неправильные глаголы (V1—V2—V3), countable/uncountable. НЕ объясняй то, чего в предложении нет. Не ограничивайся «Present Continuous, потому что действие сейчас» — объясняй как живой преподаватель. Термины: Present Simple, V1/V2/V3, am/is/are и т.п. — как в примерах ниже.

### Эталоны (такой уровень подробности обязателен)

1) A2: russian: «Ты когда-нибудь был в Италии?» → english: «Have you ever been to Italy?» → explanation: «Present Perfect, потому что спрашиваем о жизненном опыте вообще, без привязки к конкретному моменту. Формула: have/has + V3, в вопросе have выходит вперёд: Have you ever been…? ever = „когда-нибудь", ставится между подлежащим и V3. Обрати внимание на предлог: been to Italy, а не been in Italy — с Present Perfect об опыте поездок используется to, потому что смысл „съездил туда (и вернулся)". Если бы речь шла о конкретном прошлом моменте, был бы Past Simple: Were you in Italy last summer?»

2) B1: russian: «Мне интересно, что ты ищешь в отношениях.» → english: «I'm curious about what you're looking for in a relationship.» → explanation: «I'm curious about — „мне любопытно/интересно": прилагательное curious требует предлог about. Дальше идёт косвенный вопрос what you're looking for — и в нём обычный порядок слов, без вспомогательного do: what you're looking for, а не what are you looking for (прямой вопрос был бы What are you looking for?). look for — фразовый глагол „искать": предлог for уходит в конец. you're looking — Present Continuous, потому что поиск — текущий процесс этого периода жизни. in a relationship — устойчивое „в отношениях"; артикль a, потому что речь об отношениях как об одном (пока абстрактном) варианте, а не о конкретных известных отношениях.»

3) B1 (два типа to): russian: «Я очень жду нашей встречи, но не хочу заранее строить слишком много ожиданий.» → english: «I'm really looking forward to meeting you, but I don't want to build up too many expectations beforehand.» → explanation: «I'm = I am. look forward to означает „с нетерпением ждать". В этой конструкции to — предлог, поэтому после него действие идёт в форме V-ing: looking forward to meeting, а не to meet. meet someone используется без with: meeting you. I don't want — отрицание в Present Simple через don't. После want идёт to + V1: want to build. Здесь два разных to: look forward to meeting → to — предлог → V-ing; want to build → to — часть инфинитива → V1. build up expectations — естественное сочетание „создавать/наращивать ожидания", build up — фразовый глагол. too many используется с исчисляемыми существительными во множественном числе: too many expectations (с неисчисляемыми было бы too much). beforehand = „заранее".»

## Обязательные правила пакета

1. Ровно 50 записей, id из назначенного диапазона по порядку.
2. Вопросы: минимум 17 из 50 (теги question / indirect-question). Вопросы должны быть живыми репликами разговора (What made you…? How long have you been…? What do you value in…?), с разными вспомогательными: do/does/did/am/is/are/have/has/will/would/could/can.
3. Отрицания: минимум 8 (тег negation).
4. Выполни ВСЕ квоты из своего брифа (batch-briefs.json): grammarQuotas — минимум записей с этим тегом, topicQuotas — минимум записей с этим тегом.
5. Темы бери из назначенных сценариев брифа — они гарантируют, что пакеты не пересекаются по содержанию. Каждый сценарий — это «якорь»: сделай по нему 4–8 записей с разной грамматикой.
6. Не добивай количество шаблонами с заменой слова (Я хочу поехать в Италию/Испанию/Францию — запрещено). Грамматика повторяется, содержание — нет.
7. Смысловые контрасты времён приветствуются (I work online / I'm working right now / I've been working a lot lately) — но рассредоточь их по пакету, не подряд.
8. Специальные конструкции объясняй особенно тщательно: look forward to + V-ing, be used to / get used to + V-ing, stop/remember/try + gerund vs infinitive (смысл меняется!), don't have to vs mustn't, If + Present (не will!) в First Conditional, by vs until, for vs since, at/in разница для мест (at the hotel — точка, in the hotel — внутри здания).
9. Фразовые глаголы — живые (get along, find out, figure out, work out, hang out, come over, pick up, drop off, end up, break up, get over, move on, open up, calm down, turn out, give up) — каждый раз объясняй значение в контексте.
10. Не используй школьные бесполезные предложения. Каждое предложение должно быть реально применимо в общении.

## Рабочий процесс

1. Прочитай свой бриф: `node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('scripts/batch-briefs.json')).find(b=>b.batch===NN),null,2))"` (из папки english-trainer).
2. Напиши файл `src/data/batches/batch-NN.json` (можно частями, но итог — валидный JSON-массив).
3. Проверь: `node scripts/validate-batch.mjs NN` — исправляй, пока не будет «✓ batch NN ok».
4. Перечитай свои 50 english-предложений глазами носителя: убери любые кальки, проверь естественность. Перечитай explanations: каждое ли объясняет все важные элементы. Исправь и снова прогони валидатор.
