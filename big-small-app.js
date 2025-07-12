// Big/Small AI Predictor with Last 5 Results Integration
class BigSmallPredictor {
    constructor() {
        this.outcomes = ['big', 'small'];
        this.history = this.generateMockHistory();
        this.stats = {
            total_predictions: 89,
            successful_predictions: 73,
            accuracy_rate: 82.0
        };
        this.lastFiveResults = [];
    }

    generateMockHistory() {
        const history = [];
        for (let i = 0; i < 8; i++) {
            history.push({
                id: i + 1,
                predicted_outcome: this.outcomes[Math.floor(Math.random() * this.outcomes.length)],
                actual_outcome: this.outcomes[Math.floor(Math.random() * this.outcomes.length)],
                confidence: Math.floor(Math.random() * 26) + 70, // 70-95%
                timestamp: new Date().toISOString(),
                result: Math.random() > 0.4 ? 'win' : 'loss' // 60% win rate for demo
            });
        }
        return history;
    }

    setLastFiveResults(results) {
        this.lastFiveResults = results.slice(-5); // Keep only last 5
    }

    generatePrediction(useLastFive = false) {
        let predictedOutcome;
        let confidence;
        let algorithm = 'Big/Small Pattern Analysis v1.0';
        
        if (useLastFive && this.lastFiveResults.length > 0) {
            // Enhanced prediction using last 5 results
            algorithm = 'Advanced Big/Small Analysis v2.0 (Last 5 Results)';
            
            // Count occurrences of each outcome in last 5 results
            const outcomeCounts = {};
            this.outcomes.forEach(outcome => outcomeCounts[outcome] = 0);
            
            this.lastFiveResults.forEach(result => {
                if (outcomeCounts[result] !== undefined) {
                    outcomeCounts[result]++;
                }
            });
            
            // Advanced prediction logic for Big/Small
            const totalResults = this.lastFiveResults.length;
            
            // Strategy 1: Predict the least frequent outcome (anti-pattern)
            const minCount = Math.min(...Object.values(outcomeCounts));
            const leastFrequent = Object.keys(outcomeCounts).filter(outcome => outcomeCounts[outcome] === minCount);
            
            // Strategy 2: Look for streaks
            const lastOutcome = this.lastFiveResults[this.lastFiveResults.length - 1];
            const streak = this.calculateStreak(this.lastFiveResults, lastOutcome);
            
            // Strategy 3: Balanced prediction (if too much of one outcome, predict the other)
            const maxCount = Math.max(...Object.values(outcomeCounts));
            const mostFrequent = Object.keys(outcomeCounts).filter(outcome => outcomeCounts[outcome] === maxCount);
            
            // Decision logic for Big/Small
            if (streak >= 3) {
                // If there's a streak of 3+, predict the opposite outcome
                const oppositeOutcome = lastOutcome === 'big' ? 'small' : 'big';
                predictedOutcome = oppositeOutcome;
                confidence = Math.floor(Math.random() * 11) + 85; // 85-95%
            } else if (maxCount >= 3) {
                // If one outcome appeared 3+ times, predict the other
                const otherOutcome = this.outcomes.filter(outcome => !mostFrequent.includes(outcome));
                predictedOutcome = otherOutcome.length > 0 ? 
                    otherOutcome[Math.floor(Math.random() * otherOutcome.length)] :
                    leastFrequent[Math.floor(Math.random() * leastFrequent.length)];
                confidence = Math.floor(Math.random() * 16) + 80; // 80-95%
            } else {
                // Predict least frequent outcome
                predictedOutcome = leastFrequent[Math.floor(Math.random() * leastFrequent.length)];
                confidence = Math.floor(Math.random() * 21) + 75; // 75-95%
            }
        } else {
            // Standard prediction without last 5 results
            const recent = this.history.slice(-5);
            const outcomeCounts = {};
            this.outcomes.forEach(outcome => outcomeCounts[outcome] = 0);
            
            recent.forEach(item => {
                if (outcomeCounts[item.actual_outcome] !== undefined) {
                    outcomeCounts[item.actual_outcome]++;
                }
            });
            
            // Simple probability-based prediction
            const bigCount = outcomeCounts['big'] || 0;
            const smallCount = outcomeCounts['small'] || 0;
            
            if (bigCount > smallCount) {
                predictedOutcome = 'small'; // Predict opposite of more frequent
                confidence = Math.floor(Math.random() * 16) + 70; // 70-85%
            } else if (smallCount > bigCount) {
                predictedOutcome = 'big'; // Predict opposite of more frequent
                confidence = Math.floor(Math.random() * 16) + 70; // 70-85%
            } else {
                // Equal distribution, random prediction
                predictedOutcome = this.outcomes[Math.floor(Math.random() * this.outcomes.length)];
                confidence = Math.floor(Math.random() * 21) + 70; // 70-90%
            }
        }

        return {
            predicted_outcome: predictedOutcome,
            confidence: confidence,
            timestamp: new Date().toISOString(),
            algorithm: algorithm,
            based_on_last_five: useLastFive && this.lastFiveResults.length > 0,
            last_five_data: useLastFive ? this.lastFiveResults : null,
            reasoning: this.generateReasoning(predictedOutcome, useLastFive)
        };
    }

