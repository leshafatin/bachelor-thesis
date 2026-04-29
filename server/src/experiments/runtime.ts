import crypto from "node:crypto";
import type { Strategy } from "../strategy/StrategyManager.js";
import { findExperimentForRoute } from "./config.js";

type CookieMap = Record<string, string>;

export type RuntimeAssignment = {
  sessionId: string;
  strategy: Strategy;
  experimentName?: string;
  experimentGroup?: string;
  setCookies: string[];
};

const SESSION_COOKIE = "render_lab_session";

export function resolveRuntimeAssignment(opts: {
  routeKey: string;
  slug: string;
  defaultStrategy: Strategy;
  cookieHeader?: string;
}): RuntimeAssignment {
  const cookies = parseCookies(opts.cookieHeader);
  const setCookies: string[] = [];

  const sessionId =
    cookies[SESSION_COOKIE] || `s_${crypto.randomBytes(8).toString("hex")}`;
  if (!cookies[SESSION_COOKIE]) {
    setCookies.push(
      serializeCookie(SESSION_COOKIE, sessionId, 60 * 60 * 24 * 30)
    );
  }

  const experiment = findExperimentForRoute(opts.routeKey, opts.slug);
  if (!experiment) {
    return {
      sessionId,
      strategy: opts.defaultStrategy,
      setCookies,
    };
  }

  const experimentCookie = `render_lab_exp_${experiment.name}`;
  const existingGroup = cookies[experimentCookie];
  const assignedGroup =
    experiment.groups.find((item) => item.name === existingGroup) ??
    pickWeightedGroup(experiment.groups);

  if (existingGroup !== assignedGroup.name) {
    setCookies.push(
      serializeCookie(experimentCookie, assignedGroup.name, 60 * 60 * 24 * 30)
    );
  }

  return {
    sessionId,
    strategy: assignedGroup.strategy,
    experimentName: experiment.name,
    experimentGroup: assignedGroup.name,
    setCookies,
  };
}

function pickWeightedGroup(
  groups: Array<{ name: string; strategy: Strategy; weight: number }>
) {
  const total = groups.reduce((acc, item) => acc + item.weight, 0);
  const target = Math.random() * total;
  let cursor = 0;

  for (const group of groups) {
    cursor += group.weight;
    if (target <= cursor) return group;
  }

  return groups[groups.length - 1];
}

function parseCookies(cookieHeader?: string): CookieMap {
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index < 0) return [part, ""];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function serializeCookie(name: string, value: string, maxAgeSeconds: number) {
  return `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}
