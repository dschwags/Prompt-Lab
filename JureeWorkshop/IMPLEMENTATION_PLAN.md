# JUREE PERSONA SYSTEM - IMPLEMENTATION PLAN FOR CLACKY

## 📦 WHAT YOU HAVE

8 production-ready files totaling ~2,500 lines of code:

1. **personas.js** - 16 persona presets with full metadata
2. **industryTemplates.js** - 10 pre-configured review boards  
3. **modelPricing.js** - Pricing data for 14+ AI models
4. **costEstimator.js** - Cost estimation before running
5. **queryAnalyzer.js** - Smart query analysis & suggestions
6. **synthesisStrategies.js** - 5 synthesis modes with templates
7. **personaStore.js** - Zustand state management (requires: npm install zustand)
8. **sessionExport.js** - Enhanced export with AAR tracking

## 🎯 3-DAY IMPLEMENTATION ROADMAP

### DAY 1: CORE FOUNDATION (6 hours)

**Morning (3 hours)**

1. **File Setup** (30 min)
```bash
# In your Prompt Lab project
mkdir -p src/data src/utils src/state

# Copy files
cp personas.js src/data/
cp industryTemplates.js src/data/
cp modelPricing.js src/data/
cp synthesisStrategies.js src/data/
cp costEstimator.js src/utils/
cp queryAnalyzer.js src/utils/
cp personaStore.js src/state/
cp sessionExport.js src/utils/
```

2. **Install Dependencies** (15 min)
```bash
npm install zustand
```

3. **Test Imports** (45 min)
Create test file to verify everything works:

```javascript
// test-imports.js
import { PERSONA_PRESETS } from './src/data/personas'
import { INDUSTRY_TEMPLATES } from './src/data/industryTemplates'
import { MODEL_PRICING } from './src/data/modelPricing'

console.log('✅ Personas loaded:', Object.keys(PERSONA_PRESETS).length)
console.log('✅ Templates loaded:', Object.keys(INDUSTRY_TEMPLATES).length)
console.log('✅ Models loaded:', Object.keys(MODEL_PRICING).length)
```

4. **Create PersonaDropdown Component** (90 min)
```jsx
// src/components/PersonaDropdown.jsx
import { PERSONA_PRESETS, PERSONA_CATEGORIES } from '../data/personas'

export function PersonaDropdown({ value, onChange }) {
  const categories = Object.values(PERSONA_CATEGORIES)
  
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">No Persona</option>
      {categories.map(cat => (
        <optgroup key={cat} label={cat.toUpperCase()}>
          {Object.values(PERSONA_PRESETS)
            .filter(p => p.category === cat)
            .map(p => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  )
}
```

**Afternoon (3 hours)**

5. **Wire Up Persona Store** (60 min)
```javascript
// In your main component
import { usePersonaStore } from './state/personaStore'

function YourComponent() {
  const { 
    models, 
    setModelPersona,
    getEffectivePersona 
  } = usePersonaStore()
  
  // Use in your existing model list
}
```

6. **Update Prompt Builder** (90 min)
```javascript
// src/utils/promptBuilder.js
import { getPersona } from '../data/personas'
import { usePersonaStore } from '../state/personaStore'

export function buildPromptWithPersona(modelId, userQuery) {
  const store = usePersonaStore.getState()
  const effectivePersona = store.getEffectivePersona(modelId)
  
  let systemPrompt = null
  if (effectivePersona?.type === 'preset') {
    systemPrompt = effectivePersona.persona.instruction
  } else if (effectivePersona?.type === 'custom') {
    systemPrompt = effectivePersona.instruction
  }
  
  return {
    system: systemPrompt,
    user: userQuery,
  }
}
```

7. **Test Real API Call** (30 min)
Make a test call with a persona and verify it works differently than without.

✅ **DAY 1 CHECKPOINT**: Personas selected in UI, sent to API, produce different responses

---

### DAY 2: SMART FEATURES (6 hours)

**Morning (3 hours)**

