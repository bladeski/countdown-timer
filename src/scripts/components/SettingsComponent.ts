import TimerComponent from './TimerComponent';

export default class SettingsComponent {
  private settingsButton: HTMLButtonElement;
  private showSettings = false;
  private form: HTMLFormElement;
  private inputs: HTMLInputElement[] = [];
  private timer: TimerComponent = new TimerComponent();

  constructor() {
    this.timer.setTimer(0,0,0, false);

    this.settingsButton = document.getElementById('SettingsButton') as HTMLButtonElement;
    this.settingsButton.addEventListener('click', this.toggleSettings.bind(this));

    this.form = document.forms.namedItem('Settings') as HTMLFormElement;

    this.form.querySelectorAll('input.timer-input-value').forEach((input) => this.inputs.push(input));

    this.inputs.forEach((input) => {
      input.addEventListener('keyup', this.onInputUpdate.bind(this));
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
  }

  private toggleSettings() {
    this.showSettings = !this.showSettings;

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

  private onInputUpdate(event: KeyboardEvent) {
    const target = (event.target as HTMLInputElement);
    const index = parseInt(target.dataset['index'] || '');
    
    if (!isNaN(parseInt(event.key)) && index < this.inputs.length - 1) {
      this.inputs[index + 1].focus()
    } else if (event.code === 'Backspace' && target.value === '' && index > 0) {
      this.inputs[index - 1].focus();
    }
  }

  private onFormSubmit(event: SubmitEvent) {
    event.preventDefault();

    this.timer.stopTimer();

    if (this.inputs.length === 6) {
      const hours = `${this.inputs[0].value}${this.inputs[1].value}`;
      const minutes = `${this.inputs[2].value}${this.inputs[3].value}`;
      const seconds = `${this.inputs[4].value}${this.inputs[5].value}`;
      const hideZeroedUnits = this.form.querySelector('[name="hideZeroedUnits"') as HTMLInputElement;

      this.timer.setTimer(parseInt(hours), parseInt(minutes), parseInt(seconds), hideZeroedUnits.checked);

      this.toggleSettings();
    }
  }
}