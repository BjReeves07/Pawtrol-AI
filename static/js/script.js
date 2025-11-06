// ====================================
// PAWTROL AI - FRONTEND JAVASCRIPT
// ====================================

// API Configuration - Use relative URL for same origin
const API_BASE_URL = window.location.origin;

// ====================================
// NAVIGATION
// ====================================

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        // Update active button
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show selected view
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(view).classList.add('active');
    });
});

// ====================================
// BACKEND CONNECTION
// ====================================

async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/animals`);
        if (response.ok) {
            const animals = await response.json();
            
            // Update status indicator
            document.getElementById('statusIndicator').className = 'status-indicator online';
            document.getElementById('statusText').textContent = 'Connected to backend';
            document.getElementById('animalList').textContent = `Animals from API: ${animals.join(', ')}`;
            
            // Update stats
            document.getElementById('totalAnimals').textContent = animals.length;
            
            // Load animals into grid
            loadAnimals(animals);
            
            return true;
        }
    } catch (error) {
        document.getElementById('statusIndicator').className = 'status-indicator offline';
        document.getElementById('statusText').textContent = 'Cannot connect to backend. Make sure Spring Boot is running on port 8080.';
        document.getElementById('animalList').textContent = '';
        console.error('Connection error:', error);
    }
    return false;
}

// ====================================
// ANIMAL MANAGEMENT
// ====================================

function loadAnimals(animals) {
    const grid = document.getElementById('animalGrid');
    const emojis = { 
        Dog: '🐕', 
        Cat: '🐈', 
        Bird: '🐦', 
        Goat: '🐐' 
    };
    
    grid.innerHTML = animals.map(animal => `
        <div class="animal-card">
            <div class="animal-icon">${emojis[animal] || '🐾'}</div>
            <h3>${animal}</h3>
            <p>Type: ${animal}</p>
            <p style="color: #999; font-size: 0.9rem;">Last activity: Not monitored yet</p>
            <button class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;" onclick="viewAnimalDetails('${animal}')">
                View Details
            </button>
        </div>
    `).join('');
}

function viewAnimalDetails(animalName) {
    alert(`Viewing details for ${animalName}.\n\nBackend team: Implement GET /animals/{id} endpoint to fetch full animal details.`);
}

// ====================================
// IMAGE UPLOAD & ANALYSIS
// ====================================

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadSpinner = document.getElementById('uploadSpinner');

// Click to select file
dropZone.addEventListener('click', () => fileInput.click());

// Drag and drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    } else {
        alert('Please upload an image file (JPG, PNG, GIF)');
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// Handle image upload
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.add('show');
        analyzeBtn.style.display = 'block';
        
        // Store file for later analysis
        analyzeBtn.dataset.file = file.name;
    };
    reader.readAsDataURL(file);
}

// Analyze button click
analyzeBtn.addEventListener('click', async () => {
    uploadSpinner.classList.add('show');
    document.getElementById('analysisResult').innerHTML = '';
    analyzeBtn.disabled = true;
    
    // TODO: Replace this with actual API call to your backend
    // This is a placeholder that simulates the API response
    
    try {
        // When backend is ready, use this code:
        /*
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        displayAnalysisResult(result);
        */
        
        // Simulation for now:
        setTimeout(() => {
            uploadSpinner.classList.remove('show');
            analyzeBtn.disabled = false;
            
            // Simulated result
            const simulatedResult = {
                success: true,
                behavior: 'Dog is pacing',
                duration: '30 seconds',
                confidence: 0.95,
                timestamp: new Date().toISOString(),
                details: 'Detected restless behavior. Animal appears to be moving back and forth repeatedly.'
            };
            
            displayAnalysisResult(simulatedResult);
        }, 2000);
        
    } catch (error) {
        uploadSpinner.classList.remove('show');
        analyzeBtn.disabled = false;
        document.getElementById('analysisResult').innerHTML = `
            <div class="summary-card" style="background: #fee;">
                <h3>Error</h3>
                <div class="summary-content">
                    <p>Failed to analyze image: ${error.message}</p>
                </div>
            </div>
        `;
    }
});

// Display analysis result
function displayAnalysisResult(result) {
    const resultDiv = document.getElementById('analysisResult');
    
    if (result.success) {
        resultDiv.innerHTML = `
            <div class="summary-card">
                <h3>✅ Analysis Complete</h3>
                <div class="summary-content">
                    <p><strong>Detected Behavior:</strong> ${result.behavior}</p>
                    <p><strong>Duration:</strong> ${result.duration}</p>
                    <p><strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
                    <p style="margin-top: 1rem;"><strong>Details:</strong></p>
                    <p>${result.details}</p>
                </div>
            </div>
        `;
        
        // Add to behavior log
        addBehaviorLog(result);
        
        // Update stats
        const currentCount = parseInt(document.getElementById('behaviorsToday').textContent);
        document.getElementById('behaviorsToday').textContent = currentCount + 1;
        
        const imagesCount = parseInt(document.getElementById('imagesAnalyzed').textContent);
        document.getElementById('imagesAnalyzed').textContent = imagesCount + 1;
    } else {
        resultDiv.innerHTML = `
            <div class="summary-card" style="background: #fee;">
                <h3>❌ Analysis Failed</h3>
                <div class="summary-content">
                    <p>${result.message || 'Unable to analyze image'}</p>
                </div>
            </div>
        `;
    }
}

// ====================================
// BEHAVIOR LOGS
// ====================================

function addBehaviorLog(behaviorData) {
    const logContainer = document.getElementById('logContainer');
    
    // Create log entry
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <div class="timestamp">${new Date(behaviorData.timestamp).toLocaleString()}</div>
        <div class="behavior">${behaviorData.behavior}</div>
        <div class="details">${behaviorData.details}</div>
        <div style="margin-top: 0.5rem; color: #999; font-size: 0.85rem;">
            Confidence: ${(behaviorData.confidence * 100).toFixed(1)}% | Duration: ${behaviorData.duration}
        </div>
    `;
    
    // Remove "no logs" message if present
    if (logContainer.innerHTML.includes('No behavior logs yet')) {
        logContainer.innerHTML = '';
    }
    
    // Add new log at the top
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // Update recent activity on dashboard
    updateRecentActivity(behaviorData);
}

