// Simple navigation helper that works without react-router-dom
export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function getCurrentPath() {
  return window.location.pathname;
}

export function getQueryParam(name: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export function setQueryParam(name: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url.toString());
}
