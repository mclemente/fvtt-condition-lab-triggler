## Classes

<dl>
<dt><a href="#ConditionLab">ConditionLab</a></dt>
<dd><p>Form application for managing mapping of Conditions to Icons and JournalEntries</p>
</dd>
<dt><a href="#EnhancedConditionMacroConfig">EnhancedConditionMacroConfig</a></dt>
<dd><p>Enhanced Condition Macro Config Application</p>
</dd>
<dt><a href="#EnhancedConditionOptionConfig">EnhancedConditionOptionConfig</a></dt>
<dd><p>Enhanced Condition Trigger Config Application</p>
</dd>
<dt><a href="#EnhancedConditionTriggerConfig">EnhancedConditionTriggerConfig</a></dt>
<dd><p>Enhanced Condition Trigger Config Application</p>
</dd>
<dt><a href="#EnhancedConditions">EnhancedConditions</a></dt>
<dd><p>Builds a mapping between status icons and journal entries that represent conditions</p>
</dd>
<dt><a href="#Sidekick">Sidekick</a></dt>
<dd><p>Provides helper methods for use elsewhere in the module (and has your back in a melee)</p>
</dd>
<dt><a href="#Triggler">Triggler</a></dt>
<dd><p>Handles triggers for other gadgets in the module... or does it?!</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getData">getData()</a></dt>
<dd></dd>
<dt><a href="#_updateObject">_updateObject(formData)</a></dt>
<dd><p>Override default update object behaviour</p>
</dd>
</dl>

<a name="ConditionLab"></a>

## ConditionLab
Form application for managing mapping of Conditions to Icons and JournalEntries

**Kind**: global class

