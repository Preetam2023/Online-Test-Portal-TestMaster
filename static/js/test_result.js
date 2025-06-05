document.addEventListener('DOMContentLoaded', function () {
    const percentage = parseFloat(document.querySelector('.score-value').innerText.replace('%', ''));
    const correct = parseInt(document.querySelector('.correct').innerText);
    const total = parseInt(document.querySelector('.total').innerText);
    const unattempted = document.querySelectorAll('.unattempted-answer').length;
    const incorrect = total - correct - unattempted;

    // Animate circular score
    const circle = document.querySelector('.progress-ring-percentage');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    const offset = circumference - (percentage / 100) * circumference;
    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        circle.style.strokeDashoffset = offset;
    }, 300);

    // Toggle sections
    const toggleSection = (btnSelector, contentSelector) => {
        const button = document.querySelector(btnSelector);
        const content = document.querySelector(contentSelector);
        const icon = button.querySelector('.toggle-icon');
        button.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
        content.style.display = 'none';
    };

    toggleSection('.toggle-questions-btn', '.question-breakdown');
    toggleSection('.toggle-analysis-btn', '.analysis-content');

    // Chart 1: Score Distribution
    new Chart(document.getElementById('scoreDistributionChart'), {
        type: 'pie',
        data: {
            labels: ['Correct', 'Incorrect', 'Unattempted'],
            datasets: [{
                data: [correct, incorrect, unattempted],
                backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E']
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

// 1. Marks Comparison Chart
new Chart(document.getElementById('comparisonChart'), {
    type: 'bar',
    data: {
        labels: ['You', 'Topper', 'Average'],
        datasets: [{
            label: 'Score (%)',
            data: [
                parseFloat(document.getElementById('youScore')?.innerText || percentage),
                parseFloat(document.getElementById('topperScore')?.innerText || 100),
                parseFloat(document.getElementById('avgScore')?.innerText || 60)
            ],
            backgroundColor: ['#4CAF50B3', '#FFC107B3', '#2196F3B3']
        }]
    },
    options: {
        scales: { y: { beginAtZero: true, max: 100 } },
        plugins: { legend: { display: false } }
    }
});

// 2. Time Comparison Chart (minutes)
const yourTime = parseInt(document.getElementById('yourTime')?.innerText || 0);
const topperTime = parseInt(document.getElementById('topperTime')?.innerText || 0);
const avgTime = parseInt(document.getElementById('avgTime')?.innerText || 0);

new Chart(document.getElementById('timeComparisonChart'), {
    type: 'bar',
    data: {
        labels: ['You', 'Topper', 'Average'],
        datasets: [{
            label: 'Time Taken (min)',
            data: [
                Math.round(yourTime / 60),
                Math.round(topperTime / 60),
                Math.round(avgTime / 60)
            ],
            backgroundColor: ['#03A9F4B3', '#FFC107B3', '#9C27B0B3']
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Minutes' }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const min = context.raw;
                        const sec = min * 60;
                        const h = Math.floor(sec / 3600);
                        const m = Math.floor((sec % 3600) / 60);
                        const s = sec % 60;
                        return ` ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    }
                }
            }
        }
    }
});


    // Chart 3: Difficulty-wise Bar Chart (Correct/Incorrect/Unattempted)
    const levels = ['easy', 'medium', 'hard'];
    const diffLabels = ['Easy', 'Medium', 'Hard'];

    const diffCorrect = levels.map(lvl => parseInt(document.getElementById(`${lvl}_correct`)?.innerText || 0));
    const diffIncorrect = levels.map(lvl => parseInt(document.getElementById(`${lvl}_incorrect`)?.innerText || 0));
    const diffUnattempted = levels.map(lvl => parseInt(document.getElementById(`${lvl}_unattempted`)?.innerText || 0));
    const diffTotal = levels.map(lvl => parseInt(document.getElementById(`${lvl}_total`)?.innerText || 0));

    new Chart(document.getElementById('difficultyChart'), {
        type: 'bar',
        data: {
            labels: diffLabels,
            datasets: [
                {
                    label: 'Correct',
                    data: diffCorrect,
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Incorrect',
                    data: diffIncorrect,
                    backgroundColor: '#F44336'
                },
                {
                    label: 'Unattempted',
                    data: diffUnattempted,
                    backgroundColor: '#9E9E9E'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            const total = diffTotal[context.dataIndex];
                            return `of ${total} questions`;
                        }
                    }
                }
            }
        }
    });

    // Chart 4: Heatmap for Detailed Difficulty (Optional, can be repurposed later)
    const matrixCtx = document.getElementById('stackedDifficultyChart').getContext('2d');
    new Chart(matrixCtx, {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Difficulty Heatmap',
                data: [
                    { x: 'Easy', y: 'Correct', v: diffCorrect[0] },
                    { x: 'Easy', y: 'Incorrect', v: diffIncorrect[0] },
                    { x: 'Easy', y: 'Unattempted', v: diffUnattempted[0] },
                    { x: 'Medium', y: 'Correct', v: diffCorrect[1] },
                    { x: 'Medium', y: 'Incorrect', v: diffIncorrect[1] },
                    { x: 'Medium', y: 'Unattempted', v: diffUnattempted[1] },
                    { x: 'Hard', y: 'Correct', v: diffCorrect[2] },
                    { x: 'Hard', y: 'Incorrect', v: diffIncorrect[2] },
                    { x: 'Hard', y: 'Unattempted', v: diffUnattempted[2] }
                ],
                backgroundColor(ctx) {
                    const value = ctx.dataset.data[ctx.dataIndex].v;
                    return `hsl(${Math.max(0, 120 - value * 10)}, 70%, 60%)`;
                },
                width: ({ chart }) => (chart.chartArea || {}).width / 3 - 10,
                height: ({ chart }) => (chart.chartArea || {}).height / 3 - 10
            }]
        },
        options: {
            scales: {
                x: { type: 'category', offset: true },
                y: { type: 'category', offset: true }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            const { x, y, v } = ctx.raw;
                            return `${y} in ${x}: ${v}`;
                        }
                    }
                }
            }
        }
    });

    // Chart 5: Time Distribution Box Plot
    const timeData = JSON.parse(document.getElementById('timeData')?.innerText || '[]');
    if (timeData.length) {
        new Chart(document.getElementById('timeDistributionChart'), {
            type: 'boxplot',
            data: {
                labels: ['Time Spent'],
                datasets: [{
                    label: 'Time (s)',
                    data: timeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)'
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Time Spent per Question' }
                },
                scales: {
                    y: { title: { display: true, text: 'Seconds' } }
                }
            }
        });
    }
});
