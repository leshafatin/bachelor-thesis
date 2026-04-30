import type { PageData } from "./pageTypes.js";

export type { CatalogItem, PageData, PageKind, ProductEventPayload } from "./pageTypes.js";

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
    const trafficSeries = [68, 72, 76, 81, 79, 83, 88].map(
      (value, index) => value + ((minute + index) % 5)
    );
    const availabilitySeries = [98.8, 98.6, 98.4, 98.3, 98.1, 97.9, 97.8].map(
      (value, index) => Number((value - ((minute + index) % 3) * 0.1).toFixed(1))
    );
    const fulfillmentSeries = [41, 39, 38, 44, 46, 43, 48].map(
      (value, index) => value + ((hour + index) % 4)
    );
    const hourlyLoad = [42, 58, 64, 71, 88, 94, 79, 62].map((value, index) => ({
      label: `${9 + index}:00`,
      value: value + ((minute + index) % 6),
    }));

    return {
      slug,
      kind: "dynamic",
      title: "Операционный отчёт за текущий интервал",
      body: "Панель для руководителя смены: здесь видно, как двигаются заказы, где проседает доступность и какие очереди рискуют выйти за SLA в ближайшие часы.",
      ts,
      experimentGoal:
        "Проверить, насколько стратегия рендеринга влияет на скорость первой отрисовки при наличии изменяющихся данных.",
      highlights: [
        { label: "Контур", value: "Операции и fulfilment" },
        { label: "Режим", value: "Живой мониторинг смены" },
        { label: "Ключевой риск", value: "Просадка доступности и SLA" },
      ],
      liveStats: [
        { label: "Новых заказов", value: String(120 + minute), delta: `+${minute % 9}%` },
        { label: "Активных сессий", value: String(40 + hour), delta: `+${hour % 6}%` },
        {
          label: "Ошибок за час",
          value: String(3 + (minute % 5)),
          delta: `${minute % 2 === 0 ? "-" : "+"}${minute % 4}%`,
        },
        {
          label: "Доставка today/tomorrow",
          value: `${89 + (hour % 7)}%`,
          delta: `${minute % 2 === 0 ? "+" : "-"}${(hour % 4) + 1}%`,
        },
      ],
      reportSeries: [
        {
          title: "Трафик витрины",
          unit: "тыс. сессий",
          labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
          points: trafficSeries,
          tone: "blue",
        },
        {
          title: "Доступность каталога",
          unit: "%",
          labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
          points: availabilitySeries,
          tone: "green",
        },
        {
          title: "Отгрузка до SLA",
          unit: "мин",
          labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
          points: fulfillmentSeries,
          tone: "orange",
        },
      ],
      reportChannelMix: [
        {
          label: "Мобильное приложение",
          value: 46 + (hour % 5),
          note: "Основной источник заказов в вечернем окне.",
          tone: "blue",
        },
        {
          label: "Web-витрина",
          value: 31 + (minute % 4),
          note: "Стабильный поток, чувствителен к скорости первой загрузки.",
          tone: "green",
        },
        {
          label: "Push и reactivation",
          value: 14 + (hour % 3),
          note: "Даёт резкие пики на акционных слотах.",
          tone: "orange",
        },
      ],
      reportHourlyLoad: hourlyLoad,
      reportSegments: [
        {
          label: "Электроника / Юг-2",
          availabilityPct: 92,
          orders: 148,
          eta: "2 ч 10 мин",
        },
        {
          label: "Дом / Север-1",
          availabilityPct: 96,
          orders: 91,
          eta: "1 ч 35 мин",
        },
        {
          label: "Кухня / Центр-4",
          availabilityPct: 94,
          orders: 73,
          eta: "2 ч 45 мин",
        },
      ],
      reportAlerts: [
        {
          title: "Падение доступности fast-moving SKU",
          severity: "high",
          note: "12 SKU выпали из обещания доставки на складе Юг-2.",
        },
        {
          title: "Рост времени до комплектации",
          severity: "medium",
          note: "Пиковая нагрузка в вечернем окне замедляет сборку заказов.",
        },
      ],
      reportWorkQueues: [
        {
          label: "Комплектация wave 18:00",
          backlog: `${18 + (minute % 6)} заказов`,
          owner: "Смена Юг-2",
          sla: "45 мин",
        },
        {
          label: "Подтверждение замен",
          backlog: `${6 + (hour % 4)} SKU`,
          owner: "Категория электроника",
          sla: "20 мин",
        },
        {
          label: "Возвраты и разбор брака",
          backlog: `${9 + (minute % 5)} кейсов`,
          owner: "Операционный контроль",
          sla: "2 ч",
        },
      ],
      facts: [
        "В отчёте совмещены метрики трафика, доступности и fulfilment, поэтому пользователю важно быстро считать общую картину.",
        "Сценарий правдоподобен для сравнения стратегий рендеринга: здесь важны и свежесть данных, и быстрый первый ответ страницы.",
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
    title: "Почему котики по-прежнему правят интернетом",
    body: "История о том, как домашние коты превратились из случайных героев форумов в устойчивый символ уютного, смешного и бесконечно цитируемого интернет-контента.",
    ts,
    experimentGoal:
      "Проверить, как стратегия рендеринга влияет на TTFB и LCP для практически неизменяемой страницы.",
    highlights: [],
    facts: [
      "Коты десятилетиями остаются одним из самых устойчивых меметических образов в сети.",
      "Статическая статья про котиков удобна для оценки глубины чтения и кликов по связанным материалам.",
      "Для такого сценария SSG обычно выглядит сильным кандидатом по скорости первой отдачи.",
    ],
  };
}

function normalizeSlug(slug: string) {
  const value = slug.trim().toLowerCase();
  if (value === "about") return "hello";
  return value || "hello";
}
