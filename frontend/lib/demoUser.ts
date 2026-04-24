/**
 * Single-source-of-truth for the placeholder user identity the web shows
 * until real authentication lands. Swap this for a session hook once
 * Telegram / magic-link login is wired up.
 */

export interface WebUser {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export const DEMO_USER: WebUser = {
  id: "u-demo",
  name: "Demo",
  role: "Founder",
  initials: "D",
  color: "#3D5AFE",
};
