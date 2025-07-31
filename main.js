document.getElementById('loading').style.display = 'none';
document.getElementById('main-content').style.display = 'block';
initDashboard();


// Navigation
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('bg-white', 'text-gray-900', 'minimal-shadow');
        tab.classList.add('text-gray-600');
    });

    document.getElementById(tabName + '-content').classList.remove('hidden');
    const activeTab = document.getElementById(tabName + '-tab');
    activeTab.classList.remove('text-gray-600');
    activeTab.classList.add('bg-white', 'text-gray-900', 'minimal-shadow');
}

// Initialize dashboard
function initDashboard() {
    updateStats();
    createCharts();
    populateUseCasesAndIssues();
    populateReviews();
}

function updateStats() {
    const totalReviews = reviewsData.length;
    const positiveReviews = reviewsData.filter(r => r.overall_sentiment === 'positive').length;
    const negativeReviews = reviewsData.filter(r => r.overall_sentiment === 'negative').length;
    const repurchaseRate = totalReviews > 0 ? Math.round((reviewsData.filter(r => r.will_repurchase === 'true').length / totalReviews) * 100) : 0;

    document.getElementById('total-reviews').textContent = totalReviews;
    document.getElementById('positive-reviews').textContent = positiveReviews;
    document.getElementById('negative-reviews').textContent = negativeReviews;
    document.getElementById('repurchase-rate').textContent = repurchaseRate + '%';
}

function createCharts() {
    // Sentiment Distribution Chart
    const sentimentCtx = document.getElementById('sentimentChart').getContext('2d');
    new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
            labels: ['ポジティブ', 'ネガティブ', 'ニュートラル'],
            datasets: [{
                data: [
                    reviewsData.filter(r => r.overall_sentiment === 'positive').length,
                    reviewsData.filter(r => r.overall_sentiment === 'negative').length,
                    reviewsData.filter(r => r.overall_sentiment === 'neutral').length
                ],
                backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#374151',
                        font: { family: 'Noto Sans JP' }
                    }
                }
            }
        }
    });

    // Aspect Analysis Chart
    const aspectCtx = document.getElementById('aspectChart').getContext('2d');
    const aspectData = {};
    reviewsData.forEach(review => {
        Object.keys(review.aspects).forEach(aspect => {
            if (!aspectData[aspect]) aspectData[aspect] = { positive: 0, negative: 0, neutral: 0 };
            const sentiment = review.aspects[aspect].sentiment;
            if (sentiment === 'positive') aspectData[aspect].positive++;
            else if (sentiment === 'negative') aspectData[aspect].negative++;
            else aspectData[aspect].neutral++;
        });
    });

    new Chart(aspectCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(aspectData),
            datasets: [
                {
                    label: 'ポジティブ',
                    data: Object.values(aspectData).map(d => d.positive),
                    backgroundColor: '#10B981'
                },
                {
                    label: 'ネガティブ',
                    data: Object.values(aspectData).map(d => d.negative),
                    backgroundColor: '#EF4444'
                },
                {
                    label: 'ニュートラル',
                    data: Object.values(aspectData).map(d => d.neutral),
                    backgroundColor: '#6B7280'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#374151',
                        font: { family: 'Noto Sans JP' }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#374151',
                        font: { family: 'Noto Sans JP' }
                    }
                },
                y: {
                    ticks: {
                        color: '#374151',
                        font: { family: 'Noto Sans JP' }
                    }
                }
            }
        }
    });

    // Sentiment Scores Chart
    const scoreCtx = document.getElementById('scoreChart').getContext('2d');
    new Chart(scoreCtx, {
        type: 'line',
        data: {
            labels: reviewsData.map((_, i) => `レビュー ${i + 1}`),
            datasets: [{
                label: '感情スコア',
                data: reviewsData.map(r => r.sentiment_score),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#374151',
                        font: { family: 'Noto Sans JP' }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#374151',
                        font: { family: 'Noto Sans JP' }
                    }
                },
                y: {
                    ticks: {
                        color: '#374151',
                        font: { family: 'Noto Sans JP' }
                    },
                    min: -1,
                    max: 1
                }
            }
        }
    });
}

function populateUseCasesAndIssues() {
    const useCases = [...new Set(reviewsData.flatMap(r => r.use_cases))];
    const issues = [...new Set(reviewsData.flatMap(r => r.issues))];

    const useCasesList = document.getElementById('use-cases-list');
    useCasesList.innerHTML = useCases.length > 0 ? useCases.map(useCase =>
        `<div class="bg-gray-50 text-gray-700 px-3 py-2 rounded border japanese-border">${useCase}</div>`
    ).join('') : '<div class="text-gray-500 italic">データなし</div>';

    const issuesList = document.getElementById('issues-list');
    issuesList.innerHTML = issues.length > 0 ? issues.map(issue =>
        `<div class="bg-gray-50 text-gray-700 px-3 py-2 rounded border japanese-border">${issue}</div>`
    ).join('') : '<div class="text-gray-500 italic">データなし</div>';
}

