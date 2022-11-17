import TimerComponent from './TimerComponent';

export default class SettingsComponent {
  private settingsButton: HTMLButtonElement;
  private showSettings = false;
  private form: HTMLFormElement;
  private inputs: HTMLInputElement[] = [];
  private timer: TimerComponent;
  private _currentSettings: SettingsModel = defaultSettings;

  private get currentSettings() {
    return this._currentSettings;
  }

  private set currentSettings(settings: SettingsModel) {
    this._currentSettings = settings;
  }

  constructor() {
    this.loadSettings();
    this.settingsButton = document.getElementById(
      'SettingsButton'
    ) as HTMLButtonElement;
    this.settingsButton.addEventListener('click', () => this.toggleSettings());

    this.form = document.forms.namedItem('Settings') as HTMLFormElement;

    this.form
      .querySelectorAll('input.timer-input-value')
      .forEach((input) => this.inputs.push(input as HTMLInputElement));

    this.inputs.forEach((input, index) => {
      input.addEventListener('input', this.onInputUpdate.bind(this));
      input.addEventListener('blur', this.onInputBlur.bind(this));
      input.value = this.currentSettings.countdownLength &&
        this.formatNumberAsString(this.currentSettings.countdownLength[index]) || '00';
    });

    const themeColourInput = this.form.querySelector('[name="themeColour"]') as HTMLInputElement;
    themeColourInput.addEventListener('input', this.setThemeColour.bind(this));

    this.form.addEventListener('input', (event: Event) => {
      const updateButton = document.getElementById(
        'UpdateButton'
      ) as HTMLButtonElement;

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

    const formElements = this.form.querySelectorAll('input, button') as NodeListOf<HTMLInputElement | HTMLButtonElement>;
    formElements.forEach(item => {
      item.ariaDisabled = `${!this.showSettings}`;
      item.disabled = !this.showSettings;
    });

    const settingsPanel = document.getElementById('Settings');
    if (this.showSettings) {
      settingsPanel?.classList.add('show');
      setTimeout(() => this.inputs[0].focus(), 500);
      this.timer?.stopTimer();
    } else {
      settingsPanel?.classList.remove('show');
      const startStopButton = document.getElementById(
        'StartStop'
      ) as HTMLButtonElement;
      startStopButton.focus();
    }
  }

  private onInputUpdate(event: Event) {
    const target = event.target as HTMLInputElement;
    const enteredValue = parseInt(target.value);
    const min = parseInt(target.min);
    const max = parseInt(target.max);
    const value =
      enteredValue > max ? max : enteredValue < min ? min : enteredValue;

    target.value = this.formatNumberAsString(value);
  }

  private onInputBlur(event: Event) {
    const target = event.target as HTMLInputElement;
    const enteredValue = parseInt(target.value);
    const value = isNaN(enteredValue) ? 0 : enteredValue;
    target.value = this.formatNumberAsString(value);
  }

  private onFormSubmit(event: SubmitEvent) {
    event.preventDefault();

    this.timer.stopTimer();

    if (this.inputs.length === 3) {
      const hours = this.inputs[0].value;
      const minutes = this.inputs[1].value;
      const seconds = this.inputs[2].value;
      const hideZeroedUnits = this.form.querySelector(
        '[name="hideZeroedUnits"]'
      ) as HTMLInputElement;
      const cycleTheme = this.form.querySelector(
        '[name="cycleTheme"]'
      ) as HTMLInputElement;
      const countdownLength = [parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)];

      this.timer.setTimer(
        countdownLength,
        hideZeroedUnits.checked,
        cycleTheme.checked
      );

      const currentSettings = {
        ...this.currentSettings,
        countdownLength,
        hideZeroedUnits: hideZeroedUnits.checked,
        cycleThemeColour: cycleTheme.checked
      }

      this.saveSettings(currentSettings);

      this.toggleSettings();
    }
  }
  
  private setThemeColour(event: Event) {
    const colour = parseInt((event.target as HTMLInputElement).value);

    if (!isNaN(colour)) {
      document.body.style.setProperty('--theme-hue-saturation', `${colour}, 71%`);
      this.saveSettings({
        themeColour: colour
      });
    }
  }

  private formatNumberAsString(number: number): string {
    return number.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
  }

  private saveSettings(settings: SettingsModel) {
    const currentSettings = {
      ...this.currentSettings,
      ...settings
    };
    this.currentSettings = currentSettings;
    (Object.keys(currentSettings) as (keyof SettingsModel)[])
      .forEach((key) => localStorage.setItem(key, JSON.stringify(currentSettings[key])))
  }

  private loadSettings() {
    this.currentSettings = {
      countdownLength: JSON.parse(localStorage.getItem('countdownLength') || JSON.stringify(defaultSettings.countdownLength)),
      hideZeroedUnits: localStorage.getItem('hideZeroedUnits') !== 'false',
      themeColour: parseInt(localStorage.getItem('themeColour') || `${defaultSettings.themeColour}`),
      cycleThemeColour: localStorage.getItem('cycleThemeColour') === 'false'
    };
  }
}

export type SettingsModel = {
  countdownLength?: number[];
  hideZeroedUnits?: boolean;
  themeColour?: number;
  cycleThemeColour?: boolean;
}

const defaultSettings: SettingsModel = {
  countdownLength: [0, 0, 0],
  hideZeroedUnits: true,
  themeColour: 260,
  cycleThemeColour: false
}
