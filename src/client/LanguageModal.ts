import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { translateText } from "../client/Utils";

@customElement("language-modal")
export class LanguageModal extends LitElement {
  @property({ type: Boolean }) visible = false;
  @property({ type: Array }) languageList: any[] = [];
  @property({ type: String }) currentLang = "en";

  createRenderRoot() {
    return this; // Use Light DOM for TailwindCSS classes
  }

  private close = () => {
    this.dispatchEvent(
      new CustomEvent("close-modal", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("visible")) {
      if (this.visible) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.handleKeyDown);
    document.body.style.overflow = "auto";
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      e.preventDefault();
      this.close();
    }
  };

  private selectLanguage = (lang: string) => {
    this.dispatchEvent(
      new CustomEvent("language-selected", {
        detail: { lang },
        bubbles: true,
        composed: true,
      }),
    );
  };

  render() {
    if (!this.visible) return null;

    return html`
      <aside class="c-modal" @click=${this.close}>
        <div
          class="c-modal__wrapper"
          @click=${(e: Event) => e.stopPropagation()}
        >
          <header class="c-modal__header">
            ${translateText("select_lang.title")}
            <div class="c-modal__close" @click=${this.close}>✕</div>
          </header>
          <section class="c-modal__content">
            ${this.languageList.map(
              (lang) => html`
                <button
                  class="c-button c-button--secondary c-button--block"
                  style="margin-bottom: 8px;"
                  @click=${() => this.selectLanguage(lang.code)}
                >
                  <span
                    style="display: inline-flex; align-items: center; gap: 8px;"
                  >
                    <img
                      src="/flags/${lang.svg}.svg"
                      class="tactical-lang-flag"
                      alt="${lang.code}"
                    />
                    <span>${lang.native} (${lang.en})</span>
                  </span>
                </button>
              `,
            )}
          </section>
        </div>
      </aside>
    `;
  }
}
