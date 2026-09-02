// Курс: модули с теорией и правилами отбора предложений из базы по тегам.
// Практика собирается автоматически из sentences.json.

import type { Level } from "../lib/types";

export type ModuleSelector = {
  grammarAny?: string[]; // предложение подходит, если есть хотя бы один из тегов
  topicAny?: string[];
  levels?: Level[];
};

export type CourseModule = {
  id: string;
  block: string;
  title: string;
  subtitle: string;
  selector: ModuleSelector;
  theory: string; // текст с переносами строк
  sections?: boolean; // делить ли на Утверждения / Отрицания / Вопросы (по умолчанию да)
};

export const BLOCKS = [
  { id: "tenses", title: "Времена", note: "Сначала теория, потом много практики по каждому времени" },
  { id: "questions", title: "Вопросы и отрицания", note: "Как строить вопросы и отрицания в любом времени" },
  { id: "rules", title: "Правила и конструкции", note: "-ing и to, модальные, conditionals, предлоги, артикли" },
  { id: "topics", title: "По темам разговора", note: "Готовые реплики для реальных диалогов" },
  { id: "levels", title: "По уровням", note: "От простого к сложному" }
];

const T = {
  ps: `Present Simple — постоянные факты, привычки, расписания, вкусы и мнения.

Формула
+ I / you / we / they + V1: I work online.
+ he / she / it + V1+s: She works online.
− don't / doesn't + V1: I don't drink. He doesn't smoke.
? Do / Does + подлежащее + V1: Do you play chess? Does he travel a lot?

Когда
• привычки и регулярность: I go to the gym four times a week.
• факты о себе: I don't eat meat. I play the violin.
• расписания: The class starts at seven.
• чувства и мнения (глаголы состояния): I love, I think, I know, I want — почти никогда не в Continuous.

Маркеры: usually, often, always, never, every day, on Sundays, twice a week.

Типичные ошибки
✗ I very like it → ✓ I really like it.
✗ He don't like → ✓ He doesn't like (в отрицании -s уходит в doesn't).
✗ Where you live? → ✓ Where do you live? (вопрос без do — самая частая ошибка).
✗ I am agree → ✓ I agree (agree — глагол, be не нужен).`,

  pc: `Present Continuous — действие в процессе: прямо сейчас, в текущий период жизни или запланированное будущее.

Формула
+ am / is / are + V-ing: I'm cooking dinner.
− am not / isn't / aren't + V-ing: I'm not working today.
? Am / Is / Are + подлежащее + V-ing: What are you doing? Are you coming?

Когда
• прямо сейчас: I'm practicing the violin right now.
• временный период: I'm learning padel these days. I'm living in Moscow for now.
• запланированное будущее (есть договорённость): I'm meeting my sister tomorrow.
• раздражающая привычка с always: He's always texting late.

Маркеры: now, right now, at the moment, these days, this week, tonight, tomorrow (с планами).

Не в Continuous: know, like, love, want, need, believe, understand, belong, mean.
✗ I'm knowing → ✓ I know. ✗ I'm wanting → ✓ I want.

Главный контраст: I work online (вообще) — I'm working right now (сейчас).`,

  psvpc: `Simple или Continuous — вопрос, который решаешь в каждом предложении о настоящем.

Present Simple = «вообще, всегда, обычно»: I cook every evening.
Present Continuous = «сейчас, в этот период, по плану»: I'm cooking right now.

Как выбрать
1. Есть слово-маркер регулярности (usually, every, often, never)? → Simple.
2. Есть «сейчас / в эти дни / сегодня вечером / завтра (план)»? → Continuous.
3. Глагол состояния (know, love, want, think «считаю»)? → Simple всегда.
4. Временная ситуация, которая скоро закончится? → Continuous: I'm staying at a hotel this week.

Пары
I play the violin (умею и играю вообще) — I'm playing the violin (прямо сейчас).
She lives in Moscow (постоянно) — She's living in Moscow (пока, временно).
What do you do? (кем работаешь) — What are you doing? (чем занят сейчас).
I think he's nice (мнение) — I'm thinking about the trip (процесс обдумывания).`,

  past: `Past Simple — завершённое действие в конкретный момент прошлого. Главное время для рассказов.

Формула
+ V2: правильные глаголы + -ed (worked, moved), неправильные — вторая форма (went, met, had, said, took).
− didn't + V1: I didn't go. She didn't call.
? Did + подлежащее + V1: Did you like it? Where did you grow up?
be: was / were; отрицание wasn't / weren't; вопрос Was it…? Were you…?

Когда
• событие в прошлом с указанием или подразумеванием момента: I moved to Moscow at 19.
• цепочка событий в рассказе: We met, talked for hours, and then he walked me home.
• завершённый период: We were together for two years.

Маркеры: yesterday, last week, in 2019, two years ago, when I was 19, then, after that.

Типичные ошибки
✗ Did you went? → ✓ Did you go? (после did — только V1).
✗ I didn't saw → ✓ I didn't see.
✗ I was born in 1998 — здесь всё верно, was born всегда с was/were.
Неправильные глаголы учатся только практикой: go–went, see–saw, take–took, come–came, make–made, get–got, say–said, tell–told, think–thought, feel–felt.`,

  pastc: `Past Continuous — длительный фон в прошлом, на котором произошло короткое событие.

Формула
+ was / were + V-ing: I was working when you called.
− wasn't / weren't + V-ing: I wasn't sleeping.
? Was / Were + подлежащее + V-ing: What were you doing at nine?

Когда
• «в тот момент я как раз…»: At 8 p.m. I was cooking dinner.
• фон + событие: I was walking home when it started to rain.
• два параллельных процесса: While I was practicing, my sister was singing.
• мягкая вежливость: I was wondering if you're free on Saturday.

Пара, которую нужно чувствовать
When you called, I was working. (звонок — короткое событие Past Simple, работа — фон Past Continuous)
When you called, I answered. (два коротких события подряд — оба Past Simple)

Не в Continuous те же глаголы состояния: I knew, I wanted, I loved (не was knowing).`,

  pp: `Present Perfect — связь прошлого с настоящим: опыт, результат к сегодняшнему дню, «уже / ещё нет», «как давно».

Формула
+ have / has + V3: I've been to Italy. She has moved.
− haven't / hasn't + V3: I haven't decided yet.
? Have / Has + подлежащее + V3: Have you ever tried padel? How long have you lived here?
V3: правильные + -ed; неправильные — третья форма (been, seen, done, gone, had, met, taken, written).

Когда
• опыт без указания момента: I've visited more than twenty countries.
• результат, важный сейчас: I've finished — можем идти. I've lost my keys — их нет.
• «уже / ещё нет / только что»: I've already eaten. He hasn't replied yet. I've just come back.
• длительность до сих пор (состояния): I've known her for ten years. I've lived here since 2019.

Маркеры: ever, never, already, yet, just, so far, recently, lately, this week, for, since.

Ключевое правило
Есть конкретный момент в прошлом (yesterday, in 2020, last summer) → Past Simple, не Perfect.
✗ I have seen him yesterday → ✓ I saw him yesterday.

been to vs gone to: I've been to Rome (была и вернулась) — He's gone to Rome (уехал и там).`,

  ppvpast: `Present Perfect vs Past Simple — самый важный контраст для русскоговорящих: в русском одно прошедшее время, в английском — выбор.

Past Simple — когда? Есть момент: yesterday, last year, in 2020, when I was 19, two hours ago.
Present Perfect — момент не важен, важна связь с сейчас: опыт, результат, «уже / ещё нет», «как давно».

Один и тот же факт
I've been to Bali. (опыт вообще — есть в моей жизни)
I went to Bali last year. (когда именно — назван момент)

I've lost my phone. (и сейчас его нет — результат)
I lost my phone yesterday. (событие в прошлом с моментом)

How long have you lived in Moscow? (до сих пор живёшь)
How long did you live in Moscow? (уже не живёшь)

Быстрый тест: можно ли добавить «уже» или «когда-нибудь»? → Perfect. Можно ли добавить «вчера / тогда»? → Past Simple.
В разговоре о новостях американцы часто говорят Past Simple даже там, где британцы возьмут Perfect: Did you eat? = Have you eaten? — оба варианта нормальны.`,

  ppc: `Present Perfect Continuous — процесс, который начался в прошлом и продолжается до сих пор (или только что закончился и виден результат).

Формула
+ have / has been + V-ing: I've been working a lot lately.
− haven't / hasn't been + V-ing: I haven't been sleeping well.
? Have / Has + подлежащее + been + V-ing: How long have you been learning English? What have you been doing?

Когда
• «в последнее время»: I've been thinking about you. I've been going to the gym more.
• «как давно ты…» про действие-процесс: I've been playing the violin since I was six.
• виден результат процесса: I'm tired — I've been practicing for three hours.

Маркеры: lately, recently, all day, for two hours, since Monday, how long.

Perfect или Perfect Continuous
I've read this book (закончила — результат) — I've been reading this book (в процессе, ещё читаю).
I've written three posts today (сколько сделано) — I've been writing all morning (как долго длился процесс).
С глаголами состояния Continuous нет: I've known him for years (не have been knowing).`,

  future: `Будущее: три основных способа — и они не взаимозаменяемы.

will + V1 — решение в момент речи, обещание, предсказание, предложение помощи.
I'll call you tonight. I think it'll be fun. I'll help you with that.
− won't: I won't be late. ? Will you come?

be going to + V1 — намерение, план, который уже есть в голове; очевидное предсказание по признакам.
I'm going to learn Italian. It's going to rain — look at the sky.
? Are you going to stay longer?

Present Continuous — договорённость с конкретным временем и местом (билет куплен, встреча назначена).
I'm flying to Rome on Friday. We're having dinner at eight.

Как выбрать
• Только что решила: «Ладно, я приеду» → I'll come.
• Планировала заранее: «Я собираюсь приехать» → I'm going to come.
• Уже забронировано: «Я прилетаю в пятницу» → I'm flying on Friday.

Типичные ошибки
✗ I will go tomorrow to the gym → ✓ I'm going to the gym tomorrow (порядок и выбор формы).
✗ If it will rain → ✓ If it rains (после if будущее не ставится).
✗ I'm going to go… — нормально, но I'm going to the gym короче и естественнее.`,

  futadv: `Future Continuous и Future Perfect — редкие, но очень «носительские» времена.

Future Continuous: will be + V-ing — «буду в процессе» в конкретный момент будущего.
This time tomorrow I'll be flying to Venice. I'll be working till six — call after.
Вежливый вопрос о планах: Will you be staying long?

Future Perfect: will have + V3 — «к моменту X уже будет сделано».
I'll have finished by eight. By next summer I'll have visited thirty countries.
Маркер — by: by Friday, by then, by the time you arrive.

Future Perfect Continuous: will have been + V-ing — «к моменту X буду делать уже N времени». Очень редко:
By next June, I'll have been living here for two years.

by vs until
by Friday = не позднее пятницы (дедлайн): I'll have decided by Friday.
until Friday = действие длится до пятницы: I'm staying until Friday.`,

  pastperf: `Past Perfect — «прошлое в прошлом»: действие, которое случилось раньше другого прошлого события.

Формула
+ had + V3: When I arrived, he had already left.
− hadn't + V3: I hadn't seen him for years.
? Had + подлежащее + V3: Had you met him before that trip?
I'd = I had (перед V3) — не путай с I'd = I would (перед V1).

Когда
• два события в прошлом, важно, какое раньше: By the time I got there, the concert had started.
• объяснение причины в прошлом: I was tired because I hadn't slept.
• в Third Conditional: If I'd known, I would have come.

Past Perfect Continuous: had been + V-ing — процесс до момента в прошлом.
I'd been working all day, so I didn't pick up.

Правило простоты: если последовательность понятна по словам (after, then, before), носители часто берут Past Simple: After I finished, I called him.`,

  mix: `Все времена вперемешку — контроль. Здесь нет подсказки, какое время нужно: решаешь по смыслу русского предложения.

Алгоритм выбора за 3 секунды
1. Это о настоящем, прошлом или будущем?
2. Факт / привычка (Simple) или процесс / момент (Continuous)?
3. Есть связь с сейчас без указания момента (Perfect)?
4. Есть маркер: yesterday → Past; lately → Perfect Continuous; by Friday → Future Perfect; tomorrow с планом → going to / Present Continuous.

Контрасты, которые нужно чувствовать
I work online — I'm working right now — I worked all day yesterday — I was working when you called — I've worked with people like that — I've been working a lot lately — I'm working all day tomorrow — I'm going to work from home — I'll still be working — I'll have finished by eight.`,

  questions: `Вопросы — вспомогательный глагол выходит перед подлежащим. Какой именно — определяет время.

Present Simple: Do / Does + V1 — Do you like jazz? Does she live here?
Present Continuous: Am / Is / Are + V-ing — Are you coming tonight?
Past Simple: Did + V1 — Did you sleep well? Where did you go?
Present Perfect: Have / Has + V3 — Have you ever been to Japan?
Будущее: Will + V1 — Will you be free on Saturday?
Модальные: Can / Could / Should / Would + V1 — Can you help me? Would you like some tea?
be: Are you tired? Was it good?

Вопросительные слова идут первыми: What / Where / When / Why / How / How long / How often / What kind of / Which.
What do you do? What are you doing? What did you do? What have you been doing? What are you going to do?

Вопрос к подлежащему — без do: Who called you? What happened? (кто/что сам совершает действие).
Предлог — в конце: Who are you waiting for? What are you looking for? Where are you from?

Ошибки
✗ What you want? → ✓ What do you want?
✗ Where you were? → ✓ Where were you?
✗ You like it? — в переписке допустимо, но в речи лучше Do you like it?`,

  negation: `Отрицания — not после вспомогательного глагола. В разговоре всегда сокращённо.

don't / doesn't (Present Simple): I don't drink. He doesn't text first.
didn't (Past Simple): I didn't see your message.
am not / isn't / aren't; wasn't / weren't: I'm not sure. It wasn't easy.
haven't / hasn't; hadn't: I haven't decided yet.
won't (will not): I won't be late.
can't, couldn't, shouldn't, mustn't, wouldn't: I can't talk right now.

После don't / didn't / doesn't — только V1: ✗ I didn't went → ✓ I didn't go.

Одно отрицание на предложение
✗ I don't know nothing → ✓ I don't know anything.
✗ I never don't → ✓ I never… (never уже отрицание).
hardly, rarely, seldom — уже отрицательные: I hardly ever go out.

Мягкие отрицания, которые звучат по-английски
I'm not really into… (не очень люблю) · I'd rather not (лучше не буду) · Not really (не особо) · I don't think so (не думаю).
don't have to (необязательно) ≠ mustn't (нельзя): You don't have to reply right away.`,

  indirect: `Косвенные вопросы — вопрос внутри предложения. Порядок слов становится обычным: без do / does / did, глагол после подлежащего.

Прямой: Where do you live? → Косвенный: I want to know where you live.
Прямой: What does he do? → Tell me what he does.
Прямой: Is she coming? → I wonder if she's coming.
Прямой: Did you like it? → I'm curious whether you liked it.

Вводные фразы
I wonder… · I'd like to know… · Do you know…? · Can you tell me…? · I'm curious (about)… · Tell me… · I'm not sure… · I have no idea…

Если в прямом вопросе нет вопросительного слова → if / whether:
Do you know if he's married? I'm not sure whether I can make it.

Ошибки
✗ I want to know where do you live → ✓ I want to know where you live.
✗ Tell me what are you looking for → ✓ Tell me what you're looking for.
Do you know what time it is? — вопросительный знак остаётся, если внешняя фраза — вопрос.`,

  tagshort: `Хвостики и короткие ответы — маленькие детали, по которым слышно живую речь.

Разделительные вопросы (tag questions): утверждение + хвостик с противоположным знаком.
You're from Moscow, aren't you? · He doesn't cook, does he? · It was fun, wasn't it? · You can come, can't you?
Интонация вниз — ты почти уверена; вверх — реально спрашиваешь.

Короткие ответы — повторяем вспомогательный глагол, не смысловой.
Do you play chess? — Yes, I do. / No, I don't.
Are you coming? — Yes, I am. / No, I'm not.
Have you been there? — Yes, I have. / No, I haven't.
Did you like it? — I did! / Not really.
Would you like some? — I'd love to. / I'd rather not.

✗ Yes, I like → ✓ Yes, I do. ✗ Yes, I am agree → ✓ Yes, I agree.`,

  gerinf: `-ing или to + V1 после глагола — нужно запомнить, какой глагол что требует.

V-ing после: enjoy, avoid, mind, finish, keep, consider, suggest, imagine, practice, miss, can't stand, feel like, look forward to.
I enjoy cooking. I don't mind waiting. I keep forgetting his name.

to + V1 после: want, need, hope, plan, decide, promise, learn, agree, refuse, would like, manage, afford, seem, tend.
I want to travel. I decided to stay. I'd like to see you.

Оба варианта (смысл не меняется): like, love, hate, prefer, start, begin, continue.
I love traveling = I love to travel.

Смысл МЕНЯЕТСЯ
stop smoking (бросить курить) — stop to smoke (остановиться, чтобы покурить).
remember meeting him (помню, что встречала) — remember to call him (не забудь позвонить).
try calling (попробовать как вариант) — try to call (пытаться).
forget doing (забыла, что делала) — forget to do (забыла сделать).

Герундий как подлежащее: Traveling makes me happy. Learning English takes time.
После предлога — всегда -ing: good at cooking, before leaving, without saying, by practicing, interested in learning.
Голый инфинитив (без to): после модальных (can go), make / let someone do, help (help me carry), would rather, had better.`,

  toprep: `Три разных to — и used to. Здесь ошибаются даже на B2.

1. to — часть инфинитива: после него V1.
I want to see you. It's nice to meet you. I decided to move.

2. to — предлог: после него -ing или существительное.
look forward to meeting you (не to meet!)
be used to living alone (привыкла жить одна)
get used to waking up early (привыкаю)
from 9 to 5 · the key to success · addicted to coffee

3. to — направление: после него место.
I'm flying to Rome. Let's go to the gym. Welcome to Moscow.

used to — три конструкции, три смысла
I used to smoke — раньше курила, теперь нет (привычка в прошлом). Отрицание: I didn't use to.
I'm used to traveling alone — привыкла (состояние). be used to + V-ing.
I'm getting used to living here — привыкаю (процесс). get used to + V-ing.

feel like + V-ing = хочется: I feel like staying home tonight. I don't feel like cooking.`,

  modals: `Модальные глаголы — после них всегда голый V1, без to, без -s, вопрос — перестановкой.

can / can't — умею, могу, можно: I can play the violin. Can you help? I can't talk right now.
could — вежливая просьба, возможность в прошлом, «мог бы»: Could you send me the address? I could play chess at five.
should / shouldn't — совет: You should try padel. You shouldn't reply after ten.
must — уверенность или строгое правило: You must be tired. I must go.
mustn't — запрещено: You mustn't tell anyone.
have to / has to — вынужденность (внешняя): I have to work tomorrow. Прошедшее: had to. Вопрос: Do you have to…?
don't have to — необязательно: You don't have to bring anything.
need to / don't need to — нужно / не нужно: I need to think about it.
may / might — вероятно, возможно: I might be late. It may rain.
would — вежливость, воображаемое: I'd love to. Would you like…? I'd travel more if I could.

Главная пара
You don't have to go = тебе необязательно идти.
You mustn't go = тебе нельзя идти.

Ошибки
✗ I can to swim → ✓ I can swim. ✗ She cans → ✓ She can. ✗ I must to go → ✓ I must go / I have to go.`,

  conditionals: `Conditionals — «если…, то…». Пять типов, но живых в разговоре четыре.

Zero (всегда так): If + Present Simple, Present Simple.
If I don't sleep enough, I feel awful. If you heat ice, it melts.

First (реально в будущем): If + Present Simple, will + V1.
If everything goes well, I'll stay longer. If he calls, I'll tell you.
✗ If it will rain → ✓ If it rains. После if — настоящее, хотя речь о будущем.

Second (нереально или маловероятно сейчас): If + Past Simple, would + V1.
If I had more time, I'd travel more. If I were you, I'd call him.
I'd = I would. Past Simple здесь про нереальность, не про прошлое. were для всех лиц — норма.

Third (нереально в прошлом — сожаление): If + had + V3, would have + V3.
If I'd known earlier, I would've changed my plans. If you hadn't texted, we'd never have met.

Mixed (прошлое повлияло на настоящее): If + had + V3, would + V1.
If I hadn't moved abroad, my life would be completely different now.

unless = if not: I won't go unless you come with me.
Запятая нужна, когда if-часть стоит первой.`,

  passive: `Passive — когда важно, что произошло, а не кто это сделал. Часто соответствует русским «отменили», «мне сказали», «его пригласили».

Формула: be (в нужном времени) + V3.
Present: The flight is delayed. Are you invited?
Past: My flight was canceled. I was born in 1998. We were told to wait.
Present Perfect: The tickets have already been booked. The decision hasn't been made yet.
Будущее: You'll be picked up at the airport.
Модальные: It can't be changed. It should be done by Friday.

by — если всё-таки важно, кто: The photo was taken by my sister.

Когда естественно
• официальные и «безличные» ситуации: The meeting was moved. I was asked to speak.
• результат важнее деятеля: The house was built in 1905.
• get + V3 в разговоре: I got invited to a wedding. He got promoted.

Не злоупотребляй: в живой речи активный залог чаще. «Меня зовут Майя» — My name is…, не I'm called.`,

  relative: `Relative clauses — присоединяем описание к существительному: который, где, чей.

who — люди: I like people who are honest. He's the guy who plays padel with me.
which — вещи: This is the book which changed my mind (в разговоре чаще that).
that — и люди, и вещи, разговорно: That's the place that I told you about.
where — место: That's the café where we met.
whose — чей: a friend whose sister sings opera.
when — время: the year when I moved to Moscow.

Когда местоимение можно опустить
Если оно — дополнение (после него есть подлежащее): The book (that) I'm reading is amazing. The guy (who) I met yesterday…
Если оно — подлежащее — нельзя: the guy who called me (who остаётся).

Предлог — в конце: the girl I told you about · the city I grew up in · the person I'm looking for.
Без запятой — уточняющее (какой именно); с запятой — добавочная информация: My sister, who lives in Moscow, plays the violin.`,

  articles: `Артикли — a / an, the или ничего. В русском их нет, поэтому решать нужно каждый раз.

a / an — один из многих, впервые упомянутый, «какой-то»: I met a guy. I have a sister. She's a blogger. an — перед гласным звуком: an hour, an idea.
the — конкретный, уже известный или единственный: The guy I met was from Italy. the sun, the same, the best, the first.
Ноль — обобщение с неисчисляемыми и множественным числом: I love music. Dogs are loyal. Life is short.

Профессии — с a: I'm a blogger. He's an engineer.
Устойчивые: go to bed, at home, at work, go to school, have breakfast — без артикля; go to the gym, at the airport, in the morning, play the violin — с the.
Страны и города — без: Russia, Moscow; но the US, the UK, the Netherlands.
Первое упоминание → a, дальше → the: I bought a dress. The dress is red.

Ошибки
✗ I'm blogger → ✓ I'm a blogger. ✗ I like the music → ✓ I like music (вообще). ✗ an advice → ✓ some advice (неисчисляемое).`,

  quantifiers: `Количество: some / any / much / many / a lot of / few / little / enough / too.

Исчисляемые (можно посчитать): friends, countries, messages, ideas.
Неисчисляемые (нельзя): advice, information, money, time, work, experience, food, music, news, furniture.
✗ an advice, informations → ✓ some advice, a piece of advice, some information.

some — в утверждениях и предложениях: I have some ideas. Would you like some tea?
any — в вопросах и отрицаниях: Do you have any plans? I don't have any time.
much — с неисчисляемыми, в вопросах и отрицаниях: How much time do you need? I don't have much money.
many — с исчисляемыми: How many countries have you visited?
a lot of / lots of — универсально в утверждениях: I have a lot of work. We have lots of friends.
a few (немного, но есть) — с исчисляемыми: I have a few friends here.
few (мало, почти нет): I have few real friends.
a little (немного, но есть) / little (мало) — с неисчисляемыми: a little time / little time.
enough — достаточно: enough sleep, enough money. Не хватает: not enough.
too much / too many — слишком: too much stress, too many expectations.
plenty of — полно: plenty of time.`,

  prepositions: `Предлоги — то, где чаще всего слышен акцент. Учатся связками: глагол + предлог, прилагательное + предлог.

Глагол + предлог
listen to · talk to · reply to · wait for · look for · look at · ask about · think about · depend on · agree with (someone) / agree on (something) · care about · believe in · apologize for · pay for · arrive in (city) / at (place).
✗ listen music → ✓ listen to music. ✗ wait you → ✓ wait for you. ✗ discuss about → ✓ discuss (без предлога!).

Прилагательное + предлог
interested in · good at · bad at · afraid of · excited about · proud of · responsible for · different from · similar to · comfortable with · tired of · famous for · married to.

Время
at 7, at night, at the weekend (брит.) / on the weekend (амер.) · on Monday, on Friday evening, on September 11 · in September, in 2026, in the morning, in an hour · for two weeks (сколько) · since Monday (с какого момента) · by Friday (не позднее) · until Friday (до) · during the trip.

Место
in Moscow, in Russia, in the room, in the car · at home, at work, at the airport, at the hotel (как точка) · on the plane, on the train, on the second floor.
I'm at the hotel (нахожусь там) — I'm in the hotel (внутри здания).

Движение
to (куда) · from (откуда) · into (внутрь) · out of (наружу) · through · across · toward · around · past.
Куда ты ходила? Where did you go? (без to!) · Откуда ты? Where are you from?`,

  phrasal: `Фразовые глаголы — глагол + частица, смысл целиком. Без них речь звучит как учебник.

Отношения и люди
get along (with) — ладить · break up — расстаться · get over — пережить · move on — жить дальше · open up — раскрыться · ask out — позвать на свидание · hang out — тусоваться · come over — зайти в гости · pick someone up — заехать за кем-то · drop someone off — подвезти.

Дела и жизнь
find out — узнать · figure out — разобраться · work out — тренироваться / получиться · turn out — оказаться · end up — в итоге оказаться · give up — бросить · set up — организовать · grow up — вырасти · calm down — успокоиться · look after / take care of — заботиться.

Время и движение
get back / come back / go back — вернуться · get up — вставать · wake up — проснуться · put off — отложить · catch up — наверстать, поболтать.

Порядок слов
Разделяемые: pick me up, drop you off, figure it out — местоимение всегда между глаголом и частицей (✗ pick up me).
С существительным — как угодно: pick up my sister = pick my sister up.
Неразделяемые: look after him, get over it, get along with her.`,

  comparison: `Сравнения — короткие прилагательные получают -er / -est, длинные — more / most.

Короткие (1 слог и 2 слога на -y): tall → taller → the tallest · easy → easier → the easiest · big → bigger → the biggest.
Длинные: interesting → more interesting → the most interesting · comfortable → more comfortable.
Неправильные: good → better → the best · bad → worse → the worst · far → further → the furthest · little → less → the least · much/many → more → the most.

Конструкции
than — чем: Texting is easier than calling.
as … as — такой же: He's as tall as you. Not as expensive as I thought.
the + превосходная: the best day of my life · the most beautiful city I've seen.
much / a lot / far + сравнительная — усиление: much better, a lot easier, far more interesting.
a bit / a little — чуть: a bit older.
the … the … — чем…, тем…: The more I travel, the more I love home.

Ошибки
✗ more better → ✓ better. ✗ more easy → ✓ easier. ✗ than me / than I — в разговоре than me нормально.
fun — существительное: more fun (не funner); funny = смешной, не «весёлый».`,

  wordorder: `Порядок слов и живые конструкции — то, что делает фразу английской, а не переведённой.

Базовый порядок: подлежащее → глагол → дополнение → место → время.
I play the violin at home on Sundays. (✗ I on Sundays at home play the violin)

Наречия частоты — перед смысловым глаголом, после be: I often cook. I'm always late. I don't usually text first.
Наречия образа действия — в конце: She speaks English well (✗ She speaks well English).

would like — вежливое «хочу»: I'd like to see you. Would you like some coffee? (не Do you want в приличном разговоре)
want someone to do — хочу, чтобы кто-то: I want you to come with me (✗ I want that you come).
let / make someone do — без to: Let me know. He made me laugh.
It's + прилагательное + to: It's hard to explain. It was nice to meet you.
There is / are — «есть»: There's a café near my place. Are there any good places here?
Косвенная речь — время сдвигается назад: He said he was busy. She told me she'd call.
Коллокации: make a decision · take a break · have fun · spend time · keep in touch · pay attention · make sense · take a trip · give it a try.`,

  topic: `Практика по теме. Реплики собраны по одной ситуации — прогони их подряд, чтобы в реальном разговоре нужная фраза всплывала сама.

Как работать
1. Читай русское, произнеси английское вслух до нажатия «Показать перевод».
2. Сверься с основным вариантом и «так тоже можно» — запомни тот, который ближе тебе.
3. Нажми на новые слова — добавь в словарик.
4. «Сразу» — только если сказала без пауз и без ошибок. Иначе — «Ещё раз».`,

  level: `Практика по уровню. Предложения одного уровня сложности — от коротких реплик до развёрнутых.

Уровни
A1 — простые факты, Present Simple / Continuous, базовые вопросы.
A2 — Past Simple, going to, будущее, простые модальные, предлоги.
B1 — Present Perfect, Conditionals 1–2, фразовые глаголы, косвенные вопросы, -ing / to.
B2 — Past Perfect, Third и Mixed Conditional, Passive, тонкие контрасты времён.

Проходи уровень целиком, пока каждое предложение не станет «сразу» дважды, и только потом переходи к следующему.`
};

