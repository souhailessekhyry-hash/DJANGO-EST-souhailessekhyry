/**
 * dice.js - Animation et interaction des dés
 *
 * Gère le lancer des dés avec animation, les appels AJAX
 * vers l'API Django, et la mise à jour des statistiques.
 */

const DC = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const DiceApp = {
    rolling: false,
    chart: null,
    chartData: [],

    els: {},

    init() {
        this.els = {
            dice1: document.getElementById('dice1'),
            dice2: document.getElementById('dice2'),
            result: document.getElementById('result'),
            btn: document.getElementById('btnRoll'),
            total: document.getElementById('totalLancers'),
            egaux: document.getElementById('totalEgaux'),
            freq: document.getElementById('freqLive'),
        };

        this.els.btn.addEventListener('click', () => this.roll());
        this.initChart();
    },

    async roll() {
        if (this.rolling) return;
        this.rolling = true;
        this.els.btn.disabled = true;

        // Appel AJAX à l'API Django
        const resp = await fetch('/api/lancer/');
        const data = await resp.json();

        // Animation
        this.els.dice1.classList.add('rolling');
        this.els.dice2.classList.add('rolling');
        this.els.dice1.classList.remove('pop');
        this.els.dice2.classList.remove('pop');
        this.els.result.innerHTML = '<span class="rolling-text">🎲 En cours...</span>';

        await this.animate(data);

        // Fin animation
        this.els.dice1.classList.remove('rolling');
        this.els.dice2.classList.remove('rolling');
        this.els.dice1.classList.add('pop');
        this.els.dice2.classList.add('pop');

        // Affichage du résultat
        this.els.dice1.textContent = DC[data.de1 - 1];
        this.els.dice2.textContent = DC[data.de2 - 1];

        if (data.egaux) {
            this.els.result.innerHTML =
                `<span class="success">🎉 ${data.de1} = ${data.de2} — Paire !</span>`;
        } else {
            this.els.result.innerHTML =
                `<span class="fail">😞 ${data.de1} ≠ ${data.de2}</span>`;
        }

        // Mise à jour des statistiques
        this.els.total.textContent = data.total_lancers;
        this.els.egaux.textContent = data.total_egaux;
        this.els.freq.textContent = data.frequence.toFixed(4);

        // Mise à jour du graphique
        this.updateChart(data.frequence, data.total_lancers);

        this.rolling = false;
        this.els.btn.disabled = false;
    },

    animate(data) {
        return new Promise(resolve => {
            let step = 0;
            const total = 16;
            const delays = [50, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 170, 190, 220, 260];

            const tick = () => {
                const v1 = Math.floor(Math.random() * 6);
                const v2 = Math.floor(Math.random() * 6);
                DiceApp.els.dice1.textContent = DC[v1];
                DiceApp.els.dice2.textContent = DC[v2];
                step++;
                if (step < total) {
                    setTimeout(tick, delays[step]);
                } else {
                    resolve();
                }
            };
            tick();
        });
    },

    initChart() {
        const ctx = document.getElementById('convergenceChart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Fréquence observée',
                    data: [],
                    backgroundColor: '#ffd700',
                    borderColor: '#ffd700',
                    pointRadius: 6,
                    pointHoverRadius: 9,
                }, {
                    label: 'Probabilité théorique (1/6)',
                    data: [],
                    type: 'line',
                    borderColor: '#dc3545',
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#e0e0e0', font: { size: 12 } },
                    },
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Nombre de lancers', color: '#aaa' },
                        ticks: { color: '#aaa' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        type: 'logarithmic',
                        min: 1,
                    },
                    y: {
                        title: { display: true, text: 'Fréquence', color: '#aaa' },
                        ticks: { color: '#aaa' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        min: 0,
                        max: 1,
                    },
                },
            },
        });

        // Ajout de la ligne théorique
        this.chart.data.datasets[1].data = [
            { x: 1, y: 1 / 6 },
            { x: 100000, y: 1 / 6 },
        ];
        this.chart.update();
    },

    updateChart(freq, total) {
        if (!this.chart) return;
        this.chart.data.datasets[0].data.push({ x: total, y: freq });
        this.chart.update();
    },
};

document.addEventListener('DOMContentLoaded', () => DiceApp.init());
