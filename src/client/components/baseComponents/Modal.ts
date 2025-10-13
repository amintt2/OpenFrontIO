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
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 24px;
      min-width: 340px;
      max-width: 860px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.1) 0%,
        rgba(118, 75, 162, 0.1) 100%
      );
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      text-align: center;
      color: #1f2937;
      padding: 1.25rem 3rem 1.25rem 1.5rem;
    }

    .c-modal__close {
      cursor: pointer;
      position: absolute;
      right: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.05);
      color: #1f2937;
      font-size: 20px;
      font-weight: 300;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
    }

    .c-modal__close:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
      transform: translateY(-50%) scale(1.1);
    }

    .c-modal__close:active {
      transform: translateY(-50%) scale(0.95);
    }

    .c-modal__content {
      background: rgba(255, 255, 255, 0.5);
      position: relative;
      color: #1f2937;
      padding: 1.75rem;
      max-height: 60dvh;
      overflow-y: auto;
    }

    .c-modal__content::-webkit-scrollbar {
      width: 8px;
    }

    .c-modal__content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
    }

    .c-modal__content::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.3);
      border-radius: 8px;
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
        background: rgba(255, 255, 255, 0.05);
        color: #f3f4f6;
      }

      .c-modal__close:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
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
