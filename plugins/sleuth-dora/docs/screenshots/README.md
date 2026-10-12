# Screenshots

The pictures used in the plugin documentation.

| File                           | Shows                                                      |
| ------------------------------ | ---------------------------------------------------------- |
| `executive.png`                | The executive screen over the last 28 days                 |
| `executive-no-deployments.png` | The executive screen for a period with no deployments      |
| `team.png`                     | The team screen with two teams                             |
| `team-no-deployments.png`      | The team screen when the teams deployed nothing            |
| `component.png`                | The Sleuth tab on a component                              |
| `component-not-mapped.png`     | The Sleuth tab on a component that is not linked to Sleuth |

They are taken by the browser tests, which show fixed figures recorded from Sleuth, so every picture
uses the same numbers. To retake them after a change to the screens:

```bash
SLEUTH_E2E_SCREENSHOTS=/some/folder yarn test:e2e
```

Then copy the pictures from that folder over the ones here.
