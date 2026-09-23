# Audit: http://localhost:6901

| Check | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| R1 | FAIL | pass | FAIL | FAIL | FAIL | FAIL |
| R2 | FAIL | — | — | — | FAIL | — |
| R3 | FAIL | — | — | — | — | — |
| R4 | FAIL | FAIL | — | — | — | — |
| R5 | — | FAIL | — | FAIL | — | — |
| R6 | FAIL | — | — | — | — | — |
| R7 | FAIL | — | — | — | FAIL | — |
| R8 | FAIL | FAIL | FAIL | FAIL | pass | pass |
| R9 | pass | — | — | — | pass | — |
| R10 | pass | — | FAIL | — | — | — |

| Width | Before scroll (MB, requests) | Full scroll (MB, requests) | Failed bodies |
|---|---|---|---|
| 390 | 21.23, 85 | 21.24, 97 | 3 |
| 768 | 21.23, 85 | 21.24, 96 | 3 |
| 1024 | 21.14, 85 | 21.15, 97 | 3 |
| 1280 | 21.23, 85 | 21.24, 99 | 0 |
| 1440 | 21.23, 85 | 21.24, 99 | 0 |
| 1920 | 21.23, 85 | 21.24, 99 | 3 |
