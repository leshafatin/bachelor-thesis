import React from "react";
import type { PageData } from "../../../data/dataService.js";
import {
  articleCardStyle,
  articleLeadStyle,
  articleTextStyle,
  contentSectionStyle,
  detailCardStyle,
  emptyStateStyle,
  heroEyebrowStyle,
  heroStyle,
  heroTitleStyle,
  listStyle,
  orderedListStyle,
  pageShellStyle,
  reportLayoutStyle,
  sectionEyebrowStyle,
  sidePanelStyle,
} from "./styles.js";

export function StaticArticlePage({
  data,
  noop,
}: {
  data: PageData;
  noop: () => void;
}) {
  return (
    <div style={pageShellStyle}>
      <section style={heroStyle}>
        <div>
          <div style={heroEyebrowStyle}>cat editorial</div>
          <h1 style={heroTitleStyle}>{data.title}</h1>
        </div>
      </section>

      <section style={contentSectionStyle}>
        <div style={reportLayoutStyle}>
          <article style={articleCardStyle}>
            <div style={sectionEyebrowStyle}>большой материал недели</div>
            <h2 style={{ marginTop: 6 }}>От древних мемов до уютных рилсов: за что интернет любит котиков</h2>
            <p style={articleLeadStyle}>{data.body}</p>
            <p style={articleTextStyle}>
              У котиков есть удивительное свойство: они одинаково хорошо работают и в
              коротком мемном формате, и в длинных историях. Пользователь может быстро
              считать знакомый образ, улыбнуться и при этом остаться на странице дольше,
              если контент аккуратно разворачивает тему дальше.
            </p>
            <p style={articleTextStyle}>
              Для контентной страницы это особенно полезно: пользователь не обязан сразу
              кликать по кнопке. Сначала он должен комфортно войти в материал, дочитать
              несколько абзацев, заинтересоваться связанным блоком и только потом
              совершить целевое действие.
            </p>
            <p style={articleTextStyle}>
              Поэтому статья про котиков здесь не просто декоративна. Это удобный
              редакционный сюжет: в нём есть и ностальгия, и бытовое наблюдение, и тот
              самый мягкий, почти терапевтический ритм, за который котиковый контент так
              часто сохраняют в закладки.
            </p>
            <div style={detailCardStyle}>
              <strong>Три наблюдения из культуры котиков</strong>
              <ul style={listStyle}>
                <li>Коты моментально узнаются и снижают порог входа в материал.</li>
                <li>Уютный, лёгкий сюжет помогает удерживать внимание на длинной странице.</li>
                <li>Связанные блоки про котиков чаще воспринимаются как продолжение истории, а не как реклама.</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <button type="button" onClick={noop}>
                Показать кошачьи тезисы
              </button>
              <button type="button" onClick={noop}>
                Ещё про котиков
              </button>
              <button type="button" onClick={noop}>
                Подобрать контент-сценарий
              </button>
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={sectionEyebrowStyle}>ещё в журнале</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <article style={detailCardStyle}>
                  <strong>Как коты стали главными героями домашних стримов</strong>
                  <p style={{ margin: "8px 0 12px", color: "#475569", lineHeight: 1.6 }}>
                    Почему обычное потягивание на подоконнике собирает больше реакции, чем постановочный контент.
                  </p>
                  <button type="button" onClick={noop}>
                    Открыть материал
                  </button>
                </article>
                <article style={detailCardStyle}>
                  <strong>Архив мемов нулевых: коты, демотиваторы и форумы</strong>
                  <p style={{ margin: "8px 0 12px", color: "#475569", lineHeight: 1.6 }}>
                    Короткий экскурс в ту эпоху, когда кошачьи картинки путешествовали по интернету в формате вложений и репостов.
                  </p>
                  <button type="button" onClick={noop}>
                    Открыть материал
                  </button>
                </article>
              </div>
            </div>
          </article>

          <aside style={sidePanelStyle}>
            <div style={sectionEyebrowStyle}>поведение читателя</div>
            <h3 style={{ margin: "6px 0 10px" }}>Прокси-воронка кошачьей статьи</h3>
            <ol style={orderedListStyle}>
              <li>Читатель вовлекается в материал и открывает ключевые тезисы.</li>
              <li>Переходит в связанные материалы про котиков и сетевую культуру.</li>
              <li>Нажимает на CTA, если тема действительно зацепила.</li>
            </ol>
            <div style={emptyStateStyle}>
              После открытия связанного материала здесь появится кошачья подборка.
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
