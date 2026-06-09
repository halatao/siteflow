import { describe, expect, it } from "vitest";
import {
  blockPropSchemas,
  componentDefinitions,
  componentRoles,
  websiteArchetypeIds,
  websiteArchetypes,
} from "../../src/catalog/index.js";

describe("component catalog", () => {
  it("defines every listed website archetype", () => {
    expect(Object.keys(websiteArchetypes).sort()).toEqual([...websiteArchetypeIds].sort());
  });

  it("references only known components from archetypes", () => {
    const componentIds = new Set(Object.keys(componentDefinitions));
    const missingReferences = Object.values(websiteArchetypes).flatMap((archetype) =>
      [...archetype.requiredComponents, ...archetype.optionalComponents]
        .filter((componentId) => !componentIds.has(componentId))
        .map((componentId) => `${archetype.id}:${componentId}`),
    );

    expect(missingReferences).toEqual([]);
  });

  it("uses only known archetypes and roles from component definitions", () => {
    const archetypeIds = new Set(websiteArchetypeIds);
    const roles = new Set(componentRoles);

    const invalidDefinitions = Object.values(componentDefinitions).flatMap((definition) => {
      const issues: string[] = [];

      if (!roles.has(definition.role)) {
        issues.push(`${definition.id}:role:${definition.role}`);
      }

      for (const archetypeId of definition.suitableFor) {
        if (!archetypeIds.has(archetypeId)) {
          issues.push(`${definition.id}:archetype:${archetypeId}`);
        }
      }

      return issues;
    });

    expect(invalidDefinitions).toEqual([]);
  });

  it("uses valid default variants", () => {
    const invalidDefaults = Object.values(componentDefinitions)
      .filter((definition) => !definition.variants.includes(definition.defaultVariant))
      .map((definition) => definition.id);

    expect(invalidDefaults).toEqual([]);
  });

  it("marks every block prop schema as a known component", () => {
    const componentIds = new Set(Object.keys(componentDefinitions));
    const unknownSchemas = Object.keys(blockPropSchemas).filter((componentId) => !componentIds.has(componentId));

    expect(unknownSchemas).toEqual([]);
  });
});
