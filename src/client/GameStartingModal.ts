import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { translateText } from "./Utils";
import "./components/baseComponents/Modal";

@customElement("game-starting-modal")
export class GameStartingModal extends LitElement {
  @query("o-modal") private modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };

  createRenderRoot() {
    return this; // use Light DOM so global tactical styles apply
  }

  render() {
    return html`
      <o-modal translationKey="game_starting_modal.title" alwaysMaximized>
        <div class="v-stack" style="align-items:center; gap: 8px;">
          <div class="copyright" style="font-size: 1.25rem; font-weight: 700;">
            © OpenFront
          </div>
          <div class="text-center">
            ${translateText("game_starting_modal.code_license")}
          </div>
        </div>
      </o-modal>
    `;
  }

  show() {
    this.modalEl?.open();
  }

  hide() {
    this.modalEl?.close();
  }
}
