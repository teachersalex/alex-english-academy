// PWA Install Prompt - Teacher Alex English Academy
// Smart app installation for mobile students

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isInstalled = false;
        
        this.init();
    }
    
    init() {
        // Check if already installed
        this.checkInstallStatus();
        
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.showInstallSuccess();
        });
        
        // Check for iOS Safari (special handling)
        this.checkIOSInstall();
    }
    
    checkInstallStatus() {
        // Check if running as installed PWA
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('🎯 Running as installed PWA');
        }
    }
    
    showInstallPrompt() {
        if (this.isInstalled) return;
        
        // Create install banner
        const banner = this.createInstallBanner();
        document.body.appendChild(banner);
        
        // Show after small delay for better UX
        setTimeout(() => {
            banner.classList.add('pwa-banner-visible');
        }, 2000);
    }
    
    createInstallBanner() {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-install-banner';
        
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-icon">📱</div>
                <div class="pwa-banner-text">
                    <div class="pwa-banner-title">Install Alex English App</div>
                    <div class="pwa-banner-subtitle">Study offline, faster access!</div>
                </div>
                <div class="pwa-banner-actions">
                    <button id="pwa-install-btn" class="pwa-install-btn">Install</button>
                    <button id="pwa-dismiss-btn" class="pwa-dismiss-btn">×</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        banner.querySelector('#pwa-install-btn').addEventListener('click', () => {
            this.triggerInstall();
        });
        
        banner.querySelector('#pwa-dismiss-btn').addEventListener('click', () => {
            this.hideInstallPrompt();
        });
        
        return banner;
    }
    
    async triggerInstall() {
        if (!this.deferredPrompt) return;
        
        try {
            // Show install prompt
            this.deferredPrompt.prompt();
            
            // Wait for user response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted PWA install');
            } else {
                console.log('❌ User dismissed PWA install');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
            
        } catch (error) {
            console.error('❌ Error triggering install:', error);
        }
    }
    
    hideInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.remove('pwa-banner-visible');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }
    
    showInstallSuccess() {
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'pwa-success-toast';
        toast.innerHTML = `
            <div class="pwa-toast-content">
                <span class="pwa-toast-icon">🎉</span>
                <span class="pwa-toast-text">App installed! Launch from home screen</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('pwa-toast-hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    checkIOSInstall() {
        // iOS Safari special handling
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = window.navigator.standalone;
        
        if (isIOS && !isInStandaloneMode && !this.isInstalled) {
            // Show iOS-specific install instructions
            setTimeout(() => {
                this.showIOSInstructions();
            }, 5000);
        }
    }
    
    showIOSInstructions() {
        const banner = document.createElement('div');
        banner.className = 'pwa-ios-banner';
        banner.innerHTML = `
            <div class="pwa-ios-content">
                <div class="pwa-ios-icon">🍎</div>
                <div class="pwa-ios-text">
                    <div class="pwa-ios-title">Install on iPhone</div>
                    <div class="pwa-ios-steps">
                        Tap <span class="pwa-share-icon">⏺️</span> → "Add to Home Screen"
                    </div>
                </div>
                <button class="pwa-ios-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
            }
        }, 8000);
    }
    
    // Check if offline capability is working
    checkOfflineStatus() {
        window.addEventListener('online', () => {
            console.log('🌐 Back online');
            this.showNetworkStatus('online');
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Gone offline');
            this.showNetworkStatus('offline');
        });
    }
    
    showNetworkStatus(status) {
        const existing = document.querySelector('.pwa-network-status');
        if (existing) existing.remove();
        
        const statusBar = document.createElement('div');
        statusBar.className = `pwa-network-status pwa-network-${status}`;
        statusBar.innerHTML = `
            <span class="pwa-network-icon">${status === 'online' ? '🌐' : '📴'}</span>
            <span class="pwa-network-text">
                ${status === 'online' ? 'Back online' : 'Offline mode - cached lessons available'}
            </span>
        `;
        
        document.body.appendChild(statusBar);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusBar.classList.add('pwa-status-hide');
            setTimeout(() => statusBar.remove(), 300);
        }, 3000);
    }
}

// CSS Styles for PWA components
const pwaStyles = `
<style>
.pwa-install-banner {
    position: fixed;
    bottom: -100px;
    left: 16px;
    right: 16px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
    z-index: 1000;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.pwa-install-banner.pwa-banner-visible {
    bottom: 16px;
}

.pwa-banner-content {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
}

.pwa-banner-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.pwa-banner-text {
    flex-grow: 1;
}

.pwa-banner-title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 2px;
}

.pwa-banner-subtitle {
    font-size: 14px;
    opacity: 0.9;
}

.pwa-banner-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.pwa-install-btn {
    background: white;
    color: #3b82f6;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pwa-install-btn:hover {
    background: #f8fafc;
    transform: scale(1.05);
}

.pwa-dismiss-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pwa-success-toast {
    position: fixed;
    top: 80px;
    left: 16px;
    right: 16px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    z-index: 1001;
    animation: slideDown 0.3s ease;
}

.pwa-success-toast.pwa-toast-hide {
    animation: slideUp 0.3s ease;
}

.pwa-toast-content {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 8px;
}

.pwa-toast-icon {
    font-size: 18px;
}

.pwa-toast-text {
    font-size: 14px;
    font-weight: 500;
}

.pwa-ios-banner {
    position: fixed;
    top: 20px;
    left: 16px;
    right: 16px;
    background: #000;
    color: white;
    border-radius: 12px;
    z-index: 1000;
    animation: slideDown 0.3s ease;
}

.pwa-ios-content {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
}

.pwa-ios-icon {
    font-size: 24px;
}

.pwa-ios-title {
    font-weight: 600;
    margin-bottom: 4px;
}

.pwa-ios-steps {
    font-size: 14px;
    opacity: 0.8;
}

.pwa-share-icon {
    background: #007AFF;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
}

.pwa-ios-close {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    margin-left: auto;
}

.pwa-network-status {
    position: fixed;
    top: 20px;
    left: 16px;
    right: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 1001;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideDown 0.3s ease;
}

.pwa-network-online {
    background: #10b981;
    color: white;
}

.pwa-network-offline {
    background: #6b7280;
    color: white;
}

.pwa-network-status.pwa-status-hide {
    animation: slideUp 0.3s ease;
}

@keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-100%); opacity: 0; }
}

@media (max-width: 480px) {
    .pwa-install-banner {
        left: 8px;
        right: 8px;
        bottom: -120px;
    }
    
    .pwa-install-banner.pwa-banner-visible {
        bottom: 8px;
    }
    
    .pwa-banner-content {
        padding: 12px;
    }
    
    .pwa-banner-title {
        font-size: 15px;
    }
    
    .pwa-banner-subtitle {
        font-size: 13px;
    }
}
</style>
`;

// Initialize PWA installer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add PWA styles
    document.head.insertAdjacentHTML('beforeend', pwaStyles);
    
    // Initialize PWA installer
    const pwaInstaller = new PWAInstaller();
    pwaInstaller.checkOfflineStatus();
    
    console.log('📱 PWA Installer ready');
});

// Export for external use
window.PWAInstaller = PWAInstaller;