# CompuYa

## 🌿 Estrategia de Ramas (Branching)

Para mantener el orden y asegurar que la rama principal siempre sea estable, utilizamos un flujo de trabajo simplificado:

* **`main`**: Rama principal. Contiene el código estable, probado y listo para entregas. **No se pushea directamente a esta rama.**
* **`feature/<nombre-descriptivo>`**: Ramas temporales creadas a partir de `main` para desarrollar nuevas funcionalidades o tests (ej: `feature/alta-envios`).
* **`fix/<nombre-descriptivo>`**: Ramas para solucionar errores.

**Flujo de trabajo:** Se crea una rama `feature/`, se realizan los commits, se sube al repositorio remoto y se abre un **Pull Request (PR)** hacia `main`.

---

## 💬 Convención de Commits

Utilizamos Conventional Commits para tener un historial de cambios legible y trazable:

* `feat:` Para agregar una nueva funcionalidad.
* `test:` Para añadir o corregir pruebas automatizadas.
* `fix:` Para solucionar un error en el código.
* `docs:` Para cambios exclusivos en la documentación.
* `refactor:` Para reestructurar el código sin cambiar su comportamiento.

