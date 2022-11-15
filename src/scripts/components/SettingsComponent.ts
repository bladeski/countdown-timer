import TimerComponent from './TimerComponent';

export default class SettingsComponent {
  private settingsButton: HTMLButtonElement;
  private showSettings = false;
  private form: HTMLFormElement;
  private inputs: HTMLInputElement[] = [];
  private timer: TimerComponent;

  constructor() {
    this.settingsButton = document.getElementById('SettingsButton') as HTMLButtonElement;
    this.settingsButton.addEventListener('click', () => this.toggleSettings());

    this.form = document.forms.namedItem('Settings') as HTMLFormElement;

    this.form.querySelectorAll('input.timer-input-value').forEach((input) => this.inputs.push(input as HTMLInputElement));

    this.inputs.forEach((input) => {
      input.addEventListener('input', this.onInputUpdate.bind(this));
    });

    this.form.addEventListener('input', (event: Event) => {
      const updateButton = document.getElementById('UpdateButton') as HTMLButtonElement;

      if (this.form.checkValidity()) {
        updateButton.ariaDisabled = 'false';
      } else {
        updateButton.ariaDisabled = 'true';
      }
    });
    this.form.addEventListener('submit', this.onFormSubmit.bind(this));
    this.timer = new TimerComponent(this.toggleSettings.bind(this));
  }

  private toggleSettings(open?: boolean) {
    this.showSettings = typeof open === 'boolean' ? open : !this.showSettings;

    const settingsPanel = document.getElementById('Settings');
    if (this.showSettings) {
      settingsPanel?.classList.add('show');
      this.inputs[0].focus();
    } else {
      settingsPanel?.classList.remove('show');
      const startStopButton = document.getElementById('StartStop') as HTMLButtonElement;
      startStopButton.focus();
    }
  }

  private onInputUpdate(event: Event) {
    const target = (event.target as HTMLInputElement);
    const value = parseInt(target.value);
    
    if (value < 10) {
      target.value = `0${value}`;
    }
  }

  private onFormSubmit(event: SubmitEvent) {
    event.preventDefault();

    this.timer.stopTimer();

    if (this.inputs.length === 3) {
      const hours = this.inputs[0].value;
      const minutes = this.inputs[1].value;
      const seconds = this.inputs[2].value;
      const hideZeroedUnits = this.form.querySelector('[name="hideZeroedUnits"') as HTMLInputElement;

      this.timer.setTimer(parseInt(hours), parseInt(minutes), parseInt(seconds), hideZeroedUnits.checked);

      this.toggleSettings();
    }
  }
}