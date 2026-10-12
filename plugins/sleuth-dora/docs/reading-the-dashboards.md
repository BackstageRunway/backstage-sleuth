# Reading the dashboards

This guide explains what each number, arrow, colour and badge on the Sleuth screens means. You do not
need to know how the plugin works to follow it.

## The four metrics

| Metric                   | In plain words                                                          | Better is |
| ------------------------ | ----------------------------------------------------------------------- | --------- |
| **Deployment frequency** | How many times a day we release to production, on average               | Higher    |
| **Lead time**            | The average time from a commit to that commit running in production     | Lower     |
| **Failure rate**         | The share of releases that caused a problem in production               | Lower     |
| **MTTR**                 | When something breaks in production, the average time until it is fixed | Lower     |

Sleuth measures all four. The screens show Sleuth's figures as they are, so they match what you see in
Sleuth for the same days.

## The period you are looking at

The buttons at the top choose the period: the last 7, 14, 28 or 90 days. Every screen starts at 28 days
unless your Backstage administrator changed the default for the team screen.

Two things are worth knowing:

- **Today counts.** "Last 7 days" is today and the six days before it.
- **Days are counted in UTC.** If you are far from UTC, the edge of the period can be a few hours off
  from your own midnight.

Figures are kept for five minutes before the plugin asks Sleuth again, so a release made a moment ago
may take a few minutes to appear.

## How durations are written

Lead time and MTTR are shown with their two largest units, rounded down: `45m`, `1h 42m`, `17d 23h`.
So `2h 48m` means "at least 2 hours 48 minutes, and less than 2 hours 49 minutes".

## The arrows: has it got better or worse?

Next to most numbers is an arrow and a percentage. It compares the period you picked with **the period
of the same length just before it**. For the last 28 days, that is the 28 days before those.

- The **direction** of the arrow is simply whether the number went up or down.
- The **colour** tells you whether that is good news:

| Colour | Meaning                               |
| ------ | ------------------------------------- |
| Green  | Better than the previous period       |
| Red    | Worse than the previous period        |
| Grey   | No change, or nothing to compare with |

Because lower is better for three of the metrics, a _downward green_ arrow is normal: lead time falling
by 13% is an improvement. For deployment frequency it is the other way round: up is green.

Sometimes there is a word where you would expect a percentage:

| You see   | It means                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `new`     | There were no deployments in the previous period, and now there are                                                              |
| `from 0%` | The failure rate was zero before and is not zero now                                                                             |
| `from 0m` | There was nothing to recover from before, and now there was                                                                      |
| `n/a`     | There is nothing to compare with. For lead time and failure rate this appears when the previous period had no deployments at all |
| `>999%`   | The change is larger than 999%                                                                                                   |

## "No deployments"

When nothing was released in the period, the screens say so instead of showing zeros. A lead time of
zero and a failure rate of 0% would look like a perfect result, when really there is nothing to measure.

- On the executive and component screens you get a sentence: "No deployments recorded in Sleuth…".
- On the team screen, the team's card gets a grey **No deployments** badge and dashes in place of lead
  time, failure rate and MTTR.

A dash (`–`) anywhere means "nothing to measure here", never zero.

## The executive screen

![Executive screen](screenshots/executive.png)

**The four cards at the top** each show one metric for the whole organisation over the period, the
change against the previous period, and a small line. The line shows how the metric moved _inside_ the
period, which is cut into four equal parts. The card's colour follows the change against the previous
period, not the shape of the line.

The first card is titled "Total Deployments" and shows deployments per day.

**"Trend Over Selected Range"** shows the same four parts as bars, one chart per metric. Each part is
labelled with the day it starts. Under each chart are the exact values, and the unit the bars use
(`/day`, `%`, or `m`, `h` or `d` for minutes, hours or days). A part with no deployments shows a dash for
lead time, failure rate and MTTR.

## The team screen

![Team screen](screenshots/team.png)

You see the teams you belong to. Use **Select Team** to look at one of them.

**The four rings** compare the teams. Each team has a colour, shown in the legend below. The figure in
the middle of a ring is the **average across the teams shown**. Teams that deployed nothing are left out
of the averages for lead time, MTTR and failure rate, because they have no value to average.

The figures are averaged and not added up on purpose: one person can belong to several teams, so the
same deployment can count for more than one team.

**The cards** show each team's four metrics and a badge:

| Badge              | When a team gets it                                                                 |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Declining**      | Its failure rate or its lead time got worse by 5% or more                           |
| **Improving**      | It deploys at least 5% more often, and neither failure rate nor lead time got worse |
| **Stable**         | Neither of the above, or the previous period had no deployments to compare with     |
| **No deployments** | It released nothing in the period                                                   |

A declining team is listed first, outlined in red and marked **Take Action**. MTTR is shown on the card
but does not affect the badge.

## The Sleuth tab on a component

![Sleuth tab on a component](screenshots/component.png)

**The four cards** show the metric, the change against the previous period, the target for the top
rating, and one to three short remarks:

- A remark from **Sleuth itself**, when Sleuth has one, such as "Your failure rate is higher than your
  previous period by 33%". It comes first.
- How the current value **rates**, for example "Meeting elite lead time target" or "Consider improving
  test coverage".
- A line saying the metric **is improving**, when it is.

A green tick is good news, an amber triangle is a warning, and a red mark needs attention.

**MTTR is marked "whole project".** Sleuth measures recovery time for a project and its environment, not
for a single code deployment. The MTTR on a component's tab is therefore the same for every component
in that project.

**"Detailed DORA Metrics"** places each metric on a scale from Low to Elite. The green tick is where the
metric is now. A grey tick is where it was in the previous period, so you can see if it moved up or
down a level. The trophy lights up at Elite.

### What the levels mean

|                          | Elite               | High                 | Medium                | Low                    |
| ------------------------ | ------------------- | -------------------- | --------------------- | ---------------------- |
| **Deployment frequency** | At least once a day | At least once a week | At least once a month | Less than once a month |
| **Lead time**            | Up to one day       | Up to one week       | Up to 30 days         | More than 30 days      |
| **Failure rate**         | Up to 5%            | Up to 10%            | Up to 15%             | More than 15%          |
| **MTTR**                 | Up to one hour      | Up to one day        | Up to one week        | More than one week     |

These levels are set by the plugin, following the usual DORA bands. Sleuth lets an organisation define
its own levels; if yours has, the level shown here can differ from the one in Sleuth even though the
numbers are the same.

## Why a number might differ from Sleuth

The figures are Sleuth's own, so they should agree. When they do not, it is usually one of these:

- **A different period.** Check that Sleuth is set to the same number of days, and remember the plugin
  counts days in UTC.
- **A different scope.** The component tab shows one code deployment in one environment. Sleuth's
  project page shows the whole project unless you filter it.
- **The five-minute delay** described above.
- **Rounding of small numbers.** Sleuth reports deployments per day to two decimals. The plugin works
  out the change in frequency from the actual number of deployments, which is more exact for services
  that are released rarely.