function populateReviews() {
    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = reviewsData.map((review, index) => `
                <div class="bg-white japanese-border rounded-lg p-6 cursor-pointer hover-lift minimal-shadow" onclick="showReviewDetail(${index})">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 rounded-full ${review.overall_sentiment === 'positive' ? 'bg-green-500' : 'bg-red-500'}"></div>
                            <div>
                                <h3 class="font-medium text-gray-900">レビュー ${index + 1}</h3>
                                <p class="text-sm text-gray-600">${review.overall_sentiment === 'positive' ? 'ポジティブ' : 'ネガティブ'}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-medium text-gray-900">${review.sentiment_score}</div>
                            <div class="text-sm text-gray-600">スコア</div>
                        </div>
                    </div>
                    <p class="text-gray-700 mb-4 line-clamp-2">"${review.original_review}"</p>
                    <div class="flex flex-wrap gap-2">
                        ${review.use_cases.map(useCase =>
        `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm japanese-border">${useCase}</span>`
    ).join('')}
                        <span class="px-2 py-1 rounded text-sm japanese-border ${review.will_repurchase === 'true' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
                            ${review.will_repurchase === 'true' ? '再購入予定' : '再購入なし'}
                        </span>
                    </div>
                </div>
            `).join('');
}

function showReviewDetail(index) {
    const review = reviewsData[index];
    const modal = document.getElementById('reviewModal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-gray-50 rounded-lg p-4 japanese-border">
                        <h3 class="font-medium text-gray-900 mb-2">元のレビュー</h3>
                        <p class="text-gray-700">"${review.original_review}"</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4 japanese-border">
                            <h3 class="font-medium text-gray-900 mb-2">総合感情</h3>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded-full ${review.overall_sentiment === 'positive' ? 'bg-green-500' : 'bg-red-500'}"></div>
                                <span class="text-gray-700">${review.overall_sentiment === 'positive' ? 'ポジティブ' : 'ネガティブ'}</span>
                                <span class="text-gray-500">(${review.sentiment_score})</span>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 rounded-lg p-4 japanese-border">
                            <h3 class="font-medium text-gray-900 mb-2">再購入意向</h3>
                            <span class="text-gray-700">${review.will_repurchase === 'true' ? '✓ あり' : '✗ なし'}</span>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4 japanese-border">
                        <h3 class="font-medium text-gray-900 mb-3">アスペクト分析</h3>
                        <div class="grid gap-2">
                            ${Object.entries(review.aspects).map(([aspect, data]) => `
                                <div class="flex justify-between items-center py-1">
                                    <span class="text-gray-700 capitalize">${aspect}</span>
                                    <span class="px-2 py-1 rounded text-sm japanese-border ${data.sentiment === 'positive' ? 'bg-green-50 text-green-700' :
            data.sentiment === 'negative' ? 'bg-red-50 text-red-700' :
                'bg-gray-100 text-gray-600'
        }">
                                        ${data.sentiment === 'not_mentioned' ? '言及なし' :
            data.sentiment === 'positive' ? 'ポジティブ' :
                data.sentiment === 'negative' ? 'ネガティブ' : 'ニュートラル'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${review.positives.length > 0 ? `
                        <div class="bg-green-50 rounded-lg p-4 japanese-border">
                            <h3 class="font-medium text-gray-900 mb-2">ポジティブポイント</h3>
                            <div class="flex flex-wrap gap-2">
                                ${review.positives.map(positive =>
                    `<span class="bg-white text-gray-700 px-2 py-1 rounded text-sm japanese-border">${positive}</span>`
                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${review.issues.length > 0 ? `
                        <div class="bg-red-50 rounded-lg p-4 japanese-border">
                            <h3 class="font-medium text-gray-900 mb-2">課題・問題点</h3>
                            <div class="flex flex-wrap gap-2">
                                ${review.issues.map(issue =>
                    `<span class="bg-white text-gray-700 px-2 py-1 rounded text-sm japanese-border">${issue}</span>`
                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="bg-blue-50 rounded-lg p-4 japanese-border">
                        <h3 class="font-medium text-gray-900 mb-2">使用用途</h3>
                        <div class="flex flex-wrap gap-2">
                            ${review.use_cases.map(useCase =>
                    `<span class="bg-white text-gray-700 px-2 py-1 rounded text-sm japanese-border">${useCase}</span>`
                ).join('')}
                        </div>
                    </div>
                </div>
            `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('reviewModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Initialize the app
loadData();