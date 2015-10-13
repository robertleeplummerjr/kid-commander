# PRI - Persistent Request Interceptor
## Why?
Mostly for front end, end to end testing, at least that is why it was originally written.  We needed a way to listen to any request that was being made for a window.

## What does PRI do?
* opens child windows from a parent window and listens to them for you
* detects navigation by setting a timeout to fire just after the `onbeforeunload` event, which is just before the new window's `onready` event... easy
* replaces XMLHttpRequest safely and communicates directly with it for ajax events so that more may be made known about the state of the child window
* any time the new window has navigation triggered, PRI calls itself onto the new window with your settings, causing it to persist


## Usage
```javascript
pri.newWindow('child1.html', {
  allRequestsDone: function() {},
  beforeLoad: function(newWindow) {},
  load: function() {},
  error: function() {},
  close: function() {}
});
```

## Settings
* allRequestsDone - fires when all ajax requests in new window
* beforeLoad - fires just before a window's `ready` event this is the mythical `window.onbeforeload` event... it isn't a myth anymore
* load - synonomouse with `new XMLHttpRequest.onload`, fires just before all `XMLHttpRequest`'s `onload` events
* error - synonomouse with `new XMLHttpRequest.onerror`, fires just before all `XMLHttpRequest`'s `onerror` events
* close - fires just after the child window closes
