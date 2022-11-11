export default class TimerComponent {
  private element: HTMLElement;
  private startStopButton: HTMLButtonElement;
  private endTime?: Date;
  private interval?: NodeJS.Timeout;
  private hoursLeft: number = -1;
  private minutesLeft: number = -1;
  private secondsLeft: number = -1;
  private showHours = true;
  private showMinutes = true;
  private hideZeroedUnits = false;

  constructor() {
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

    this.startStopButton.addEventListener('click', () => {
      if (this.interval) {
        this.stopTimer();
      } else {
        this.setTimer(this.hoursLeft, this.minutesLeft, this.secondsLeft, this.hideZeroedUnits);
        this.startTimer();
      }
    })

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (this.interval && event.key === ' ') {
        this.stopTimer();
      }
    });
  }

  public setTimer(hours: number, minutes: number = 0, seconds: number = 0, hideZeroedUnits = false) {
    if (
      typeof hours !== 'number' ||
      typeof hours !== 'number' ||
      typeof hours !== 'number'
    ) {
      throw new Error('Hours, minutes and seconds need to be a valid number');
    }
    this.hideZeroedUnits = hideZeroedUnits;
    this.showHours = !hideZeroedUnits;
    this.showMinutes = !hideZeroedUnits;

    const timerInMs =
      hours * TimeInMs.HOURS +
      minutes * TimeInMs.MINUTES +
      seconds * TimeInMs.SECONDS;
    this.endTime = new Date();
    this.endTime.setTime(this.endTime.getTime() + timerInMs);
    this.updateTimer();
  }

  public startTimer() {
    if (this.endTime) {
      const { hours, minutes, seconds } = this.getRemainingTime(this.endTime);
      this.hoursLeft = hours;
      this.minutesLeft = minutes;
      this.secondsLeft = seconds;

      // this.showHours = hours > 0;
      // this.showMinutes = hours > 0 || minutes > 0;

      this.setTimeValue();

      const startStopButton = document.getElementById('StartStop');
      startStopButton?.classList.remove('timer-stopped');
      startStopButton?.classList.add('timer-started');
      
      this.interval = setInterval(() => {
        this.updateTimer();
      }, 100);

    }
  }

  public stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;

      const startStopButton = document.getElementById('StartStop');
      startStopButton?.classList.add('timer-stopped');
      startStopButton?.classList.remove('timer-started');
    }
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
      }
      this.setClass();
      

      if (hours <= 0 && minutes <= 0 && seconds <= 0) {
        this.stopTimer();
        this.startStopButton.disabled = true;
      } else {
        this.startStopButton.disabled = false;
      }
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
    if (!this.showHours && this.hoursLeft <= 0) {
      this.element.classList.add('hide-hours');
    }

    if (!this.showMinutes && this.minutesLeft <= 0 && this.hoursLeft <= 0) {
      this.element.classList.add('hide-minutes');
    }

    this.element.classList.add('hours');
    this.element.classList.add('minutes');
    this.element.classList.add('seconds');

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