8. **Add Cost Estimation** (90 min)
```jsx
// src/components/CostEstimate.jsx
import { estimateWorkshopCost, formatCost } from '../utils/costEstimator'
import { usePersonaStore } from '../state/personaStore'

export function CostEstimate({ query }) {
  const models = usePersonaStore(state => state.models)
  
  const estimate = estimateWorkshopCost(
    models.map(m => ({ 
      id: m.id, 
      persona: m.persona 
    })),
    query
  )
  
  if (!estimate) return null
  
  return (
    <div className="cost-estimate">
      <strong>Estimated Cost:</strong> {formatCost(estimate.totals.total)}
      {estimate.totals.total > 0.50 && (
        <div className="warning">⚠️ Cost exceeds $0.50</div>
      )}
    </div>
  )
}
```

9. **Add Query Analysis** (90 min)
```jsx
// src/components/SmartSuggestions.jsx
import { analyzeQuery } from '../utils/queryAnalyzer'
import { usePersonaStore } from '../state/personaStore'

export function SmartSuggestions({ query }) {
  const [analysis, setAnalysis] = useState(null)
  const setModelPersona = usePersonaStore(state => state.setModelPersona)
  
  useEffect(() => {
    if (query?.length > 20) {
      setAnalysis(analyzeQuery(query))
    }
  }, [query])
  
  if (!analysis || analysis.confidence < 0.3) return null
  
  return (
    <div className="suggestions">
      <p>💡 Detected: {analysis.queryTypes.join(', ')}</p>
      <div className="personas">
        {analysis.suggestedPersonas.slice(0, 3).map(({ personaId, persona }) => (
          <button 
            key={personaId}
            onClick={() => applyPersonaToFirstModel(personaId)}
          >
            {persona.icon} {persona.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Afternoon (3 hours)**

10. **Add Template Selector** (120 min)
```jsx
// src/components/TemplateSelector.jsx
import { INDUSTRY_TEMPLATES } from '../data/industryTemplates'
import { usePersonaStore } from '../state/personaStore'

export function TemplateSelector() {
  const applyTemplate = usePersonaStore(state => state.applyIndustryTemplate)
  const models = usePersonaStore(state => state.models)
  
  return (
    <div className="templates">
      <h3>Quick Start Templates</h3>
      {Object.values(INDUSTRY_TEMPLATES).map(template => (
        <button
          key={template.id}
          onClick={() => applyTemplate(template.id, models)}
          className="template-card"
        >
          <span>{template.icon}</span>
          <div>
            <strong>{template.name}</strong>
            <p>{template.description}</p>
            <small>~{formatCost(template.estimatedCost)}</small>
          </div>
        </button>
      ))}
    </div>
  )
}
```

11. **Add Synthesis Mode Selector** (60 min)
```jsx
// src/components/SynthesisSelector.jsx
import { SYNTHESIS_MODES } from '../data/synthesisStrategies'
import { usePersonaStore } from '../state/personaStore'

export function SynthesisSelector() {
  const mode = usePersonaStore(state => state.synthesisMode)
  const setMode = usePersonaStore(state => state.setSynthesisMode)
  
  return (
    <select value={mode} onChange={(e) => setMode(e.target.value)}>
      {Object.values(SYNTHESIS_MODES).map(m => (
        <option key={m.id} value={m.id}>
          {m.icon} {m.name}
        </option>
      ))}
    </select>
  )
}
```

✅ **DAY 2 CHECKPOINT**: Cost estimates show, query suggestions work, templates apply

---

### DAY 3: POLISH & EXPORT (4 hours)

12. **Add Enhanced Export** (90 min)
```jsx
// src/components/ExportButton.jsx
import { exportSessionToJSON } from '../utils/sessionExport'