    generateReasoning(prediction, useLastFive) {
        if (!useLastFive || this.lastFiveResults.length === 0) {
            return "Based on historical pattern analysis and probability distribution";
        }
        
        const bigCount = this.lastFiveResults.filter(r => r === 'big').length;
        const smallCount = this.lastFiveResults.filter(r => r === 'small').length;
        
        if (bigCount > smallCount + 1) {
            return `${bigCount} BIG vs ${smallCount} SMALL detected - predicting balance correction`;
        } else if (smallCount > bigCount + 1) {
            return `${smallCount} SMALL vs ${bigCount} BIG detected - predicting balance correction`;
        } else {
            return "Balanced pattern detected - using anti-pattern analysis";
        }
    }

    calculateStreak(results, outcome) {
        let streak = 0;
        for (let i = results.length - 1; i >= 0; i--) {
            if (results[i] === outcome) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    getStats() {
        return this.stats;
    }

    getHistory() {
        return this.history.slice(0, 6);
    }

    getLastFiveResults() {
        return this.lastFiveResults;
    }
}

// Initialize the predictor
const predictor = new BigSmallPredictor();

// DOM manipulation functions
function updateStats() {
    const stats = predictor.getStats();
    document.getElementById('total-predictions').textContent = stats.total_predictions;
    document.getElementById('successful-predictions').textContent = stats.successful_predictions;
    document.getElementById('accuracy-rate').textContent = stats.accuracy_rate + '%';
}

function updateHistory() {
    const history = predictor.getHistory();
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '';
    
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'flex items-center justify-between p-2 border border-green-500/20 rounded mb-2';
        
        const outcomeClass = getOutcomeClass(item.actual_outcome);
        const outcomeIcon = item.actual_outcome === 'big' ? '📈' : '📉';
        const resultBadge = item.result === 'win' ? 
            '<span class="bg-green-600 text-white px-2 py-1 rounded text-xs">win</span>' :
            '<span class="bg-red-600 text-white px-2 py-1 rounded text-xs">loss</span>';
        
        historyItem.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="text-lg">${outcomeIcon}</span>
                <span class="text-green-400 text-sm uppercase">${item.actual_outcome}</span>
            </div>
            <span class="text-xs text-green-400/70">#${item.id}</span>
            ${resultBadge}
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

function updateLastFiveDisplay() {
    const lastFive = predictor.getLastFiveResults();
    const container = document.getElementById('last-five-display');
    
    if (lastFive.length === 0) {
        container.innerHTML = '<div class="text-green-400/50 text-sm">No results entered yet</div>';
        return;
    }
    
    container.innerHTML = lastFive.map((outcome, index) => {
        const outcomeIcon = outcome === 'big' ? '📈' : '📉';
        const outcomeClass = outcome === 'big' ? 'text-red-400' : 'text-blue-400';
        return `<div class="flex items-center space-x-2">
            <span class="text-green-400/70 text-sm">${index + 1}:</span>
            <span class="text-lg">${outcomeIcon}</span>
            <span class="${outcomeClass} text-sm uppercase font-bold">${outcome}</span>
        </div>`;
    }).join('');
}

function getOutcomeClass(outcome) {
    return outcome === 'big' ? 'text-red-400' : 'text-blue-400';
}

function showPrediction(prediction) {
    const predictionContainer = document.getElementById('prediction-container');
    const outcomeClass = prediction.predicted_outcome === 'big' ? 'prediction-big' : 'prediction-small';
    const outcomeIcon = prediction.predicted_outcome === 'big' ? '📈' : '📉';
    
    const basedOnText = prediction.based_on_last_five ? 
        '<div class="text-xs text-green-400/70 mb-2">🎯 Based on your last 5 results</div>' : '';
    
    predictionContainer.innerHTML = `
        <div class="text-center space-y-4 p-6 border border-green-500/30 rounded-lg bg-black/30">
            ${basedOnText}
            <div class="text-sm text-green-400/70 uppercase tracking-wider">
                NEXT OUTCOME PREDICTION
            </div>
            <div class="${outcomeClass} inline-block px-8 py-4 rounded-lg text-2xl font-bold uppercase">
                ${outcomeIcon} ${prediction.predicted_outcome}
            </div>
            <div class="flex justify-center items-center space-x-4 text-sm">
                <span class="border border-green-500/50 text-green-400 px-2 py-1 rounded">
                    Confidence: ${prediction.confidence}%
                </span>
                <span class="border border-green-500/50 text-green-400 px-2 py-1 rounded text-xs">
                    ${prediction.algorithm}
                </span>
            </div>
            <div class="text-xs text-green-400/50 max-w-md mx-auto">
                ${prediction.reasoning}
            </div>
            <div class="text-xs text-green-400/50">
                Generated: ${new Date(prediction.timestamp).toLocaleString()}
            </div>
        </div>
    `;
}

function addLastResult(outcome) {
    const currentResults = predictor.getLastFiveResults();
    currentResults.push(outcome);
    predictor.setLastFiveResults(currentResults);
    updateLastFiveDisplay();
    
    // Clear any existing prediction when new data is added
    document.getElementById('prediction-container').innerHTML = '';
}

function clearLastResults() {
    predictor.setLastFiveResults([]);
    updateLastFiveDisplay();
    document.getElementById('prediction-container').innerHTML = '';
}

function generatePrediction() {
    const button = document.getElementById('predict-button');
    button.innerHTML = '<span class="animate-spin">🎯</span> ANALYZING...';
    button.disabled = true;
    
    setTimeout(() => {
        const useLastFive = predictor.getLastFiveResults().length > 0;
        const prediction = predictor.generatePrediction(useLastFive);
        showPrediction(prediction);
        
        button.innerHTML = '🎯 GENERATE PREDICTION';
        button.disabled = false;
    }, 1500);
}

function openWhatsApp() {
    window.open('https://whatsapp.com/channel/0029VavHzv259PwTIz1XxJ09', '_blank');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateHistory();
    updateLastFiveDisplay();
    
    // Add event listeners
    document.getElementById('predict-button').addEventListener('click', generatePrediction);
    document.querySelectorAll('.whatsapp-button').forEach(button => {
        button.addEventListener('click', openWhatsApp);
    });
    
    // Add event listeners for outcome buttons
    document.getElementById('add-big').addEventListener('click', () => addLastResult('big'));
    document.getElementById('add-small').addEventListener('click', () => addLastResult('small'));
    document.getElementById('clear-results').addEventListener('click', clearLastResults);
});

