import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { GameEnv } from "../../../core/configuration/Config";
import { GameType } from "../../../core/game/Game";
import { GameView } from "../../../core/game/GameView";
import { MultiTabDetector } from "../../MultiTabDetector";
import { translateText } from "../../Utils";
import { Layer } from "./Layer";

import "../../components/baseComponents/Modal";

@customElement("multi-tab-modal")
export class MultiTabModal extends LitElement implements Layer {
  public game: GameView;

  private detector: MultiTabDetector;

  @property({ type: Number }) duration: number = 5000;
  @state() private countdown: number = 5;
  @state() private isVisible: boolean = false;
  @state() private fakeIp: string = "";
  @state() private deviceFingerprint: string = "";
  @state() private reported: boolean = true;

  private intervalId?: number;

  // Disable shadow DOM to allow Tailwind classes to work
  createRenderRoot() {
    return this;
  }

  tick() {
    if (
      this.game.inSpawnPhase() ||
      this.game.config().gameConfig().gameType === GameType.Singleplayer ||
      this.game.config().serverConfig().env() === GameEnv.Dev
    ) {
      return;
    }
    if (!this.detector) {
      this.detector = new MultiTabDetector();
      this.detector.startMonitoring((duration: number) => {
        this.show(duration);
      });
    }
  }

  init() {
    this.fakeIp = this.generateFakeIp();
    this.deviceFingerprint = this.generateDeviceFingerprint();
    this.reported = true;
  }

  // Generate fake IP in format xxx.xxx.xxx.xxx
  private generateFakeIp(): string {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 255),
    ).join(".");
  }

  // Generate fake device fingerprint (32 character hex)
  private generateDeviceFingerprint(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
  }

  // Show the modal with penalty information
  public show(duration: number): void {
    if (!this.game.myPlayer()?.isAlive()) {
      return;
    }
    this.duration = duration;
    this.countdown = Math.ceil(duration / 1000);
    this.isVisible = true;

    // Start countdown timer
    this.intervalId = window.setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        this.hide();
      }
    }, 1000);

    this.requestUpdate();
  }

  // Hide the modal
  public hide(): void {
    this.isVisible = false;

    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    // Dispatch event when modal is closed
    this.dispatchEvent(
      new CustomEvent("penalty-complete", {
        bubbles: true,
        composed: true,
      }),
    );

    this.requestUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  render() {
    if (!this.isVisible) {
      return html``;
    }

    return html`
      <o-modal translationKey="multi_tab.warning">
        <div class="v-stack" style="gap: 12px;">
          <div class="h-stack between">
            <h2 class="text-2xl" style="color: #ef4444;">
              ${translateText("multi_tab.warning")}
            </h2>
            <div
              class="px-2 py-1 text-xs font-bold"
              style="border: 2px solid var(--tactical-grey-600); color: var(--fontColorLight); background: transparent;"
            >
              RECORDING
            </div>
          </div>

          <p>${translateText("multi_tab.detected")}</p>

          <div class="c-box v-stack" style="gap: 6px;">
            <div class="h-stack between">
              <span style="color: var(--tactical-grey-400);">IP:</span>
              <span style="color: #ef4444;">${this.fakeIp}</span>
            </div>
            <div class="h-stack between">
              <span style="color: var(--tactical-grey-400);"
                >Device Fingerprint:</span
              >
              <span style="color: #ef4444;">${this.deviceFingerprint}</span>
            </div>
            <div class="h-stack between">
              <span style="color: var(--tactical-grey-400);">Reported:</span>
              <span style="color: #ef4444;"
                >${this.reported ? "TRUE" : "FALSE"}</span
              >
            </div>
          </div>

          <p>
            ${translateText("multi_tab.please_wait")}
            <span class="font-bold text-xl">${this.countdown}</span>
            ${translateText("multi_tab.seconds")}
          </p>

          <div
            style="width: 100%; height: 10px; border: 1px solid var(--tactical-grey-600);"
          >
            <div
              style="height: 100%; background: #ef4444; width: ${(this
                .countdown /
                (this.duration / 1000)) *
              100}%; transition: width 1s linear;"
            ></div>
          </div>

          <p class="text-sm" style="color: var(--tactical-grey-300);">
            ${translateText("multi_tab.explanation")}
          </p>

          <p class="text-xs" style="color: #ef4444; font-weight: 600;">
            Repeated violations may result in permanent account suspension.
          </p>
        </div>
      </o-modal>
    `;
  }
}
