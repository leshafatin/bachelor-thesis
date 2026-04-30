import React, { useState } from "react";
import type { PageData, ProductEventPayload } from "./types";
import {
  alertCardStyle,
  alertPillHighStyle,
  alertPillMediumStyle,
  chartCardStyle,
  chartFooterStyle,
  chartGridStyle,
  chartSvgStyle,
  chartTitleStyle,
  channelCardStyle,
  channelMixGridStyle,
  channelTrackStyle,
  contentSectionStyle,
  detailCardStyle,
  emptyStateStyle,
  heroEyebrowStyle,
  heroPromoStyle,
  heroStyle,
  heroTextStyle,
  heroTitleStyle,
  hourlyLoadBarStyle,
  hourlyLoadBarWrapStyle,
  hourlyLoadColumnStyle,
  hourlyLoadStyle,
  insightCardStyle,
  insightGridStyle,
  insightLabelStyle,
  orderedListStyle,
  pageShellStyle,
  pillAlertStyle,
  queueCardStyle,
  queueGridStyle,
  reportLayoutStyle,
  reportPanelHeaderStyle,
  reportPanelStyle,
  sectionEyebrowStyle,
  segmentCellStyle,
  segmentsTableStyle,
  sidePanelStyle,
  statCardStyle,
  statusNoteStyle,
  successNoteStyle,
  toolbarStyle,
} from "./styles";