function updateRecentActivity(behaviorData) {
    const recentActivityDiv = document.getElementById('recentActivity');
    recentActivityDiv.innerHTML = `
        <div class="log-entry">
            <div class="timestamp">${new Date(behaviorData.timestamp).toLocaleString()}</div>
            <div class="behavior">${behaviorData.behavior}</div>
            <div class="details">${behaviorData.details}</div>
        </div>
    `;
}

// Load behavior logs from backend
async function loadBehaviorLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/behaviors`);
        if (response.ok) {
            const logs = await response.json();
            logs.forEach(log => addBehaviorLog(log));
        }
    } catch (error) {
        console.error('Failed to load behavior logs:', error);
    }
}

// ====================================
// SUMMARIES & ALERTS
// ====================================

async function loadDailySummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/summary/daily`);
        if (response.ok) {
            const summary = await response.json();
            document.getElementById('todaySummary').innerHTML = `
                <p><strong>Generated:</strong> ${new Date(summary.timestamp).toLocaleString()}</p>
                <p style="margin-top: 1rem;">${summary.content}</p>
            `;
        }
    } catch (error) {
        console.error('Failed to load daily summary:', error);
    }
}

async function loadAlerts() {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`);
        if (response.ok) {
            const alerts = await response.json();
            const alertsDiv = document.getElementById('alertsContent');
            
            if (alerts.length === 0) {
                alertsDiv.innerHTML = '<p>No unusual behaviors detected. System is monitoring normally.</p>';
            } else {
                alertsDiv.innerHTML = alerts.map(alert => `
                    <div class="log-entry">
                        <div class="timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
                        <div class="behavior">${alert.title} <span class="alert-badge warning">Alert</span></div>
                        <div class="details">${alert.message}</div>
                    </div>
                `).join('');
                
                // Update alert count
                document.getElementById('activeAlerts').textContent = alerts.length;
            }
        }
    } catch (error) {
        console.error('Failed to load alerts:', error);
    }
}

// ====================================
// INITIALIZATION
// ====================================

window.addEventListener('load', () => {
    // Check backend connection
    checkConnection();
    
    // Refresh connection status every 30 seconds
    setInterval(checkConnection, 30000);
    
    // Load additional data (when backend endpoints are ready)
    // Uncomment these when backend is implemented:
    // loadBehaviorLogs();
    // loadDailySummary();
    // loadAlerts();
});

// ====================================
// UTILITY FUNCTIONS
// ====================================

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Show notification
function showNotification(message, type = 'info') {
    // TODO: Implement notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkConnection,
        loadAnimals,
        addBehaviorLog,
        displayAnalysisResult
    };
}
// WEBCAM LIVE MONITORING

const video = document.getElementById("video");
const output = document.getElementById("output");

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
        console.log("Webcam started");
    } catch (err) {
        console.error("Webcam error:", err);
        output.innerText = "Failed to start webcam.";
    }
}

// Convert current frame to base64
function getFrameBase64() {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg").split(",")[1]; // Remove prefix
}

// Send frame to Flask backend
async function sendFrame() {
    if (!video.srcObject) return;

    const frame = getFrameBase64();
    try {
        const res = await fetch(`${API_BASE_URL}/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ frame })
        });
        const data = await res.json();
        if (data.success) {
            output.innerText = data.result;
        } else {
            console.error(data.message);
        }
    } catch (err) {
        console.error("Error sending frame:", err);
    }
}

// Start capturing frames every 3 seconds
setInterval(sendFrame, 3000);

// Start webcam automatically when page loads
window.addEventListener('load', startWebcam);
