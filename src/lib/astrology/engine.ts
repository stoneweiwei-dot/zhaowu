/**
 * Canonical Western astrology engine surface.
 *
 * The implementation remains in ../western-astrology/engine for backwards
 * compatibility with existing imports and tests. New runtime code should
 * import from @/lib/astrology/engine so all six specialist engines are
 * discoverable directly under src/lib.
 */
export * from "../western-astrology/engine";
