/**
 * Rule selector. Populated entirely from the `rules` list passed in (which
 * traces back to simulation/rules.js) — no rule names or descriptions are
 * hardcoded here, so adding a new automaton to rules.js is enough to make
 * it appear in this dropdown.
 */
export default function RuleControls({ ruleId, onRuleChange, rules }) {
  const selectedRule = rules.find((rule) => rule.id === ruleId) ?? rules[0];

  return (
    <section className="control-panel" aria-label="Rule selection">
      <label htmlFor="rule-select" className="control-label">
        Rule
      </label>
      <select id="rule-select" value={ruleId} onChange={(event) => onRuleChange(event.target.value)}>
        {rules.map((rule) => (
          <option key={rule.id} value={rule.id}>
            {rule.name}
          </option>
        ))}
      </select>

      {selectedRule && <p className="control-panel__description">{selectedRule.description}</p>}
    </section>
  );
}