const TENSE_TAGS = [
  "present-simple", "present-continuous", "present-continuous-future", "past-simple", "past-continuous",
  "present-perfect", "present-perfect-continuous", "past-perfect", "past-perfect-continuous",
  "future-will", "going-to", "future-continuous", "future-perfect", "future-perfect-continuous"
];

export const COURSE: CourseModule[] = [
  // ---- Времена ----
  { id: "present-simple", block: "tenses", title: "Present Simple", subtitle: "Факты, привычки, вкусы", selector: { grammarAny: ["present-simple"] }, theory: T.ps },
  { id: "present-continuous", block: "tenses", title: "Present Continuous", subtitle: "Сейчас, в этот период, по плану", selector: { grammarAny: ["present-continuous", "present-continuous-future"] }, theory: T.pc },
  { id: "simple-vs-continuous", block: "tenses", title: "Simple vs Continuous", subtitle: "Контраст: вообще или сейчас", selector: { grammarAny: ["present-simple", "present-continuous"] }, theory: T.psvpc },
  { id: "past-simple", block: "tenses", title: "Past Simple", subtitle: "Рассказы о прошлом", selector: { grammarAny: ["past-simple"] }, theory: T.past },
  { id: "past-continuous", block: "tenses", title: "Past Continuous", subtitle: "Фон и событие", selector: { grammarAny: ["past-continuous"] }, theory: T.pastc },
  { id: "present-perfect", block: "tenses", title: "Present Perfect", subtitle: "Опыт, результат, «уже / ещё нет»", selector: { grammarAny: ["present-perfect"] }, theory: T.pp },
  { id: "perfect-vs-past", block: "tenses", title: "Perfect vs Past Simple", subtitle: "Главный контраст для русскоговорящих", selector: { grammarAny: ["present-perfect", "past-simple"] }, theory: T.ppvpast },
  { id: "present-perfect-continuous", block: "tenses", title: "Present Perfect Continuous", subtitle: "«В последнее время», «как давно»", selector: { grammarAny: ["present-perfect-continuous"] }, theory: T.ppc },
  { id: "future", block: "tenses", title: "Будущее: will / going to / Continuous", subtitle: "Решение, намерение, договорённость", selector: { grammarAny: ["future-will", "going-to", "present-continuous-future"] }, theory: T.future },
  { id: "future-advanced", block: "tenses", title: "Future Continuous и Perfect", subtitle: "«Буду в процессе», «уже сделаю к…»", selector: { grammarAny: ["future-continuous", "future-perfect", "future-perfect-continuous", "by-until"] }, theory: T.futadv },
  { id: "past-perfect", block: "tenses", title: "Past Perfect", subtitle: "Прошлое в прошлом", selector: { grammarAny: ["past-perfect", "past-perfect-continuous"] }, theory: T.pastperf },
  { id: "all-tenses", block: "tenses", title: "Все времена вперемешку", subtitle: "Контроль: выбираешь время сама", selector: { grammarAny: TENSE_TAGS }, theory: T.mix },

  // ---- Вопросы и отрицания ----
  { id: "questions", block: "questions", title: "Вопросы", subtitle: "do / does / did / am / is / are / have / will", selector: { grammarAny: ["question"] }, theory: T.questions, sections: false },
  { id: "negation", block: "questions", title: "Отрицания", subtitle: "don't / didn't / haven't / won't / can't", selector: { grammarAny: ["negation"] }, theory: T.negation, sections: false },
  { id: "indirect-questions", block: "questions", title: "Косвенные вопросы", subtitle: "I wonder where you live", selector: { grammarAny: ["indirect-question"] }, theory: T.indirect, sections: false },
  { id: "tags-short-answers", block: "questions", title: "Хвостики и короткие ответы", subtitle: "…, aren't you? — Yes, I am.", selector: { grammarAny: ["tag-question", "short-answer"] }, theory: T.tagshort, sections: false },

  // ---- Правила и конструкции ----
  { id: "gerund-infinitive", block: "rules", title: "-ing или to", subtitle: "enjoy doing / want to do / stop smoking", selector: { grammarAny: ["gerund", "infinitive", "bare-infinitive", "stop-remember-try"] }, theory: T.gerinf },
  { id: "to-and-used-to", block: "rules", title: "Три вида to и used to", subtitle: "look forward to meeting / used to / be used to", selector: { grammarAny: ["to-preposition", "look-forward-to", "be-used-to", "used-to", "feel-like"] }, theory: T.toprep },
  { id: "modals", block: "rules", title: "Модальные глаголы", subtitle: "can / should / must / have to / might", selector: { grammarAny: ["modal"] }, theory: T.modals },
  { id: "conditionals", block: "rules", title: "Conditionals", subtitle: "If I had more time, I'd travel more", selector: { grammarAny: ["conditional-0", "conditional-1", "conditional-2", "conditional-3", "conditional-mixed"] }, theory: T.conditionals },
  { id: "passive", block: "rules", title: "Passive", subtitle: "My flight was canceled", selector: { grammarAny: ["passive"] }, theory: T.passive },
  { id: "relative-clauses", block: "rules", title: "who / that / which / where", subtitle: "Relative clauses", selector: { grammarAny: ["relative-clause"] }, theory: T.relative },
  { id: "articles", block: "rules", title: "Артикли", subtitle: "a / the / ничего", selector: { grammarAny: ["article"] }, theory: T.articles },
  { id: "quantifiers", block: "rules", title: "Количество", subtitle: "some / any / much / many / a few", selector: { grammarAny: ["quantifier", "countable-uncountable"] }, theory: T.quantifiers },
  { id: "prepositions", block: "rules", title: "Предлоги", subtitle: "wait for / at 7 / in Moscow / since Monday", selector: { grammarAny: ["preposition", "time-preposition", "place-preposition", "movement-preposition", "for-since", "by-until"] }, theory: T.prepositions },
  { id: "phrasal-verbs", block: "rules", title: "Фразовые глаголы", subtitle: "find out / hang out / break up / end up", selector: { grammarAny: ["phrasal-verb"] }, theory: T.phrasal },
  { id: "comparison", block: "rules", title: "Сравнения", subtitle: "easier than / the best / as … as", selector: { grammarAny: ["comparative", "superlative"] }, theory: T.comparison },
  { id: "word-order", block: "rules", title: "Порядок слов и живые конструкции", subtitle: "would like / want you to / let me know", selector: { grammarAny: ["word-order", "would-like", "want-someone-to", "there-is", "reported-speech", "collocation"] }, theory: T.wordorder },

  // ---- По темам ----
  { id: "topic-communication", block: "topics", title: "Общение и переписка", subtitle: "Согласиться, уточнить, ответить на «что делаешь»", selector: { topicAny: ["communication", "texting", "small-talk", "humor"] }, theory: T.topic, sections: false },
  { id: "topic-acquaintance", block: "topics", title: "Знакомство и свидания", subtitle: "Кто ты, что ищешь, первые встречи", selector: { topicAny: ["acquaintance", "dating"] }, theory: T.topic, sections: false },
  { id: "topic-relationships", block: "topics", title: "Отношения и чувства", subtitle: "Доверие, границы, прошлый опыт", selector: { topicAny: ["relationships", "past-relationships", "feelings"] }, theory: T.topic, sections: false },
  { id: "topic-travel", block: "topics", title: "Путешествия", subtitle: "Рейсы, отели, маршруты", selector: { topicAny: ["travel"] }, theory: T.topic, sections: false },
  { id: "topic-work", block: "topics", title: "Работа", subtitle: "Проекты, созвоны, цели", selector: { topicAny: ["work"] }, theory: T.topic, sections: false },
  { id: "topic-family", block: "topics", title: "Семья и друзья", subtitle: "Родители, сёстры, подруги", selector: { topicAny: ["family", "friends"] }, theory: T.topic, sections: false },
  { id: "topic-daily", block: "topics", title: "Повседневность", subtitle: "Еда, спорт, режим, планы", selector: { topicAny: ["daily-life", "food", "lifestyle", "plans"] }, theory: T.topic, sections: false },
  { id: "topic-interests", block: "topics", title: "Интересы", subtitle: "Музыка, книги, спорт, ИИ", selector: { topicAny: ["interests"] }, theory: T.topic, sections: false },
  { id: "topic-deep", block: "topics", title: "Глубокие разговоры", subtitle: "Ценности, мечты, страхи", selector: { topicAny: ["deep-talk"] }, theory: T.topic, sections: false },

  // ---- По уровням ----
  { id: "level-a1", block: "levels", title: "A1", subtitle: "Первые фразы", selector: { levels: ["A1"] }, theory: T.level, sections: false },
  { id: "level-a2", block: "levels", title: "A2", subtitle: "Базовый разговор", selector: { levels: ["A2"] }, theory: T.level, sections: false },
  { id: "level-b1", block: "levels", title: "B1", subtitle: "Уверенный разговор", selector: { levels: ["B1"] }, theory: T.level, sections: false },
  { id: "level-b2", block: "levels", title: "B2", subtitle: "Свободно и точно", selector: { levels: ["B2"] }, theory: T.level, sections: false }
];
