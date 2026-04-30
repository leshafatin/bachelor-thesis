import React from "react";
import type { PageData } from "../../../data/dataService.js";
import {
  badgeStyle,
  checkoutPanelStyle,
  contentSectionStyle,
  emptyStateStyle,
  formatRub,
  heroEyebrowStyle,
  heroPromoStyle,
  heroStyle,
  heroTextStyle,
  heroTitleStyle,
  pageShellStyle,
  productCardStyle,
  productImageStyle,
  productImageWrapStyle,
  statusNoteStyle,
  toolbarStyle,
} from "./styles.js";

export function InteractiveCatalogPage({
  data,
  noop,
}: {
  data: PageData;
  noop: () => void;
}) {
  const category: string = "all";
  const search: string = "";
  const cart: string[] = [];
  const delivery = "standard";
  const phone = "";
  const statusNote = "";
  const selectedItemId: string | null = null;

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
            <select value={category} onChange={noop}>
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
            <input value={search} onChange={noop} placeholder="Товар, бренд или категория" />
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
            {catalogItems.map((item) => (
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
                  <button type="button" disabled={!item.inStock} onClick={noop}>
                    В корзину
                  </button>
                  <button type="button" onClick={noop}>
                    Подробнее
                  </button>
                </div>
              </article>
            ))}
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
            <div style={emptyStateStyle}>Корзина пока пуста. Выберите товары из каталога.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" disabled={!cartItems.length} onClick={noop}>
                Перейти к оформлению
              </button>
              <button type="button" onClick={noop}>
                Рассрочка 0-0-12
              </button>
            </div>
            {false ? (
              <div style={{ marginTop: 18 }}>
                <label style={{ display: "block", marginBottom: 10 }}>
                  Телефон{" "}
                  <input value={phone} onChange={noop} placeholder="+7 (999) 123-45-67" />
                </label>
                <label style={{ display: "block", marginBottom: 12 }}>
                  Способ доставки{" "}
                  <select value={delivery} onChange={noop}>
                    <option value="standard">Курьером завтра</option>
                    <option value="express">Экспресс за 2 часа</option>
                    <option value="pickup">Самовывоз из пункта выдачи</option>
                  </select>
                </label>
              </div>
            ) : null}
            {statusNote ? <div style={statusNoteStyle}>{statusNote}</div> : null}
          </aside>
        </div>

        {selectedItem ? <div /> : null}
      </section>
    </div>
  );
}