export function DynamicReportPage({
  data,
  onProductEvent,
}: {
  data: PageData;
  onProductEvent?: (event: ProductEventPayload) => void;
}) {
  const [reportRange, setReportRange] = useState("today");
  const [reportDetailOpen, setReportDetailOpen] = useState(false);
  const [reportAlertAcknowledged, setReportAlertAcknowledged] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const track = (event: ProductEventPayload) => onProductEvent?.(event);

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

  return (
    <div style={pageShellStyle}>
      <section style={heroStyle}>
        <div>
          <div style={heroEyebrowStyle}>operations</div>
          <h1 style={heroTitleStyle}>{data.title}</h1>
          <p style={heroTextStyle}>{data.body}</p>
        </div>
        <div style={heroPromoStyle}>
          <div style={{ fontSize: 12, opacity: 0.8, textTransform: "uppercase" }}>
            смена под контролем
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>3 зоны внимания</div>
          <p style={{ margin: "10px 0 0", lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>
            Доступность SKU, вечерняя wave и очередь на подтверждение замен. Панель
            должна быстро показать общую картину и довести пользователя до действия.
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
          {data.liveStats?.map((item) => (
            <div key={item.label} style={statCardStyle}>
              <div style={{ fontSize: 13, color: "#365b86" }}>{item.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: "10px 0" }}>
                {item.value}
              </div>
              <div style={{ color: "#365b86" }}>{item.delta ?? "без изменений"}</div>
            </div>
          ))}
        </div>

        {data.reportSeries?.length ? (
          <div style={chartGridStyle}>
            {data.reportSeries.map((series) => (
              <div key={series.title} style={chartCardStyle}>
                <div style={chartTitleStyle}>{series.title}</div>
                <svg viewBox="0 0 240 92" style={chartSvgStyle} aria-hidden="true">
                  <path
                    d={buildSparklinePath(series.points)}
                    fill="none"
                    stroke={toneColor(series.tone)}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div style={chartFooterStyle}>
                  <span>{series.labels[0]}</span>
                  <strong>
                    {series.points[series.points.length - 1]} {series.unit}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div style={reportLayoutStyle}>
          <section style={reportPanelStyle}>
            {data.reportChannelMix?.length ? (
              <>
                <div style={sectionEyebrowStyle}>каналы и нагрузка</div>
                <h2 style={{ margin: "6px 0 0" }}>Откуда приходит спрос в этой смене</h2>
                <div style={channelMixGridStyle}>
                  {data.reportChannelMix.map((channel) => (
                    <div key={channel.label} style={channelCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <strong>{channel.label}</strong>
                        <span style={{ color: toneColor(channel.tone), fontWeight: 700 }}>
                          {channel.value}%
                        </span>
                      </div>
                      <div style={channelTrackStyle}>
                        <div
                          style={{
                            width: `${channel.value}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: toneColor(channel.tone),
                          }}
                        />
                      </div>
                      <p style={{ margin: "10px 0 0", color: "#475569", lineHeight: 1.5 }}>
                        {channel.note}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {data.reportHourlyLoad?.length ? (
              <>
                <div style={{ ...sectionEyebrowStyle, marginTop: 22 }}>часовой профиль</div>
                <h2 style={{ margin: "6px 0 0" }}>Пик нагрузки по окнам</h2>
                <div style={hourlyLoadStyle}>
                  {data.reportHourlyLoad.map((point) => (
                    <div key={point.label} style={hourlyLoadColumnStyle}>
                      <div style={{ fontSize: 12, color: "#365b86", fontWeight: 700 }}>
                        {point.value}
                      </div>
                      <div style={hourlyLoadBarWrapStyle}>
                        <div
                          style={{
                            ...hourlyLoadBarStyle,
                            height: `${Math.max(20, point.value)}%`,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{point.label}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <div style={reportPanelHeaderStyle}>
              <div>
                <div style={{ ...sectionEyebrowStyle, marginTop: 24 }}>контрольный сигнал</div>
                <h2 style={{ margin: "6px 0 8px" }}>Падение доступности fast-moving SKU</h2>
              </div>
              <span style={pillAlertStyle}>требует реакции</span>
            </div>
            <p style={{ color: "#475569", marginTop: 0 }}>
              По части ассортимента наблюдается снижение доступности на витрине. В
              нормальном рабочем ритме пользователь сначала считывает общую ситуацию,
              потом открывает отклонение и только после этого подтверждает контроль
              или уводит выгрузку в командный контур.
            </p>
            <div style={insightGridStyle}>
              <div style={insightCardStyle}>
                <div style={insightLabelStyle}>Период</div>
                <strong>
                  {reportRange === "today"
                    ? "Сегодня"
                    : reportRange === "week"
                      ? "7 дней"
                      : "30 дней"}
                </strong>
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

            {data.reportSegments?.length ? (
              <>
                <table style={segmentsTableStyle}>
                  <thead>
                    <tr>
                      <th style={segmentCellStyle}>Сегмент</th>
                      <th style={segmentCellStyle}>Доступность</th>
                      <th style={segmentCellStyle}>Заказы</th>
                      <th style={segmentCellStyle}>ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reportSegments.map((segment) => (
                      <tr key={segment.label}>
                        <td style={segmentCellStyle}>{segment.label}</td>
                        <td style={segmentCellStyle}>{segment.availabilityPct}%</td>
                        <td style={segmentCellStyle}>{segment.orders}</td>
                        <td style={segmentCellStyle}>{segment.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : null}

            {data.reportWorkQueues?.length ? (
              <>
                <div style={{ ...sectionEyebrowStyle, marginTop: 22 }}>очереди и SLA</div>
                <h2 style={{ margin: "6px 0 0" }}>Что команда должна закрыть до конца окна</h2>
                <div style={queueGridStyle}>
                  {data.reportWorkQueues.map((queue) => (
                    <div key={queue.label} style={queueCardStyle}>
                      <strong>{queue.label}</strong>
                      <div style={{ marginTop: 10, color: "#0f172a", fontWeight: 700 }}>
                        {queue.backlog}
                      </div>
                      <div style={{ marginTop: 6, color: "#475569" }}>{queue.owner}</div>
                      <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                        SLA: {queue.sla}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
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

            {data.reportAlerts?.map((alert) => (
              <div key={alert.title} style={alertCardStyle}>
                <div
                  style={
                    alert.severity === "high"
                      ? alertPillHighStyle
                      : alertPillMediumStyle
                  }
                >
                  {alert.severity === "high" ? "high" : "medium"}
                </div>
                <strong style={{ display: "block", marginTop: 10 }}>{alert.title}</strong>
                <p style={{ margin: "8px 0 0", color: "#475569" }}>{alert.note}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </div>
  );
}

function buildSparklinePath(points: number[]) {
  if (!points.length) return "";
  const width = 240;
  const height = 92;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point - min) / range) * (height - 10) - 5;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function toneColor(tone: "blue" | "green" | "orange") {
  if (tone === "green") return "#16a34a";
  if (tone === "orange") return "#ea580c";
  return "#2563eb";
}
