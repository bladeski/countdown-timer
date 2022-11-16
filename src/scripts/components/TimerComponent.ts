import confetti from 'canvas-confetti';

export default class TimerComponent {
  private element: HTMLElement;
  private startStopButton: HTMLButtonElement;
  private endTime?: Date;
  private interval?: NodeJS.Timeout;
  private hoursLeft: number = 0;
  private minutesLeft: number = 0;
  private secondsLeft: number = 0;
  private hideZeroedUnits = false;
  private cycleTheme = false;
  private themeColour = 230;
  private openSettings: (open?: boolean) => void;

  constructor(openSettings: (open?: boolean) => void) {
    this.openSettings = openSettings;

    const element = document.getElementById('Timer');

    if (element) {
      this.element = element;
    } else {
      this.element = document.createElement('div');
      document.body.appendChild(this.element);
    }

    const startStopButton = document.getElementById('StartStop');

    if (startStopButton) {
      this.startStopButton = startStopButton as HTMLButtonElement;
    } else {
      this.startStopButton = document.createElement('button');
    }

    this.reset();

    this.startStopButton.addEventListener('click', () => {
      if (this.interval) {
        this.stopTimer();
      } else {
        this.setTimer(this.hoursLeft, this.minutesLeft, this.secondsLeft, this.hideZeroedUnits, this.cycleTheme, this.themeColour);
        this.startTimer();
      }
    })

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (this.interval && event.key === ' ') {
        this.stopTimer();
      }
    });
  }

  public setTimer(hours: number, minutes: number = 0, seconds: number = 0, hideZeroedUnits = false, cycleTheme = false, themeColour = 260) {
    if (
      typeof hours !== 'number' ||
      typeof minutes !== 'number' ||
      typeof seconds !== 'number'
    ) {
      throw new Error('Hours, minutes and seconds need to be a valid number');
    }
    this.hideZeroedUnits = hideZeroedUnits;
    this.cycleTheme = cycleTheme;
    this.themeColour = themeColour;

    this.hoursLeft = hours;
    this.minutesLeft = minutes;
    this.secondsLeft = seconds;
    
    this.setTimeUnitValue(this.hoursLeft, TimeUnit.HOURS);
    this.setTimeUnitValue(this.minutesLeft, TimeUnit.MINUTES);
    this.setTimeUnitValue(this.secondsLeft, TimeUnit.SECONDS);
    
    this.setStartStopButtonDisabled();
    this.setClass();
  }

  public startTimer() {
    const timerInMs =
      this.hoursLeft * TimeInMs.HOURS +
      this.minutesLeft * TimeInMs.MINUTES +
      this.secondsLeft * TimeInMs.SECONDS;
    
    this.endTime = new Date();
    this.endTime.setTime(this.endTime.getTime() + timerInMs + TimeInMs.SECONDS);

    this.setTimeValue();

    const startStopButton = document.getElementById('StartStop');
    startStopButton?.classList.remove('timer-stopped');
    startStopButton?.classList.add('timer-started');
    startStopButton?.blur();

    this.openSettings(false);

    this.interval = setInterval(() => {
      this.updateTimer();
    }, 50);
  }

  public stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;

      const startStopButton = document.getElementById('StartStop');
      startStopButton?.classList.add('timer-stopped');
      startStopButton?.classList.remove('timer-started');
      document.body.classList.remove('pulse');
    }
  }

  public reset() {
    this.stopTimer();
    this.endTime = undefined;
    this.hoursLeft = 0;
    this.minutesLeft = 0;
    this.secondsLeft = 0;
    this.setTimer(0, 0, 0, false);
    this.openSettings(true);
  }

  private updateTimer() {
    if (this.endTime) {
      const { hours, minutes, seconds } = this.getRemainingTime(this.endTime);
      
      if (hours !== this.hoursLeft) {
        this.hoursLeft = hours;
        this.setTimeUnitValue(this.hoursLeft, TimeUnit.HOURS);
      }

      if (minutes !== this.minutesLeft) {
        this.minutesLeft = minutes;
        this.setTimeUnitValue(this.minutesLeft, TimeUnit.MINUTES);
      }

      if (seconds !== this.secondsLeft) {
        this.secondsLeft = seconds;
        this.setTimeUnitValue(this.secondsLeft, TimeUnit.SECONDS);
        this.updateThemeColour();
      }
      this.setClass();
      
      if (hours <= 0 && minutes <= 0 && seconds <= 10) {
        document.body.classList.add('pulse');
      }

      if (hours <= 0 && minutes <= 0 && seconds <= 0) {
        document.body.classList.remove('pulse');
        this.interval && confetti({
          particleCount: 100,
          spread: 160,
          shapes: ['circle', 'circle', 'square'],
          gravity: 0.5,
          ticks: 300
        })?.then(() => {
          this.reset();
        });
        this.stopTimer();
      }

      this.setStartStopButtonDisabled();
    }
  }

  private updateThemeColour() {
    if (this.cycleTheme) {
      this.themeColour = this.themeColour + 2;
      document.body.style.setProperty('--theme-hue-saturation', `${this.themeColour}, 71%`);
    }
  }

  private getRemainingTime(endTime: Date) {
    const currentTime = new Date();
    const timeLeft = endTime.getTime() - currentTime.getTime();
    const hours = Math.floor(timeLeft / TimeInMs.HOURS);
    const minutes = Math.floor(timeLeft / TimeInMs.MINUTES) % 60;
    const seconds = Math.floor(timeLeft / TimeInMs.SECONDS) % 60;

    return {
      hours,
      minutes,
      seconds
    };
  }

  private setStartStopButtonDisabled() {
    const isDisabled = this.hoursLeft <= 0 && this.minutesLeft <= 0 && this.secondsLeft <= 0;
    this.startStopButton.disabled = isDisabled;
    this.startStopButton.ariaDisabled = `${isDisabled}`;
  }

  private setTimeValue() {
    this.setTimeUnitValue(this.hoursLeft, TimeUnit.HOURS);
    this.setTimeUnitValue(this.minutesLeft, TimeUnit.MINUTES);
    this.setTimeUnitValue(this.secondsLeft, TimeUnit.SECONDS);
  }

  private setTimeUnitValue(value: number, unit: TimeUnit) {
    const valueString = value.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    const unitElement1 = document.getElementById(`${unit}1`);
    const unitElement2 = document.getElementById(`${unit}2`);
    
    if (unitElement1 && unitElement2) {    
      unitElement1.textContent = valueString[0];
      unitElement2.textContent = valueString[1];
    }
  }

  private setClass() {
    this.element.classList.remove('hide-hours');
    this.element.classList.remove('hide-minutes');
    this.element.classList.add('hours');
    this.element.classList.add('minutes');
    this.element.classList.add('seconds');

    if (this.hideZeroedUnits && this.hoursLeft <= 0) {
      this.element.classList.add('hide-hours');

      if (this.minutesLeft <= 0) {
        this.element.classList.add('hide-minutes');        
      }
    }

    if (this.hoursLeft === 0) {
      this.element.classList.remove('hours');

      if (this.minutesLeft === 0) {
        this.element.classList.remove('minutes');

        if (this.secondsLeft === 0) {
          this.element.classList.remove('seconds');
        }
      }
    }
  }
}

enum TimeInMs {
  SECONDS = 1000,
  MINUTES = 60000,
  HOURS = 3600000,
}

enum TimeUnit {
  HOURS = 'Hours',
  MINUTES = 'Minutes',
  SECONDS = 'Seconds',
}
