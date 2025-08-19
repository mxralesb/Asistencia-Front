// src/lib/alumnosBus.js
const CHANNEL = 'alumnos:changed';

export function notifyAlumnosChanged() {

  window.dispatchEvent(new Event(CHANNEL));
}

export function onAlumnosChanged(cb) {
  const handler = () => cb();
  window.addEventListener(CHANNEL, handler);
  return () => window.removeEventListener(CHANNEL, handler);
}
