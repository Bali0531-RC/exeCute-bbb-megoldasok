class LeaderboardManager {
    constructor() {
        this.apiEndpoint = 'https://api.plexdev.live';
        
        this.isOnline = false;
        this.playerName = localStorage.getItem('playerName') || null;
        this.personalBest = parseInt(localStorage.getItem('personalBest')) || null;
        
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

    async submitScore(moves) {
        if (!this.personalBest || moves < this.personalBest) {
            const isNewRecord = this.personalBest !== null;
            this.personalBest = moves;
            localStorage.setItem('personalBest', moves);

            if (!this.playerName) {
                const shouldSubmit = confirm(
                    `🎉 Új személyes rekord: ${moves} lépés!\n\n` +
                    `Szeretnéd felküldeni a toplistára?`
                );

                if (shouldSubmit) {
                    const name = this.promptForName();
                    if (name) {
                        this.playerName = name;
                        localStorage.setItem('playerName', name);
                        await this.updateLeaderboard(name, moves);
                    }
                }
            } else {
                if (isNewRecord) {
                    const shouldUpdate = confirm(
                        `🎉 Új személyes rekord: ${moves} lépés!\n\n` +
                        `Frissíted a toplistán a rekordodat (${this.playerName})?`
                    );
                    
                    if (shouldUpdate) {
                        await this.updateLeaderboard(this.playerName, moves);
                    }
                } else {
                    await this.updateLeaderboard(this.playerName, moves);
                }
            }

            return true;
        }

        return false;
    }

    promptForName() {
        let name = null;
        while (!name || name.trim().length === 0) {
            name = prompt('Add meg a neved a toplistához:');
            if (name === null) return null;
            name = name.trim();
            if (name.length > 20) {
                alert('A név maximum 20 karakter lehet!');
                name = null;
            }
        }
        return name;
    }

    async updateLeaderboard(name, moves) {
        if (!this.isOnline) {
            alert('❌ Nincs internet kapcsolat - a toplista nem elérhető');
            return false;
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

            if (response.ok) {
                alert('✅ Toplista frissítve!');
                return true;
            } else {
                throw new Error('Failed to update leaderboard');
            }
        } catch (error) {
            console.error('Leaderboard update error:', error);
            alert('❌ Hiba történt a toplista frissítésekor');
            return false;
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

    getPersonalBest() {
        return this.personalBest;
    }

    getPlayerName() {
        return this.playerName;
    }

    resetPersonalData() {
        if (confirm('Biztosan törölni szeretnéd a személyes adataidat?')) {
            localStorage.removeItem('playerName');
            localStorage.removeItem('personalBest');
            this.playerName = null;
            this.personalBest = null;
            alert('✅ Személyes adatok törölve');
        }
    }
}
