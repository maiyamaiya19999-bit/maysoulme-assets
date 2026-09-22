# Установщик рабочего места Валентина (инструкция для Claude)

Ты выполняешь установку на компьютере Валентины — ученицы Майи (@maysoulme). Пакет скачивается архивом: https://maiyamaiya19999-bit.github.io/maysoulme-assets/valentina-guide/downloads/valentina-guide-full-package.zip — доступы к чужим репозиториям не нужны. Пройди пункты по порядку, в конце дай отчёт по каждому: что установлено и что проверено. Если пункт не удался — не молчи: скажи, что не вышло, и предложи решение. Ничего не выдумывай.

Ниже `$P` = `~/valentina-guide-setup` (папка, куда распаковывается пакет).

## 1. Скачивание пакета

```
curl -fL -o /tmp/valentina-guide-full-package.zip https://maiyamaiya19999-bit.github.io/maysoulme-assets/valentina-guide/downloads/valentina-guide-full-package.zip
mkdir -p ~/valentina-guide-setup && ditto -xk /tmp/valentina-guide-full-package.zip ~/valentina-guide-setup && rm /tmp/valentina-guide-full-package.zip
```

На Windows вместо ditto используй распаковку средствами системы (Expand-Archive в PowerShell). Если папка уже существует — это обновление: перед перезаписью `brand/PROFILE.md` выполни оговорку из раздела 4.

## 2. Скиллы

Скопируй **все** `*.md` из `$P/skills/` в `~/.claude/commands/` (создай папку, если её нет; одноимённые файлы перезаписать):

```
mkdir -p ~/.claude/commands && cp "$P/skills/"*.md ~/.claude/commands/
```

Набор: raspakovka, voice-edit, tg-posts, reels-expert, reels-story, stories, progrev, selling-lesson, dozhim, offer, ca, content-plan. Если какого-то файла нет в папке — отметь в отчёте, пустышку не создавай.

## 3. Бренд-файлы

```
mkdir -p ~/.claude/brand
cp "$P/brand/PROFILE.md" "$P/brand/TOV-SAMPLES.md" "$P/brand/WRITING-RULES.md" ~/.claude/brand/
```

- `PROFILE.md` — главный файл: каждый скилл читает его первым. В нём есть пометки `[нужна деталь: …]` — их закрывает скилл `/raspakovka`.
- `TOV-SAMPLES.md` — живые тексты Валентины, эталон голоса.
- `WRITING-RULES.md` — правила живой речи, обязательны для любого текста.

Если `~/.claude/brand/PROFILE.md` уже существует и отличается от версии в пакете (`diff -q`) — **не перезаписывай молча**: спроси, редактировала ли его Валентина; если да — оставь её версию.

## 4. Проверка

1. Вызови `/tg-posts` с любой темой из ниши Валентины. Скилл должен сначала прочитать PROFILE.md и написать пост живой речью без рубленых фраз.
2. Вызови `/raspakovka` — скилл должен найти пометки `[нужна деталь]` и начать задавать вопросы по одной.

## 5. Отчёт

По каждому пункту: сделано / не сделано и почему. Затем предложи Валентины начать с `/raspakovka`, чтобы закрыть пометки в профиле.
