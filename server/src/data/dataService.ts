export type PageKind = "static" | "dynamic" | "interactive";

export type PageData = {
  slug: string;
  kind: PageKind;
  title: string;
  body: string;
  ts: string;
  strategy?: string;
  experimentGoal: string;
  highlights: Array<{ label: string; value: string }>;
  facts?: string[];
  liveStats?: Array<{ label: string; value: string; delta?: string }>;
  catalogItems?: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    image: string;
    priceRub: number;
    oldPriceRub?: number;
    badge?: string;
    inStock: boolean;
  }>;
};

export function listPageScenarios() {
  return [
    {
      slug: "hello",
      kind: "static" as const,
      title: "Информационная статья",
      note: "Подходит для оценки выгоды SSG и низкого TTFB на почти неизменяемом контенте.",
    },
    {
      slug: "report",
      kind: "dynamic" as const,
      title: "Динамический отчёт",
      note: "Имитирует страницу, где важна актуальность данных и заметна серверная работа.",
    },
    {
      slug: "catalog",
      kind: "interactive" as const,
      title: "Интерактивный каталог",
      note: "Показывает страницу с большим объёмом данных и клиентскими фильтрами.",
    },
  ];
}

export function getPageData(inputSlug: string): PageData {
  const slug = normalizeSlug(inputSlug);
  const now = new Date();
  const ts = now.toISOString();

  if (slug === "report") {
    const minute = now.getUTCMinutes();
    const hour = now.getUTCHours();

    return {
      slug,
      kind: "dynamic",
      title: "Операционный отчёт за текущий интервал",
      body: "Страница имитирует серверную витрину с часто меняющимися агрегатами. Её удобно использовать для сравнения выигрыша SSR по актуальности данных и оценки компромиссов SSG.",
      ts,
      experimentGoal:
        "Проверить, насколько стратегия рендеринга влияет на скорость первой отрисовки при наличии изменяющихся данных.",
      highlights: [
        { label: "Источник данных", value: "Серверная агрегация" },
        { label: "Характер контента", value: "Часто обновляется" },
        { label: "Ожидаемый лидер", value: "SSR или SSG с поправкой на свежесть" },
      ],
      liveStats: [
        { label: "Новых заказов", value: String(120 + minute), delta: `+${minute % 9}%` },
        { label: "Активных сессий", value: String(40 + hour), delta: `+${hour % 6}%` },
        {
          label: "Ошибок за час",
          value: String(3 + (minute % 5)),
          delta: `${minute % 2 === 0 ? "-" : "+"}${minute % 4}%`,
        },
      ],
      facts: [
        "Данные включают временную метку генерации, поэтому хорошо видна разница между свежестью и скоростью.",
        "Сценарий подходит для обсуждения ограничений SSG на быстро меняющемся контенте.",
      ],
    };
  }

  if (slug === "catalog") {
    const catalogItems = [
      [
        "buds-pro-2",
        "Наушники SoundAir Pro 2",
        "Электроника",
        "Шумоподавление, 36 часов автономной работы и быстрая зарядка кейса.",
        "/static/products/earbuds.svg",
        12990,
        15990,
        "Хит",
        true,
      ],
      [
        "vacuum-x9",
        "Робот-пылесос CleanBot X9",
        "Дом",
        "Лазерная навигация, влажная уборка и управление через приложение.",
        "/static/products/robot-vacuum.svg",
        24990,
        29990,
        "Скидка",
        true,
      ],
      [
        "airfryer-max",
        "Аэрогриль CookEasy Max",
        "Кухня",
        "Объём 6 литров, 8 программ и прозрачное окно контроля готовки.",
        "/static/products/air-fryer.svg",
        8990,
        10990,
        "Топ продаж",
        true,
      ],
      [
        "monitor-27q",
        "Монитор ViewMax 27 QHD",
        "Компьютеры",
        "IPS-матрица 165 Гц, тонкие рамки и режим защиты зрения.",
        "/static/products/monitor.svg",
        21990,
        24990,
        "Новинка",
        true,
      ],
      [
        "chair-flex",
        "Кресло Office Flex Mesh",
        "Мебель",
        "Сетчатая спинка, поясничная поддержка и регулировка подлокотников.",
        "/static/products/chair.svg",
        17990,
        20990,
        "Скидка",
        true,
      ],
      [
        "watch-fit-s",
        "Смарт-часы Pulse Watch Fit S",
        "Гаджеты",
        "AMOLED-дисплей, трекинг сна и до 12 дней без подзарядки.",
        "/static/products/smartwatch.svg",
        11990,
        13990,
        "Хит",
        true,
      ],
      [
        "coffee-mini",
        "Кофемашина Barista Mini One",
        "Кухня",
        "Автоматический капучинатор и компактный формат для дома.",
        "/static/products/coffee-machine.svg",
        18990,
        22990,
        "Премиум",
        true,
      ],
      [
        "powerbank-20",
        "Пауэрбанк ChargeUp 20000",
        "Электроника",
        "Быстрая зарядка 22.5W, USB-C и цифровой индикатор уровня заряда.",
        "/static/products/powerbank.svg",
        3490,
        4290,
        "Выгодно",
        false,
      ],
    ] as Array<
      [string, string, string, string, string, number, number, string, boolean]
    >;

    return {
      slug,
      kind: "interactive",
      title: "Каталог продуктов с фильтрацией",
      body: "Страница содержит заметный объём контента и клиентское взаимодействие после первой загрузки. На ней удобно сравнивать не только TTFB, но и пользовательское восприятие интерактивности.",
      ts,
      experimentGoal:
        "Сравнить, как стратегия рендеринга ведёт себя на данных с большим количеством карточек и последующей фильтрацией на клиенте.",
      highlights: [
        { label: "Источник данных", value: "Смешанный: сервер + клиент" },
        { label: "Характер контента", value: "Объёмный и интерактивный" },
        { label: "Фокус метрик", value: "LCP и INP" },
      ],
      catalogItems: catalogItems.map(
        ([
          id,
          name,
          category,
          description,
          image,
          priceRub,
          oldPriceRub,
          badge,
          inStock,
        ]) => ({
          id,
          name,
          category,
          description,
          image,
          priceRub,
          oldPriceRub,
          badge,
          inStock,
        })
      ),
      facts: [
        "После первичной отрисовки пользователь фильтрует данные на клиенте.",
        "Сценарий показывает, что низкий TTFB не всегда гарантирует лучшую интерактивность.",
      ],
    };
  }

  return {
    slug,
    kind: "static",
    title: "Информационная страница проекта",
    body: "Контент этой страницы почти не меняется, поэтому она подходит для сравнения классических преимуществ SSG и SSR на условно статическом материале.",
    ts,
    experimentGoal:
      "Проверить, как стратегия рендеринга влияет на TTFB и LCP для практически неизменяемой страницы.",
    highlights: [
      { label: "Источник данных", value: "Предсказуемый контент" },
      { label: "Характер контента", value: "Статический" },
      { label: "Фокус метрик", value: "TTFB и LCP" },
    ],
    facts: [
      "Это базовый сценарий, с которого удобно начинать серию замеров.",
      "Ожидается, что SSG здесь будет наиболее сильным кандидатом по скорости ответа.",
      "SSR остаётся полезным как контрольная стратегия для сравнения с предсобранной страницей.",
    ],
  };
}

function normalizeSlug(slug: string) {
  const value = slug.trim().toLowerCase();
  if (value === "about") return "hello";
  return value || "hello";
}
