# Countdown Timer

## About

This is a lightweight, accessible and customisable countdown timer web component built with TypeScript and packaged with ParcelJS.

A [demo is available here](https://bladeski.github.io/countdown-timer-example/)

## Getting Started

To get started, install this into your project using:

`npm install @bladeski/countdown-timer`

or

`yarn add @bladeski/countdown-timer`.

Once installed, simply import into your project using `import '@bladeski/countdown-timer'`, then add the following tag into your HTML `<countdown-component></countdown-component>`.

To access the component methods, events, etc. simply find it in the DOM as below:

```js
  const countdownComponent = document.querySelector('countdown-component');
  countdownComponent.setCountdownLength([0,0,30]);
  countdownComponent.startCountdown();
```

### TypeScript

When using TypeScript, use the `CountdownComponent` cast to the correct type using:

```ts
const countdownComponent = document.querySelector('countdown-component') as CountdownComponent;
```

## API

### Data-Attributes

#### data-base-font-size

Pass this data attribute into the web component with a number value to set the base font size.

### Properties

#### timeLeft

This will return the time left on the timer.

```ts
  timeLeft: [hoursLeft: number, minutesLeft: number, secondsLeft: number]
```

### Methods

#### setCountdownLength

Sets the length of the countdown timer.

``` ts
  setCountdownLength(countdownLength: number[], hideZeroedUnits = false);
```

#### startCountdown

Starts the countdown.

``` ts
  startCountdown();
```

#### stopCountdown

Stops/pauses the countdown.

``` ts
  stopCountdown();
```

#### reset

Resets the countdown timer.

``` ts
  reset();
```

#### focus

Overrides the default focus method and focusses the start/stop button.

``` ts
  focus();
```

### Events

#### Countdown Start

Triggered when the countdown has started.

Example

``` ts
  countdownComponent.addEventListener('countdownStart', () => console.log('Countdown Started'));
```

#### Countdown Stop

Triggered when the countdown has stopped.

Example

``` ts
  countdownComponent.addEventListener('countdownStop', () => console.log('Countdown Stopped'));
```

#### Countdown End

Triggered when the countdown has reached 00:00:00.

Example

``` ts
  countdownComponent.addEventListener('countdownEnd', () => console.log('Countdown Ended'));
```

#### Countdown Reset

Triggered when the countdown has been reset.

Example

``` ts
  countdownComponent.addEventListener('countdownReset', () => console.log('Countdown Reset'));
```
