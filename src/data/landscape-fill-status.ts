import {
  INITIAL_NODES,
  MODEL_META_FIELDS,
  type ModelMeta,
  type ModelNode,
} from "./landscape";

export type FieldCoverage = {
  field: keyof ModelMeta;
  filled: number;
  total: number;
  pct: number;
};

const isFilled = (v: unknown) =>
  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "";

export function getModelNodes(): ModelNode[] {
  return INITIAL_NODES.filter((n): n is ModelNode => n.type === "node");
}

export function getFieldCoverage(): FieldCoverage[] {
  const models = getModelNodes();
  const total = models.length;
  return MODEL_META_FIELDS.map((field) => {
    const filled = models.reduce(
      (acc, m) => acc + (isFilled((m as ModelMeta)[field]) ? 1 : 0),
      0,
    );
    return {
      field,
      filled,
      total,
      pct: total === 0 ? 0 : Math.round((filled / total) * 100),
    };
  });
}

export function getModelsMissingField(field: keyof ModelMeta): ModelNode[] {
  return getModelNodes().filter(
    (m) => !isFilled((m as ModelMeta)[field]),
  );
}

export function getOverallFillPct(): number {
  const coverage = getFieldCoverage();
  if (coverage.length === 0) return 0;
  const avg =
    coverage.reduce((acc, c) => acc + c.pct, 0) / coverage.length;
  return Math.round(avg);
}
