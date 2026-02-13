    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -6% 0px'
    });

    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

    const header = document.querySelector('.site-header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    document.getElementById('year').textContent = new Date().getFullYear();

    const bgAudio = document.getElementById('bg-audio');
    if (bgAudio) {
      const START_AT_SECONDS = 46;
      bgAudio.volume = 0.2;

      const startAudio = () => {
        if (Number.isFinite(bgAudio.duration) && bgAudio.duration > START_AT_SECONDS) {
          if (Math.abs(bgAudio.currentTime - START_AT_SECONDS) > 0.25) {
            bgAudio.currentTime = START_AT_SECONDS;
          }
        }
        bgAudio.play().catch(() => {});
      };

      bgAudio.addEventListener('loadedmetadata', () => {
        if (bgAudio.duration > START_AT_SECONDS) {
          bgAudio.currentTime = START_AT_SECONDS;
        }
      }, { once: true });

      // Try immediately, then retry during initial page lifecycle events.
      startAudio();
      window.addEventListener('load', startAudio, { once: true });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && bgAudio.paused) startAudio();
      });

      // Best-effort retries for environments that delay media readiness.
      let attempts = 0;
      const retry = setInterval(() => {
        if (!bgAudio.paused || attempts >= 8) {
          clearInterval(retry);
          return;
        }
        attempts += 1;
        startAudio();
      }, 750);
    }

    document.querySelectorAll('video[data-thumb-start]').forEach((video) => {
      const startAt = Number(video.getAttribute('data-thumb-start'));
      if (!Number.isFinite(startAt) || startAt < 0) return;

      const seekToThumbFrame = () => {
        const canSeek = Number.isFinite(video.duration) && video.duration > startAt;
        if (!canSeek) return;

        const applyFrame = () => {
          video.pause();
          video.removeEventListener('seeked', applyFrame);
        };

        video.addEventListener('seeked', applyFrame, { once: true });
        video.currentTime = startAt;
      };

      if (video.readyState >= 1) {
        seekToThumbFrame();
      } else {
        video.addEventListener('loadedmetadata', seekToThumbFrame, { once: true });
      }
    });
