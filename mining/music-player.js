class ZeneJatszo {
    constructor() {
        this.lejatszasiLista = [
            'GDjjU14zsds'
        ];
        
        this.jatszo = null;
        this.jelenlegiIndex = 0;
        this.jatszikE = false;
        this.nemitottE = localStorage.getItem('zeneNemitva') !== 'false';
        this.kesz = false;
    }

    jatszoInicializalas() {
        console.log('🎬 YouTube lejátszó inicializálása...');
        this.jelenlegiIndex = Math.floor(Math.random() * this.lejatszasiLista.length);
        
        this.jatszo = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: this.lejatszasiLista[this.jelenlegiIndex],
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                showinfo: 0
            },
            events: {
                onReady: (event) => this.jatszoKesz(event),
                onStateChange: (event) => this.jatszoAllapotValtozas(event),
                onError: (event) => this.jatszoHiba(event)
            }
        });
    }

    jatszoKesz(event) {
        console.log('🎵 Zenelejátszó kész');
        this.kesz = true;
        
        event.target.setVolume(30);
        this.zeneGombFrissites(false);
    }

    jatszoAllapotValtozas(event) {
        if (event.data === YT.PlayerState.ENDED) {
            this.kovetkezoLejatszasa();
        } else if (event.data === YT.PlayerState.PLAYING) {
            this.jatszikE = true;
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.jatszikE = false;
        }
    }

    jatszoHiba(event) {
        console.error('YouTube lejátszó hiba:', event.data);
        this.kovetkezoLejatszasa();
    }

    kovetkezoLejatszasa() {
        this.jelenlegiIndex = Math.floor(Math.random() * this.lejatszasiLista.length);
        
        if (this.jatszo) {
            this.jatszo.loadVideoById(this.lejatszasiLista[this.jelenlegiIndex]);
        }
    }

    zeneValt() {
        console.log('🎵 Zene gomb megnyomva, kész:', this.kesz, 'játszik:', this.jatszikE);
        
        if (!this.jatszo || !this.kesz) {
            console.log('⚠️ Lejátszó még nem kész');
            return;
        }

        if (!this.jatszikE) {
            this.jatszo.unMute();
            this.jatszo.setVolume(30);
            this.jatszo.playVideo();
            this.nemitottE = false;
            this.jatszikE = true;
            this.zeneGombFrissites(true);
            localStorage.setItem('zeneNemitva', 'false');
            console.log('▶️ Zene elindult');
        } else {
            this.jatszo.pauseVideo();
            this.jatszikE = false;
            this.zeneGombFrissites(false);
            localStorage.setItem('zeneNemitva', 'true');
            console.log('⏸️ Zene megállítva');
        }
    }

    zeneGombFrissites(jatszik) {
        const zeneGomb = document.getElementById('musicToggle');
        if (zeneGomb) {
            const ikon = zeneGomb.querySelector('.icon');
            ikon.textContent = jatszik ? '🔊' : '🔇';
        }
    }
}
