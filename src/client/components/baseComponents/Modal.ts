import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { translateText } from "../../Utils";

@customElement("o-modal")
export class OModal extends LitElement {
  @state() public isModalOpen = false;
  @property({ type: String }) title = "";
  @property({ type: String }) translationKey = "";
  @property({ type: Boolean }) alwaysMaximized = false;

  static styles = css`
    .c-modal {
      position: fixed;
      padding: 1rem;
      z-index: 9999;
      left: 0;
      bottom: 0;
      right: 0;
      top: 0;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      overflow-y: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .c-modal__wrapper {
      background: var(--tactical-grey-900, #1a1f2e);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 0;
      min-width: 340px;
      max-width: 860px;
      border: none;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes modalSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .c-modal__wrapper.always-maximized {
      width: 100%;
      min-width: 340px;
      max-width: 860px;
      min-height: 320px;
      height: 60vh;
      height: 60dvh;
    }

    .c-modal__header {
      position: relative;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      background: var(--tactical-black, #0a0e14);
      border-bottom: 2px solid var(--military-green-accent, #5cb85c);
      text-align: center;
      color: var(--military-green-accent, #5cb85c);
      padding: 1.25rem 3rem 1.25rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      font-family: var(
        --font-tactical,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        "Roboto",
        monospace
      );
    }

    .c-modal__close {
      cursor: pointer;
      position: absolute;
      right: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      background: transparent;
      color: var(--tactical-grey-400, #6b7280);
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid var(--tactical-grey-600, #4b5563);
      padding: 3px;
    }

    .c-modal__close:hover {
      background: var(--alert-red, #dc2626);
      color: var(--fontColorLight, #ffffff);
      border-color: var(--alert-red, #dc2626);
      box-shadow: 0 0 12px rgba(220, 38, 38, 0.5);
      transform: translateY(-50%) scale(1.1);
    }

    .c-modal__close:active {
      transform: translateY(-50%) scale(0.95);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .c-modal__content {
      background: var(--tactical-grey-900, #1a1f2e);
      position: relative;
      color: var(--fontColor, #f3f4f6);
      padding: 2rem 1.5rem;
      max-height: 60dvh;
      overflow-y: auto;
    }

    .c-modal__content::-webkit-scrollbar {
      width: 8px;
    }

    .c-modal__content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 0;
    }

    .c-modal__content::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.3);
      border-radius: 0;
    }

    .c-modal__content::-webkit-scrollbar-thumb:hover {
      background: rgba(102, 126, 234, 0.5);
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .c-modal {
        background-color: rgba(0, 0, 0, 0.8);
      }

      .c-modal__wrapper {
        background: rgba(17, 24, 39, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
      }

      .c-modal__header {
        background: linear-gradient(
          135deg,
          rgba(129, 140, 248, 0.1) 0%,
          rgba(167, 139, 250, 0.1) 100%
        );
        border-bottom-color: rgba(255, 255, 255, 0.1);
        color: #f3f4f6;
      }

      .c-modal__close {
        background: transparent;
        color: var(--tactical-grey-400, #6b7280);
        border: 2px solid var(--tactical-grey-600, #4b5563);
      }

      .c-modal__close:hover {
        background: var(--alert-red, #dc2626);
        color: var(--fontColorLight, #ffffff);
        border-color: var(--alert-red, #dc2626);
      }

      .c-modal__content {
        color: #f3f4f6;
        background: rgba(17, 24, 39, 0.5);
      }

      .c-modal__content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      .c-modal__content::-webkit-scrollbar-thumb {
        background: rgba(129, 140, 248, 0.3);
      }

      .c-modal__content::-webkit-scrollbar-thumb:hover {
        background: rgba(129, 140, 248, 0.5);
      }
    }
  `;
  public open() {
    this.isModalOpen = true;
  }

  public close() {
    this.isModalOpen = false;
    this.dispatchEvent(
      new CustomEvent("modal-close", { bubbles: true, composed: true }),
    );
  }

  render() {
    return html`
      ${this.isModalOpen
        ? html`
            <aside class="c-modal" @click=${this.close}>
              <div
                @click=${(e: Event) => e.stopPropagation()}
                class="c-modal__wrapper ${this.alwaysMaximized
                  ? "always-maximized"
                  : ""}"
              >
                <header class="c-modal__header">
                  ${`${this.translationKey}` === ""
                    ? `${this.title}`
                    : `${translateText(this.translationKey)}`}
                  <div class="c-modal__close" @click=${this.close}>✕</div>
                </header>
                <section class="c-modal__content">
                  <slot></slot>
                </section>
              </div>
            </aside>
          `
        : html``}
    `;
  }
}
