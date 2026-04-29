import React, { useState } from "react";

export type PageData = {
  slug: string;
  kind: "static" | "dynamic" | "interactive";
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

export type ProductEventPayload = {
  eventType: string;
  eventTarget?: string;
  eventValue?: string;
};

const Page = ({
  data,
  onProductEvent,
}: {
  data: PageData;
  onProductEvent?: (event: ProductEventPayload) => void;
}) => {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [delivery, setDelivery] = useState("standard");
  const [phone, setPhone] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [articleInsightsOpen, setArticleInsightsOpen] = useState(false);
  const [relatedMaterialOpen, setRelatedMaterialOpen] = useState(false);
  const [consultationRequested, setConsultationRequested] = useState(false);
  const [reportRange, setReportRange] = useState("today");
  const [reportDetailOpen, setReportDetailOpen] = useState(false);
  const [reportAlertAcknowledged, setReportAlertAcknowledged] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const categories = Array.from(
    new Set((data.catalogItems ?? []).map((item) => item.category))
  );
  const catalogItems = (data.catalogItems ?? []).filter((item) => {
    const categoryMatches = category === "all" || item.category === category;
    const searchMatches =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    return categoryMatches && searchMatches;
  });
  const selectedItem =
    (data.catalogItems ?? []).find((item) => item.id === selectedItemId) ?? null;
  const cartItems = (data.catalogItems ?? []).filter((item) =>
    cart.includes(item.id)
  );
  const cartTotal = cartItems.reduce((sum, item) => sum + item.priceRub, 0);

  const track = (event: ProductEventPayload) => onProductEvent?.(event);

  const toggleCart = (itemId: string) => {
    const exists = cart.includes(itemId);
    const nextCart = exists
      ? cart.filter((id) => id !== itemId)
      : [...cart, itemId];
    setCart(nextCart);
    setStatusNote("");
    track({
      eventType: exists ? "remove_from_cart" : "add_to_cart",
      eventTarget: itemId,
      eventValue: String(nextCart.length),
    });
  };

  const openDetails = (itemId: string, categoryName: string) => {
    setSelectedItemId(itemId);
    track({
      eventType: "view_product_details",
      eventTarget: itemId,
      eventValue: categoryName,
    });
  };

  const beginCheckout = () => {
    setCheckoutStarted(true);
    setStatusNote("");
    track({
      eventType: "begin_checkout",
      eventTarget: "checkout_panel",
      eventValue: String(cart.length),
    });
  };

  const submitCheckout = () => {
    setStatusNote("Заказ принят, мы с вами свяжемся.");
    track({
      eventType: "submit_checkout",
      eventTarget: delivery,
      eventValue: String(cartTotal),
    });
  };

  const requestInstallment = () => {
    setStatusNote("Заявка принята, мы с вами свяжемся.");
    track({
      eventType: "click_fake_door",
      eventTarget: "installment_offer",
      eventValue: String(cartTotal),
    });
  };

  const openArticleInsights = () => {
    setArticleInsightsOpen(true);
    track({
      eventType: "engaged_read",
      eventTarget: "article_highlights",
      eventValue: data.slug,
    });
  };

  const openRelatedMaterial = () => {
    setRelatedMaterialOpen(true);
    track({
      eventType: "open_related_material",
      eventTarget: "related_materials",
      eventValue: data.slug,
    });
  };

  const requestConsultation = () => {
    setConsultationRequested(true);
    track({
      eventType: "click_cta",
      eventTarget: "content_consultation",
      eventValue: data.slug,
    });
  };

  const changeReportRange = (value: string) => {
    setReportRange(value);
    setReportMessage("");
    track({
      eventType: "change_report_filter",
      eventTarget: "report_range",
      eventValue: value,
    });
  };

  const openReportDetail = () => {
    setReportDetailOpen(true);
    setReportMessage("");
    track({
      eventType: "open_report_detail",
      eventTarget: "anomaly_panel",
      eventValue: reportRange,
    });
  };

  const acknowledgeReportAlert = () => {
    setReportAlertAcknowledged(true);
    setReportMessage("Контроль принят, ответственный получит уведомление.");
    track({
      eventType: "acknowledge_alert",
      eventTarget: "inventory_alert",
      eventValue: reportRange,
    });
  };

  const exportReport = () => {
    setReportMessage("Отчёт сформирован, ссылка на выгрузку отправлена в рабочий чат.");
    track({
      eventType: "export_report",
      eventTarget: "report_export",
      eventValue: reportRange,
    });
  };

  if (data.kind === "interactive" && data.catalogItems?.length) {
    return (
      <div style={pageShellStyle}>
        <section style={heroStyle}>
          <div>
            <div style={heroEyebrowStyle}>marketplace demo</div>
            <h1 style={heroTitleStyle}>Render Shop</h1>
            <p style={heroTextStyle}>
              Выбирайте популярные товары, собирайте корзину и проходите путь до
              оформления заказа.
            </p>
          </div>
          <div style={heroPromoStyle}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Только сегодня</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
              Скидки до 20%
            </div>
            <div style={{ marginTop: 8 }}>
              На бытовую технику, электронику и товары для дома.
            </div>
          </div>
        </section>

        <section style={contentSectionStyle}>
          <div style={toolbarStyle}>
            <label>
              Категория{" "}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  track({
                    eventType: "filter_catalog",
                    eventTarget: "category",
                    eventValue: e.target.value,
                  });
                }}
              >
                <option value="all">Все категории</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Поиск{" "}
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  track({
                    eventType: "search_catalog",
                    eventTarget: "catalog_search",
                    eventValue: e.target.value,
                  });
                }}
                placeholder="Товар, бренд или категория"
              />
            </label>
            <span style={{ color: "#64748b" }}>Найдено товаров: {catalogItems.length}</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {catalogItems.map((item) => {
                const inCart = cart.includes(item.id);
                return (
                  <article key={item.id} style={productCardStyle}>
                    <div style={productImageWrapStyle}>
                      {item.badge ? <div style={badgeStyle}>{item.badge}</div> : null}
                      <img
                        src={item.image}
                        alt={item.name}
                        style={productImageStyle}
                        loading="lazy"
                      />
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
                      {item.category}
                    </div>
                    <h3 style={{ margin: "8px 0 6px", fontSize: 18 }}>{item.name}</h3>
                    <p style={{ margin: "0 0 10px", color: "#475569", minHeight: 54 }}>
                      {item.description}
                    </p>

                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <strong style={{ fontSize: 24, color: "#0f172a" }}>
                        {formatRub(item.priceRub)}
                      </strong>
                      {item.oldPriceRub ? (
                        <span
                          style={{
                            fontSize: 14,
                            color: "#94a3b8",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatRub(item.oldPriceRub)}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ marginTop: 8, color: item.inStock ? "#0f9f53" : "#b45309" }}>
                      {item.inStock ? "Доставка завтра" : "Поставка ожидается"}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                      <button
                        type="button"
                        disabled={!item.inStock}
                        onClick={() => toggleCart(item.id)}
                      >
                        {inCart ? "Убрать" : "В корзину"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openDetails(item.id, item.category)}
                      >
                        Подробнее
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside style={checkoutPanelStyle}>
              <h2 style={{ marginTop: 0 }}>Корзина</h2>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                Добавьте товары и перейдите к оформлению заказа.
              </p>

              <div style={{ marginBottom: 10 }}>
                <strong>{cartItems.length}</strong> товаров
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
                {formatRub(cartTotal)}
              </div>

              {cartItems.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={cartRowStyle}>
                      <img src={item.image} alt={item.name} style={cartThumbStyle} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>
                          {formatRub(item.priceRub)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyStateStyle}>
                  Корзина пока пуста. Выберите товары из каталога.
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                <button
                  type="button"
                  disabled={!cartItems.length}
                  onClick={beginCheckout}
                >
                  Перейти к оформлению
                </button>
                <button type="button" onClick={requestInstallment}>
                  Рассрочка 0-0-12
                </button>
              </div>

              {checkoutStarted ? (
                <div style={{ marginTop: 18 }}>
                  <label style={{ display: "block", marginBottom: 10 }}>
                    Телефон{" "}
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </label>
                  <label style={{ display: "block", marginBottom: 12 }}>
                    Способ доставки{" "}
                    <select
                      value={delivery}
                      onChange={(e) => {
                        setDelivery(e.target.value);
                        track({
                          eventType: "select_delivery",
                          eventTarget: "delivery",
                          eventValue: e.target.value,
                        });
                      }}
                    >
                      <option value="standard">Курьером завтра</option>
                      <option value="express">Экспресс за 2 часа</option>
                      <option value="pickup">Самовывоз из пункта выдачи</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={!phone.trim()}
                    onClick={submitCheckout}
                  >
                    Оформить заказ
                  </button>
                </div>
              ) : null}

              {statusNote ? <div style={statusNoteStyle}>{statusNote}</div> : null}
            </aside>
          </div>
        </section>

        {selectedItem ? (
          <div style={modalOverlayStyle} onClick={() => setSelectedItemId(null)}>
            <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                style={modalCloseStyle}
                onClick={() => setSelectedItemId(null)}
              >
                Закрыть
              </button>
              <div style={modalGridStyle}>
                <div style={modalImageWrapStyle}>
                  <img src={selectedItem.image} alt={selectedItem.name} style={modalImageStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                    {selectedItem.category}
                  </div>
                  <h2 style={{ marginTop: 0 }}>{selectedItem.name}</h2>
                  <p style={{ color: "#334155", lineHeight: 1.6 }}>
                    {selectedItem.description}
                  </p>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <strong style={{ fontSize: 28 }}>{formatRub(selectedItem.priceRub)}</strong>
                    {selectedItem.oldPriceRub ? (
                      <span
                        style={{
                          color: "#94a3b8",
                          textDecoration: "line-through",
                        }}
                      >
                        {formatRub(selectedItem.oldPriceRub)}
                      </span>
                    ) : null}
                  </div>
                  <p style={{ color: "#0f9f53" }}>
                    {selectedItem.inStock
                      ? "В наличии, доставка уже завтра"
                      : "Сейчас нет в наличии, оставьте заявку"}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      disabled={!selectedItem.inStock}
                      onClick={() => {
                        toggleCart(selectedItem.id);
                        setSelectedItemId(null);
                      }}
                    >
                      Добавить в корзину
                    </button>
                    <button type="button" onClick={() => setSelectedItemId(null)}>
                      Продолжить покупки
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (data.kind === "dynamic" && data.liveStats?.length) {
    return (
      <div style={pageShellStyle}>
        <section style={heroStyle}>
          <div>
            <div style={heroEyebrowStyle}>operations</div>
            <h1 style={heroTitleStyle}>{data.title}</h1>
            <p style={heroTextStyle}>
              Операционная панель с ежедневными метриками и статусом ключевых
              процессов.
            </p>
          </div>
        </section>

        <section style={contentSectionStyle}>
          <div style={toolbarStyle}>
            <label>
              Период{" "}
              <select
                value={reportRange}
                onChange={(e) => changeReportRange(e.target.value)}
              >
                <option value="today">Сегодня</option>
                <option value="week">7 дней</option>
                <option value="month">30 дней</option>
              </select>
            </label>
            <button type="button" onClick={openReportDetail}>
              Разобрать отклонение
            </button>
            <button type="button" onClick={exportReport}>
              Экспорт отчёта
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {data.liveStats.map((item) => (
              <div key={item.label} style={statCardStyle}>
                <div style={{ fontSize: 13, color: "#365b86" }}>{item.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, margin: "10px 0" }}>
                  {item.value}
                </div>
                <div style={{ color: "#365b86" }}>{item.delta ?? "без изменений"}</div>
              </div>
            ))}
          </div>

          <div style={reportLayoutStyle}>
            <section style={reportPanelStyle}>
              <div style={reportPanelHeaderStyle}>
                <div>
                  <div style={sectionEyebrowStyle}>контрольный сигнал</div>
                  <h2 style={{ margin: "6px 0 8px" }}>Падение доступности fast-moving SKU</h2>
                </div>
                <span style={pillAlertStyle}>требует реакции</span>
              </div>
              <p style={{ color: "#475569", marginTop: 0 }}>
                По части ассортимента наблюдается снижение доступности на витрине. Этот
                сценарий имитирует рабочую панель, где пользователь меняет период,
                открывает детали и принимает решение по алерту.
              </p>
              <div style={insightGridStyle}>
                <div style={insightCardStyle}>
                  <div style={insightLabelStyle}>Период</div>
                  <strong>{reportRange === "today" ? "Сегодня" : reportRange === "week" ? "7 дней" : "30 дней"}</strong>
                </div>
                <div style={insightCardStyle}>
                  <div style={insightLabelStyle}>Зона риска</div>
                  <strong>Склад Юг-2</strong>
                </div>
                <div style={insightCardStyle}>
                  <div style={insightLabelStyle}>Приоритет</div>
                  <strong>Высокий</strong>
                </div>
              </div>
            </section>

            <aside style={sidePanelStyle}>
              <div style={sectionEyebrowStyle}>детали сценария</div>
              <h3 style={{ margin: "6px 0 10px" }}>Что делает оператор</h3>
              <ol style={orderedListStyle}>
                <li>Выбирает интересующий период.</li>
                <li>Открывает карточку отклонения.</li>
                <li>Подтверждает обработку алерта.</li>
                <li>Экспортирует отчёт для команды.</li>
              </ol>

              {reportDetailOpen ? (
                <div style={detailCardStyle}>
                  <strong>Отклонение по группе "Электроника"</strong>
                  <p style={{ margin: "8px 0", color: "#475569" }}>
                    На 12 SKU снизилась доступность в течение последних 4 часов. Нужно
                    подтвердить контроль и передать выгрузку в операционный чат.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={acknowledgeReportAlert}>
                      Подтвердить контроль
                    </button>
                    <button type="button" onClick={exportReport}>
                      Отправить выгрузку
                    </button>
                  </div>
                </div>
              ) : (
                <div style={emptyStateStyle}>
                  Откройте детальную панель, чтобы продолжить рабочий сценарий.
                </div>
              )}

              {reportAlertAcknowledged ? (
                <div style={successNoteStyle}>Алерт взят в работу.</div>
              ) : null}
              {reportMessage ? <div style={statusNoteStyle}>{reportMessage}</div> : null}
            </aside>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={pageShellStyle}>
      <section style={heroStyle}>
        <div>
          <div style={heroEyebrowStyle}>journal</div>
          <h1 style={heroTitleStyle}>{data.title}</h1>
          <p style={heroTextStyle}>
            Материал о том, как современные цифровые сервисы проектируют быстрый и
            предсказуемый пользовательский опыт.
          </p>
        </div>
      </section>

      <section style={contentSectionStyle}>
        <div style={reportLayoutStyle}>
          <article style={articleCardStyle}>
            <div style={sectionEyebrowStyle}>материал недели</div>
            <h2 style={{ marginTop: 6 }}>Как продуктовые команды проектируют быстрые интерфейсы</h2>
            <p style={articleLeadStyle}>
              Скорость доступа к контенту и последовательность пользовательского
              сценария напрямую влияют на качество восприятия цифрового продукта.
            </p>
            <p style={articleTextStyle}>
              Хорошая пользовательская страница должна оставаться понятной и цельной
              независимо от того, каким образом она формируется внутри системы. Поэтому
              в современных интерфейсах особенно важны быстрый вход в сценарий,
              визуальная стабильность и минимальное время до первого осмысленного
              взаимодействия.
            </p>
            <p style={articleTextStyle}>
              На практике продуктовые команды балансируют между скоростью ответа,
              свежестью данных и сложностью поддержки. Именно поэтому для таких страниц
              полезно измерять не только технические метрики, но и вовлечение читателя:
              дочитал ли он материал, открыл ли связанный блок и нажал ли на целевое
              действие.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <button type="button" onClick={openArticleInsights}>
                Показать ключевые тезисы
              </button>
              <button type="button" onClick={openRelatedMaterial}>
                Связанные материалы
              </button>
              <button type="button" onClick={requestConsultation}>
                Обсудить внедрение
              </button>
            </div>

            {articleInsightsOpen ? (
              <div style={detailCardStyle}>
                <strong>Ключевые тезисы</strong>
                <ul style={listStyle}>
                  <li>Быстрый вход в сценарий влияет на восприятие качества продукта.</li>
                  <li>Одинаковый TTFB не гарантирует одинаковую вовлечённость.</li>
                  <li>Контентные страницы тоже можно оценивать через proxy-метрики.</li>
                </ul>
              </div>
            ) : null}
          </article>

          <aside style={sidePanelStyle}>
            <div style={sectionEyebrowStyle}>поведение читателя</div>
            <h3 style={{ margin: "6px 0 10px" }}>Прокси-воронка статьи</h3>
            <ol style={orderedListStyle}>
              <li>Читатель вовлекается в материал.</li>
              <li>Открывает связанные материалы.</li>
              <li>Нажимает на целевое действие.</li>
            </ol>

            {relatedMaterialOpen ? (
              <div style={detailCardStyle}>
                <strong>Что ещё можно посмотреть</strong>
                <ul style={listStyle}>
                  <li>Разбор влияния LCP на продуктовые сценарии.</li>
                  <li>Практика сравнения CSR, SSR и SSG на реальных страницах.</li>
                  <li>Методика построения прокси-метрик для ВКР.</li>
                </ul>
              </div>
            ) : (
              <div style={emptyStateStyle}>
                После открытия связанного материала здесь появится рекомендованный блок.
              </div>
            )}

            {consultationRequested ? (
              <div style={successNoteStyle}>
                Спасибо, заявка принята. Мы свяжемся с вами для обсуждения.
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
};

function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

const pageShellStyle: React.CSSProperties = {
  fontFamily: "system-ui",
  padding: 24,
  maxWidth: 1220,
  margin: "0 auto",
  background: "#f8fafc",
};

const heroStyle: React.CSSProperties = {
  padding: 28,
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(0,94,255,0.96), rgba(130,60,255,0.88))",
  color: "#ffffff",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

const heroEyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: "rgba(255,255,255,0.74)",
};

const heroTitleStyle: React.CSSProperties = {
  margin: "8px 0 12px",
  fontSize: 40,
  lineHeight: 1.05,
};

const heroTextStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 720,
  color: "rgba(255,255,255,0.92)",
  lineHeight: 1.6,
};

const heroPromoStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.2)",
  alignSelf: "start",
};

const contentSectionStyle: React.CSSProperties = {
  padding: 24,
  borderRadius: 20,
  border: "1px solid #dbe3ef",
  background: "#ffffff",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 18,
};

const productCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 14,
  background: "#ffffff",
  boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
};

const productImageWrapStyle: React.CSSProperties = {
  position: "relative",
  background: "#f8fafc",
  borderRadius: 16,
  overflow: "hidden",
};

const productImageStyle: React.CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  display: "block",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  background: "#2563eb",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 999,
  padding: "6px 10px",
};

const checkoutPanelStyle: React.CSSProperties = {
  border: "1px solid #dbe3ef",
  borderRadius: 20,
  padding: 18,
  background: "#f8fafc",
  position: "sticky",
  top: 20,
};

const cartRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "56px 1fr",
  gap: 10,
  alignItems: "center",
  padding: 8,
  borderRadius: 12,
  background: "#ffffff",
};

const cartThumbStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  objectFit: "cover",
  borderRadius: 10,
};

const emptyStateStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "#ffffff",
  color: "#64748b",
};

const statusNoteStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "#eff6ff",
  color: "#1d4ed8",
};

const statCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 16,
  background: "#eef6ff",
  border: "1px solid #c7def8",
};

const reportLayoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 1fr)",
  gap: 18,
  alignItems: "start",
};

const reportPanelStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
};

const reportPanelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
  flexWrap: "wrap",
};

const pillAlertStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: 12,
  fontWeight: 700,
};

const sectionEyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.1,
  color: "#64748b",
};

const insightGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const insightCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const insightLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  marginBottom: 6,
};

const sidePanelStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #dbe3ef",
};

const detailCardStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid #dbe3ef",
};

const successNoteStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "#ecfdf3",
  color: "#166534",
};

const articleCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
};

const articleLeadStyle: React.CSSProperties = {
  fontSize: 20,
  lineHeight: 1.5,
  color: "#0f172a",
};

const articleTextStyle: React.CSSProperties = {
  color: "#334155",
  lineHeight: 1.8,
};

const orderedListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 20,
  color: "#334155",
  lineHeight: 1.8,
};

const listStyle: React.CSSProperties = {
  margin: "8px 0 0",
  paddingLeft: 20,
  color: "#334155",
  lineHeight: 1.8,
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.5)",
  display: "grid",
  placeItems: "center",
  padding: 20,
  zIndex: 20,
};

const modalStyle: React.CSSProperties = {
  width: "min(920px, 100%)",
  background: "#ffffff",
  borderRadius: 24,
  padding: 24,
  position: "relative",
  boxShadow: "0 24px 48px rgba(15,23,42,0.2)",
};

const modalCloseStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
};

const modalGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)",
  gap: 20,
  alignItems: "start",
};

const modalImageWrapStyle: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: 18,
  overflow: "hidden",
};

const modalImageStyle: React.CSSProperties = {
  width: "100%",
  height: 320,
  objectFit: "cover",
  display: "block",
};

export default Page;
