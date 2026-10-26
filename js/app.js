// ============================================================
// APP.JS — Main Application Controller & Interactive Orchestrator
// Hybrid AI Framework for Software Quality Prediction
// ============================================================

class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.dataset = generateTrainingDataset();
        this.predictions = hybridFramework.predictDataset(this.dataset);
        this.selectedModule = null;
        this.analysisResults = null;
        this.currentStaticInputs = null;
        this.currentDynamicInputs = null;
        this.currentGlossaryFilter = 'all';
        this.animationFrameId = null;
    }

    init() {
        this.setupNavigation();
        this.setupScenarioPresets();
        this.setupSampleProjects();
        this.setupCustomAnalysis();
        this.renderDashboard();
        this.renderConcepts();
        this.animateCounters();
        this.startParticleAnimation();

        // Default custom prediction on initial load
        this.loadScenario('superficial_coverage_trap', false);

        // Show dashboard by default
        this.navigateTo('dashboard');
    }

    // ===================== NAVIGATION =====================
    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateTo(section);
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const nav = document.getElementById('mainNav');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                nav.classList.toggle('open');
            });
        }
    }

    navigateTo(sectionId) {
        this.currentSection = sectionId;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });

        // Show/hide sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        // Close mobile menu
        document.getElementById('mainNav')?.classList.remove('open');

        // Scroll to content top
        window.scrollTo({ top: 350, behavior: 'smooth' });

        // Render section-specific content
        setTimeout(() => {
            switch (sectionId) {
                case 'dashboard': this.renderDashboard(); break;
                case 'concepts': this.renderConcepts(); break;
                case 'analysis': this.renderAnalysis(); break;
                case 'models': this.renderModels(); break;
                case 'dataset': this.renderDataset(); break;
                case 'results': this.renderResults(); break;
            }
        }, 100);
    }

    // ===================== INTERACTIVE ARCHITECTURE =====================
    inspectStage(stageId) {
        const stage = ARCHITECTURE_STAGES.find(s => s.id === stageId);
        if (!stage) return;

        const inspector = document.getElementById('archInspector');
        const titleEl = document.getElementById('inspectorTitle');
        const descEl = document.getElementById('inspectorDesc');
        const pointsEl = document.getElementById('inspectorPoints');
        const formulaEl = document.getElementById('inspectorFormula');

        if (!inspector) return;

        // Highlight active block
        document.querySelectorAll('.arch-block').forEach(b => {
            b.classList.toggle('active-stage', b.dataset.stage === stageId);
        });

        titleEl.innerHTML = `<span style="font-size: 22px;">${stage.icon}</span> <span>${stage.title}</span> <span style="font-size: 11px; padding: 2px 8px; border-radius: 100px; background: ${stage.color}20; color: ${stage.color}; font-weight: 600; margin-left: 8px;">${stage.subtitle}</span>`;
        descEl.textContent = stage.description;
        pointsEl.innerHTML = stage.keyPoints.map(p => `<li>${p}</li>`).join('');
        formulaEl.innerHTML = `<strong>Formula / Transformation:</strong><br><br>${stage.formula}`;

        inspector.classList.add('open');
        inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    closeInspector() {
        const inspector = document.getElementById('archInspector');
        if (inspector) inspector.classList.remove('open');
        document.querySelectorAll('.arch-block').forEach(b => b.classList.remove('active-stage'));
    }

    animatePipelineFlow() {
        const blocks = [
            document.querySelector('[data-stage="stage_static"]'),
            document.querySelector('[data-stage="stage_nn"]'),
            document.querySelector('[data-stage="stage_dynamic"]'),
            document.querySelector('[data-stage="stage_gbm"]'),
            document.querySelector('[data-stage="stage_fusion"]'),
            document.querySelector('[data-stage="stage_output"]')
        ];

        blocks.forEach((b, index) => {
            if (!b) return;
            setTimeout(() => {
                b.classList.add('pulsing');
                setTimeout(() => b.classList.remove('pulsing'), 900);
            }, index * 260);
        });

        setTimeout(() => {
            this.inspectStage('stage_fusion');
        }, blocks.length * 260);
    }

    // ===================== DASHBOARD =====================
    renderDashboard() {
        const avgQuality = Math.round(this.predictions.reduce((s, p) => s + p.predicted.qualityScore, 0) / this.predictions.length);
        const avgDefectProb = (this.predictions.reduce((s, p) => s + p.predicted.defectProbability, 0) / this.predictions.length * 100).toFixed(1);
        const highRiskCount = this.predictions.filter(p => p.predicted.riskLevel === 'High' || p.predicted.riskLevel === 'Critical').length;
        const modelAccuracy = MODEL_COMPARISON.hybrid.accuracy;

        this.setCounter('dashAvgQuality', avgQuality);
        this.setCounter('dashDefectProb', avgDefectProb, '%');
        this.setCounter('dashHighRisk', highRiskCount);
        this.setCounter('dashAccuracy', modelAccuracy, '%');

        this.renderRiskDistribution();
        this.renderAtRiskModules();

        const topModule = this.predictions[0];
        chartManager.createRadarChart('dashRadarChart', topModule.static, topModule.dynamic);
        chartManager.createQualityDistributionChart('dashDistributionChart', this.predictions);
    }

    renderRiskDistribution() {
        const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
        this.predictions.forEach(p => counts[p.predicted.riskLevel]++);

        const container = document.getElementById('riskDistribution');
        if (!container) return;

        const colors = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
        const total = this.predictions.length;

        container.innerHTML = Object.entries(counts).map(([level, count]) => `
            <div class="risk-bar-item">
                <div class="risk-bar-header">
                    <span class="risk-label" style="color: ${colors[level]}">
                        <span class="risk-dot" style="background: ${colors[level]}"></span>
                        ${level} Risk
                    </span>
                    <span class="risk-count">${count} modules (${Math.round(count / total * 100)}%)</span>
                </div>
                <div class="risk-bar-track">
                    <div class="risk-bar-fill" style="width: ${count / total * 100}%; background: ${colors[level]}" data-width="${count / total * 100}"></div>
                </div>
            </div>
        `).join('');

        setTimeout(() => {
            container.querySelectorAll('.risk-bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }, 150);
    }

    renderAtRiskModules() {
        const container = document.getElementById('atRiskModules');
        if (!container) return;

        const atRisk = [...this.predictions]
            .sort((a, b) => b.predicted.defectProbability - a.predicted.defectProbability)
            .slice(0, 5);

        container.innerHTML = atRisk.map((m, i) => `
            <div class="at-risk-item" onclick="app.analyzeModule(${m.id - 1})" title="Click to inspect module metrics in Analysis simulator">
                <div class="at-risk-rank">${i + 1}</div>
                <div class="at-risk-info">
                    <div class="at-risk-name">${m.name}</div>
                    <div class="at-risk-metrics">
                        CC: ${m.static.cyclomaticComplexity} · Coverage: ${m.dynamic.branchCoverage}% · Defect Dens: ${m.dynamic.defectDensity}
                    </div>
                </div>
                <div class="at-risk-score" style="color: ${m.predicted.riskColor}">
                    ${(m.predicted.defectProbability * 100).toFixed(0)}%
                    <span class="risk-badge" style="background: ${m.predicted.riskColor}20; color: ${m.predicted.riskColor}">${m.predicted.riskLevel}</span>
                </div>
            </div>
        `).join('');
    }

    // ===================== CONCEPTS & GUIDE =====================
    renderConcepts() {
        this.filterGlossary(this.currentGlossaryFilter);
    }

    filterGlossary(filter, triggerBtn = null) {
        this.currentGlossaryFilter = filter;

        // Update active chip style
        if (triggerBtn) {
            document.querySelectorAll('.glossary-chip').forEach(c => c.classList.remove('active'));
            triggerBtn.classList.add('active');
        }

        const container = document.getElementById('glossaryGrid');
        if (!container) return;

        const allMetrics = [
            ...STATIC_METRICS_INFO.map(m => ({ ...m, type: 'static' })),
            ...DYNAMIC_METRICS_INFO.map(m => ({ ...m, type: 'dynamic' }))
        ];

        let filtered = allMetrics;
        if (filter === 'static') filtered = allMetrics.filter(m => m.type === 'static');
        else if (filter === 'dynamic') filtered = allMetrics.filter(m => m.type === 'dynamic');
        else if (filter !== 'all') filtered = allMetrics.filter(m => m.category.toLowerCase().includes(filter.toLowerCase()));

        container.innerHTML = filtered.map(m => `
            <div class="glossary-card">
                <div class="glossary-card-top">
                    <span class="glossary-card-name">${m.name} (${m.shortName})</span>
                    <span class="glossary-card-tag">${m.category}</span>
                </div>
                <div class="glossary-card-desc">${m.plainEnglish}</div>
                <div class="glossary-card-meta">
                    <span>Target: <strong>${m.healthy}</strong></span>
                    <span>Tool: <strong>${m.tool}</strong></span>
                </div>
            </div>
        `).join('');
    }

    // ===================== ANALYSIS & SCENARIOS =====================
    renderAnalysis() {
        // Form & presets are already wired
    }

    setupScenarioPresets() {
        const container = document.getElementById('scenarioPresetsGrid');
        if (!container) return;

        container.innerHTML = SCENARIO_PRESETS.map(s => `
            <div class="scenario-card" onclick="app.loadScenario('${s.id}')">
                <div class="scenario-top">
                    <span class="scenario-icon">${s.icon}</span>
                    <span class="scenario-badge ${s.badgeClass}">${s.badge}</span>
                </div>
                <div class="scenario-title">${s.name}</div>
                <div class="scenario-summary">${s.summary}</div>
                <div class="scenario-load-btn">
                    <span>Load &amp; Predict Scenario</span> ▹
                </div>
            </div>
        `).join('');
    }

    loadScenario(scenarioId, shouldScroll = true) {
        const scenario = SCENARIO_PRESETS.find(s => s.id === scenarioId);
        if (!scenario) return;

        // Fill static inputs
        STATIC_METRICS_INFO.forEach(m => {
            const input = document.getElementById(`input_${m.key}`);
            const slider = input?.parentElement.querySelector('.metric-slider');
            const val = scenario.static[m.key];
            if (input) input.value = val;
            if (slider) slider.value = val;
            this.updateHealthBadge(m.key, val, m.statusRule);
        });

        // Fill dynamic inputs
        DYNAMIC_METRICS_INFO.forEach(m => {
            const input = document.getElementById(`input_${m.key}`);
            const slider = input?.parentElement.querySelector('.metric-slider');
            const val = scenario.dynamic[m.key];
            if (input) input.value = val;
            if (slider) slider.value = val;
            this.updateHealthBadge(m.key, val, m.statusRule);
        });

        this.runCustomPrediction();

        if (shouldScroll && this.currentSection === 'analysis') {
            document.getElementById('customMetricsForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    setupSampleProjects() {
        const container = document.getElementById('sampleProjects');
        if (!container) return;

        container.innerHTML = Object.entries(SAMPLE_PROJECTS).map(([key, project]) => `
            <div class="sample-project-card" onclick="app.loadSampleProject('${key}')">
                <div class="project-icon">${project.icon}</div>
                <div class="project-name">${project.name}</div>
                <div class="project-desc">${project.description}</div>
                <div class="project-modules">${project.modules.length} modules ▹</div>
            </div>
        `).join('');
    }

    setupCustomAnalysis() {
        const staticInputs = document.getElementById('staticInputs');
        const dynamicInputs = document.getElementById('dynamicInputs');

        if (staticInputs) {
            staticInputs.innerHTML = STATIC_METRICS_INFO.map(m => `
                <div class="metric-input-group">
                    <div class="metric-header-row">
                        <div class="metric-title-wrap">
                            <label for="input_${m.key}">${m.name} ${m.unit ? `(${m.unit})` : ''}</label>
                            <span class="metric-tooltip-trigger" title="${m.plainEnglish} | Healthy Target: ${m.healthy}">ℹ️</span>
                        </div>
                        <span class="metric-health-badge" id="badge_${m.key}">Healthy</span>
                    </div>
                    <input type="number" id="input_${m.key}" name="${m.key}" 
                           min="${m.min}" max="${m.max}" 
                           value="${Math.round((m.min + m.max) / 2)}"
                           step="${m.max > 100 ? 10 : 1}">
                    <input type="range" class="metric-slider" 
                           min="${m.min}" max="${m.max}" 
                           value="${Math.round((m.min + m.max) / 2)}"
                           oninput="app.onSliderInput('${m.key}', this.value, 'static')">
                </div>
            `).join('');

            staticInputs.querySelectorAll('input[type=number]').forEach(input => {
                input.addEventListener('input', () => {
                    const key = input.name;
                    const slider = input.parentElement.querySelector('.metric-slider');
                    if (slider) slider.value = input.value;
                    const info = STATIC_METRICS_INFO.find(m => m.key === key);
                    if (info) this.updateHealthBadge(key, +input.value, info.statusRule);
                });
            });
        }

        if (dynamicInputs) {
            dynamicInputs.innerHTML = DYNAMIC_METRICS_INFO.map(m => `
                <div class="metric-input-group">
                    <div class="metric-header-row">
                        <div class="metric-title-wrap">
                            <label for="input_${m.key}">${m.name} ${m.unit ? `(${m.unit})` : ''}</label>
                            <span class="metric-tooltip-trigger" title="${m.plainEnglish} | Healthy Target: ${m.healthy}">ℹ️</span>
                        </div>
                        <span class="metric-health-badge" id="badge_${m.key}">Healthy</span>
                    </div>
                    <input type="number" id="input_${m.key}" name="${m.key}" 
                           min="${m.min}" max="${m.max}" 
                           value="${Math.round((m.min + m.max) / 2)}"
                           step="${m.max > 100 ? 10 : 1}">
                    <input type="range" class="metric-slider" 
                           min="${m.min}" max="${m.max}" 
                           value="${Math.round((m.min + m.max) / 2)}"
                           oninput="app.onSliderInput('${m.key}', this.value, 'dynamic')">
                </div>
            `).join('');

            dynamicInputs.querySelectorAll('input[type=number]').forEach(input => {
                input.addEventListener('input', () => {
                    const key = input.name;
                    const slider = input.parentElement.querySelector('.metric-slider');
                    if (slider) slider.value = input.value;
                    const info = DYNAMIC_METRICS_INFO.find(m => m.key === key);
                    if (info) this.updateHealthBadge(key, +input.value, info.statusRule);
                });
            });
        }

        document.getElementById('btnRandomFill')?.addEventListener('click', () => this.randomFillMetrics());
        document.getElementById('btnPredict')?.addEventListener('click', () => this.runCustomPrediction());
    }

    onSliderInput(key, value, type) {
        const input = document.getElementById(`input_${key}`);
        if (input) input.value = value;
        const list = type === 'static' ? STATIC_METRICS_INFO : DYNAMIC_METRICS_INFO;
        const info = list.find(m => m.key === key);
        if (info) this.updateHealthBadge(key, +value, info.statusRule);
    }

    updateHealthBadge(key, val, statusRule) {
        const badge = document.getElementById(`badge_${key}`);
        if (!badge || !statusRule) return;
        const status = statusRule(val);
        badge.className = `metric-health-badge ${status}`;
        badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }

    loadSampleProject(projectKey) {
        const project = SAMPLE_PROJECTS[projectKey];
        if (!project) return;

        const projectModules = project.modules.map(name => {
            const found = this.predictions.find(p => p.name === name);
            return found || this.predictions[0];
        });

        this.navigateTo('results');
        setTimeout(() => this.renderProjectResults(project, projectModules), 200);
    }

    analyzeModule(index) {
        const module = this.predictions[index];
        if (!module) return;

        this.navigateTo('analysis');
        setTimeout(() => {
            STATIC_METRICS_INFO.forEach(m => {
                const input = document.getElementById(`input_${m.key}`);
                const slider = input?.parentElement.querySelector('.metric-slider');
                const val = module.static[m.key];
                if (input) input.value = val;
                if (slider) slider.value = val;
                this.updateHealthBadge(m.key, val, m.statusRule);
            });
            DYNAMIC_METRICS_INFO.forEach(m => {
                const input = document.getElementById(`input_${m.key}`);
                const slider = input?.parentElement.querySelector('.metric-slider');
                const val = module.dynamic[m.key];
                if (input) input.value = val;
                if (slider) slider.value = val;
                this.updateHealthBadge(m.key, val, m.statusRule);
            });

            this.runCustomPrediction();
        }, 200);
    }

    randomFillMetrics() {
        const randomModule = generateModuleMetrics(Math.floor(Math.random() * 10000), (Math.random() - 0.5) * 2);

        STATIC_METRICS_INFO.forEach(m => {
            const input = document.getElementById(`input_${m.key}`);
            const slider = input?.parentElement.querySelector('.metric-slider');
            const val = randomModule.static[m.key];
            if (input) input.value = val;
            if (slider) slider.value = val;
            this.updateHealthBadge(m.key, val, m.statusRule);
        });
        DYNAMIC_METRICS_INFO.forEach(m => {
            const input = document.getElementById(`input_${m.key}`);
            const slider = input?.parentElement.querySelector('.metric-slider');
            const val = randomModule.dynamic[m.key];
            if (input) input.value = val;
            if (slider) slider.value = val;
            this.updateHealthBadge(m.key, val, m.statusRule);
        });

        this.runCustomPrediction();
    }

    runCustomPrediction() {
        const staticMetrics = {};
        STATIC_METRICS_INFO.forEach(m => {
            staticMetrics[m.key] = +document.getElementById(`input_${m.key}`)?.value || 0;
        });
        const dynamicMetrics = {};
        DYNAMIC_METRICS_INFO.forEach(m => {
            dynamicMetrics[m.key] = +document.getElementById(`input_${m.key}`)?.value || 0;
        });

        this.currentStaticInputs = staticMetrics;
        this.currentDynamicInputs = dynamicMetrics;

        const resultsPanel = document.getElementById('predictionResults');
        if (resultsPanel) {
            resultsPanel.classList.add('loading');
            resultsPanel.style.display = 'block';
        }

        setTimeout(() => {
            const result = hybridFramework.predict(staticMetrics, dynamicMetrics);
            this.analysisResults = result;
            this.renderPredictionResults(result, staticMetrics, dynamicMetrics);
            if (resultsPanel) resultsPanel.classList.remove('loading');
        }, 300);
    }

    renderPredictionResults(result, staticMetrics, dynamicMetrics) {
        const container = document.getElementById('predictionResults');
        if (!container) return;

        const recommendationsHtml = (result.recommendations || []).map(r => `
            <div class="remediation-card ${r.priority.toLowerCase().includes('critical') ? 'p0' : (r.priority.toLowerCase().includes('high') ? 'p1' : (r.priority.toLowerCase().includes('medium') ? 'p2' : 'optimal'))}">
                <div class="remediation-top">
                    <span class="remediation-priority">${r.priority}</span>
                    <span class="remediation-tool-tag">${r.tool}</span>
                </div>
                <div class="remediation-title">${r.title}</div>
                <div class="remediation-advice">${r.advice}</div>
                <div class="remediation-metric-delta">
                    <span>Current: <strong style="color: #fff;">${r.current}</strong></span>
                    <span>Target: <strong style="color: var(--accent-cyan);">${r.target}</strong></span>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="results-header">
                <div>
                    <h3>🔮 Prediction Outcome &amp; Assessment</h3>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                        Synthesized through Neural Network (Static) + Gradient Boosting (Dynamic) + Interaction Core
                    </p>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="confidence-badge">Confidence: ${result.confidence}%</span>
                    <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 12px;" onclick="app.openAuditModal()">
                        📑 View Full Audit Report
                    </button>
                </div>
            </div>
            
            <div class="results-grid">
                <div class="result-card primary">
                    <div class="result-label">Quality Score</div>
                    <div class="result-value" style="color: ${result.riskColor}">${result.qualityScore}</div>
                    <div class="result-sublabel">out of 100</div>
                    <canvas id="resultGauge" width="200" height="200"></canvas>
                </div>
                
                <div class="result-card">
                    <div class="result-label">Defect Probability</div>
                    <div class="result-value" style="color: ${result.riskColor}">${(result.defectProbability * 100).toFixed(1)}%</div>
                    <div class="result-sublabel">chance of production defect</div>
                </div>
                
                <div class="result-card">
                    <div class="result-label">Risk Classification</div>
                    <div class="result-value risk-badge-large" style="color: ${result.riskColor}; background: ${result.riskColor}15;">
                        ${result.riskLevel}
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="result-label">Reliability Index</div>
                    <div class="result-value" style="color: #00d4ff">${result.reliabilityIndex}</div>
                    <div class="result-sublabel">stability &amp; MTBF score</div>
                </div>
                
                <div class="result-card">
                    <div class="result-label">Maintainability</div>
                    <div class="result-value" style="color: #7c3aed">${result.maintainabilityPrediction}</div>
                    <div class="result-sublabel">code health rating</div>
                </div>
            </div>

            <div class="results-charts-row">
                <div class="chart-container small">
                    <h4>Multi-Dimensional Metric Profile</h4>
                    <canvas id="resultRadar"></canvas>
                </div>
                <div class="chart-container small">
                    <h4>Ensemble Model Contribution</h4>
                    <canvas id="resultBreakdown"></canvas>
                </div>
            </div>

            <!-- Ensemble Breakdown Details -->
            <div class="model-breakdown-details">
                <h4>Hybrid Model Component Breakdown</h4>
                <div class="breakdown-bars">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Neural Network (Static Features)</span>
                        <div class="breakdown-bar-track">
                            <div class="breakdown-bar-fill" style="width: ${result.modelBreakdown.neuralNetwork * 100}%; background: #7c3aed"></div>
                        </div>
                        <span class="breakdown-value">${(result.modelBreakdown.neuralNetwork * 100).toFixed(1)}%</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Gradient Boosting (Dynamic Features)</span>
                        <div class="breakdown-bar-track">
                            <div class="breakdown-bar-fill" style="width: ${result.modelBreakdown.gradientBoosting * 100}%; background: #00d4ff"></div>
                        </div>
                        <span class="breakdown-value">${(result.modelBreakdown.gradientBoosting * 100).toFixed(1)}%</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Cross-Feature Interaction Impact</span>
                        <div class="breakdown-bar-track">
                            <div class="breakdown-bar-fill" style="width: ${Math.abs(result.modelBreakdown.interactionScore) * 100}%; background: #f59e0b"></div>
                        </div>
                        <span class="breakdown-value">${result.modelBreakdown.interactionScore > 0 ? '+' : ''}${(result.modelBreakdown.interactionScore * 100).toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            <!-- Actionable Remediation Section -->
            <div class="remediation-section">
                <div class="remediation-header">
                    <h4>
                        <span>🛡️</span>
                        Actionable Quality Remediation Plan
                    </h4>
                    <span style="font-size: 11px; color: var(--text-muted);">Prioritized actions derived from metric violations</span>
                </div>
                <div class="remediation-grid">
                    ${recommendationsHtml}
                </div>
            </div>
        `;

        chartManager.createQualityGauge('resultGauge', result.qualityScore, result.riskColor);
        chartManager.createRadarChart('resultRadar', staticMetrics, dynamicMetrics);
        chartManager.createModelBreakdownChart('resultBreakdown', result.modelBreakdown);
    }

    // ===================== AUDIT REPORT MODAL =====================
    openAuditModal() {
        const modal = document.getElementById('auditReportModal');
        const body = document.getElementById('auditReportBody');
        if (!modal || !body) return;

        const result = this.analysisResults || hybridFramework.predict(
            this.predictions[0].static,
            this.predictions[0].dynamic
        );
        const staticM = this.currentStaticInputs || this.predictions[0].static;
        const dynamicM = this.currentDynamicInputs || this.predictions[0].dynamic;

        body.innerHTML = `
            <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div>
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent-cyan); font-weight: 700;">Overall Quality Verdict</span>
                        <h2 style="font-size: 28px; font-weight: 800; color: ${result.riskColor}; margin-top: 4px;">
                            ${result.qualityScore} / 100 — <span style="font-size: 20px;">${result.riskLevel} Risk</span>
                        </h2>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 12px; color: var(--text-muted);">Defect Likelihood:</span>
                        <div style="font-size: 20px; font-weight: 700; color: ${result.riskColor}; font-family: var(--font-mono);">${(result.defectProbability * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 10px;">Executive Summary &amp; Model Decisions</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid var(--border-glass);">
                    <td style="padding: 8px 0; color: var(--text-secondary);">Neural Network (Static Structural Risk):</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: var(--font-mono);">${(result.modelBreakdown.neuralNetwork * 100).toFixed(1)}%</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-glass);">
                    <td style="padding: 8px 0; color: var(--text-secondary);">Gradient Boosting (Dynamic Execution Risk):</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: var(--font-mono);">${(result.modelBreakdown.gradientBoosting * 100).toFixed(1)}%</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-glass);">
                    <td style="padding: 8px 0; color: var(--text-secondary);">Cross-Feature Interaction Term Impact:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: var(--font-mono);">${(result.modelBreakdown.interactionScore * 100).toFixed(2)}%</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-glass);">
                    <td style="padding: 8px 0; color: var(--text-secondary);">System Reliability Index:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: var(--font-mono); color: var(--accent-cyan);">${result.reliabilityIndex} / 100</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: var(--text-secondary);">Maintainability Rating:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: var(--font-mono); color: var(--accent-purple);">${result.maintainabilityPrediction} / 100</td>
                </tr>
            </table>

            <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 10px;">Prioritized Remediation Roadmap</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                ${(result.recommendations || []).map(r => `
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-glass); border-left: 3px solid ${r.priority.includes('Critical') ? '#ef4444' : (r.priority.includes('High') ? '#f59e0b' : '#10b981')}; padding: 10px 14px; border-radius: 4px; font-size: 12px;">
                        <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px;">
                            <span>${r.title}</span>
                            <span style="font-size: 10px; color: var(--accent-cyan); font-family: var(--font-mono);">${r.tool}</span>
                        </div>
                        <div style="color: var(--text-secondary); margin-bottom: 4px;">${r.advice}</div>
                        <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Current: ${r.current} ▹ Target: ${r.target}</div>
                    </div>
                `).join('')}
            </div>
        `;

        modal.classList.add('open');
    }

    closeAuditModal() {
        const modal = document.getElementById('auditReportModal');
        if (modal) modal.classList.remove('open');
    }

    copyAuditReportMarkdown() {
        const result = this.analysisResults || hybridFramework.predict(this.predictions[0].static, this.predictions[0].dynamic);
        const md = `# Software Quality Audit Report
**Framework:** Hybrid AI Framework for Software Quality Prediction (STQA Research)
**Overall Quality Score:** ${result.qualityScore}/100
**Risk Classification:** ${result.riskLevel}
**Defect Probability:** ${(result.defectProbability * 100).toFixed(1)}%
**Reliability Index:** ${result.reliabilityIndex}/100
**Maintainability Index:** ${result.maintainabilityPrediction}/100

## Model Breakdown
- Neural Network (Static structural risk): ${(result.modelBreakdown.neuralNetwork * 100).toFixed(1)}%
- Gradient Boosting (Dynamic testing risk): ${(result.modelBreakdown.gradientBoosting * 100).toFixed(1)}%
- Cross-Feature Interaction Impact: ${(result.modelBreakdown.interactionScore * 100).toFixed(2)}%

## Remediation Roadmap
${(result.recommendations || []).map(r => `- [${r.priority}] **${r.title}**: ${r.advice} (Current: ${r.current}, Target: ${r.target}, Tool: ${r.tool})`).join('\n')}
`;
        navigator.clipboard.writeText(md).then(() => {
            alert('Audit report markdown copied to clipboard!');
        });
    }

    // ===================== MODELS =====================
    renderModels() {
        chartManager.createModelComparisonChart('modelComparisonChart');
        chartManager.createDetailedComparisonChart('detailedComparisonChart');
        chartManager.createTrainingHistoryChart('trainingHistoryChart');
        chartManager.createFeatureImportanceChart('staticImportanceChart', 'static');
        chartManager.createFeatureImportanceChart('dynamicImportanceChart', 'dynamic');
        chartManager.createConfusionMatrix('confusionMatrixChart');
        this.renderModelCards();
    }

    renderModelCards() {
        const container = document.getElementById('modelCards');
        if (!container) return;

        container.innerHTML = Object.values(MODEL_COMPARISON).map(model => `
            <div class="model-card" style="border-color: ${model.color}30">
                <div class="model-card-header" style="background: ${model.color}15">
                    <div class="model-dot" style="background: ${model.color}"></div>
                    <h4>${model.name}</h4>
                </div>
                <div class="model-card-body">
                    <div class="model-stat">
                        <span>Accuracy</span>
                        <span style="color: ${model.color}">${model.accuracy}%</span>
                    </div>
                    <div class="model-stat">
                        <span>Precision</span>
                        <span>${model.precision}%</span>
                    </div>
                    <div class="model-stat">
                        <span>Recall</span>
                        <span>${model.recall}%</span>
                    </div>
                    <div class="model-stat">
                        <span>F1 Score</span>
                        <span>${model.f1Score}%</span>
                    </div>
                    <div class="model-stat">
                        <span>AUC-ROC</span>
                        <span>${model.auc}</span>
                    </div>
                    <div class="model-stat">
                        <span>MSE</span>
                        <span>${model.mse}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 6px;">
                        <em>${model.limitation || ''}</em>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ===================== DATASET =====================
    renderDataset() {
        this.filterDataset();
        chartManager.createPredictionScatterChart('datasetScatterChart', this.predictions);
    }

    filterDataset() {
        const query = (document.getElementById('datasetSearch')?.value || '').toLowerCase().trim();
        const risk = document.getElementById('riskFilter')?.value || 'ALL';
        const sort = document.getElementById('sortBy')?.value || 'id';

        let list = [...this.predictions];

        if (query) {
            list = list.filter(m => m.name.toLowerCase().includes(query) || m.id.toString() === query);
        }

        if (risk !== 'ALL') {
            list = list.filter(m => m.predicted.riskLevel === risk);
        }

        if (sort === 'qualityDesc') list.sort((a, b) => b.predicted.qualityScore - a.predicted.qualityScore);
        else if (sort === 'qualityAsc') list.sort((a, b) => a.predicted.qualityScore - b.predicted.qualityScore);
        else if (sort === 'complexity') list.sort((a, b) => b.static.cyclomaticComplexity - a.static.cyclomaticComplexity);
        else if (sort === 'coverage') list.sort((a, b) => a.dynamic.branchCoverage - b.dynamic.branchCoverage);
        else list.sort((a, b) => a.id - b.id);

        const countBadge = document.getElementById('datasetCountBadge');
        if (countBadge) countBadge.textContent = `${list.length} of ${this.predictions.length} modules`;

        const container = document.getElementById('datasetTable');
        if (!container) return;

        const thead = `
            <tr>
                <th>#</th>
                <th>Module Name</th>
                <th>LOC</th>
                <th>Complexity</th>
                <th>Maintainability</th>
                <th>Branch Coverage</th>
                <th>Test Pass</th>
                <th>Defect Density</th>
                <th>Quality Score</th>
                <th>Risk Level</th>
                <th>Action</th>
            </tr>
        `;

        const tbody = list.map(p => `
            <tr class="dataset-row ${p.predicted.riskLevel.toLowerCase()}">
                <td>${p.id}</td>
                <td class="module-name">${p.name}</td>
                <td>${p.static.loc}</td>
                <td>${p.static.cyclomaticComplexity}</td>
                <td>${p.static.maintainabilityIndex}</td>
                <td>${p.dynamic.branchCoverage}%</td>
                <td>${p.dynamic.testPassRate}%</td>
                <td>${p.dynamic.defectDensity}</td>
                <td><span class="quality-badge" style="color: ${p.predicted.riskColor}">${p.predicted.qualityScore}</span></td>
                <td><span class="risk-badge" style="background: ${p.predicted.riskColor}20; color: ${p.predicted.riskColor}">${p.predicted.riskLevel}</span></td>
                <td><button class="btn-analyze" onclick="app.analyzeModule(${p.id - 1})">Analyze ▹</button></td>
            </tr>
        `).join('');

        container.innerHTML = `<thead>${thead}</thead><tbody>${tbody}</tbody>`;
    }

    // ===================== RESULTS =====================
    renderResults() {
        chartManager.createPredictionScatterChart('resultsScatterChart', this.predictions);
        chartManager.createQualityDistributionChart('resultsDistributionChart', this.predictions);
        this.renderSummaryStats();
    }

    renderProjectResults(project, modules) {
        const container = document.getElementById('projectResultsPanel');
        if (!container) return;

        container.style.display = 'block';
        container.innerHTML = `
            <div class="project-result-header">
                <span class="project-result-icon">${project.icon}</span>
                <div>
                    <h3>${project.name} Quality Assessment</h3>
                    <p>${project.description} (${modules.length} Microservices Analyzed)</p>
                </div>
            </div>
            <div class="project-modules-grid">
                ${modules.map(m => `
                    <div class="project-module-card" style="border-left: 3px solid ${m.predicted.riskColor}">
                        <div class="pm-header">
                            <span class="pm-name">${m.name}</span>
                            <span class="risk-badge" style="background: ${m.predicted.riskColor}20; color: ${m.predicted.riskColor}">${m.predicted.riskLevel}</span>
                        </div>
                        <div class="pm-score" style="color: ${m.predicted.riskColor}">${m.predicted.qualityScore}</div>
                        <div class="pm-details">
                            <span>Defect Risk: ${(m.predicted.defectProbability * 100).toFixed(0)}%</span>
                            <span>Reliability: ${m.predicted.reliabilityIndex}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="project-summary">
                <div class="ps-stat">
                    <span class="ps-label">Average Quality</span>
                    <span class="ps-value">${Math.round(modules.reduce((s, m) => s + m.predicted.qualityScore, 0) / modules.length)} / 100</span>
                </div>
                <div class="ps-stat">
                    <span class="ps-label">High / Critical Risk Modules</span>
                    <span class="ps-value" style="color: #ef4444">${modules.filter(m => m.predicted.riskLevel === 'High' || m.predicted.riskLevel === 'Critical').length} of ${modules.length}</span>
                </div>
                <div class="ps-stat">
                    <span class="ps-label">Deployment Gate Recommendation</span>
                    <span class="ps-value">${modules.filter(m => m.predicted.riskLevel === 'High' || m.predicted.riskLevel === 'Critical').length > 1 ? '🛑 Hold Release (Refactor Required)' : '✅ Proceed to Staging'}</span>
                </div>
            </div>
        `;
    }

    renderSummaryStats() {
        const evaluation = hybridFramework.evaluate(this.dataset);
        const container = document.getElementById('summaryStats');
        if (!container) return;

        container.innerHTML = `
            <div class="summary-stat-card">
                <div class="ss-label">Hybrid Accuracy</div>
                <div class="ss-value" style="color: #00d4ff">${evaluation.accuracy}%</div>
            </div>
            <div class="summary-stat-card">
                <div class="ss-label">Precision</div>
                <div class="ss-value" style="color: #7c3aed">${evaluation.precision}%</div>
            </div>
            <div class="summary-stat-card">
                <div class="ss-label">Recall (Sensitivity)</div>
                <div class="ss-value" style="color: #10b981">${evaluation.recall}%</div>
            </div>
            <div class="summary-stat-card">
                <div class="ss-label">F1-Score</div>
                <div class="ss-value" style="color: #f59e0b">${evaluation.f1Score}%</div>
            </div>
            <div class="summary-stat-card">
                <div class="ss-label">Mean Squared Error</div>
                <div class="ss-value">${evaluation.mse}</div>
            </div>
            <div class="summary-stat-card">
                <div class="ss-label">Mean Absolute Error</div>
                <div class="ss-value">${evaluation.mae}</div>
            </div>
        `;
    }

    // ===================== UTILITIES =====================
    setCounter(elementId, value, suffix = '') {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.dataset.target = value;
        el.dataset.suffix = suffix;
    }

    animateCounters() {
        const counters = document.querySelectorAll('[data-target]');
        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const suffix = counter.dataset.suffix || '';
            const duration = 1200;
            const start = performance.now();

            const animate = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;

                counter.textContent = (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;

                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });
    }

    startParticleAnimation() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = [];

        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 45; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.6,
                speedX: (Math.random() - 0.5) * 0.45,
                speedY: (Math.random() - 0.5) * 0.45,
                opacity: Math.random() * 0.5 + 0.1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }
}

// Global instance & window handler
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