* [ConditionLab](#ConditionLab)
    * _instance_
        * [.updatedMap](#ConditionLab+updatedMap)
        * [.prepareData()](#ConditionLab+prepareData)
        * [.getData()](#ConditionLab+getData)
        * [._buildSubmitData()](#ConditionLab+_buildSubmitData)
        * [._processFormData(formData)](#ConditionLab+_processFormData)
        * [._restoreDefaults()](#ConditionLab+_restoreDefaults)
        * [._updateObject(event, formData)](#ConditionLab+_updateObject)
        * [._processFormUpdate(formData)](#ConditionLab+_processFormUpdate)
        * [._saveMapping(newMap, mapType)](#ConditionLab+_saveMapping)
        * [._finaliseSave(preparedMap)](#ConditionLab+_finaliseSave)
        * [._exportToJSON()](#ConditionLab+_exportToJSON)
        * [._importFromJSONDialog()](#ConditionLab+_importFromJSONDialog)
        * [._processImport(html)](#ConditionLab+_processImport)
        * [._getHeaderButtons()](#ConditionLab+_getHeaderButtons)
        * [.activateListeners(html)](#ConditionLab+activateListeners)
        * [._onChangeInputs(event)](#ConditionLab+_onChangeInputs) ⇒ <code>Application.render</code>
        * [._onChangeFilter()](#ConditionLab+_onChangeFilter)
        * [._filterMapByName(map, filter)](#ConditionLab+_filterMapByName) ⇒
        * [._onChangeMapType(event)](#ConditionLab+_onChangeMapType)
        * [._onChangeIconPath(event)](#ConditionLab+_onChangeIconPath)
        * [._onClickActiveEffectConfig(event)](#ConditionLab+_onClickActiveEffectConfig)
        * [._onChangeReferenceId(event)](#ConditionLab+_onChangeReferenceId)
        * [._onOpenTrigglerForm(event)](#ConditionLab+_onOpenTrigglerForm)
        * [._onAddRow(event)](#ConditionLab+_onAddRow)
        * [._onRemoveRow(event)](#ConditionLab+_onRemoveRow)
        * [._onChangeSortOrder(event)](#ConditionLab+_onChangeSortOrder)
        * [._onClickSortButton(event)](#ConditionLab+_onClickSortButton)
        * [._sortMapByName(map, direction)](#ConditionLab+_sortMapByName) ⇒ <code>Array</code>
        * [._onRestoreDefaults(event)](#ConditionLab+_onRestoreDefaults)
        * [._onResetForm(event)](#ConditionLab+_onResetForm)
        * [._onSaveClose(event)](#ConditionLab+_onSaveClose)
        * [._onClickMacroConfig(event)](#ConditionLab+_onClickMacroConfig)
        * [._onClickTriggerConfig(event)](#ConditionLab+_onClickTriggerConfig)
        * [._onClickOptionConfig(event)](#ConditionLab+_onClickOptionConfig)
        * [._hasMapChanged()](#ConditionLab+_hasMapChanged)
        * [._hasPropertyChanged(propertyName, original, comparison)](#ConditionLab+_hasPropertyChanged) ⇒ <code>Boolean</code>
    * _static_
        * [.defaultOptions](#ConditionLab.defaultOptions)
        * [._onRender(app, html, data)](#ConditionLab._onRender)
        * [._onRenderSaveDialog(app, html, data)](#ConditionLab._onRenderSaveDialog)
        * [._onRenderRestoreDefaultsDialog(app, html, data)](#ConditionLab._onRenderRestoreDefaultsDialog)

<a name="ConditionLab+updatedMap"></a>

### conditionLab.updatedMap
Get updated map by combining existing in-memory map with current formdata

**Kind**: instance property of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+prepareData"></a>

### conditionLab.prepareData()
Prepare data for form rendering

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+getData"></a>

### conditionLab.getData()
Gets data for the template render

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+_buildSubmitData"></a>

### conditionLab.\_buildSubmitData()
Enriches submit data with existing map to ensure continuity

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+_processFormData"></a>

### conditionLab.\_processFormData(formData)
Processes the Form Data and builds a usable Condition Map

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| formData | <code>\*</code> |

<a name="ConditionLab+_restoreDefaults"></a>

### conditionLab.\_restoreDefaults()
Restore defaults for a mapping

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+_updateObject"></a>

### conditionLab.\_updateObject(event, formData)
Take the new map and write it back to settings, overwriting existing

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>Object</code> |
| formData | <code>Object</code> |

<a name="ConditionLab+_processFormUpdate"></a>

### conditionLab.\_processFormUpdate(formData)
Process Condition Lab formdata and then save changes

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| formData | <code>\*</code> |

<a name="ConditionLab+_saveMapping"></a>

### conditionLab.\_saveMapping(newMap, mapType)
Saves a given map and option map type to storage

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| newMap | <code>\*</code> |
| mapType | <code>\*</code> |

<a name="ConditionLab+_finaliseSave"></a>

### conditionLab.\_finaliseSave(preparedMap)
Performs final steps after saving mapping

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| preparedMap | <code>\*</code> |

<a name="ConditionLab+_exportToJSON"></a>

### conditionLab.\_exportToJSON()
Exports the current map to JSON

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+_importFromJSONDialog"></a>

### conditionLab.\_importFromJSONDialog()
Initiates an import via a dialog
Borrowed from foundry.js Entity class

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+_processImport"></a>

### conditionLab.\_processImport(html)
Process a Condition Map Import

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| html | <code>\*</code> |

<a name="ConditionLab+_getHeaderButtons"></a>

### conditionLab.\_getHeaderButtons()
Override the header buttons method

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+activateListeners"></a>

### conditionLab.activateListeners(html)
Activate app listeners

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| html | <code>\*</code> |

<a name="ConditionLab+_onChangeInputs"></a>

### conditionLab.\_onChangeInputs(event) ⇒ <code>Application.render</code>
Input change handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onChangeFilter"></a>

### conditionLab.\_onChangeFilter()
Filter input change handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+_filterMapByName"></a>

### conditionLab.\_filterMapByName(map, filter) ⇒
Filter the given map by the name property using the supplied filter value, marking filtered entries as "hidden"

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
**Returns**: filteredMap

| Param | Type |
| --- | --- |
| map | <code>Array</code> |
| filter | <code>String</code> |

<a name="ConditionLab+_onChangeMapType"></a>

### conditionLab.\_onChangeMapType(event)
Change Map Type event handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onChangeIconPath"></a>

### conditionLab.\_onChangeIconPath(event)
Handle icon path change

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onClickActiveEffectConfig"></a>

### conditionLab.\_onClickActiveEffectConfig(event)
Handle click Active Effect Config button

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onChangeReferenceId"></a>

### conditionLab.\_onChangeReferenceId(event)
Reference Link change handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onOpenTrigglerForm"></a>

### conditionLab.\_onOpenTrigglerForm(event)
Open Triggler form event handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onAddRow"></a>

### conditionLab.\_onAddRow(event)
Add Row event handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onRemoveRow"></a>

### conditionLab.\_onRemoveRow(event)
Handler for remove row event

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onChangeSortOrder"></a>

### conditionLab.\_onChangeSortOrder(event)
Handle a change sort order click

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onClickSortButton"></a>

### conditionLab.\_onClickSortButton(event)
Sort button handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_sortMapByName"></a>

### conditionLab.\_sortMapByName(map, direction) ⇒ <code>Array</code>
Sorts the given map by the name property

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| map | <code>Array</code> |
| direction | <code>\*</code> |

<a name="ConditionLab+_onRestoreDefaults"></a>

### conditionLab.\_onRestoreDefaults(event)
**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onResetForm"></a>

### conditionLab.\_onResetForm(event)
Reset form handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onSaveClose"></a>

### conditionLab.\_onSaveClose(event)
Save and Close handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onClickMacroConfig"></a>

### conditionLab.\_onClickMacroConfig(event)
Macro Config button click handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onClickTriggerConfig"></a>

### conditionLab.\_onClickTriggerConfig(event)
Trigger Config button click handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_onClickOptionConfig"></a>

### conditionLab.\_onClickOptionConfig(event)
Option Config button click handler

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="ConditionLab+_hasMapChanged"></a>

### conditionLab.\_hasMapChanged()
Checks the updatedMap property against the initial map

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab+_hasPropertyChanged"></a>

### conditionLab.\_hasPropertyChanged(propertyName, original, comparison) ⇒ <code>Boolean</code>
Checks a given propertyName on an original and comparison object to see if it has changed

**Kind**: instance method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| propertyName | <code>\*</code> |
| original | <code>\*</code> |
| comparison | <code>\*</code> |

<a name="ConditionLab.defaultOptions"></a>

### ConditionLab.defaultOptions
Get options for the form

**Kind**: static property of [<code>ConditionLab</code>](#ConditionLab)
<a name="ConditionLab._onRender"></a>

### ConditionLab.\_onRender(app, html, data)
Condition Lab Render handler

**Kind**: static method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| app | <code>\*</code> |
| html | <code>\*</code> |
| data | <code>\*</code> |

<a name="ConditionLab._onRenderSaveDialog"></a>

### ConditionLab.\_onRenderSaveDialog(app, html, data)
Render save dialog hook handler

**Kind**: static method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| app | <code>\*</code> |
| html | <code>jQuery</code> |
| data | <code>\*</code> |

<a name="ConditionLab._onRenderRestoreDefaultsDialog"></a>

### ConditionLab.\_onRenderRestoreDefaultsDialog(app, html, data)
Render restore defaults hook handler

**Kind**: static method of [<code>ConditionLab</code>](#ConditionLab)

| Param | Type |
| --- | --- |
| app | <code>\*</code> |
| html | <code>\*</code> |
| data | <code>\*</code> |

<a name="EnhancedConditionMacroConfig"></a>

## EnhancedConditionMacroConfig
Enhanced Condition Macro Config Application

**Kind**: global class

* [EnhancedConditionMacroConfig](#EnhancedConditionMacroConfig)
    * _instance_
        * [.getData()](#EnhancedConditionMacroConfig+getData) ⇒ <code>Object</code>
        * [._updateObject(event, formData)](#EnhancedConditionMacroConfig+_updateObject)
    * _static_
        * [.defaultOptions](#EnhancedConditionMacroConfig.defaultOptions)

<a name="EnhancedConditionMacroConfig+getData"></a>

### enhancedConditionMacroConfig.getData() ⇒ <code>Object</code>
Gets data for template rendering

**Kind**: instance method of [<code>EnhancedConditionMacroConfig</code>](#EnhancedConditionMacroConfig)
**Returns**: <code>Object</code> - data
<a name="EnhancedConditionMacroConfig+_updateObject"></a>

### enhancedConditionMacroConfig.\_updateObject(event, formData)
Update Object on Form Submission

**Kind**: instance method of [<code>EnhancedConditionMacroConfig</code>](#EnhancedConditionMacroConfig)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |
| formData | <code>\*</code> |

<a name="EnhancedConditionMacroConfig.defaultOptions"></a>

### EnhancedConditionMacroConfig.defaultOptions
defaultOptions

**Kind**: static property of [<code>EnhancedConditionMacroConfig</code>](#EnhancedConditionMacroConfig)
<a name="EnhancedConditionOptionConfig"></a>

## EnhancedConditionOptionConfig
Enhanced Condition Trigger Config Application

**Kind**: global class

* [EnhancedConditionOptionConfig](#EnhancedConditionOptionConfig)
    * _instance_
        * [.getData()](#EnhancedConditionOptionConfig+getData) ⇒ <code>Object</code>
        * [.activateListeners(html)](#EnhancedConditionOptionConfig+activateListeners)
        * [._onCheckboxChange(event)](#EnhancedConditionOptionConfig+_onCheckboxChange) ⇒
        * [._updateObject(event, formData)](#EnhancedConditionOptionConfig+_updateObject)
        * [.getSpecialStatusEffectByField(field)](#EnhancedConditionOptionConfig+getSpecialStatusEffectByField) ⇒ <code>String</code>
        * [.setSpecialStatusEffectMapping(effect, conditionId)](#EnhancedConditionOptionConfig+setSpecialStatusEffectMapping)
    * _static_
        * [.defaultOptions](#EnhancedConditionOptionConfig.defaultOptions)
        * [._onSpecialStatusEffectToggle(event)](#EnhancedConditionOptionConfig._onSpecialStatusEffectToggle)

<a name="EnhancedConditionOptionConfig+getData"></a>

### enhancedConditionOptionConfig.getData() ⇒ <code>Object</code>
Gets data for template rendering

**Kind**: instance method of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)
**Returns**: <code>Object</code> - data
<a name="EnhancedConditionOptionConfig+activateListeners"></a>

### enhancedConditionOptionConfig.activateListeners(html)
Application listeners

**Kind**: instance method of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)

| Param | Type |
| --- | --- |
| html | <code>jQuery</code> |

<a name="EnhancedConditionOptionConfig+_onCheckboxChange"></a>

### enhancedConditionOptionConfig.\_onCheckboxChange(event) ⇒
Checkbox change event handler

**Kind**: instance method of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="EnhancedConditionOptionConfig+_updateObject"></a>

### enhancedConditionOptionConfig.\_updateObject(event, formData)
Update Object on Form Submission

**Kind**: instance method of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |
| formData | <code>\*</code> |

<a name="EnhancedConditionOptionConfig+getSpecialStatusEffectByField"></a>

### enhancedConditionOptionConfig.getSpecialStatusEffectByField(field) ⇒ <code>String</code>
Get the enum for a special status effect based on the field name

**Kind**: instance method of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)
**Returns**: <code>String</code> - enum for the special status effect

| Param | Type |
| --- | --- |
| field | <code>\*</code> |

<a name="EnhancedConditionOptionConfig+setSpecialStatusEffectMapping"></a>

### enhancedConditionOptionConfig.setSpecialStatusEffectMapping(effect, conditionId)
Sets the special status effect to the provided condition Id

**Kind**: instance method of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)

| Param | Type | Default |
| --- | --- | --- |
| effect | <code>\*</code> |  |
| conditionId | <code>\*</code> | <code></code> |

<a name="EnhancedConditionOptionConfig.defaultOptions"></a>

### EnhancedConditionOptionConfig.defaultOptions
defaultOptions

**Kind**: static property of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)
<a name="EnhancedConditionOptionConfig._onSpecialStatusEffectToggle"></a>

### EnhancedConditionOptionConfig.\_onSpecialStatusEffectToggle(event)
Special Status Effect toggle handler

**Kind**: static method of [<code>EnhancedConditionOptionConfig</code>](#EnhancedConditionOptionConfig)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |

<a name="EnhancedConditionTriggerConfig"></a>

## EnhancedConditionTriggerConfig
Enhanced Condition Trigger Config Application

**Kind**: global class

* [EnhancedConditionTriggerConfig](#EnhancedConditionTriggerConfig)
    * _instance_
        * [.getData()](#EnhancedConditionTriggerConfig+getData) ⇒ <code>Object</code>
        * [._updateObject(event, formData)](#EnhancedConditionTriggerConfig+_updateObject)
    * _static_
        * [.defaultOptions](#EnhancedConditionTriggerConfig.defaultOptions)

<a name="EnhancedConditionTriggerConfig+getData"></a>

### enhancedConditionTriggerConfig.getData() ⇒ <code>Object</code>
Gets data for template rendering

**Kind**: instance method of [<code>EnhancedConditionTriggerConfig</code>](#EnhancedConditionTriggerConfig)
**Returns**: <code>Object</code> - data
<a name="EnhancedConditionTriggerConfig+_updateObject"></a>

### enhancedConditionTriggerConfig.\_updateObject(event, formData)
Update Object on Form Submission

**Kind**: instance method of [<code>EnhancedConditionTriggerConfig</code>](#EnhancedConditionTriggerConfig)

| Param | Type |
| --- | --- |
| event | <code>\*</code> |
| formData | <code>\*</code> |

<a name="EnhancedConditionTriggerConfig.defaultOptions"></a>

### EnhancedConditionTriggerConfig.defaultOptions
defaultOptions

**Kind**: static property of [<code>EnhancedConditionTriggerConfig</code>](#EnhancedConditionTriggerConfig)
<a name="EnhancedConditions"></a>

## EnhancedConditions
Builds a mapping between status icons and journal entries that represent conditions

**Kind**: global class

* [EnhancedConditions](#EnhancedConditions)
    * [._onReady()](#EnhancedConditions._onReady)
    * [._onPreUpdateToken(scene, update, options, userId)](#EnhancedConditions._onPreUpdateToken)
    * [._onUpdateToken()](#EnhancedConditions._onUpdateToken)
    * [._onCreateActiveEffect(actor, update, options, userId)](#EnhancedConditions._onCreateActiveEffect)
    * [._onDeleteActiveEffect(actor, update, options, userId)](#EnhancedConditions._onDeleteActiveEffect)
    * [._onUpdateCombat(combat, update, options, userId)](#EnhancedConditions._onUpdateCombat)
    * [._onRenderChatMessage(app, html, data)](#EnhancedConditions._onRenderChatMessage)
    * [._onRenderChatLog(app, html, data)](#EnhancedConditions._onRenderChatLog)
    * [._onRenderCombatTracker(app, html, data)](#EnhancedConditions._onRenderCombatTracker)
    * [._processActiveEffectChange(effect, type)](#EnhancedConditions._processActiveEffectChange)
    * [.lookupEntryMapping(effectIds, [map])](#EnhancedConditions.lookupEntryMapping)
    * [.outputChatMessage()](#EnhancedConditions.outputChatMessage)
    * [._toggleDefeated(entities)](#EnhancedConditions._toggleDefeated)
    * [._removeOtherConditions(entity, conditionId)](#EnhancedConditions._removeOtherConditions)
    * [._migrateConditionIds(conditionMap)](#EnhancedConditions._migrateConditionIds)
    * [._processMacros(macroIds, entity)](#EnhancedConditions._processMacros)
    * [.updateConditionTimestamps()](#EnhancedConditions.updateConditionTimestamps)
    * [._toggleLabButtonVisibility(display)](#EnhancedConditions._toggleLabButtonVisibility)
    * [._loadDefaultMaps()](#EnhancedConditions._loadDefaultMaps)
    * [._prepareMap(conditionMap)](#EnhancedConditions._prepareMap)
    * [._backupCoreEffects()](#EnhancedConditions._backupCoreEffects)
    * [._backupCoreSpecialStatusEffects()](#EnhancedConditions._backupCoreSpecialStatusEffects)
    * [._createJournalEntry(condition)](#EnhancedConditions._createJournalEntry)
    * [._lookupConditionByName(conditionName, map)](#EnhancedConditions._lookupConditionByName)
    * [._updateStatusEffects(conditionMap)](#EnhancedConditions._updateStatusEffects)
    * [._prepareStatusEffects(conditionMap)](#EnhancedConditions._prepareStatusEffects) ⇒ <code>Array</code>
    * [._prepareActiveEffects(effects)](#EnhancedConditions._prepareActiveEffects)
    * [.getConditionIcons()](#EnhancedConditions.getConditionIcons)
    * [.getIconsByCondition(condition)](#EnhancedConditions.getIconsByCondition)
    * [.getConditionsByIcon(icon)](#EnhancedConditions.getConditionsByIcon)
    * [.mapFromJson(json)](#EnhancedConditions.mapFromJson)
    * [.getDefaultMap()](#EnhancedConditions.getDefaultMap) ⇒ <code>Object</code>
    * [.buildDefaultMap()](#EnhancedConditions.buildDefaultMap)
    * ~~[.applyCondition(...params)](#EnhancedConditions.applyCondition)~~
    * [.addCondition(conditionName, [entities])](#EnhancedConditions.addCondition)
    * [.getCondition(conditionName)](#EnhancedConditions.getCondition)
    * [.getConditions(entities)](#EnhancedConditions.getConditions) ⇒ <code>Array</code>
    * [.getActiveEffect(condition)](#EnhancedConditions.getActiveEffect)
    * [.getConditionEffects(entities, map, warn)](#EnhancedConditions.getConditionEffects) ⇒ <code>Map</code> \| <code>Object</code>
    * [.hasCondition(conditionName, entities, [options])](#EnhancedConditions.hasCondition) ⇒ <code>Boolean</code>
    * [.removeCondition(entities, conditionName, options)](#EnhancedConditions.removeCondition)
    * [.removeAllConditions(entities)](#EnhancedConditions.removeAllConditions)

<a name="EnhancedConditions._onReady"></a>

### EnhancedConditions.\_onReady()
Ready Hook handler
Steps:
1. Get default maps
2. Get mapType
3. Get Condition Map
4. Override status effects

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
<a name="EnhancedConditions._onPreUpdateToken"></a>

### EnhancedConditions.\_onPreUpdateToken(scene, update, options, userId)
Handle PreUpdate Token Hook.
If the update includes effect data, add an `option` for the update hook handler to look for

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| scene | <code>\*</code> |
| update | <code>\*</code> |
| options | <code>\*</code> |
| userId | <code>\*</code> |

<a name="EnhancedConditions._onUpdateToken"></a>

### EnhancedConditions.\_onUpdateToken()
Hooks on token updates. If the update includes effects, calls the journal entry lookup

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
<a name="EnhancedConditions._onCreateActiveEffect"></a>

### EnhancedConditions.\_onCreateActiveEffect(actor, update, options, userId)
Create Active Effect handler

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| actor | <code>\*</code> |
| update | <code>\*</code> |
| options | <code>\*</code> |
| userId | <code>\*</code> |

<a name="EnhancedConditions._onDeleteActiveEffect"></a>

### EnhancedConditions.\_onDeleteActiveEffect(actor, update, options, userId)
Create Active Effect handler

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| actor | <code>\*</code> |
| update | <code>\*</code> |
| options | <code>\*</code> |
| userId | <code>\*</code> |

<a name="EnhancedConditions._onUpdateCombat"></a>

### EnhancedConditions.\_onUpdateCombat(combat, update, options, userId)
Update Combat Handler

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| combat | <code>\*</code> |
| update | <code>\*</code> |
| options | <code>\*</code> |
| userId | <code>\*</code> |

<a name="EnhancedConditions._onRenderChatMessage"></a>

### EnhancedConditions.\_onRenderChatMessage(app, html, data)
Render Chat Message handler

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Todo**

- [ ] move to chatlog render?


| Param | Type |
| --- | --- |
| app | <code>\*</code> |
| html | <code>\*</code> |
| data | <code>\*</code> |

<a name="EnhancedConditions._onRenderChatLog"></a>

### EnhancedConditions.\_onRenderChatLog(app, html, data)
ChatLog render hook

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| app | <code>\*</code> |
| html | <code>\*</code> |
| data | <code>\*</code> |

<a name="EnhancedConditions._onRenderCombatTracker"></a>

### EnhancedConditions.\_onRenderCombatTracker(app, html, data)
**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| app | <code>\*</code> |
| html | <code>\*</code> |
| data | <code>\*</code> |

<a name="EnhancedConditions._processActiveEffectChange"></a>

### EnhancedConditions.\_processActiveEffectChange(effect, type)
Process the addition/removal of an Active Effect

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| effect | <code>ActiveEffect</code> |  | the effect |
| type | <code>String</code> | <code>create</code> | the type of change to process |

<a name="EnhancedConditions.lookupEntryMapping"></a>

### EnhancedConditions.lookupEntryMapping(effectIds, [map])
Checks statusEffect icons against map and returns matching condition mappings

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| effectIds | <code>Array</code> \| <code>String</code> |  | A list of effectIds, or a single effectId to check |
| [map] | <code>Array</code> | <code>[]</code> | the condition map to look in |

<a name="EnhancedConditions.outputChatMessage"></a>

### EnhancedConditions.outputChatMessage()
Output one or more condition entries to chat

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Todo**

- [ ] refactor to use actor or token

<a name="EnhancedConditions._toggleDefeated"></a>

### EnhancedConditions.\_toggleDefeated(entities)
Marks a Combatants for a particular entity as defeated

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Description |
| --- | --- | --- |
| entities | <code>Actor</code> \| <code>Token</code> | the entity to mark defeated |
| options.markDefeated | <code>Boolean</code> | an optional state flag (default=true) |

<a name="EnhancedConditions._removeOtherConditions"></a>

### EnhancedConditions.\_removeOtherConditions(entity, conditionId)
For a given entity, removes conditions other than the one supplied

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| entity | <code>\*</code> |
| conditionId | <code>\*</code> |

<a name="EnhancedConditions._migrateConditionIds"></a>

### EnhancedConditions.\_migrateConditionIds(conditionMap)
Migrates Condition Ids to be truly unique-ish

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| conditionMap | <code>\*</code> |

<a name="EnhancedConditions._processMacros"></a>

### EnhancedConditions.\_processMacros(macroIds, entity)
Process macros based on given Ids

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default |
| --- | --- | --- |
| macroIds | <code>\*</code> |  |
| entity | <code>\*</code> | <code></code> |

<a name="EnhancedConditions.updateConditionTimestamps"></a>

### EnhancedConditions.updateConditionTimestamps()
Update condition added/removed timestamps

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
<a name="EnhancedConditions._toggleLabButtonVisibility"></a>

### EnhancedConditions.\_toggleLabButtonVisibility(display)
Determines whether to display the combat utility belt div in the settings sidebar

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Todo:**: extract to helper in sidekick class?

| Param | Type |
| --- | --- |
| display | <code>Boolean</code> |

<a name="EnhancedConditions._loadDefaultMaps"></a>

### EnhancedConditions.\_loadDefaultMaps()
Returns the default maps supplied with the module

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Todo:**: map to entryId and then rebuild on import
<a name="EnhancedConditions._prepareMap"></a>

### EnhancedConditions.\_prepareMap(conditionMap)
Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| conditionMap | <code>\*</code> |

<a name="EnhancedConditions._backupCoreEffects"></a>

### EnhancedConditions.\_backupCoreEffects()
Duplicate the core status icons, freeze the duplicate then store a copy in settings

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
<a name="EnhancedConditions._backupCoreSpecialStatusEffects"></a>

### EnhancedConditions.\_backupCoreSpecialStatusEffects()
Duplicate the core special status effect mappings, freeze the duplicate then store a copy in settings

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
<a name="EnhancedConditions._createJournalEntry"></a>

### EnhancedConditions.\_createJournalEntry(condition)
Creates journal entries for any conditions that don't have one

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>String</code> | the condition being evaluated |

<a name="EnhancedConditions._lookupConditionByName"></a>

### EnhancedConditions.\_lookupConditionByName(conditionName, map)
Gets one or more conditions from the map by their name

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionName | <code>String</code> |  | the condition to get |
| map | <code>Array</code> | <code></code> | the condition map to search |

<a name="EnhancedConditions._updateStatusEffects"></a>

### EnhancedConditions.\_updateStatusEffects(conditionMap)
Updates the CONFIG.statusEffect effects with Condition Map ones

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| conditionMap | <code>\*</code> |

<a name="EnhancedConditions._prepareStatusEffects"></a>

### EnhancedConditions.\_prepareStatusEffects(conditionMap) ⇒ <code>Array</code>
Converts the given Condition Map (one or more Conditions) into a Status Effects array or object

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Returns**: <code>Array</code> - statusEffects

| Param | Type |
| --- | --- |
| conditionMap | <code>Array</code> \| <code>Object</code> |

<a name="EnhancedConditions._prepareActiveEffects"></a>

### EnhancedConditions.\_prepareActiveEffects(effects)
Prepares one or more ActiveEffects from Conditions for placement on an actor

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Description |
| --- | --- | --- |
| effects | <code>Object</code> \| <code>Array</code> | a single ActiveEffect data object or an array of ActiveEffect data objects |

<a name="EnhancedConditions.getConditionIcons"></a>

### EnhancedConditions.getConditionIcons()
Returns just the icon side of the map

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
<a name="EnhancedConditions.getIconsByCondition"></a>

### EnhancedConditions.getIconsByCondition(condition)
Retrieves a condition icon by its mapped name

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| condition | <code>\*</code> |

<a name="EnhancedConditions.getConditionsByIcon"></a>

### EnhancedConditions.getConditionsByIcon(icon)
Retrieves a condition name by its mapped icon

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| icon | <code>\*</code> |

<a name="EnhancedConditions.mapFromJson"></a>

### EnhancedConditions.mapFromJson(json)
Parses a condition map JSON and returns a map

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| json | <code>\*</code> |

<a name="EnhancedConditions.getDefaultMap"></a>

### EnhancedConditions.getDefaultMap() ⇒ <code>Object</code>
Returns the default condition map for a given system

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
<a name="EnhancedConditions.buildDefaultMap"></a>

### EnhancedConditions.buildDefaultMap()
Builds a default map for a given system

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Todo**

- [ ] #281 update for active effects

<a name="EnhancedConditions.applyCondition"></a>

### ~~EnhancedConditions.applyCondition(...params)~~
***Deprecated***

Apply the named condition to the provided entities (Actors or Tokens)

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**See**: EnhancedConditions#addCondition

| Param | Type |
| --- | --- |
| ...params | <code>any</code> |

<a name="EnhancedConditions.addCondition"></a>

### EnhancedConditions.addCondition(conditionName, [entities])
Applies the named condition to the provided entities (Actors or Tokens)

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionName | <code>Array.&lt;String&gt;</code> \| <code>String</code> |  | the name of the condition to add |
| [entities] | <code>Array.&lt;Actor&gt;</code> \| <code>Array.&lt;Token&gt;</code> \| <code>Actor</code> \| <code>Token</code> | <code></code> | one or more Actors or Tokens to apply the Condition to |
| [options.warn] | <code>Boolean</code> | <code>true</code> | raise warnings on errors |
| [options.allowDuplicates] | <code>Boolean</code> | <code>false</code> | if one or more of the Conditions specified is already active on the Entity, this will still add the Condition. Use in conjunction with `replaceExisting` to determine how duplicates are handled |
| [options.replaceExisting] | <code>Boolean</code> | <code>false</code> | whether or not to replace existing Conditions with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and `replaceExisting` is false then a duplicate condition is created. Has no effect is `keepDuplicates` is `false` |

**Example**
```js
// Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.
game.clt.addCondition("Blinded", game.actors.getName("Bob"));
```
**Example**
```js
// Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.
game.clt.addCondition("Charmed");
```
**Example**
```js
// Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, replacing any existing Conditions of the same names.
game.clt.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
```
<a name="EnhancedConditions.getCondition"></a>

### EnhancedConditions.getCondition(conditionName, map)
Gets a condition by name from the Condition Map

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default |
| --- | --- | --- |
| conditionName | <code>\*</code> |  |
| map | <code>\*</code> | <code></code> |
| options.warn | <code>\*</code> |  |

<a name="EnhancedConditions.getConditions"></a>

### EnhancedConditions.getConditions(entities) ⇒ <code>Array</code>
Retrieves all active conditions for one or more given entities (Actors or Tokens)

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Returns**: <code>Array</code> - entityConditionMap  a mapping of conditions for each provided entity

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entities | <code>Actor</code> \| <code>Token</code> | <code></code> | one or more Actors or Tokens to get Conditions from |
| options.warn | <code>Boolean</code> |  | output notifications |

**Example**
```js
// Get conditions for an Actor named "Bob"
game.clt.getConditions(game.actors.getName("Bob"));
```
**Example**
```js
// Get conditions for the currently controlled Token
game.clt.getConditions();
```
<a name="EnhancedConditions.getActiveEffect"></a>

### EnhancedConditions.getActiveEffect(condition)
Gets the Active Effect data (if any) for the given condition

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type |
| --- | --- |
| condition | <code>\*</code> |

<a name="EnhancedConditions.getConditionEffects"></a>

### EnhancedConditions.getConditionEffects(entities, map, warn) ⇒ <code>Map</code> \| <code>Object</code>
Gets any Active Effect instances present on the entities (Actor/s or Token/s) that are mapped Conditions

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Returns**: <code>Map</code> \| <code>Object</code> - A Map containing the Actor Id and the Condition Active Effect instances if any

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entities | <code>String</code> |  | the entities to check |
| map | <code>Array</code> | <code></code> | the Condition map to check (optional) |
| warn | <code>Boolean</code> |  | output notifications |

<a name="EnhancedConditions.hasCondition"></a>

### EnhancedConditions.hasCondition(conditionName, entities, [options]) ⇒ <code>Boolean</code>
Checks if the provided Entity (Actor or Token) has the given condition

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)
**Returns**: <code>Boolean</code> - hasCondition  Returns true if one or more of the provided entities has one or more of the provided conditions

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionName | <code>String</code> \| <code>Array</code> |  | the name/s of the condition or conditions to check for |
| entities | <code>Actor</code> \| <code>Token</code> \| <code>Array</code> | <code></code> | the entity or entities to check (Actor/s or Token/s) |
| [options] | <code>Object</code> |  | options object |
| [options.warn] | <code>Boolean</code> |  | whether or not to output notifications |

**Example**
```js
// Check for the "Blinded" condition on Actor "Bob"
game.clt.hasCondition("Blinded", game.actors.getName("Bob"));
```
**Example**
```js
// Check for the "Charmed" and "Deafened" conditions on the controlled tokens
game.clt.hasCondition(["Charmed", "Deafened"]);
```
<a name="EnhancedConditions.removeCondition"></a>

### EnhancedConditions.removeCondition(entities, conditionName, options)
Removes one or more named conditions from an Entity (Actor/Token)

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entities | <code>Actor</code> \| <code>Token</code> | <code></code> | One or more Actors or Tokens |
| conditionName | <code>String</code> |  | the name of the Condition to remove |
| options | <code>Object</code> |  | options for removal |
| options.warn | <code>Boolean</code> |  | whether or not to raise warnings on errors |

**Example**
```js
// Remove Condition named "Blinded" from an Actor named Bob
game.clt.removeCondition("Blinded", game.actors.getName("Bob"));
```
**Example**
```js
// Remove Condition named "Charmed" from the currently controlled Token, but don't show any warnings if it fails.
game.clt.removeCondition("Charmed", {warn=false});
```
<a name="EnhancedConditions.removeAllConditions"></a>

### EnhancedConditions.removeAllConditions(entities)
Removes all conditions from the provided entities

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entities | <code>Actors</code> \| <code>Tokens</code> | <code></code> | One or more Actors or Tokens to remove Conditions from |
| options.warn | <code>Boolean</code> |  | output notifications |

**Example**
```js
// Remove all Conditions on an Actor named Bob
game.clt.removeAllConditions(game.actors.getName("Bob"));
```
**Example**
```js
// Remove all Conditions on the currently controlled Token
game.clt.removeAllConditions();
```
<a name="Sidekick"></a>

## Sidekick
Provides helper methods for use elsewhere in the module (and has your back in a melee)

**Kind**: global class

* [Sidekick](#Sidekick)
    * [.getSetting(key)](#Sidekick.getSetting) ⇒ <code>Object</code>
    * [.getAllSettings()](#Sidekick.getAllSettings) ⇒ <code>Array</code>
    * [.setSetting(key, value, awaitResult)](#Sidekick.setSetting) ⇒ <code>Promise</code> \| <code>ClientSetting</code>
    * [.registerSetting(key, metadata)](#Sidekick.registerSetting) ⇒ <code>ClientSettings.register</code>
    * [.registerMenu(key, metadata)](#Sidekick.registerMenu) ⇒ <code>ClientSettings.registerMenu</code>
    * [.registerAllSettings(settingsData)](#Sidekick.registerAllSettings) ⇒ <code>Array</code>
    * [.fetchJsons(source, path)](#Sidekick.fetchJsons)
    * [.fetchJson(file)](#Sidekick.fetchJson) ⇒
    * [.validateObject(object)](#Sidekick.validateObject) ⇒ <code>Boolean</code>
    * [.convertMapToArray(map)](#Sidekick.convertMapToArray)
    * [.getKeyByValue(object, value)](#Sidekick.getKeyByValue)
    * [.getInverseMap()](#Sidekick.getInverseMap)
    * [.handlebarsHelpers()](#Sidekick.handlebarsHelpers)
    * [.jQueryHelpers()](#Sidekick.jQueryHelpers)
    * [.getTerms(arr)](#Sidekick.getTerms)
    * [.escapeRegExp(string)](#Sidekick.escapeRegExp) ⇒ <code>String</code>
    * [.coerceType(target, type)](#Sidekick.coerceType) ⇒ <code>\*</code>
    * [.buildFormData(FD)](#Sidekick.buildFormData)
    * [.createId(existingIds)](#Sidekick.createId)
    * [.toTitleCase(string)](#Sidekick.toTitleCase)
    * [.replaceOnDocument(pattern, string, param2)](#Sidekick.replaceOnDocument)
    * [.getTextNodesIn(el)](#Sidekick.getTextNodesIn) ⇒ <code>jQuery</code>
    * [.generateUniqueSlugId(string, idList)](#Sidekick.generateUniqueSlugId)
    * [.getNameFromFilePath(path)](#Sidekick.getNameFromFilePath) ⇒ <code>String</code>
    * [.getFirstGM()](#Sidekick.getFirstGM) ⇒ <code>GM</code> \| <code>null</code>
    * [.isFirstGM()](#Sidekick.isFirstGM) ⇒ <code>Boolean</code>
    * [.findArrayDuplicates(arrayToCheck, filterProperty)](#Sidekick.findArrayDuplicates) ⇒ <code>Array</code>
    * [.identifyArrayDuplicatesByProperty(arrayToCheck, filterProperty)](#Sidekick.identifyArrayDuplicatesByProperty) ⇒ <code>Boolean</code>
    * [.loadTemplates()](#Sidekick.loadTemplates)
    * [.getDocumentOwners(document)](#Sidekick.getDocumentOwners) ⇒ <code>Array</code>
    * [.toCamelCase(string, delimiter)](#Sidekick.toCamelCase) ⇒

<a name="Sidekick.getSetting"></a>

### Sidekick.getSetting(key) ⇒ <code>Object</code>
Get a single setting using the provided key

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Returns**: <code>Object</code> - setting

| Param | Type |
| --- | --- |
| key | <code>\*</code> |

<a name="Sidekick.getAllSettings"></a>

### Sidekick.getAllSettings() ⇒ <code>Array</code>
Get all CUB settings

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Returns**: <code>Array</code> - settings
<a name="Sidekick.setSetting"></a>

### Sidekick.setSetting(key, value, awaitResult) ⇒ <code>Promise</code> \| <code>ClientSetting</code>
Sets a single game setting

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type | Default |
| --- | --- | --- |
| key | <code>\*</code> |  |
| value | <code>\*</code> |  |
| awaitResult | <code>\*</code> | <code>false</code> |

<a name="Sidekick.registerSetting"></a>

### Sidekick.registerSetting(key, metadata) ⇒ <code>ClientSettings.register</code>
Register a single setting using the provided key and setting data

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| key | <code>\*</code> |
| metadata | <code>\*</code> |

<a name="Sidekick.registerMenu"></a>

### Sidekick.registerMenu(key, metadata) ⇒ <code>ClientSettings.registerMenu</code>
Register a menu setting using the provided key and setting data

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| key | <code>\*</code> |
| metadata | <code>\*</code> |

<a name="Sidekick.registerAllSettings"></a>

### Sidekick.registerAllSettings(settingsData) ⇒ <code>Array</code>
Register all provided setting data

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| settingsData | <code>\*</code> |

<a name="Sidekick.fetchJsons"></a>

### Sidekick.fetchJsons(source, path)
Use FilePicker to browse then Fetch one or more JSONs and return them

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| source | <code>\*</code> |
| path | <code>\*</code> |

<a name="Sidekick.fetchJson"></a>

### Sidekick.fetchJson(file) ⇒
Fetch a JSON from a given file

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Returns**: JSON | null

| Param | Type |
| --- | --- |
| file | <code>File</code> |

<a name="Sidekick.validateObject"></a>

### Sidekick.validateObject(object) ⇒ <code>Boolean</code>
Validate that an object is actually an object

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| object | <code>Object</code> |

<a name="Sidekick.convertMapToArray"></a>

### Sidekick.convertMapToArray(map)
Convert any ES6 Maps/Sets to objects for settings use

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| map | <code>Map</code> |

<a name="Sidekick.getKeyByValue"></a>

### Sidekick.getKeyByValue(object, value)
Retrieves a key using the given value

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | - the object that contains the key/value |
| value | <code>\*</code> |  |

<a name="Sidekick.getInverseMap"></a>

### Sidekick.getInverseMap()
Inverts the key and value in a map

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Todo:**: rework
<a name="Sidekick.handlebarsHelpers"></a>

### Sidekick.handlebarsHelpers()
Adds additional handlebars helpers

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
<a name="Sidekick.jQueryHelpers"></a>

### Sidekick.jQueryHelpers()
Adds additional jquery helpers

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
<a name="Sidekick.getTerms"></a>

### Sidekick.getTerms(arr)
Takes an array of terms (eg. name parts) and returns groups of neighbouring terms

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| arr | <code>\*</code> |

<a name="Sidekick.escapeRegExp"></a>

### Sidekick.escapeRegExp(string) ⇒ <code>String</code>
Escapes regex special chars

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Returns**: <code>String</code> - escapedString

| Param | Type |
| --- | --- |
| string | <code>String</code> |

<a name="Sidekick.coerceType"></a>

### Sidekick.coerceType(target, type) ⇒ <code>\*</code>
Attempts to coerce a target value into the exemplar's type

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Returns**: <code>\*</code> - coercedValue

| Param | Type |
| --- | --- |
| target | <code>\*</code> |
| type | <code>\*</code> |

<a name="Sidekick.buildFormData"></a>

### Sidekick.buildFormData(FD)
Builds a FD returned from FormDataExtended into a formData array
Borrowed from foundry.js

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| FD | <code>\*</code> |

<a name="Sidekick.createId"></a>

### Sidekick.createId(existingIds)
Get a random unique Id, checking an optional supplied array of ids for a match

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| existingIds | <code>\*</code> |

<a name="Sidekick.toTitleCase"></a>

### Sidekick.toTitleCase(string)
Sets a string to Title Case

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| string | <code>\*</code> |

<a name="Sidekick.replaceOnDocument"></a>

### Sidekick.replaceOnDocument(pattern, string, param2)
Parses HTML and replaces instances of a matched pattern

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| pattern | <code>\*</code> |
| string | <code>\*</code> |
| param2 | <code>\*</code> |

<a name="Sidekick.getTextNodesIn"></a>

### Sidekick.getTextNodesIn(el) ⇒ <code>jQuery</code>
Get text nodes in a given element

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| el | <code>\*</code> |

<a name="Sidekick.generateUniqueSlugId"></a>

### Sidekick.generateUniqueSlugId(string, idList)
For a given string generate a slug, optionally checking a list of existing Ids for uniqueness

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| string | <code>\*</code> |
| idList | <code>\*</code> |

<a name="Sidekick.getNameFromFilePath"></a>

### Sidekick.getNameFromFilePath(path) ⇒ <code>String</code>
For a given file path, find the filename and then apply title case

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| path | <code>String</code> |

<a name="Sidekick.getFirstGM"></a>

### Sidekick.getFirstGM() ⇒ <code>GM</code> \| <code>null</code>
Gets the first GM user

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Returns**: <code>GM</code> \| <code>null</code> - a GM object or null if none found
<a name="Sidekick.isFirstGM"></a>

### Sidekick.isFirstGM() ⇒ <code>Boolean</code>
Checks if the current user is the first active GM

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
<a name="Sidekick.findArrayDuplicates"></a>

### Sidekick.findArrayDuplicates(arrayToCheck, filterProperty) ⇒ <code>Array</code>
Filters an array down to just its duplicate elements based on the property specified

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| arrayToCheck | <code>\*</code> |
| filterProperty | <code>\*</code> |

<a name="Sidekick.identifyArrayDuplicatesByProperty"></a>

### Sidekick.identifyArrayDuplicatesByProperty(arrayToCheck, filterProperty) ⇒ <code>Boolean</code>
Returns true for each array element that is a duplicate based on the property specified

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| arrayToCheck | <code>\*</code> |
| filterProperty | <code>\*</code> |

<a name="Sidekick.loadTemplates"></a>

### Sidekick.loadTemplates()
Loads templates for partials

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
<a name="Sidekick.getDocumentOwners"></a>

### Sidekick.getDocumentOwners(document) ⇒ <code>Array</code>
Retrieves all the owners of a given document

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)

| Param | Type |
| --- | --- |
| document | <code>\*</code> |

<a name="Sidekick.toCamelCase"></a>

### Sidekick.toCamelCase(string, delimiter) ⇒
Converts the given string to camelCase using the provided delimiter to break up words

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)
**Returns**: the converted string

| Param | Type |
| --- | --- |
| string | <code>String</code> |
| delimiter | <code>String</code> |

**Example**
```js
Sidekick.toCamelCase("my-cool-string", "-") // returns "myCoolString"
```
<a name="Triggler"></a>

## Triggler
Handles triggers for other gadgets in the module... or does it?!

**Kind**: global class

* [Triggler](#Triggler)
    * [.triggersFromJson(json)](#Triggler.triggersFromJson) ⇒ <code>Array</code>
    * [._prepareTrigger(trigger)](#Triggler._prepareTrigger)
    * [._constructString(parts)](#Triggler._constructString)
    * [._executeTrigger(trigger, target)](#Triggler._executeTrigger)
    * [._processUpdate(entity, update, entryPoint1, entryPoint2)](#Triggler._processUpdate)
    * [._onUpdateActor(actor, update, options, userId)](#Triggler._onUpdateActor)
    * [._onUpdateToken(token, update, options, userId)](#Triggler._onUpdateToken)
    * [._onRenderMacroConfig(app, html, data)](#Triggler._onRenderMacroConfig)

<a name="Triggler.triggersFromJson"></a>

### Triggler.triggersFromJson(json) ⇒ <code>Array</code>
Parses triggers JSON and returns triggers

**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| json | <code>Object</code> |

<a name="Triggler._prepareTrigger"></a>

### Triggler.\_prepareTrigger(trigger)
Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible

**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| trigger | <code>\*</code> |

<a name="Triggler._constructString"></a>

### Triggler.\_constructString(parts)
Construct a string based on trigger parts

**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| parts | <code>\*</code> |

<a name="Triggler._executeTrigger"></a>

### Triggler.\_executeTrigger(trigger, target)
Executes a trigger calling predefined actions

**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| trigger | <code>\*</code> |
| target | <code>\*</code> |

<a name="Triggler._processUpdate"></a>

### Triggler.\_processUpdate(entity, update, entryPoint1, entryPoint2)
Processes an entity update and evaluates triggers

**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| entity | <code>\*</code> |
| update | <code>\*</code> |
| entryPoint1 | <code>\*</code> |
| entryPoint2 | <code>\*</code> |

<a name="Triggler._onUpdateActor"></a>

### Triggler.\_onUpdateActor(actor, update, options, userId)
Update Actor handler

**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| actor | <code>\*</code> |
| update | <code>\*</code> |
| options | <code>\*</code> |
| userId | <code>\*</code> |

<a name="Triggler._onUpdateToken"></a>

### Triggler.\_onUpdateToken(token, update, options, userId)
Update token handler

**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| token | <code>Token</code> |
| update | <code>\*</code> |
| options | <code>\*</code> |
| userId | <code>\*</code> |

<a name="Triggler._onRenderMacroConfig"></a>

### Triggler.\_onRenderMacroConfig(app, html, data)
**Kind**: static method of [<code>Triggler</code>](#Triggler)

| Param | Type |
| --- | --- |
| app | <code>\*</code> |
| html | <code>\*</code> |
| data | <code>\*</code> |

<a name="getData"></a>

## getData()
**Kind**: global function
<a name="_updateObject"></a>

## \_updateObject(formData)
Override default update object behaviour

**Kind**: global function

| Param | Type |
| --- | --- |
| formData | <code>\*</code> |

