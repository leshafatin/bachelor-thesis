import React, { useState } from "react";
import type { PageData, ProductEventPayload } from "./types";
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
  successNoteStyle,
} from "./styles";

export function StaticArticlePage({
  data,
  onProductEvent,
}: {
  data: PageData;
  onProductEvent?: (event: ProductEventPayload) => void;
}) {
  const [articleInsightsOpen, setArticleInsightsOpen] = useState(false);
  const [relatedMaterialOpen, setRelatedMaterialOpen] = useState(false);
  const [consultationRequested, setConsultationRequested] = useState(false);
  const track = (event: ProductEventPayload) => onProductEvent?.(event);

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

  const extraArticles = [
    {
      title: "Как коты стали главными героями домашних стримов",
      text: "Почему обычное потягивание на подоконнике собирает больше реакции, чем постановочный контент.",
    },
    {
      title: "Архив мемов нулевых: коты, демотиваторы и форумы",
      text: "Короткий экскурс в ту эпоху, когда кошачьи картинки путешествовали по интернету в формате вложений и репостов.",
    },
  ];

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
              <button type="button" onClick={openArticleInsights}>
                Показать кошачьи тезисы
              </button>
              <button type="button" onClick={openRelatedMaterial}>
                Ещё про котиков
              </button>
              <button type="button" onClick={requestConsultation}>
                Подобрать контент-сценарий
              </button>
            </div>

            {articleInsightsOpen ? (
              <div style={detailCardStyle}>
                <strong>Ключевые кошачьи тезисы</strong>
                <ul style={listStyle}>
                  <li>Страница с котиками быстро считывается и мягко втягивает пользователя в чтение.</li>
                  <li>Даже для лёгкого контента одинаковый TTFB не гарантирует одинаковую вовлечённость.</li>
                  <li>Статические статьи удобно оценивать через proxy-метрики интереса и дочитывания.</li>
                </ul>
              </div>
            ) : null}

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
                {extraArticles.map((article) => (
                  <article key={article.title} style={detailCardStyle}>
                    <strong>{article.title}</strong>
                    <p style={{ margin: "8px 0 12px", color: "#475569", lineHeight: 1.6 }}>
                      {article.text}
                    </p>
                    <button type="button" onClick={openRelatedMaterial}>
                      Открыть материал
                    </button>
                  </article>
                ))}
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

            {relatedMaterialOpen ? (
              <div style={detailCardStyle}>
                <strong>Что ещё можно почитать</strong>
                <ul style={listStyle}>
                  <li>Почему фотографии спящих котов стабильно собирают лучший отклик.</li>
                  <li>Как длинные редакционные страницы выигрывают от SSG.</li>
                  <li>Какие proxy-метрики вовлечения лучше работают для медийного контента.</li>
                </ul>
              </div>
            ) : (
              <div style={emptyStateStyle}>
                После открытия связанного материала здесь появится кошачья подборка.
              </div>
            )}

            {consultationRequested ? (
              <div style={successNoteStyle}>
                Отлично, запрос принят. Мы поможем подобрать контентный сценарий под твою задачу.
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
