import '@testing-library/jest-dom'
import '../components';

import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

beforeEach(() => {
  document.body.innerHTML = '<countdown-component></countdown-component>';
});

describe('Countdown component', () => {

  test('the component renders correctly', () => {
    const component = document.querySelector('countdown-component');
    
    expect(component).not.toBeNull();
    expect(component?.shadowRoot?.querySelector('button#StartStopButton')).not.toBeNull();
    expect(component?.shadowRoot?.querySelector('.time-container')).not.toBeNull();
    expect(component?.shadowRoot?.querySelectorAll('.time-container span')).toHaveLength(8);
  });

  test('the component shows a default time of 00:00:00', () => {
    const component = document.querySelector('countdown-component');

    const timeValues = component?.shadowRoot?.querySelectorAll('.time-container span') as NodeListOf<HTMLSpanElement>;
    expect(timeValues).not.toBeNull();
    expect(timeValues).toHaveLength(8);
    expect(timeValues[0].textContent).toBe('0');
    expect(timeValues[1].textContent).toBe('0');
    expect(timeValues[2].textContent).toBe(':');
    expect(timeValues[3].textContent).toBe('0');
    expect(timeValues[4].textContent).toBe('0');
    expect(timeValues[5].textContent).toBe(':');
    expect(timeValues[6].textContent).toBe('0');
    expect(timeValues[7].textContent).toBe('0');
  });

  test('setting the component countdownLength updates the time left', () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);

    const timeValues = component?.shadowRoot?.querySelectorAll('.time-container span') as NodeListOf<HTMLSpanElement>;
    expect(timeValues).not.toBeNull();
    expect(timeValues).toHaveLength(8);
    expect(timeValues[0].textContent).toBe('0');
    expect(timeValues[1].textContent).toBe('1');
    expect(timeValues[2].textContent).toBe(':');
    expect(timeValues[3].textContent).toBe('0');
    expect(timeValues[4].textContent).toBe('1');
    expect(timeValues[5].textContent).toBe(':');
    expect(timeValues[6].textContent).toBe('0');
    expect(timeValues[7].textContent).toBe('1');
    expect(component?.timeLeft).toStrictEqual([1, 1, 1]);
  });

  test('setting the component countdownLength with an incorrect value throws an error', () => {
    const component = document.querySelector('countdown-component');
    const t = () => component?.setCountdownLength([]);

    expect(t).toThrowError('Hours, minutes and seconds need to be a valid number');
  });

  test('setting hideZeroedUnits to true hides the 0 values', () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([0, 0, 1], true);

    const countdownTimer = component?.shadowRoot?.querySelector('.countdown-timer') as HTMLDivElement;
    expect(countdownTimer).toHaveClass('hide-hours');
    expect(countdownTimer).toHaveClass('hide-minutes');
  });

  test('resetting the component countdownLength resets the time left', () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);
    component?.reset();

    const timeValues = component?.shadowRoot?.querySelectorAll('.time-container span') as NodeListOf<HTMLSpanElement>;
    expect(timeValues).not.toBeNull();
    expect(timeValues[0].textContent).toBe('0');
    expect(timeValues[1].textContent).toBe('0');
    expect(timeValues[2].textContent).toBe(':');
    expect(timeValues[3].textContent).toBe('0');
    expect(timeValues[4].textContent).toBe('0');
    expect(timeValues[5].textContent).toBe(':');
    expect(timeValues[6].textContent).toBe('0');
    expect(timeValues[7].textContent).toBe('0');
    expect(component?.timeLeft).toStrictEqual([0, 0, 0]);
  });

  test('starting the countdown fires the countdownStart event', () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);

    const mockEvent = jest.fn();
    component?.addEventListener('countdownStart', mockEvent);

    component?.startCountdown();

    expect(mockEvent).toBeCalledTimes(1);
  });

  test('stopping the countdown fires the countdownStop event', () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);

    const mockEvent = jest.fn();
    component?.addEventListener('countdownStop', mockEvent);

    component?.startCountdown();
    component?.stopCountdown();

    expect(mockEvent).toBeCalledTimes(1);
  });

  test('clicking the start/stop button to start the countdown fires the countdownStart event', async () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);

    const mockEvent = jest.fn();
    component?.addEventListener('countdownStart', mockEvent);

    const startStopButton = component?.shadowRoot?.querySelector('button#StartStopButton') as HTMLButtonElement;
    await user.click(startStopButton);

    expect(mockEvent).toBeCalledTimes(1);
  });

  test('clicking the start/stop button to stop the countdown fires the countdownStop event', async () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);

    const mockEvent = jest.fn();
    component?.addEventListener('countdownStop', mockEvent);

    const startStopButton = component?.shadowRoot?.querySelector('button#StartStopButton') as HTMLButtonElement;
    await user.click(startStopButton);
    await user.click(startStopButton);

    expect(mockEvent).toBeCalledTimes(1);
  });

  test('resetting the countdown fires the countdownReset event', () => {
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);

    const mockEvent = jest.fn();
    component?.addEventListener('countdownReset', mockEvent);

    component?.reset();

    expect(mockEvent).toBeCalledTimes(1);
  });

  test('running the countdown to the end fires the countdownEnd event', () => {
    jest.useFakeTimers();
    
    const component = document.querySelector('countdown-component');
    component?.setCountdownLength([1, 1, 1]);

    const mockEvent = jest.fn();
    component?.addEventListener('countdownEnd', mockEvent);

    component?.startCountdown();

    jest.runAllTimers();

    expect(mockEvent).toBeCalledTimes(1);
  });
});