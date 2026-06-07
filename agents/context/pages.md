# POM Registry

This file is the source of truth for every Page Object in the project. Agents read it before deciding whether to add or modify a POM.

## Currently registered POMs

_No POMs registered yet. The `pomWriterAgent` adds entries here as POMs are created._

## Format for new entries

```
### PageName

**File:** `pages/PageName.ts`
**Fixture name:** `pageName`
**Purpose:** What user-facing region this POM represents.

#### Locators
- `someLocator` — role/text/testid description

#### Methods
- `async someAction(arg: T): Promise<void>` — what it does
- `async someGetter(): Promise<string>` — what it returns
```
