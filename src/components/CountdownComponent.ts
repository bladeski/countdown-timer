import { CountdownEventName, TimeInMs, TimeUnit } from '../enums';

export class CountdownComponent extends HTMLElement {
  private readonly countdownContainer: HTMLElement;
  private startStopButton: HTMLButtonElement;
  private endTime?: Date;
  private interval?: number;
  private hoursLeft: number = 0;
  private minutesLeft: number = 0;
  private secondsLeft: number = 0;
  private hideZeroedUnits = false;

  constructor() {
    super();
    
    const shadow = this.attachShadow({ mode: 'open' });

    this.countdownContainer = document.createElement('div');
    this.countdownContainer.classList.add('countdown-timer');

    this.countdownContainer.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="time-container hours minutes seconds">
        <span class="hour-value"></span>
        <span class="hour-value"></span>
        <span class="hour-divider">:</span>
        <span class="minute-value"></span>
        <span class="minute-value"></span>
        <span class="minute-divider">:</span>
        <span class="second-value"></span>
        <span class="second-value"></span>
      </div>
      <button id="StartStopButton" class="countdown-stopped" aria-label="Start/pause the countdown" aria-disabled="true" disabled>
      </button>
    `;

    this.setCountdownLength = this.setCountdownLength.bind(this);
    this.startCountdown = this.startCountdown.bind(this);
    this.stopCountdown = this.stopCountdown.bind(this);
    this.reset = this.reset.bind(this);

    const startStopButton = this.countdownContainer.querySelector('button#StartStopButton');

    if (startStopButton instanceof Element) {
      this.startStopButton = startStopButton as HTMLButtonElement;
      this.startStopButton.addEventListener('click', () => {
        // TODO: Put into method
        if (this.interval) {
          this.stopCountdown();
        } else {
          this.setCountdownLength([this.hoursLeft, this.minutesLeft, this.secondsLeft], this.hideZeroedUnits);
          this.startCountdown();
        }
      });
    } else {
      throw new Error('There was a problem configuring the Countdown component.')
    }

    this.reset();
    shadow.appendChild(this.countdownContainer);
  }

  public setCountdownLength(countdownLength: number[], hideZeroedUnits = false) {
    if (
      typeof countdownLength[0] !== 'number' ||
      typeof countdownLength[1] !== 'number' ||
      typeof countdownLength[2] !== 'number'
    ) {
      throw new Error('Hours, minutes and seconds need to be a valid number');
    }
    this.hideZeroedUnits = hideZeroedUnits;

    this.hoursLeft = countdownLength[0];
    this.minutesLeft = countdownLength[1];
    this.secondsLeft = countdownLength[2];
    
    this.setTimeUnitValue(this.hoursLeft, TimeUnit.HOURS);
    this.setTimeUnitValue(this.minutesLeft, TimeUnit.MINUTES);
    this.setTimeUnitValue(this.secondsLeft, TimeUnit.SECONDS);
    
    this.setStartStopButtonDisabled();
    this.setClass();
  }

  public startCountdown() {
    const countdownInMs =
      this.hoursLeft * TimeInMs.HOURS +
      this.minutesLeft * TimeInMs.MINUTES +
      this.secondsLeft * TimeInMs.SECONDS;
    
    this.endTime = new Date();
    this.endTime.setTime(this.endTime.getTime() + countdownInMs + TimeInMs.SECONDS);

    this.setTimeValue();

    this.startStopButton?.classList.remove('countdown-stopped');
    this.startStopButton?.classList.add('countdown-started');
    this.startStopButton?.blur();

    this.triggerEvent(CountdownEventName.START);

    this.interval = window.setInterval(() => {
      this.updateCountdown();
    }, 50);
  }

  public stopCountdown() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;

      this.startStopButton?.classList.add('countdown-stopped');
      this.startStopButton?.classList.remove('countdown-started');
      
      this.triggerEvent(CountdownEventName.STOP);
    }
  }

  public reset() {
    this.stopCountdown();
    this.endTime = undefined;
    this.hoursLeft = 0;
    this.minutesLeft = 0;
    this.secondsLeft = 0;
    this.setCountdownLength([0, 0, 0], false);
    
    this.triggerEvent(CountdownEventName.RESET);
  }

  private updateCountdown() {
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
        this.interval && this.triggerEvent(CountdownEventName.END);
        this.stopCountdown();
      }

      this.setStartStopButtonDisabled();
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
    const unitElements = this.countdownContainer.querySelectorAll(`.${unit}-value`);
    
    if (unitElements.length === 2) {    
      unitElements[0].textContent = valueString[0];
      unitElements[1].textContent = valueString[1];
    }
  }

  private setClass() {
    this.countdownContainer.classList.remove('hide-hours');
    this.countdownContainer.classList.remove('hide-minutes');
    this.countdownContainer.classList.add('hours');
    this.countdownContainer.classList.add('minutes');
    this.countdownContainer.classList.add('seconds');

    if (this.hideZeroedUnits && this.hoursLeft <= 0) {
      this.countdownContainer.classList.add('hide-hours');

      if (this.minutesLeft <= 0) {
        this.countdownContainer.classList.add('hide-minutes');        
      }
    }

    if (this.hoursLeft === 0) {
      this.countdownContainer.classList.remove('hours');

      if (this.minutesLeft === 0) {
        this.countdownContainer.classList.remove('minutes');

        if (this.secondsLeft === 0) {
          this.countdownContainer.classList.remove('seconds');
        }
      }
    }
  }

  private triggerEvent(eventName: CountdownEventName, payload?: any) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: payload
    });
    this.dispatchEvent(event);
  }

  private getStyles() {
    return `
      :host {
        --body-font-size: 28px;
        --font-size-regular: 1rem;
        --font-size-l: 1.5rem;
        --font-size-xl: 2.25rem;
        --font-size-xxl: 3.375rem;
        --font-size-xxxl: 5.063rem;
        --font-size-xxxxl: 7.594rem;

        --padding-small: 0.5rem;
        --padding-regular: 1rem;
        --padding-large: 2.5rem;

        --default-transition: 250ms ease-in-out;

        --primary-font-colour: #fcfcfc;

        font-size: var(--body-font-regular);
        color: var(--primary-font-colour);
        line-height: 1.5;
        text-align: justify;
      }

      button {
        display: flex;
        padding: var(--padding-small);
        border: none;
        background-color: transparent;
        font-size: var(--font-size-xxl);
        opacity: 0.2;
        transition: opacity var(--default-transition);
      }
      
      button:hover:not(:disabled):not([aria-disabled='true']),
      button:active:not(:disabled):not([aria-disabled='true']),
      button:focus:not(:disabled):not([aria-disabled='true']) {
        opacity: 1;
      }

      #StartStopButton {
        padding: 0;
        box-sizing: border-box;
        height: 74px;        
        border-color: transparent transparent transparent var(--primary-font-colour);
        transition: border-style 100ms ease-in-out, border-width 100ms ease-in-out, opacity var(--default-transition);
        will-change: border-width;
        cursor: pointer;
        border-style: solid;
        border-width: 37px 0 37px 60px;
      }

