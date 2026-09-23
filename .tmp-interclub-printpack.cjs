var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/clubchallenge/InterclubPrintPack.jsx
var InterclubPrintPack_exports = {};
__export(InterclubPrintPack_exports, {
  default: () => InterclubPrintPack
});
module.exports = __toCommonJS(InterclubPrintPack_exports);
var import_react = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
var RALLYHUB_MARK_URL = "https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png";
var NAVY = "#0b2e59";
var BLUE = "#07558d";
var GREEN = "#0b914a";
var COPYRIGHT = "\xA9 2026 RallyHub. All rights reserved.";
function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
function fmtDate(value) {
  if (!value) return "________________";
  try {
    return (/* @__PURE__ */ new Date(value + (String(value).length === 10 ? "T12:00:00" : ""))).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return String(value);
  }
}
function shortGender(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v.startsWith("f")) return "F";
  if (v.startsWith("m")) return "M";
  return "";
}
function RallyHubBrand({ small = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: small ? "rhpp-brand rhpp-brand-small" : "rhpp-brand", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: RALLYHUB_MARK_URL, alt: "RallyHub" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-brand-type", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-wordmark", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rally" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hub" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-strap", children: [
        "PLAY ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "\u2022" }),
        " CONNECT ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "\u2022" }),
        " BELONG"
      ] })
    ] })
  ] });
}
function ScriptTagline() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-script-tag", children: [
    "Play",
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
    "Connect",
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
    "Belong",
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
  ] });
}
function StandardHeader({ event, tournament, title, schedule = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: schedule ? "rhpp-header rhpp-header-schedule" : "rhpp-header", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RallyHubBrand, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-kicker", children: "INTERCLUB" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
        event.club_a_name,
        " vs ",
        event.club_b_name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        tournament?.location || "Venue: __________________",
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u2502" }),
        " Date: ",
        fmtDate(tournament?.start_date)
      ] })
    ] }),
    !schedule && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScriptTagline, {})
  ] });
}
function ScoreHeader({ event, tournament }) {
  const team = (name, logo, sideClass) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-score-team " + sideClass, children: [
    logo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: logo, alt: "" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: name })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "rhpp-score-header", children: [
    team(event.club_a_name, event.club_a_logo_url, "rhpp-score-team-a"),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-score-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RallyHubBrand, { small: true }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-kicker", children: "INTERCLUB" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
        event.club_a_name,
        " vs ",
        event.club_b_name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Master Score Sheet" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        tournament?.location || "Venue: __________________",
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u2502" }),
        " Date: ",
        fmtDate(tournament?.start_date)
      ] })
    ] }),
    team(event.club_b_name, event.club_b_logo_url, "rhpp-score-team-b")
  ] });
}
function Footer({ sourceNote = "" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { className: "rhpp-footer", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { className: "rhpp-wave", viewBox: "0 0 1000 60", preserveAspectRatio: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M0,34 C185,2 340,53 515,38 C700,20 835,8 1000,18", fill: "none", stroke: "#0b67b2", strokeWidth: "5" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-footer-row", children: [
      sourceNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rhpp-footer-source", children: sourceNote }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RallyHubBrand, { small: true }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "rhpp-footer-copy", children: [
        "Powered by ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
          "Rally",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hub" })
        ] }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "\u2502" }),
        " ",
        COPYRIGHT
      ] })
    ] })
  ] });
}
function Page({ children, className = "" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "rhpp-page " + className, children });
}
function fixtureFor(matches, round, court) {
  return matches.find((m) => Number(m.round_number) === Number(round) && Number(m.court_number) === Number(court));
}
function PairNames({ names = [] }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: names.join(" & ") || "\u2014" });
}
function MasterScorePage({ event, tournament, matches, rounds, courts }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { className: "rhpp-score-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreHeader, { event, tournament }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "rhpp-score-table", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "rhpp-round-col", children: "Round" }),
        courts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", { children: [
          "Court ",
          c
        ] }, c))
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rounds.map((round) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "rhpp-round-number", children: round }),
        courts.map((court) => {
          const m = fixtureFor(matches, round, court);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "rhpp-score-cell", children: m ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-score-name", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PairNames, { names: m.club_a_names || [] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-score-boxes", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "v" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-score-name", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PairNames, { names: m.club_b_names || [] }) })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-empty", children: "No match" }) }, court);
        })
      ] }, round)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-score-bottom", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-notes-box", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Notes" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-reminders", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Quick Reminders" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Write the score here first if the desk is busy" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Enter it in RallyHub as soon as practical" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keep this sheet as the paper backup" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
  ] });
}
function participantAvailableInRound(p, round, lastScheduledById) {
  if ((p.roster_role || "rotation") === "reserve" && !p.reserve_activated) return false;
  const from = Number(p.available_from_round || p.replacement_effective_round || 1);
  if (round < from) return false;
  if (["withdrawn", "injured", "replaced"].includes(p.status)) {
    const last = Number(lastScheduledById[p.id] || 0);
    return last > 0 && round <= last;
  }
  return true;
}
function RoundSchedule({ event, matches, participants, round, courts, lastScheduledById }) {
  const roundMatches = matches.filter((m) => Number(m.round_number) === round);
  const activeIds = new Set(roundMatches.flatMap((m) => [...m.club_a_participant_ids || [], ...m.club_b_participant_ids || []]));
  const resting = participants.filter((p) => ["club_a", "club_b"].includes(p.side) && participantAvailableInRound(p, round, lastScheduledById) && !activeIds.has(p.id));
  const restingA = resting.filter((p) => p.side === "club_a").sort((a, b) => Number(a.event_rank || 999) - Number(b.event_rank || 999));
  const restingB = resting.filter((p) => p.side === "club_b").sort((a, b) => Number(a.event_rank || 999) - Number(b.event_rank || 999));
  const restRows = Math.max(restingA.length, restingB.length, 1);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-round-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-round-band", children: [
      "Round ",
      round
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-court-grid", children: courts.map((court) => {
      const m = fixtureFor(roundMatches, round, court);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-court-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-court-head", children: [
          "Court ",
          court
        ] }),
        m ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-court-body", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PairNames, { names: m.club_a_names || [] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "vs" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PairNames, { names: m.club_b_names || [] }) })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-court-body rhpp-empty", children: "No match scheduled" })
      ] }, court);
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-rest-wrap", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-rest-title", children: "Resting this round" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-rest-heads", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: event.club_a_name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: event.club_b_name })
      ] }),
      Array.from({ length: restRows }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-rest-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: restingA[i]?.display_name || "" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: restingB[i]?.display_name || "" })
      ] }, i))
    ] }),
    event.include_break && Number(event.break_after_round) === round && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-break", children: [
      event.break_minutes,
      "-minute break after Round ",
      round
    ] })
  ] });
}
function MasterSchedulePage({ event, tournament, matches, participants, rounds, lastScheduledById, pageIndex, totalPages }) {
  const courts = Array.from({ length: Number(event.courts || 4) }, (_, i) => i + 1);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { className: "rhpp-schedule-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandardHeader, { event, tournament, title: "Master Schedule / Court Assignment", schedule: true }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-schedule-stack", children: rounds.map((round) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundSchedule, { event, matches, participants, round, courts, lastScheduledById }, round)) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-page-number", children: [
      "Rounds ",
      rounds[0],
      "\u2013",
      rounds[rounds.length - 1],
      " \xB7 Page ",
      pageIndex + 1,
      " of ",
      totalPages
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, { sourceNote: "Auto-populated from RallyHub draw and round schedule." })
  ] });
}
function RosterTable({ event, side, players }) {
  const isA = side === "club_a";
  const name = isA ? event.club_a_name : event.club_b_name;
  const logo = isA ? event.club_a_logo_url : event.club_b_logo_url;
  const primary = isA ? event.club_a_primary_colour : event.club_b_primary_colour;
  const secondary = isA ? event.club_a_secondary_colour : event.club_b_secondary_colour;
  const rotation = players.filter((p) => (p.roster_role || "rotation") !== "reserve").sort((a, b) => Number(a.event_rank || 999) - Number(b.event_rank || 999));
  const reserves = players.filter((p) => (p.roster_role || "rotation") === "reserve").sort((a, b) => Number(a.event_rank || 999) - Number(b.event_rank || 999));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-roster", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-roster-title", style: { background: secondary || "#eef4f8", borderColor: primary || BLUE }, children: [
      logo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: logo, alt: "" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: name })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "No." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Player Name" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "M / F" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Notes" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: Array.from({ length: Math.max(16, rotation.length) }, (_, i) => {
        const p = rotation[i];
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p?.event_rank || i + 1 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p?.display_name || "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p ? shortGender(p.gender) : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p && p.status !== "active" ? p.status : "" })
        ] }, i);
      }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-reserve-title", children: "Reserves" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", { className: "rhpp-reserves", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: Array.from({ length: Math.max(4, reserves.length) }, (_, i) => {
      const p = reserves[i];
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
          "R",
          i + 1
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p?.display_name || "" })
      ] }, i);
    }) }) })
  ] });
}
function TeamRosterPage({ event, tournament, participants, roundsCount, courtsCount }) {
  const a = participants.filter((p) => p.side === "club_a");
  const b = participants.filter((p) => p.side === "club_b");
  const matchFormat = event.normal_match_type === "timed" ? `Timed \xB7 ${event.play_minutes || 0} min${event.timed_draws_allowed === false ? " \xB7 no draws" : " \xB7 draws allowed"}` : `First to ${event.normal_target_points || 11} \xB7 win by ${event.normal_win_by || 1}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { className: "rhpp-roster-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandardHeader, { event, tournament, title: "Team Roster & Playing Order" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-roster-layout", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterTable, { event, side: "club_a", players: a }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterTable, { event, side: "club_b", players: b }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "rhpp-info-panel", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Event Information" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Date" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: fmtDate(tournament?.start_date) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Venue" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: tournament?.location || "________________" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Format" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
            courtsCount,
            " courts \xB7 ",
            roundsCount,
            " rounds"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Match format" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: matchFormat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Break" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: event.include_break ? `${event.break_minutes} minutes after Round ${event.break_after_round}` : "No scheduled break" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Team size" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
            a.filter((p) => (p.roster_role || "rotation") !== "reserve").length,
            " / ",
            b.filter((p) => (p.roster_role || "rotation") !== "reserve").length,
            " players + reserves"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-day-notes", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Notes / Changes on the Day" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
  ] });
}
function RuleCard({ n, title, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-rule", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rhpp-rule-number", children: n }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
        n,
        ". ",
        title
      ] }),
      children
    ] })
  ] });
}
function BriefingPage({ event, tournament, roundsCount, courtsCount }) {
  const format = event.normal_match_type === "timed" ? `Timed rounds \xB7 ${event.play_minutes || 0} minutes${event.timed_draws_allowed === false ? " \xB7 no draws" : " \xB7 draws allowed"}` : `First to ${event.normal_target_points || 11} \xB7 win by ${event.normal_win_by || 1}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { className: "rhpp-briefing-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandardHeader, { event, tournament, title: "Event Briefing & Rules" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-rule-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuleCard, { n: "1", title: "Format", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          courtsCount,
          " courts, ",
          roundsCount,
          " rounds"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Pairs are pre-drawn and shown on the schedule" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: format }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          "Interclub scoring: ",
          event.win_points ?? 2,
          " points for a win",
          Number(event.draw_points ?? 1) ? `, ${event.draw_points ?? 1} for a draw` : ""
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuleCard, { n: "3", title: "Break", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: event.include_break ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          event.break_minutes,
          "-minute break after Round ",
          event.break_after_round
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The host may shorten or end the break if needed" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          "Be ready for Round ",
          Number(event.break_after_round || 0) + 1
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No scheduled mid-event break" }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuleCard, { n: "2", title: "During the Event", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Be ready when your court is called" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keep to the published schedule" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Change over promptly at the end of each round" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Report scores to the host / desk" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Enjoy the event and good sportsmanship" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuleCard, { n: "4", title: "Substitutions / Withdrawals", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Tell the host immediately if you cannot continue" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A reserve or approved replacement may be used" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Future fixtures can be adjusted without changing completed results" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuleCard, { n: "5", title: "Showcase Final (if included)", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Separate points-based final, not a timed round" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Host chooses 11 or 15, win by 1 or 2" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Any two eligible players from each club may be selected" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "An exhibition Showcase does not change the Interclub result" })
      ] }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-most-important", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Most importantly ..." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Be fair, have fun, and represent your team with pride!" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
  ] });
}
function FinalResultPage({ event, tournament, score, overallScore, showcaseMatch, courtsCount, roundsCount }) {
  const winner = overallScore.clubA === overallScore.clubB ? "Overall draw" : overallScore.clubA > overallScore.clubB ? event.club_a_name : event.club_b_name;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { className: "rhpp-result-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandardHeader, { event, tournament, title: "Final Result" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-result-layout", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-team-score-grid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "a", style: { borderTopColor: event.club_a_primary_colour || "#155eaa" }, children: [
            event.club_a_logo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: event.club_a_logo_url, alt: "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: event.club_a_name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: overallScore.clubA }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Interclub points" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "b", style: { borderTopColor: event.club_b_primary_colour || "#8b1e24" }, children: [
            event.club_b_logo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: event.club_b_logo_url, alt: "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: event.club_b_name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: overallScore.clubB }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Interclub points" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-result-stats", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: score.matchesWonA }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              event.club_a_name,
              " wins"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: score.draws }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Draws" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: score.matchesWonB }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              event.club_b_name,
              " wins"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: score.gamePointsA }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Points scored" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              score.gamePointDifference >= 0 ? "+" : "",
              score.gamePointDifference
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Point differential" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: score.gamePointsB }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Points scored" })
          ] })
        ] }),
        showcaseMatch && ["completed", "draw"].includes(showcaseMatch.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-showcase-result", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: showcaseMatch.showcase_mode === "exhibition" ? "Showcase Final (Exhibition)" : "Showcase Tiebreak Final" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            event.club_a_name,
            " ",
            showcaseMatch.score_a,
            " \u2013 ",
            showcaseMatch.score_b,
            " ",
            event.club_b_name
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            (showcaseMatch.club_a_names || []).join(" & "),
            " vs ",
            (showcaseMatch.club_b_names || []).join(" & ")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
            "First to ",
            showcaseMatch.showcase_target_points || 11,
            " \xB7 win by ",
            showcaseMatch.showcase_win_by || 1,
            showcaseMatch.showcase_mode === "exhibition" ? " \xB7 Interclub result unchanged" : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-winner", children: [
          "Final result: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: winner })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "rhpp-signoff", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Event Details" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Date:" }),
          " ",
          fmtDate(tournament?.start_date)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Venue:" }),
          " ",
          tournament?.location || "________________"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Format:" }),
          " ",
          courtsCount,
          " courts \xB7 ",
          roundsCount,
          " rounds"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Showcase:" }),
          " Included / Not included"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Sign Off" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "We confirm that the above result is correct." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          event.club_a_name,
          " Captain:",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          event.club_b_name,
          " Captain:",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          "Host:",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          "Date:",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
  ] });
}
function InterclubPrintPack({ event, tournament, matches = [], participants = [], score, overallScore, showcaseMatch }) {
  if (!event) return null;
  const roundsCount = Math.max(Number(event.planned_rounds || 0), ...matches.filter((m) => !m.is_showcase && Number(m.round_number || 0) <= Number(event.planned_rounds || 9999)).map((m) => Number(m.round_number || 0)), 1);
  const rounds = Array.from({ length: roundsCount }, (_, i) => i + 1);
  const playable = matches.filter((m) => !m.is_showcase && m.status !== "not_played" && Number(m.round_number || 0) <= roundsCount);
  const maxCourt = Math.max(Number(event.courts || 0), ...playable.map((m) => Number(m.court_number || 0)), 1);
  const courts = Array.from({ length: maxCourt }, (_, i) => i + 1);
  const lastScheduledById = {};
  playable.forEach((m) => {
    [...m.club_a_participant_ids || [], ...m.club_b_participant_ids || []].forEach((id) => {
      lastScheduledById[id] = Math.max(Number(lastScheduledById[id] || 0), Number(m.round_number || 0));
    });
  });
  const scorePages = chunk(rounds, 12);
  const schedulePages = chunk(rounds, 2);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rhpp-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
      @page { size:A4 portrait; margin:0; }
      @media print {
        html,body,#root { margin:0!important; padding:0!important; background:#fff!important; }
        body { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
        .rhpp-page { break-after:page!important; page-break-after:always!important; }
        .rhpp-page:last-child { break-after:auto!important; page-break-after:auto!important; }
      }
      .rhpp-root{font-family:Arial,Helvetica,sans-serif;color:${NAVY};background:#fff}
      .rhpp-page{position:relative;width:210mm;height:297mm;box-sizing:border-box;padding:6mm 7mm 18mm;background:#fff;color:${NAVY};overflow:hidden;border:.25mm solid #d7e6f2}
      .rhpp-brand{display:flex;align-items:center;gap:2mm;min-width:0}.rhpp-brand img{width:13mm;height:13mm;object-fit:contain;display:block}.rhpp-brand-type{min-width:0}.rhpp-wordmark{font-size:19pt;line-height:.9;font-weight:900;letter-spacing:-.04em;color:#07184c;white-space:nowrap}.rhpp-wordmark b{color:${GREEN}}.rhpp-strap{font-size:4.8pt;font-weight:800;letter-spacing:.22em;margin-top:1.2mm;white-space:nowrap}.rhpp-strap i{font-style:normal;color:${GREEN}}.rhpp-brand-small img{width:9mm;height:9mm}.rhpp-brand-small .rhpp-wordmark{font-size:13pt}.rhpp-brand-small .rhpp-strap{font-size:3.5pt;margin-top:.7mm;letter-spacing:.18em}
      .rhpp-header{height:27mm;display:grid;grid-template-columns:56mm 1fr 31mm;align-items:start;gap:2mm;border-bottom:.45mm solid ${GREEN};padding:1mm 2mm 2.2mm;box-sizing:border-box;margin-bottom:2mm}.rhpp-header-schedule{grid-template-columns:60mm 1fr}.rhpp-header-schedule .rhpp-heading{text-align:right;padding-right:1mm}.rhpp-heading{text-align:center}.rhpp-kicker{font-size:10pt;font-weight:900;letter-spacing:.04em;line-height:1}.rhpp-heading h1{font-size:13pt;line-height:1.02;margin:.7mm 0 0;font-weight:900}.rhpp-heading h2{font-size:9.2pt;line-height:1.05;margin:1mm 0 0;color:#0a64a8;font-weight:800}.rhpp-heading p,.rhpp-score-heading p{font-size:5.8pt;margin:1.2mm 0 0;color:#294b6d;font-weight:600}.rhpp-heading p span,.rhpp-score-heading p span{margin:0 1mm}.rhpp-script-tag{text-align:center;font-family:cursive;font-style:italic;font-weight:800;font-size:9pt;line-height:.9;color:#063c79;padding-top:1mm;transform:rotate(-5deg)}.rhpp-script-tag span{display:block;width:19mm;border-bottom:1.2mm solid #69b92f;transform:rotate(-8deg);margin:1.2mm auto 0}
      .rhpp-score-header{height:31mm;display:grid;grid-template-columns:43mm 1fr 43mm;gap:2mm;align-items:center;border-bottom:.35mm solid #b9d3e4;margin-bottom:2mm}.rhpp-score-heading{text-align:center}.rhpp-score-heading .rhpp-brand{justify-content:center;margin-bottom:.8mm}.rhpp-score-heading .rhpp-kicker{font-size:9pt}.rhpp-score-heading h1{font-size:13pt;margin:.6mm 0 0;line-height:1}.rhpp-score-heading h2{font-size:8pt;color:#0a64a8;margin:.8mm 0 0}.rhpp-score-team{display:flex;align-items:center;gap:2mm;font-size:8.5pt;font-weight:900;line-height:1.05}.rhpp-score-team img{width:15mm;height:15mm;object-fit:contain;border-radius:50%;background:#fff}.rhpp-score-team-b{justify-content:flex-end;text-align:right}
      .rhpp-footer{position:absolute;left:7mm;right:7mm;bottom:4mm;height:12mm}.rhpp-wave{position:absolute;left:0;right:0;top:-1mm;width:100%;height:7mm}.rhpp-footer-row{position:absolute;left:0;right:0;bottom:0;height:8mm;display:flex;align-items:flex-end;gap:2mm}.rhpp-footer-source{font-size:4.6pt;color:#35607d}.rhpp-footer-copy{margin-left:auto;font-size:4.6pt;color:#315579;white-space:nowrap}.rhpp-footer-copy strong{color:#07184c}.rhpp-footer-copy strong span{color:${GREEN}}.rhpp-footer-copy i{font-style:normal;margin:0 .7mm}
      .rhpp-score-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:5pt}.rhpp-score-table th{height:7mm;background:${BLUE};color:white;padding:.5mm;border:.25mm solid #d7e7f2;font-size:6.4pt}.rhpp-score-table td{border:.25mm solid #88abc4;height:13.15mm;padding:.35mm .5mm;vertical-align:middle;box-sizing:border-box}.rhpp-round-col{width:10mm}.rhpp-round-number{text-align:center;font-size:11pt;font-weight:900;background:#eef8fd}.rhpp-score-cell{text-align:center}.rhpp-score-name{font-size:4.65pt;line-height:1.05;height:3.5mm;overflow:hidden;display:flex;align-items:center;justify-content:center}.rhpp-score-boxes{height:4.6mm;display:flex;justify-content:center;align-items:center;gap:1.2mm}.rhpp-score-boxes span{width:6.4mm;height:5.1mm;border:.35mm solid #52728d;border-radius:.7mm;display:inline-block}.rhpp-score-boxes b{font-size:5.5pt}.rhpp-empty{color:#8399ab;font-style:italic}
      .rhpp-score-bottom{display:grid;grid-template-columns:1.25fr .95fr;gap:2.2mm;margin-top:2.3mm}.rhpp-notes-box,.rhpp-reminders{height:25mm;background:#f1f8fc;border-radius:2mm;padding:2mm;box-sizing:border-box;font-size:5.7pt}.rhpp-notes-box strong,.rhpp-reminders strong{font-size:6.3pt}.rhpp-notes-box i{display:block;border-bottom:.25mm solid #567998;height:4.4mm}.rhpp-reminders ul{margin:1.4mm 0 0;padding-left:4mm;line-height:1.5}
      .rhpp-schedule-stack{display:grid;gap:2.2mm}.rhpp-round-block{border:.25mm solid #8ab5d4;border-radius:1mm;overflow:hidden;background:#fff}.rhpp-round-band{height:7mm;background:linear-gradient(90deg,#07558d,#0d4d82);color:#fff;font-size:11pt;font-weight:900;display:flex;align-items:center;padding:0 3mm}.rhpp-court-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.4mm;padding:1.5mm}.rhpp-court-card{border:.3mm solid #63a6d2;border-radius:.6mm;overflow:hidden}.rhpp-court-head{height:5.3mm;background:#d8effc;font-size:7.5pt;font-weight:900;display:flex;align-items:center;justify-content:center}.rhpp-court-body{height:13.8mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.5mm 1mm;box-sizing:border-box;font-size:5.7pt;font-weight:700;line-height:1.12}.rhpp-court-body em{font-style:normal;font-size:5pt;color:#405b72;margin:.3mm 0}
      .rhpp-rest-wrap{margin:0 1.5mm 1.5mm;border:.25mm solid #8ab5d4}.rhpp-rest-title{height:5.5mm;background:#d8effc;font-size:7.3pt;font-weight:900;display:flex;align-items:center;padding:0 2mm}.rhpp-rest-heads,.rhpp-rest-row{display:grid;grid-template-columns:1fr 1fr}.rhpp-rest-heads strong{height:5mm;background:#dff2c9;border:.2mm solid #7eb5d6;display:flex;align-items:center;justify-content:center;font-size:6.2pt}.rhpp-rest-row span{height:3.65mm;border:.2mm solid #bad0df;border-top:0;padding:0 2mm;display:flex;align-items:center;font-size:5.25pt}.rhpp-break{height:6.5mm;margin:1.5mm;background:#dff2c9;color:#073866;font-size:7.2pt;font-weight:900;display:flex;align-items:center;justify-content:center}.rhpp-page-number{position:absolute;right:7mm;bottom:13mm;font-size:4.5pt;color:#7890a3}
      .rhpp-roster-layout{display:grid;grid-template-columns:1fr 1fr 56mm;gap:2.5mm}.rhpp-roster-title{height:12mm;border:.3mm solid;border-radius:2mm 2mm 0 0;display:flex;align-items:center;gap:2mm;padding:1mm 2mm;box-sizing:border-box;font-size:8.5pt}.rhpp-roster-title img{width:9mm;height:9mm;object-fit:contain;border-radius:50%;background:#fff}.rhpp-roster table{width:100%;border-collapse:collapse;font-size:5.4pt}.rhpp-roster th{height:6mm;background:${BLUE};color:white;padding:.7mm}.rhpp-roster td{border:.22mm solid #9eb8cb;height:5.7mm;padding:.4mm .8mm}.rhpp-roster td:first-child{width:8mm;text-align:center;font-weight:800}.rhpp-roster th:nth-child(3),.rhpp-roster td:nth-child(3){width:12mm;text-align:center}.rhpp-roster th:last-child{width:18mm}.rhpp-reserve-title{height:7mm;background:#dde9f0;padding:1.5mm 2mm;box-sizing:border-box;font-size:7pt;font-weight:900;margin-top:2mm;border-radius:1mm 1mm 0 0}.rhpp-reserves td{height:5.4mm!important}.rhpp-info-panel{background:#eff8fd;border-radius:2mm;padding:2.5mm;font-size:5.8pt}.rhpp-info-panel h3{font-size:8pt;margin:0 0 2mm}.rhpp-info-panel dl{margin:0}.rhpp-info-panel dt{font-size:6pt;font-weight:900;margin-top:2.7mm}.rhpp-info-panel dd{margin:.4mm 0 0;line-height:1.3}.rhpp-day-notes{margin-top:5mm}.rhpp-day-notes i{display:block;border-bottom:.25mm solid #7894aa;height:8mm}
      .rhpp-rule-grid{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm}.rhpp-rule{display:grid;grid-template-columns:10mm 1fr;gap:2mm;border:.3mm solid #bdd7e8;border-radius:2mm;padding:3mm;min-height:49mm;box-sizing:border-box}.rhpp-rule-number{width:8mm;height:8mm;border-radius:50%;background:${NAVY};color:#fff;display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:900}.rhpp-rule h3{font-size:8pt;margin:0 0 2mm}.rhpp-rule ul{padding-left:4mm;margin:0;font-size:6.6pt;line-height:1.55}.rhpp-rule-grid .rhpp-rule:nth-child(5){grid-column:2}.rhpp-most-important{height:22mm;margin-top:3mm;border:.3mm solid #9fd3b3;background:#eef9ef;border-radius:2mm;display:flex;align-items:center;justify-content:center;gap:5mm}.rhpp-most-important strong{color:#098844;font-size:8pt}.rhpp-most-important span{font-size:7pt;font-weight:700}
      .rhpp-result-layout{display:grid;grid-template-columns:1fr 57mm;gap:3mm}.rhpp-team-score-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.rhpp-team-score-grid>div{height:59mm;border:.35mm solid #bfd5e4;border-top:1.2mm solid;border-radius:2mm;padding:3mm;text-align:center;box-sizing:border-box;background:#f5fbff}.rhpp-team-score-grid>div.b{background:#fff7f7}.rhpp-team-score-grid img{width:15mm;height:15mm;object-fit:contain;display:block;margin:0 auto 1mm}.rhpp-team-score-grid strong{display:block;font-size:8.5pt}.rhpp-team-score-grid b{display:block;font-size:31pt;line-height:1;margin:2mm 0}.rhpp-team-score-grid small{font-size:6pt}.rhpp-result-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm;margin-top:2.5mm}.rhpp-result-stats>div{border:.25mm solid #b7cad8;border-radius:1.5mm;padding:2mm;text-align:center}.rhpp-result-stats b{display:block;font-size:13pt}.rhpp-result-stats span{display:block;font-size:5.5pt}.rhpp-showcase-result{margin-top:3mm;background:#eff9ef;border:.3mm solid #aad7b1;border-radius:2mm;padding:3mm;text-align:center}.rhpp-showcase-result>*{display:block}.rhpp-showcase-result strong{font-size:7pt;color:#087e42}.rhpp-showcase-result b{font-size:8.5pt;margin-top:1mm}.rhpp-showcase-result span,.rhpp-showcase-result small{font-size:5.6pt;margin-top:.7mm}.rhpp-winner{margin-top:4mm;text-align:center;font-size:9pt}.rhpp-signoff{background:#eff8fd;border-radius:2mm;padding:3mm;font-size:6pt}.rhpp-signoff h3{font-size:8pt;margin:0 0 2mm}.rhpp-signoff h3:not(:first-child){margin-top:6mm}.rhpp-signoff p{margin:1.5mm 0}.rhpp-signoff label{display:grid;grid-template-columns:auto 1fr;gap:2mm;margin-top:5mm}.rhpp-signoff i{border-bottom:.25mm solid #7894aa}
    ` }),
    scorePages.map((rs, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MasterScorePage, { event, tournament, matches: playable, rounds: rs, courts }, `score-${i}`)),
    schedulePages.map((rs, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MasterSchedulePage, { event, tournament, matches: playable, participants, rounds: rs, lastScheduledById, pageIndex: i, totalPages: schedulePages.length }, `schedule-${i}`)),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamRosterPage, { event, tournament, participants, roundsCount, courtsCount: courts.length }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefingPage, { event, tournament, roundsCount, courtsCount: courts.length }),
    ["completed", "archived"].includes(event.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinalResultPage, { event, tournament, score, overallScore, showcaseMatch, courtsCount: courts.length, roundsCount })
  ] });
}
