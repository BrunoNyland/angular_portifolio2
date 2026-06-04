# Padrões de automação que sobrevivem ao tempo

Por que a maioria dos seus scripts quebram em 6 meses — e como estruturá-los para durar anos sem manutenção.

> ⚠️ Conteúdo de exemplo (formatação). Substitua pelo texto real do post.

## O problema dos scripts "throwaway"

A maioria dos scripts nasce como solução pontual e vira dependência crítica sem
nunca ter sido projetada para isso. Alguns princípios que ajudam:

- **Entrada e saída explícitas** — nada de caminhos fixos espalhados pelo código.
- **Falhe alto e cedo** — valide cedo, registre o contexto, não engula exceções.
- **Idempotência** — rodar duas vezes não pode corromper o estado.

## Um exemplo

```python
from pathlib import Path

def load_rows(path: Path) -> list[dict]:
    """Lê um CSV validando o cabeçalho antes de processar."""
    if not path.exists():
        raise FileNotFoundError(f"arquivo não encontrado: {path}")
    import csv
    with path.open(encoding="utf-8") as fh:
        return list(csv.DictReader(fh))
```

Estruture o código pensando em quem vai lê-lo em seis meses — provavelmente você.
