(function () {
  function drawBarChart(canvas, config) {
    if (!(canvas instanceof HTMLCanvasElement)) return;

    var data = (config && config.data) || {};
    var labels = Array.isArray(data.labels) ? data.labels : [];
    var dataset =
      Array.isArray(data.datasets) && data.datasets.length
        ? data.datasets[0]
        : { data: [] };
    var values = Array.isArray(dataset.data) ? dataset.data.map(Number) : [];
    var label = dataset.label || "";

    var width = canvas.clientWidth || 520;
    var height = 260;
    var dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var padding = { top: 28, right: 20, bottom: 40, left: 44 };
    var chartWidth = width - padding.left - padding.right;
    var chartHeight = height - padding.top - padding.bottom;
    var max = Math.max.apply(null, values.concat([1]));
    var stepX = labels.length ? chartWidth / labels.length : chartWidth;
    var barWidth = Math.min(72, stepX * 0.58);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#d5dde8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.font = "12px system-ui";
    ctx.fillText(label, padding.left, 16);

    for (var i = 0; i < labels.length; i += 1) {
      var value = values[i] || 0;
      var x = padding.left + stepX * i + (stepX - barWidth) / 2;
      var barHeight = max > 0 ? (value / max) * chartHeight : 0;
      var y = padding.top + chartHeight - barHeight;

      ctx.fillStyle = "#5b8def";
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#475569";
      ctx.textAlign = "center";
      ctx.fillText(String(labels[i] || ""), x + barWidth / 2, height - 14);
      ctx.fillText(String(Math.round(value * 100) / 100), x + barWidth / 2, y - 8);
    }

    ctx.textAlign = "start";
  }

  function Chart(canvas, config) {
    this.canvas = canvas;
    this.config = config || {};
    drawBarChart(canvas, this.config);
  }

  Chart.prototype.destroy = function () {};

  window.Chart = Chart;
})();
