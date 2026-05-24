document.addEventListener('DOMContentLoaded', () => {
    let audioContext, analyser, dataArray, animationId;
    const sourceNodes = new Map();

    const initContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 128;
            analyser.connect(audioContext.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
    };

    const stopAll = () => {
        cancelAnimationFrame(animationId);
        document.querySelectorAll('.audio').forEach(a => { a.pause(); a.currentTime = 0; });
        document.querySelectorAll('.play-radio').forEach(b => {
            b.variant = 'primary';
            b.innerHTML = '<sl-icon slot="prefix" name="play-circle-fill"></sl-icon> Play';
        });
    };

    const draw = (canvas) => {
        animationId = requestAnimationFrame(() => draw(canvas));
        analyser.getByteFrequencyData(dataArray);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / dataArray.length) * 2;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const h = dataArray[i] / 4;
            ctx.fillStyle = '#00ff41';
            ctx.fillRect(x, canvas.height - h, barWidth, h);
            x += barWidth + 2;
        }
    };

    document.body.addEventListener('click', async (e) => {
        const playBtn = e.target.closest('.play-radio');
        const stopBtn = e.target.closest('.stop-radio');

        if (playBtn) {
            const card = playBtn.closest('sl-card');
            const audio = card.querySelector('.audio');
            initContext();
            if (audioContext.state === 'suspended') await audioContext.resume();

            if (audio.paused) {
                stopAll();
                if (!sourceNodes.has(audio)) {
                    sourceNodes.set(audio, audioContext.createMediaElementSource(audio));
                    sourceNodes.get(audio).connect(analyser);
                }
                audio.play();
                playBtn.variant = 'warning';
                playBtn.innerHTML = '<sl-icon slot="prefix" name="pause-circle-fill"></sl-icon> Pause';
                document.getElementById('now-playing-title').textContent = playBtn.dataset.title;
                draw(card.querySelector('.visualizer'));
            } else {
                audio.pause();
                playBtn.variant = 'primary';
                playBtn.innerHTML = '<sl-icon slot="prefix" name="play-circle-fill"></sl-icon> Play';
            }
        }
        if (stopBtn) { stopAll(); document.getElementById('now-playing-title').textContent = "None"; }
    });

    document.addEventListener('sl-input', (e) => {
        if (e.target.classList.contains('volume-control')) {
            e.target.closest('sl-card').querySelector('.audio').volume = e.target.value / 100;
        }
    });

    document.addEventListener('sl-change', (e) => {
        if (e.target.classList.contains('stream-selector')) {
            const audio = e.target.closest('sl-card').querySelector('.audio');
            audio.src = e.target.value;
            stopAll();
        }
    });

    setInterval(() => {
        document.getElementById('current-time').textContent = new Date().toTimeString().split(' ')[0];
    }, 1000);
});
