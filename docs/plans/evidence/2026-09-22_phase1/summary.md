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
| 390 | 21.22, 86 | 21.23, 95 | 3 |
| 768 | 21.22, 85 | 21.23, 96 | 3 |
| 1024 | 21.12, 85 | 21.14, 97 | 3 |
| 1280 | 21.22, 85 | 21.23, 99 | 3 |
| 1440 | 21.22, 85 | 21.23, 99 | 3 |
| 1920 | 21.22, 85 | 21.23, 99 | 3 |
