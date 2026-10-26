// ============================================================
// CHARTS.JS — Visualization Manager using Chart.js
// Creates interactive, beautiful charts for the dashboard
// ============================================================

class ChartManager {
    constructor() {
        this.charts = {};
        this.defaultFont = "'Inter', sans-serif";
        this.gridColor = 'rgba(255,255,255,0.06)';
        this.tickColor = 'rgba(255,255,255,0.5)';

        Chart.defaults.font.family = this.defaultFont;
        Chart.defaults.color = this.tickColor;
    }

    destroy(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    destroyAll() {
        Object.keys(this.charts).forEach(id => this.destroy(id));
    }

    // Radar chart: Static vs Dynamic metric profiles
    createRadarChart(canvasId, staticMetrics, dynamicMetrics) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const labels = ['Complexity', 'Maintainability', 'Duplication', 'Coupling', 'Coverage', 'Test Pass', 'Mutation', 'Reliability'];
        const staticData = [
            staticMetrics.cyclomaticComplexity / 80 * 100,
            staticMetrics.maintainabilityIndex,
            staticMetrics.codeDuplication / 60 * 100,
            staticMetrics.couplingBetweenObjects / 40 * 100,
            0, 0, 0, 0
        ];
        const dynamicData = [
            0, 0, 0, 0,
            dynamicMetrics.statementCoverage,
            dynamicMetrics.testPassRate,
            dynamicMetrics.mutationScore,
            Math.min(100, dynamicMetrics.mtbf / 5)
        ];

        this.charts[canvasId] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Static Analysis',
                        data: staticData,
                        backgroundColor: 'rgba(124, 58, 237, 0.15)',
                        borderColor: '#7c3aed',
                        borderWidth: 2,
                        pointBackgroundColor: '#7c3aed',
                        pointRadius: 4
                    },
                    {
                        label: 'Dynamic Testing',
                        data: dynamicData,
                        backgroundColor: 'rgba(0, 212, 255, 0.15)',
                        borderColor: '#00d4ff',
                        borderWidth: 2,
                        pointBackgroundColor: '#00d4ff',
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20, usePointStyle: true, pointStyleWidth: 10 }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: this.gridColor },
                        pointLabels: { color: this.tickColor, font: { size: 11 } },
                        ticks: { display: false },
                        angleLines: { color: this.gridColor }
                    }
                }
            }
        });
    }

    // Doughnut chart: Quality Score
    createQualityGauge(canvasId, score, riskColor) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const remaining = 100 - score;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Quality Score', 'Remaining'],
                datasets: [{
                    data: [score, remaining],
                    backgroundColor: [riskColor, 'rgba(255,255,255,0.05)'],
                    borderWidth: 0,
                    cutout: '78%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            },
            plugins: [{
                id: 'centerText',
                beforeDraw(chart) {
                    const { ctx: c, chartArea: { width, height, top } } = chart;
                    c.save();
                    c.font = `bold 36px 'Inter', sans-serif`;
                    c.fillStyle = riskColor;
                    c.textAlign = 'center';
                    c.textBaseline = 'middle';
                    c.fillText(score, width / 2, top + height / 2 - 8);
                    c.font = `13px 'Inter', sans-serif`;
                    c.fillStyle = 'rgba(255,255,255,0.5)';
                    c.fillText('/ 100', width / 2, top + height / 2 + 22);
                    c.restore();
                }
            }]
        });
    }

    // Bar chart: Model comparison
    createModelComparisonChart(canvasId) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const models = Object.values(MODEL_COMPARISON);
        const labels = models.map(m => m.name.split('(')[0].trim());

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Accuracy',
                        data: models.map(m => m.accuracy),
                        backgroundColor: models.map(m => m.color + '99'),
                        borderColor: models.map(m => m.color),
                        borderWidth: 2,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Accuracy: ${ctx.parsed.x}%`
                        }
                    }
                },
                scales: {
                    x: {
                        min: 60,
                        max: 100,
                        grid: { color: this.gridColor },
                        ticks: { callback: v => v + '%' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { size: 12 } }
                    }
                }
            }
        });
    }

    // Multi-metric grouped bar chart for model comparison
    createDetailedComparisonChart(canvasId) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const metrics = ['accuracy', 'precision', 'recall', 'f1Score'];
        const metricLabels = ['Accuracy', 'Precision', 'Recall', 'F1 Score'];
        const models = Object.values(MODEL_COMPARISON);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: metricLabels,
                datasets: models.map(model => ({
                    label: model.name.split('(')[0].trim(),
                    data: metrics.map(m => model[m]),
                    backgroundColor: model.color + '80',
                    borderColor: model.color,
                    borderWidth: 1.5,
                    borderRadius: 4
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        min: 60,
                        max: 100,
                        grid: { color: this.gridColor },
                        ticks: { callback: v => v + '%' }
                    }
                }
            }
        });
    }

    // Line chart: Training history (loss and accuracy)
    createTrainingHistoryChart(canvasId) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: TRAINING_HISTORY.epoch,
                datasets: [
                    {
                        label: 'Train Loss',
                        data: TRAINING_HISTORY.trainLoss,
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124,58,237,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Val Loss',
                        data: TRAINING_HISTORY.valLoss,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Train Accuracy',
                        data: TRAINING_HISTORY.trainAcc,
                        borderColor: '#10b981',
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Val Accuracy',
                        data: TRAINING_HISTORY.valAcc,
                        borderColor: '#00d4ff',
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Epoch', color: this.tickColor },
                        grid: { color: this.gridColor },
                        ticks: { maxTicksLimit: 10 }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Loss', color: this.tickColor },
                        grid: { color: this.gridColor },
                        min: 0
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Accuracy (%)', color: this.tickColor },
                        grid: { display: false },
                        min: 40,
                        max: 100
                    }
                }
            }
        });
    }

    // Horizontal bar chart: Feature importance
    createFeatureImportanceChart(canvasId, type = 'static') {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const data = FEATURE_IMPORTANCE[type];
        const color = type === 'static' ? '#7c3aed' : '#00d4ff';

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.feature),
                datasets: [{
                    label: 'Importance',
                    data: data.map(d => d.importance),
                    backgroundColor: data.map((_, i) => {
                        const opacity = 0.4 + (1 - i / data.length) * 0.5;
                        return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
                    }),
                    borderColor: color,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Importance: ${(ctx.parsed.x * 100).toFixed(1)}%`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: this.gridColor },
                        ticks: { callback: v => (v * 100).toFixed(0) + '%' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }

    // Scatter plot: Predicted vs Actual quality scores
    createPredictionScatterChart(canvasId, predictions) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const data = predictions.map(p => ({
            x: p.actual.qualityScore,
            y: p.predicted.qualityScore,
            label: p.name
        }));

        this.charts[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Predictions',
                        data: data,
                        backgroundColor: data.map(d => {
                            const error = Math.abs(d.x - d.y);
                            if (error < 5) return '#10b98199';
                            if (error < 10) return '#f59e0b99';
                            return '#ef444499';
                        }),
                        pointRadius: 6,
                        pointHoverRadius: 9
                    },
                    {
                        label: 'Perfect Prediction',
                        data: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
                        type: 'line',
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderDash: [8, 4],
                        borderWidth: 1.5,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const d = ctx.raw;
                                return d.label ? `${d.label}: Actual=${d.x}, Predicted=${d.y}` : '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Actual Quality Score', color: this.tickColor },
                        grid: { color: this.gridColor },
                        min: 0, max: 100
                    },
                    y: {
                        title: { display: true, text: 'Predicted Quality Score', color: this.tickColor },
                        grid: { color: this.gridColor },
                        min: 0, max: 100
                    }
                }
            }
        });
    }

    // Heatmap-style confusion matrix
    createConfusionMatrix(canvasId) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const { truePositive: tp, falsePositive: fp, falseNegative: fn, trueNegative: tn } = CONFUSION_MATRIX;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Predicted Defective', 'Predicted Non-Defective'],
                datasets: [
                    {
                        label: 'Actually Defective',
                        data: [tp, fn],
                        backgroundColor: ['#10b98199', '#ef444499'],
                        borderColor: ['#10b981', '#ef4444'],
                        borderWidth: 2,
                        borderRadius: 6
                    },
                    {
                        label: 'Actually Non-Defective',
                        data: [fp, tn],
                        backgroundColor: ['#f59e0b99', '#00d4ff99'],
                        borderColor: ['#f59e0b', '#00d4ff'],
                        borderWidth: 2,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (ctx) => {
                                const vals = ['TP', 'FN', 'FP', 'TN'];
                                const idx = ctx.datasetIndex * 2 + ctx.dataIndex;
                                return `Type: ${vals[idx]}`;
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        grid: { color: this.gridColor },
                        title: { display: true, text: 'Count', color: this.tickColor }
                    }
                }
            }
        });
    }

    // Dataset quality distribution histogram
    createQualityDistributionChart(canvasId, predictions) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        // Bin quality scores
        const bins = Array(10).fill(0);
        const labels = [];
        for (let i = 0; i < 10; i++) {
            labels.push(`${i * 10}-${(i + 1) * 10}`);
        }
        predictions.forEach(p => {
            const bin = Math.min(9, Math.floor(p.predicted.qualityScore / 10));
            bins[bin]++;
        });

        const colors = bins.map((_, i) => {
            if (i < 3) return '#ef4444';
            if (i < 5) return '#f59e0b';
            if (i < 7) return '#00d4ff';
            return '#10b981';
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Modules',
                    data: bins,
                    backgroundColor: colors.map(c => c + '80'),
                    borderColor: colors,
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Quality Score Distribution',
                        color: 'rgba(255,255,255,0.7)',
                        font: { size: 13, weight: '500' }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Quality Score Range', color: this.tickColor },
                        grid: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Number of Modules', color: this.tickColor },
                        grid: { color: this.gridColor },
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }

    // Model breakdown pie chart
    createModelBreakdownChart(canvasId, breakdown) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        const absInteraction = Math.abs(breakdown.interactionScore);
        const total = breakdown.staticWeight + breakdown.dynamicWeight + absInteraction;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Neural Network (Static)', 'Gradient Boosting (Dynamic)', 'Cross-Feature Interaction'],
                datasets: [{
                    data: [
                        +(breakdown.staticWeight / total * 100).toFixed(1),
                        +(breakdown.dynamicWeight / total * 100).toFixed(1),
                        +(absInteraction / total * 100).toFixed(1)
                    ],
                    backgroundColor: ['#7c3aed99', '#00d4ff99', '#f59e0b99'],
                    borderColor: ['#7c3aed', '#00d4ff', '#f59e0b'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
                        }
                    }
                }
            }
        });
    }
}

const chartManager = new ChartManager();