      #StartStopButton.countdown-started {
        border-style: double;
        border-width: 0px 0 0px 60px;
      }

      .countdown-timer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .countdown-timer.hide-hours .time-container {
        grid-template-columns: 1fr 1fr auto 1fr 1fr;
        font-size: var(--font-size-xxl);
      }

      .countdown-timer.hide-hours .hour-value,
      .countdown-timer.hide-hours .hour-divider {
        display: none;
      }

      .countdown-timer.hide-minutes .time-container {
        grid-template-columns: 1fr 1fr auto;
        font-size: var(--font-size-xxxl);
      }

      .countdown-timer.hide-minutes .minute-value,
      .countdown-timer.hide-minutes .minute-divider {
        display: none;
      }

      .time-container {
        display: grid;
        grid-template-columns: 1fr 1fr repeat(2, auto 1fr 1fr);
        align-items: baseline;

        font-family: 'Bungee', sans-serif;
        font-size: var(--font-size-xl);

        transition: font-size var(--default-transition);
      }

      .time-container.hours .hour-value,
      .time-container.hours .hour-divider,
      .time-container.minutes .minute-value,
      .time-container.minutes .minute-divider,
      .time-container.seconds .second-value {
        opacity: 1;
      }

      .hour-value,
      .minute-value,
      .second-value,
      .hour-divider,
      .minute-divider {
        opacity: 0.5;
        transition: opacity var(--default-transition);
      }

      .time-container span:nth-of-type(3n) {
        text-align: center;
      }

      .time-container span:nth-of-type(3n + 1) {
        text-align: right;
      }

      .time-container span:nth-of-type(3n + 2) {
        text-align: left;
      }

      @media screen and (min-width: 680px) {
        .time-container {
          font-size: var(--font-size-xxl);
        }

        .time-container.hide-hours {
          font-size: var(--font-size-xxxl);
        }

        .time-container.hide-minutes {
          font-size: var(--font-size-xxxxl);
        }
      }
    `;
  }
}

customElements.define('countdown-component', CountdownComponent);

declare global {
  interface HTMLElementTagNameMap {
    'countdown-component': CountdownComponent
  }
}