# Flow of Work Sessions Timer

Simple pomodoro-style [timer across multiple sessions](https://martypdx.github.io/session-timer/).

## Session Timer

- timer tracks current session
- alerts when a session has completed
- confirmation of alert starts next session

## Session Duration

Default session duration is 25 minutes. Add a search parameter to the url to change the duration:

```
https://martypdx.github.io/session-timer/?minutes=15
```

## Session Tracking

- adds (and counts) number of sessions
- break reminders: color of session goes from green to yellow to red
- refresh that page to start tracking sessions again

## Theme

- ○ light
- ◑ auto (system)
- ● dark