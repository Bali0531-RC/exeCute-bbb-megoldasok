class MusicPlayer {
    constructor() {
        this.playlist = [
            'lNoUP579nQ8',
            'sb5EuQ2oczY',
            'xvFZjo5PgG0',
            'kJQP7kiw5Fk',
            'sYgIVlfwv8Q'
        ];
        
        this.player = null;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isMuted = localStorage.getItem('musicMuted') !== 'false';
        this.isReady = false;
    }

    initPlayer() {
        this.currentIndex = Math.floor(Math.random() * this.playlist.length);
        
        this.player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: this.playlist[this.currentIndex],
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
                onReady: (event) => this.onPlayerReady(event),
                onStateChange: (event) => this.onPlayerStateChange(event),
                onError: (event) => this.onPlayerError(event)
            }
        });
    }

    onPlayerReady(event) {
        console.log('🎵 Music player ready');
        this.isReady = true;
        
        event.target.setVolume(30);
        this.updateMusicButton(false);
    }

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            this.playNext();
        } else if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
        }
    }

    onPlayerError(event) {
        console.error('YouTube player error:', event.data);
        this.playNext();
    }

    playNext() {
        this.currentIndex = Math.floor(Math.random() * this.playlist.length);
        
        if (this.player) {
            this.player.loadVideoById(this.playlist[this.currentIndex]);
        }
    }

    toggleMusic() {
        console.log('🎵 Toggle music clicked, ready:', this.isReady, 'playing:', this.isPlaying);
        
        if (!this.player || !this.isReady) {
            console.log('⚠️ Player not ready yet');
            return;
        }

        if (!this.isPlaying) {
            this.player.unMute();
            this.player.setVolume(30);
            this.player.playVideo();
            this.isMuted = false;
            this.isPlaying = true;
            this.updateMusicButton(true);
            localStorage.setItem('musicMuted', 'false');
            console.log('▶️ Music started');
        } else {
            this.player.pauseVideo();
            this.isPlaying = false;
            this.updateMusicButton(false);
            localStorage.setItem('musicMuted', 'true');
            console.log('⏸️ Music paused');
        }
    }

    updateMusicButton(playing) {
        const musicButton = document.getElementById('musicToggle');
        if (musicButton) {
            const icon = musicButton.querySelector('.icon');
            icon.textContent = playing ? '🔊' : '🔇';
        }
    }
}

let musicPlayer = null;

function onYouTubeIframeAPIReady() {
    console.log('📺 YouTube API ready');
    if (musicPlayer) {
        musicPlayer.initPlayer();
    }
}

window.addEventListener('load', () => {
    console.log('🎮 Page loaded, creating MusicPlayer...');
    musicPlayer = new MusicPlayer();
    
    if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
        console.log('✅ YouTube API already loaded, initializing player...');
        musicPlayer.initPlayer();
    } else {
        console.log('⏳ Waiting for YouTube API...');
    }
    
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        console.log('🎵 Music toggle button found');
        musicToggle.addEventListener('click', () => {
            if (musicPlayer) {
                musicPlayer.toggleMusic();
            }
        });
    } else {
        console.error('❌ Music toggle button not found');
    }
});
