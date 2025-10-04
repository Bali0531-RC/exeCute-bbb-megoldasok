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
        this.isMuted = localStorage.getItem('musicMuted') === 'true';
        
        this.initPlayer();
    }

    initPlayer() {
        window.onYouTubeIframeAPIReady = () => {
            this.currentIndex = Math.floor(Math.random() * this.playlist.length);
            
            this.player = new YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: this.playlist[this.currentIndex],
                playerVars: {
                    autoplay: 1,
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
        };
    }

    onPlayerReady(event) {
        console.log('🎵 Music player ready');
        
        if (this.isMuted) {
            event.target.mute();
            this.updateMusicButton(false);
        } else {
            event.target.setVolume(30);
            event.target.playVideo();
            this.isPlaying = true;
            this.updateMusicButton(true);
        }
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
        if (!this.player) return;

        if (this.isMuted || !this.isPlaying) {
            this.player.unMute();
            this.player.setVolume(30);
            this.player.playVideo();
            this.isMuted = false;
            this.isPlaying = true;
            this.updateMusicButton(true);
            localStorage.setItem('musicMuted', 'false');
        } else {
            this.player.mute();
            this.player.pauseVideo();
            this.isMuted = true;
            this.isPlaying = false;
            this.updateMusicButton(false);
            localStorage.setItem('musicMuted', 'true');
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

window.addEventListener('load', () => {
    musicPlayer = new MusicPlayer();
    
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (musicPlayer) {
                musicPlayer.toggleMusic();
            }
        });
    }
});
