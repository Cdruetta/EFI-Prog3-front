const listeners = new Set();
let active = 0;

export function startLoading() { 
  active++; 
  emit(); 
}

export function stopLoading()  { 
  active = Math.max(0, active - 1); 
  emit(); 
}

export function resetLoading() {
  active = 0;
  emit();
}

export function onLoadingChange(fn) { 
  listeners.add(fn); 
  return () => listeners.delete(fn); 
}

function emit() {
  const visible = active > 0;
  listeners.forEach(fn => fn(visible));
}
