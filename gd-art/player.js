if (!customElements.get('krillion-player')) {
  customElements.define('krillion-player', class extends HTMLElement {
    connectedCallback() {
      if (this.ready) return;
      this.ready = true;
      const frame = this.querySelector('.kr-player-frame');
      const cover = this.querySelector('.kr-player-cover');
      const play = this.querySelector('[data-gd-start]');
      const tools = this.querySelector('.kr-player-tools');
      const full = this.querySelector('[data-gd-full]');
      const close = this.querySelector('[data-kr-close]');
      const status = this.querySelector('[role=status]');
      let active;
      let waiting;

      const stop = (message, focus = true) => {
        window.clearTimeout(waiting);
        if (document.fullscreenElement === frame) document.exitFullscreen().catch(() => {});
        active?.remove();
        active = null;
        tools.hidden = true;
        cover.hidden = false;
        status.textContent = message;
        if (focus) play.focus();
      };

      this.stop = () => stop('', false);
      play.hidden = false;
      full.hidden = !frame.requestFullscreen;
      play.addEventListener('click', () => {
        if (active) return;
        const next = document.createElement('iframe');
        next.title = this.dataset.gameTitle + ' browser game';
        next.allow = 'fullscreen';
        next.allowFullscreen = true;
        next.referrerPolicy = 'strict-origin-when-cross-origin';
        next.src = this.dataset.gdSrc;
        next.addEventListener('error', () => {
          if (active === next) stop('The game could not load. Check your connection and press Play game to retry.');
        }, { once: true });
        next.addEventListener('load', () => {
          if (active !== next) return;
          window.clearTimeout(waiting);
          next.classList.add('kr-frame-visible');
          status.textContent = 'If the player is unavailable, use Return to cover to try again.';
        }, { once: true });
        active = next;
        tools.hidden = false;
        cover.hidden = true;
        status.textContent = 'Opening the game…';
        waiting = window.setTimeout(() => {
          if (active === next) stop('The game is taking too long to load. Press Play game to retry.');
        }, 18000);
        frame.append(next);
        close.focus();
      });
      close.addEventListener('click', () => stop('Player closed. Press Play game to start again.'));
      full.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement === frame) await document.exitFullscreen();
          else await frame.requestFullscreen();
        } catch {
          status.textContent = 'Fullscreen is unavailable. You can keep playing in the game panel.';
        }
      });
    }
    disconnectedCallback() { this.stop?.(); }
  });
}

if (!customElements.get('gd-guide')) {
  customElements.define('gd-guide', class extends HTMLElement {
    connectedCallback() {
      if (this.ready) return;
      this.ready = true;
      const form = this.querySelector('form');
      const output = form.querySelector('output');
      const initial = output.textContent;
      form.hidden = false;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const answer = data.get('gd-choice');
        const mode = data.get('gd-mode');
        const target = mode === 'rare' ? 'uncommon' : 'familiar';
        output.textContent = answer === 'outside'
          ? 'That response belongs to a different category. Check the noun the question asks for first.'
          : answer === target
            ? 'That answer fits both the sample category and your chosen scoring direction. The real game determines its own results.'
            : 'That answer fits the sample category, but the other valid option is a better match for this scoring direction.';
      });
      form.addEventListener('reset', () => { output.textContent = initial; });
    }
  });
}
