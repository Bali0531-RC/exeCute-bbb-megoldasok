class ServerAPI {
    constructor() {
        this.baseUrl = 'https://bitkozpont.mik.uni-pannon.hu/2025';
        this.teamcode = localStorage.getItem('teamcode') || '';
    }

    setTeamcode(code) {
        this.teamcode = code;
        localStorage.setItem('teamcode', code);
    }

    getTeamcode() {
        return this.teamcode;
    }

    async keresesKuldese(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    teamcode: this.teamcode
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP hiba: ${response.status}`);
            }

            const result = await response.json();
            console.log('Szerver válasz:', result);
            
            if (result.status !== 'success') {
                const hibaUzenet = result.message || result.error || 'Ismeretlen hiba történt';
                console.error('Szerver hibaüzenet:', hibaUzenet);
                console.error('Teljes válasz:', result);
                throw new Error(hibaUzenet);
            }

            return result;
        } catch (error) {
            console.error('API hiba:', error);
            throw error;
        }
    }

    async osszesFeladatLekerdezes() {
        return await this.keresesKuldese('gettasks.php', { id: 'all' });
    }

    async feladatLekerdezes(taskId) {
        return await this.keresesKuldese('gettasks.php', { id: taskId });
    }

    async valaszKuldes(taskId, originalData, originalHash, answerData) {
        return await this.keresesKuldese('answer.php', {
            id: taskId,
            original_data: originalData,
            original_hash: originalHash,
            answer_data: answerData
        });
    }
}

const api = new ServerAPI();
