# Grammar Coverage Map

Целевые количества на 2000 предложений (минимумы; одна запись покрывает несколько пунктов сразу). Частотность соответствует реальной разговорной речи.

## Словарь grammarTags (только эти значения)

`present-simple`, `present-continuous`, `present-continuous-future`, `past-simple`, `past-continuous`, `present-perfect`, `present-perfect-continuous`, `past-perfect`, `past-perfect-continuous`, `future-will`, `going-to`, `future-continuous`, `future-perfect`, `future-perfect-continuous`, `question`, `indirect-question`, `tag-question`, `short-answer`, `negation`, `imperative`, `modal`, `conditional-0`, `conditional-1`, `conditional-2`, `conditional-3`, `conditional-mixed`, `gerund`, `infinitive`, `to-preposition`, `bare-infinitive`, `preposition`, `phrasal-verb`, `collocation`, `article`, `quantifier`, `countable-uncountable`, `comparative`, `superlative`, `relative-clause`, `passive`, `used-to`, `be-used-to`, `would-like`, `there-is`, `word-order`, `stop-remember-try`, `look-forward-to`, `feel-like`, `time-preposition`, `place-preposition`, `movement-preposition`, `for-since`, `by-until`, `want-someone-to`, `reported-speech`

## Времена (минимумы)

| Время | Мин. | Комментарий |
|---|---|---|
| present-simple | 400 | факты, привычки, состояния |
| present-continuous | 280 | сейчас, текущий период, запланированное будущее (`present-continuous-future` ~60 из них) |
| past-simple | 300 | рассказы о прошлом, вопросы о прошлом |
| present-perfect | 200 | опыт, результат, ever/never/yet/already, how long |
| present-perfect-continuous | 80 | lately, how long have you been |
| past-continuous | 70 | фон в прошлом, was doing when |
| going-to | 90 | намерения |
| future-will | 120 | решения, обещания, прогнозы |
| past-perfect | 40 | до другого события в прошлом |
| past-perfect-continuous | 12 | had been doing |
| future-continuous | 25 | I'll be doing |
| future-perfect | 15 | I'll have done by |
| future-perfect-continuous | 5 | немного, естественные примеры |

## Конструкции (минимумы)

| Пункт | Мин. |
|---|---|
| question (прямые вопросы) | 620 (~35% с учётом indirect) |
| negation | 320 |
| indirect-question | 70 |
| modal (can/could/should/must/have to/may/might/would...) | 180 |
| conditional-0/1/2/3/mixed | 25/45/35/15/8 |
| gerund (все случаи -ing вне времён: после глаголов, предлогов, подлежащее) | 180 |
| infinitive (to + V1 после want/need/decide...) | 220 |
| to-preposition (look forward to, be used to, get used to...) | 40 |
| preposition (глагольные: wait for, depend on, listen to...) | 350 |
| time-preposition (at/on/in/for/since/by/until/during) | 120 |
| place-preposition (in/at/on места) | 90 |
| movement-preposition | 40 |
| article (a/the/нулевой — где есть что объяснить) | 250 |
| quantifier (some/any/much/many/a lot of/few/little/enough/too) | 90 |
| countable-uncountable (advice/information/money/time...) | 50 |
| phrasal-verb (живые: find out, hang out, break up, end up...) | 160 |
| relative-clause (who/that/which/where, опускание) | 70 |
| passive (только реальные ситуации) | 45 |
| comparative/superlative | 60 |
| used-to / be-used-to | 25/20 |
| stop-remember-try (смыслоразличительные пары) | 15 |
| would-like | 30 |
| collocation | 150 |
| word-order (наречия, порядок слов — где это суть) | 60 |
| imperative | 40 |
| tag-question | 15 |
| reported-speech (лёгкий, разговорный) | 20 |

## Контрасты времён

Минимум 25 групп смысловых контрастов (I work / I'm working / I've been working / I worked / I was working / I'm going to work / I'll be working...), рассеянных по разным пакетам, не подряд.

## Уровни по диапазонам ID

- 1–300 — A1–A2: present simple/continuous, простые вопросы, be, have got, базовые предлоги, артикли.
- 301–800 — A2–B1: past simple, going to, will, present perfect (первое знакомство), базовые модальные, gerund/infinitive.
- 801–1400 — B1: perfect vs past, present perfect continuous, conditionals 1–2, phrasal verbs, indirect questions.
- 1401–1800 — B1–B2: conditionals 2–3, past perfect, passive, relative clauses, нюансы -ing/to.
- 1801–2000 — B2: mixed conditionals, future perfect, тонкие контрасты, но по-прежнему разговорный.

## Учёт покрытия

После каждого пакета validation-скрипт (`node scripts/validate-dataset.mjs`) печатает фактические счётчики тегов; сверять с этой картой, дефициты закрывать в следующих пакетах.
