# Automation patterns that survive time

Why most scripts break in 6 months — and how to structure them so they last for years untouched.

> ⚠️ Sample content (formatting). Replace with the real post text.

## The "throwaway" script problem

Most scripts start as a one-off fix and quietly become a critical dependency
without ever being designed for it. A few principles that help:

- **Explicit input and output** — no hardcoded paths scattered around.
- **Fail loud and early** — validate up front, log the context, never swallow exceptions.
- **Idempotency** — running twice must not corrupt state.

## An example

```python
from pathlib import Path

def load_rows(path: Path) -> list[dict]:
    """Read a CSV, validating the header before processing."""
    if not path.exists():
        raise FileNotFoundError(f"file not found: {path}")
    import csv
    with path.open(encoding="utf-8") as fh:
        return list(csv.DictReader(fh))
```

Write code for whoever reads it in six months — probably you.
