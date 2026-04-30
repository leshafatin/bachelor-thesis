import React, { useState } from "react";
import type { PageData, ProductEventPayload } from "./types";
import {
  badgeStyle,
  cartRowStyle,
  cartThumbStyle,
  checkoutPanelStyle,
  contentSectionStyle,
  emptyStateStyle,
  formatRub,
  heroEyebrowStyle,
  heroPromoStyle,
  heroStyle,
  heroTextStyle,
  heroTitleStyle,
  modalCloseStyle,
  modalGridStyle,
  modalImageStyle,
  modalImageWrapStyle,
  modalOverlayStyle,
  modalStyle,
  pageShellStyle,
  productCardStyle,
  productImageStyle,
  productImageWrapStyle,
  statusNoteStyle,
  toolbarStyle,
} from "./styles";

export function InteractiveCatalogPage({
  data,
  onProductEvent,
}: {
  data: PageData;
  onProductEvent?: (event: ProductEventPayload) => void;
}) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [delivery, setDelivery] = useState("standard");
  const [phone, setPhone] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const track = (event: ProductEventPayload) => onProductEvent?.(event);
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
