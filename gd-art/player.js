if (!customElements.get('gd-guide')) {
  customElements.define('gd-guide', class extends HTMLElement {
    connectedCallback() {
      if (this.ready) return;
      this.ready = true;
      const cover = this.querySelector('.gd-cover');
      const frameBox = this.querySelector('.gd-frame');
      const start = this.querySelector('[data-gd-start]');
      const full = this.querySelector('[data-gd-full]');
      const status = this.querySelector('.gd-status');
      const source = this.querySelector('[data-gd-src]').dataset.gdSrc;
      const form = this.querySelector('form');
      const output = form.querySelector('output');
      const initial = output.textContent;

      start.hidden = false;
      form.hidden = false;
      start.addEventListener('click', () => {
        const frame = document.createElement('iframe');
        frame.title = 'GD Krillion browser game';
        frame.allow = 'fullscreen';
        frame.allowFullscreen = true;
        frame.src = source;
        let timer = window.setTimeout(() => {
          status.textContent = 'Still waiting? Check your connection before restarting the game.';
        }, 11000);
        this.cancelWaiting = () => window.clearTimeout(timer);
        frame.addEventListener('load', () => {
          window.clearTimeout(timer);
          status.textContent = 'Choose your scoring mode in the game.';
        }, { once: true });
        frame.addEventListener('error', () => {
          window.clearTimeout(timer);
          status.textContent = 'The game did not load. Check your connection, then reload this page to try again.';
        }, { once: true });
        frameBox.append(frame);
        cover.hidden = true;
        full.hidden = !frameBox.requestFullscreen;
        status.textContent = 'Opening the game…';
        frame.focus();
      }, { once: true });

      full.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement === frameBox) await document.exitFullscreen();
          else await frameBox.requestFullscreen();
        } catch {
          status.textContent = 'Fullscreen is unavailable in this browser. You can keep playing in the game panel.';
        }
      });
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
    disconnectedCallback() { this.cancelWaiting?.(); }
  });
}
