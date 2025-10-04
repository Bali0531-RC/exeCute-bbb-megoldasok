class LeaderboardManager {
    constructor() {
        this.apiEndpoint = 'https://api.plexdev.live';
        
        this.isOnline = false;
        
        this.checkConnection();
    }

    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.apiEndpoint}/health`, {
                signal: controller.signal
            }).catch(() => null);
            
            clearTimeout(timeoutId);
            this.isOnline = response && response.ok;
            
            if (this.isOnline) {
                console.log('✅ Leaderboard online');
            } else {
                console.log('❌ Leaderboard offline - nincs internet kapcsolat');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('❌ Leaderboard offline - nincs internet kapcsolat');
        }
    }

    async submitScore(name, moves) {
        if (!this.isOnline) {
            return {
                success: false,
                error: 'Nincs internet kapcsolat - a toplista nem elérhető'
            };
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/leaderboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    moves: moves,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.playerName = name;
                this.personalBest = moves;
                localStorage.setItem('playerName', name);
                localStorage.setItem('personalBest', moves);
                
                return { success: true, data };
            } else {
                if (data.error === 'Name contains inappropriate content') {
                    return {
                        success: false,
                        error: `A név nem megfelelő tartalmat tartalmaz (${data.category}). Kérlek válassz másik nevet!`
                    };
                }
                return {
                    success: false,
                    error: data.error || 'Hiba történt a toplista frissítésekor'
                };
            }
        } catch (error) {
            console.error('Leaderboard update error:', error);
            return {
                success: false,
                error: 'Nem sikerült kapcsolódni a szerverhez'
            };
        }
    }

    async getLeaderboard(limit = 10) {
        if (!this.isOnline) {
            return [];
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/leaderboard?limit=${limit}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            return [];
        }
    }
}
