import { allure } from 'allure-playwright';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
export type Layer = 'e2e';

export interface FunctionalAllureMeta {
  layer: Layer;
  suite: string;
  subSuite: string;
  component: string;
  severity: Severity;
  owner?: string;
}

export interface TestDescription {
  whatIsTested: string;
  testSteps: string[];
}

export function setFunctionalAllureMeta(meta: FunctionalAllureMeta): void {
  allure.label('layer', meta.layer);
  allure.label('suite', meta.suite);
  allure.label('subSuite', meta.subSuite);
  allure.label('feature', meta.component);
  allure.severity(meta.severity);
  allure.owner(meta.owner ?? 'or');
}

export function addTestDescription(desc: TestDescription): void {
  const stepsBlock = desc.testSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  allure.description(`**What is tested:** ${desc.whatIsTested}\n\n**Steps:**\n${stepsBlock}`);
}

export function addTag(tag: string): void {
  allure.tag(tag);
}

export function addLink(label: string, url: string): void {
  allure.link(url, label);
}