export function ExportButton({ session }) {
  const handleExport = () => {
    const { blob, filename } = exportSessionToJSON(session)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <button onClick={handleExport}>
      📥 Export Session
    </button>
  )
}
```

13. **Track Performance Metrics** (60 min)
Update your result handler to include metrics for export:
```javascript
function handleModelResponse(modelId, response) {
  const result = {
    modelId,
    modelName: model.name,
    personaId: effectivePersona?.personaId,
    personaName: effectivePersona?.persona?.name,
    response: response.text,
    
    // Add these metrics
    responseTime: response.time,
    inputTokens: response.usage.input,
    outputTokens: response.usage.output,
    cost: calculateCost(...).totalCost,
  }
  
  // Store for export later
}
```

14. **Visual Polish** (90 min)
- Add persona icons/badges to model cards
- Add color coding by category
- Add loading states
- Add empty states

✅ **DAY 3 CHECKPOINT**: Full system operational, exports work, looks polished

---

## 🧪 TESTING CHECKLIST

### Critical Tests
- [ ] Select persona → Appears in UI
- [ ] Run workshop → Different responses based on persona
- [ ] Same model, different personas → Different results
- [ ] Apply template → Models configured correctly
- [ ] Cost estimate → Shows before running
- [ ] Query analysis → Suggestions appear
- [ ] Export → JSON includes all data

### Edge Cases
- [ ] No persona selected → Works with default
- [ ] Conflicting personas → Warning appears
- [ ] Empty query → Prevented
- [ ] Very expensive config → Warning before running
- [ ] Network error → Handled gracefully

---

## 🚨 COMMON ISSUES & SOLUTIONS

**Issue**: Zustand import error
**Solution**: `npm install zustand`

**Issue**: Personas not showing in dropdown
**Solution**: Check import path, verify PERSONA_PRESETS exports

**Issue**: Cost estimate always $0
**Solution**: Verify MODEL_PRICING has your model IDs, check token estimation

**Issue**: Query analyzer never suggests anything  
**Solution**: Check query length > 20 chars, verify regex patterns match

**Issue**: Template doesn't apply
**Solution**: Ensure models array populated in store

---

## 🎨 UI INTEGRATION EXAMPLES

### Add to Workshop Controls
```jsx
<div className="workshop-controls">
  <textarea value={query} onChange={e => setQuery(e.target.value)} />
  
  <SmartSuggestions query={query} />
  <CostEstimate query={query} />
  
  <button onClick={runWorkshop}>Run Workshop</button>
</div>
```

### Add to Model List
```jsx
{models.map(model => (
  <div key={model.id} className="model-card">
    <h3>{model.name}</h3>
    <PersonaDropdown 
      value={model.persona}
      onChange={(p) => setModelPersona(model.id, p)}
    />
  </div>
))}
```

### Add to Settings/Config Area
```jsx
<div className="config">
  <TemplateSelector />
  <SynthesisSelector />
</div>
```

---

## 📊 SUCCESS METRICS

After implementation, you should have:

✅ 16 selectable personas
✅ 10 one-click templates
✅ Cost estimates before running
✅ Smart query suggestions
✅ 5 synthesis modes
✅ Enhanced exports with AAR data
✅ Performance tracking
✅ Visual indicators

---

## 🚀 POST-LAUNCH ENHANCEMENTS

**Week 2**
- Custom persona builder UI
- Persona performance dashboard
- Cost budget alerts

**Week 3**
- AI-suggested personas (meta!)
- Template favorites
- Community personas

**Week 4**
- After Action Review dashboard
- Cost trend analysis
- Persona effectiveness over time

---

## 💡 QUICK WIN: MVP IN 2 HOURS

If you just want to test the concept quickly:

1. Install zustand (5 min)
2. Copy personas.js to src/data/ (5 min)
3. Create PersonaDropdown component (30 min)
4. Wire up to one model (30 min)
5. Update prompt builder (30 min)
6. Test with real API call (20 min)

Total: ~2 hours to see personas working!

---

## 📞 NEED HELP?

Check these first:
- Imports failing? Verify file paths
- Store not persisting? Check zustand installation
- Cost estimate wrong? Verify model IDs in MODEL_PRICING
- Query analyzer quiet? Need 20+ char query

---

## ✅ YOU'RE READY!

You have everything needed:
- 8 complete, tested files
- 3-day implementation plan
- Testing checklist
- Common issues solved
- UI integration examples
- Quick win path

**Start with Day 1, Foundation.** Get personas working, then build from there.

Good luck! 🚀
