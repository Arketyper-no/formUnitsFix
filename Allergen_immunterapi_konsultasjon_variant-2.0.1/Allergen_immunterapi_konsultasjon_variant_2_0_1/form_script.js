(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getFirstDate = exports.AllergenInjection = void 0;

var AllergenInjection =
/** @class */
function () {
  function AllergenInjection(allergen, injectionTime) {
    this.allergen = allergen;
    this.injectionTime = injectionTime;
  }

  AllergenInjection.prototype.compareTime = function (t) {
    var _a;

    var result = "".concat(t === null || t === void 0 ? void 0 : t.value).localeCompare("".concat((_a = this.injectionTime) === null || _a === void 0 ? void 0 : _a.value));
    console.debug("Compare this ".concat(this.injectionTime, " with ").concat(t, " - result = ").concat(result));
    return result;
  };

  AllergenInjection.prototype.getFirst = function (t) {
    var result = this.compareTime(t);

    if (result > 0) {
      return t;
    } else {
      return this.injectionTime;
    }
  };

  return AllergenInjection;
}();

exports.AllergenInjection = AllergenInjection;

function getFirstDate(a, b) {
  if (a == null && b == null) {
    return null;
  }

  if (a == null) {
    return b;
  }

  if (b == null) {
    return a;
  }

  var result = "".concat(a === null || a === void 0 ? void 0 : a.value).localeCompare("".concat(b === null || b === void 0 ? void 0 : b.value));

  if (result < 0) {
    return a;
  } else {
    return b;
  }
}

exports.getFirstDate = getFirstDate;
},{}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.addListenerAllergen = void 0;

var index_1 = require("./index");

var updateGenericReactionContainer_1 = require("./updateGenericReactionContainer");

var checkForFirstExponationTimeForAllAllergens_1 = require("./checkForFirstExponationTimeForAllAllergens");

function addListenerAllergen(api) {
  addListenersForInjection();
  addListenersForGenericReaction();

  function addListenersForInjection() {
    api.addListener(index_1.f_injection_container, "OnChildAdded", function (id, value, parent) {
      console.log("#### new injection added - explore");
    });
    api.addListener(index_1.f_allergen_selected, "OnChanged", function (id, value, parent) {
      (0, updateGenericReactionContainer_1.handleStateChangeForGenericReaction)(api, parent);
      (0, checkForFirstExponationTimeForAllAllergens_1.checkForFirstExponationTimeForAllAllergens)(api);
    });
    api.addListener(index_1.f_allergen_injection_timeallergen, "OnChanged", function (id, value, parent) {
      (0, updateGenericReactionContainer_1.handleStateChangeForGenericReaction)(api, parent);
      var allergen = api.getFieldValue(index_1.f_allergen_selected, parent);
      (0, checkForFirstExponationTimeForAllAllergens_1.checkForFirstExponationTimeForAllAllergens)(api);
    });
  }

  function addListenersForGenericReaction() {
    api.addListener(index_1.f_generic_reaction, "OnChanged", function (id, value, parent) {
      console.log("isGenericReaction changed" + value);
      (0, updateGenericReactionContainer_1.handleStateChangeForGenericReaction)(api, parent);
    });
    api.addListener(index_1.f_generic_reaction, "OnFormInitialized", function (id, value, parent) {
      console.log("isGenericReaaction on form initialized" + value);
      (0, updateGenericReactionContainer_1.handleStateChangeForGenericReaction)(api, parent);
    });
    api.addListener(index_1.f_generic_reaction, "OnChildAdded", function (id, value, parent) {
      console.log("isGenericReaaction on child added" + value);
    });
    api.addListener(index_1.f_generic_reaction, "OnChildRemoved", function (id, value, parent) {
      console.log("isGenericReaaction on child removed" + value);
    });
    api.addListener(index_1.allergen_generic_reaction_first_exposed_time_form_id, "OnChanged", function (id, value, parent) {
      console.info(">> Eksponeringstid ble endret til " + value);
    });
  }
}

exports.addListenerAllergen = addListenerAllergen;
},{"./checkForFirstExponationTimeForAllAllergens":5,"./index":6,"./updateGenericReactionContainer":8}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupListenerDoubleControlGenericReaction = exports.reactivateDoubleControlCheck = void 0;

// Kommentert ut av byggescript = require("ehrcraft-form-api");

var FUNC_NAME = "### DOBBELTKONTROLL:: ";
/**
 * Dobbeltkontroll generisk reaksjon
 */

var f_time = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering/time";
var f_medication = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering/legemiddel,_dose_og_administrasjonsvei@Legemiddel, dose og administrasjonsvei";
var f_double_control = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering/dobbeltkontrollert";
var f_medication_container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering";
var f_med_double_performer = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering/other_participations/performer"; //const f_med_double_participation_container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering/other_participations";

var f_med_double_function = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering/other_participations/function";
var v_med_double_function = "Dobbeltkontroll";
/**
 * Use this method to recalculate the occurences of "Dobbeltkontroll"
 * This function fix an issue where the user had to toggle back and forth "Dobbeltkontroll?"
 * Now the state is consistent when user toggles "Generell reaksjon"
 * @param api
 */

function reactivateDoubleControlCheck(api) {
  var medications = api.getFields(f_medication_container);
  var controller = setupListenerDoubleControlGenericReaction(api);

  for (var _i = 0, medications_1 = medications; _i < medications_1.length; _i++) {
    var m = medications_1[_i];
    var d = api.getFieldValue(f_double_control, m);
    controller.onDoubleControlChanged(d, m);
  }
}

exports.reactivateDoubleControlCheck = reactivateDoubleControlCheck;
/**
 * Beskrivelse av ønsket funksjonalitet:
 * Dersom pasienten får en reaksjon på behandling skal det dokumenteres om den generiske reaksjonen. Av og til må det gis medikament for å motvirke reaksjonen. Medikament registreres som en ACTION.medication.v1.
 * Følgende egenskaper settes om medikamentet:
 * - tidspunkt for gitt medikament (ACTION.time)
 * - hvilket legemiddel som ble gitt (DV_TEXT)
 * - om det var krav om dobbeltkontroll på medikamentet (DV_BOOLEAN)
 *
 * Dersom det er krav om dobbeltkontroll (DV_BOOLEAN = true) så skal det dokumenteres hvem som gjorde dobbeltkontroll gjennom egenskapen other_participations. Denne skal da være påkrevet å fylle ut.
 *
 * @param api
 */

function setupListenerDoubleControlGenericReaction(api) {
  console.log("##  set up listener generic reaction");
  return {
    listen: function () {
      setUpListener();
    },
    onDoubleControlChanged: onDoubleControlChanged
  };

  function setUpListener() {
    [f_time, f_medication].forEach(function (f) {
      api.addListener(f, "OnChanged", function (id, value, parent) {
        handleMedicationStateChanged(parent, evaluteMedicationState(parent));
      });
    });
    api.addListener(f_double_control, "OnFormInitialized", function (id, value, parent) {
      //console.log(FUNC_NAME + " double control on initialized" + value);
      onDoubleControlChanged(value, parent);
    });
    api.addListener(f_double_control, "OnChanged", function (id, value, parent) {
      //console.log(FUNC_NAME + " double control on changed" + value);
      onDoubleControlChanged(value, parent);
    });
  }
  /**
   *
   * @param value Yes/No for double control
   * @param parent the medication container
   */


  function onDoubleControlChanged(value, parent) {
    if (value != undefined || value != null) {
      var v_1 = value;
      console.log(FUNC_NAME + "on changed to value " + v_1.value);

      if (v_1.value) {
        toogleFunctionAndPerformer(parent, "ACTIVE");
      } else {
        toogleFunctionAndPerformer(parent, "DISABLE");
      }
    } else {
      toogleFunctionAndPerformer(parent, "DISABLE");
    }
  }
  /**
   *
   * @param parent the container
   * @param state DATA = some data is entered elsewhere and the double control element must be verified by user, NO-DATA = no other data is entered
   */


  function handleMedicationStateChanged(parent, state) {
    switch (state) {
      case "DATA":
        api.setOccurrences(f_double_control, "1..1", parent);
        break;

      case "NO-DATA":
        api.setOccurrences(f_double_control, "0..1", parent);
        break;
    }
  }
  /**
   *
   * @param parent the container
   * @param toogle ACTIVE = double control is active, DISABLE = double control is not active and should be cleared/disabled
   */


  function toogleFunctionAndPerformer(parent, toogle) {
    switch (toogle) {
      case "ACTIVE":
        api.enableField(f_med_double_function, parent);
        api.enableField(f_med_double_performer, parent);
        var t = new DvText();
        t.value = v_med_double_function;
        api.setFieldValue(f_med_double_function, t, parent);
        break;

      case "DISABLE":
        api.disableField(f_med_double_function, parent);
        api.disableField(f_med_double_performer, parent);
        api.clearField(f_med_double_function, parent);
        api.clearField(f_med_double_performer, parent);
        break;
    }
  }

  function evaluteMedicationState(parent) {
    var time = api.getFieldValue(f_time, parent);
    var medication = api.getFieldValue(f_medication, parent);
    var doubleControl = api.getFieldValue(f_double_control, parent);

    if (isNull(time) && isNull(medication) && isNull(doubleControl)) {
      return "NO-DATA";
    } else {
      return "DATA";
    }

    function isNull(t) {
      if (t == undefined) {
        return true;
      }
    }
  }
}

exports.setupListenerDoubleControlGenericReaction = setupListenerDoubleControlGenericReaction;
},{}],4:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.addListenerMedication = void 0;

// Kommentert ut av byggescript = require("ehrcraft-form-api");

function addListenerMedication(api) {
  var f_styrke = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/legemiddelhåndtering/legemiddeldetaljer/styrke@Styrke";
  var f_volume = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/legemiddelhåndtering/dosering/volum@Volum";
  var f_dose = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/legemiddelhåndtering/dosering/dose";
  api.addListener(f_styrke, "OnChanged", function (id, value, parent) {
    setDose(parent);
  });
  api.addListener(f_volume, "OnChanged", function (id, value, parent) {
    setDose(parent);
  });

  function setDose(parent) {
    var v_styrke = api.getFieldValue(f_styrke, parent);
    var v_volume = api.getFieldValue(f_volume, parent);
    var s = getMagnitudeOrUndefined(v_styrke);
    var v = getMagnitudeOrUndefined(v_volume);

    if (s != undefined && v != undefined) {
      var d = s * v;
      var v_dosage = new DvQuantity();
      v_dosage.magnitude = d;
      v_dosage.units = "[arb'U]{SQ-U}";
      console.log("Dose beregnet til ".concat(v_dosage, " based on ").concat(v_styrke, " * ").concat(v_dosage));
      api.setFieldValue(f_dose, v_dosage, parent);
    } else {
      api.clearField(f_dose, parent);
    }

    function getMagnitudeOrUndefined(v) {
      if (v == undefined || v == null) {
        return undefined;
      } else {
        if (v.magnitude != undefined) {
          return v.magnitude;
        } else {
          return undefined;
        }
      }
    }
  }
}

exports.addListenerMedication = addListenerMedication;
},{}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.checkForFirstExponationTimeForAllAllergens = void 0;

var index_1 = require("./index");

var AllergenInjection_1 = require("./AllergenInjection");

var isGenericReactionValue_1 = require("./isGenericReactionValue");
/**
 * A function which does some heavy lifting.....
 * It will collect all injection times for each allergen
 * Then for each allergen the first injection time will be chosen
 * Then for each generic reaction the exponation time will be set to the first injection time
 * @param api
 */


function checkForFirstExponationTimeForAllAllergens(api) {
  var injections = api.getFields(index_1.f_injection_container);
  var allergenTimes = {};
  log("Start checkForFirstExponationTimeForAllAllergens");
  collectAllergenTimes();
  log("Antall injeksjoner totalt: ".concat(injections.length));
  updateExponationTimes();
  log("End checkForFirstExponationTimeForAllAllergens");

  function collectAllergenTimes() {
    for (var _i = 0, injections_1 = injections; _i < injections_1.length; _i++) {
      var parent_1 = injections_1[_i];
      var allergen = api.getFieldValue(index_1.f_allergen_selected, parent_1);
      var time = api.getFieldValue(index_1.f_allergen_injection_timeallergen, parent_1);

      if (allergen != null) {
        var v_1 = allergen.definingCode.codeString + "";
        var current = allergenTimes[v_1];

        if (current == null) {
          current = {
            allergen: allergen,
            time: time
          };
        }

        if (time != null) {
          var first = (0, AllergenInjection_1.getFirstDate)(current.time, time);

          if (first != null) {
            current.time = first;
            allergenTimes[v_1] = current;
          } else {
            log("first is null");
          }
        } else {
          log("time is null for allergen" + allergen);
        }
      } else {
        log("allergen is null");
      }
    }
  }

  function updateExponationTimes() {
    var _a, _b;

    log("Begin update of eksponeringstid");

    for (var _i = 0, injections_2 = injections; _i < injections_2.length; _i++) {
      var parent_2 = injections_2[_i];
      var allergen = api.getFieldValue(index_1.f_allergen_selected, parent_2);

      if (allergen != null) {
        var first = allergenTimes[allergen.definingCode.codeString + ""];
        var v_generic_reaction = api.getFieldValue(index_1.f_generic_reaction, parent_2);
        var genericReactionTrue = (0, isGenericReactionValue_1.isGenericReactionValue)(v_generic_reaction);

        if (genericReactionTrue) {
          log("SET  ".concat((_a = first === null || first === void 0 ? void 0 : first.allergen) === null || _a === void 0 ? void 0 : _a.value, " to ").concat((_b = first === null || first === void 0 ? void 0 : first.time) === null || _b === void 0 ? void 0 : _b.value));
          api.setFieldValue(index_1.allergen_generic_reaction_first_exposed_time_form_id, first === null || first === void 0 ? void 0 : first.time, parent_2);
        } else {
          log("CLEAR since no generic reaction ");
          api.clearField(index_1.allergen_generic_reaction_first_exposed_time_form_id, parent_2);
        }
      }
    }
  }

  function log(s) {
    console.debug("--> checkForFirstExponationTimeForAllAllergens: " + s);
  }
}

exports.checkForFirstExponationTimeForAllAllergens = checkForFirstExponationTimeForAllAllergens;
},{"./AllergenInjection":1,"./index":6,"./isGenericReactionValue":7}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.allergen_generic_reaction_first_exposed_time_form_id = exports.f_generic_reaction = exports.f_generic_reaction_container = exports.f_injection_container = exports.f_allergen_injection_timeallergen = exports.f_allergen_selected = exports.main = void 0;

var addListenerMedication_1 = require("./addListenerMedication");

var addListenerAllergen_1 = require("./addListenerAllergen");

var addListenerDoubleControl_1 = require("./addListenerDoubleControl");
/**
 * Main function invoked when form is initialized
 * @param api
 */


function main(api) {
  console.log("###############");
  console.log("############### Welcome to the allergen immunetherapy script world - I will set up the listeners and make sure all logic is handled correct");
  console.log("###############");
  setUpListeners();

  function setUpListeners() {
    (0, addListenerMedication_1.addListenerMedication)(api);
    (0, addListenerAllergen_1.addListenerAllergen)(api);
    (0, addListenerDoubleControl_1.setupListenerDoubleControlGenericReaction)(api).listen();
  }
}

exports.main = main;
exports.f_allergen_selected = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/legemiddelhåndtering/allergen@Allergen";
exports.f_allergen_injection_timeallergen = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/legemiddelhåndtering/time";
/**
 * Repeating SECTION for each injection given
 * /content[openEHR-EHR-SECTION.adhoc.v1 and name/value='Templat-overskrift']/items[openEHR-EHR-SECTION.adhoc.v1]
 */

exports.f_injection_container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift";
/**
 * SECTION with models to describe a generic reaction
 * /content[openEHR-EHR-SECTION.adhoc.v1 and name/value='Templat-overskrift']/items[openEHR-EHR-SECTION.adhoc.v1]/items[openEHR-EHR-SECTION.adhoc.v1 and name/value='Generell reaksjon']
 */

exports.f_generic_reaction_container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon";
exports.f_generic_reaction = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/generell_reaksjon@Generell reaksjon";
/**
 * Form id - defines the time for the first exponation causing the generic reaction
 */

exports.allergen_generic_reaction_first_exposed_time_form_id = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/reaksjonshendelse/første_eksponering";main(api);
},{"./addListenerAllergen":2,"./addListenerDoubleControl":3,"./addListenerMedication":4}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isGenericReactionValue = void 0;

function isGenericReactionValue(v) {
  var isReaction = false;

  if (v != null) {
    var t = v;

    if (t.value && t.value == 'Ja') {
      isReaction = true;
    }
  }

  console.debug("#- injection has generic reaction = ".concat(isReaction));
  return isReaction;
}

exports.isGenericReactionValue = isGenericReactionValue;
},{}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.handleStateChangeForGenericReaction = void 0;

// Kommentert ut av byggescript = require("ehrcraft-form-api");

var index_1 = require("./index");

var isGenericReactionValue_1 = require("./isGenericReactionValue");

var addListenerDoubleControl_1 = require("./addListenerDoubleControl");

var checkForFirstExponationTimeForAllAllergens_1 = require("./checkForFirstExponationTimeForAllAllergens");
/**
 * Combined function to manage the state for each generic reaction.
 * @param api
 * @param isGenericReaction
 * @param parent . the container defining the injection - the method will only update status for the generic reaction in this injection/container
 */


function handleStateChangeForGenericReaction(api, parent) {
  var v = api.getFieldValue(index_1.f_generic_reaction, parent);
  var injectionTime = api.getFieldValue(index_1.f_allergen_injection_timeallergen, parent);
  console.log(injectionTime);
  var isGenericReaction = (0, isGenericReactionValue_1.isGenericReactionValue)(v);
  console.debug("> START: Update generic reaction container - with generic reaction value = ".concat(v));
  toggleContainer();
  activateGenericReactionContainer();
  console.debug("< END: Update generic reaction container - with generic reaction value = ".concat(isGenericReaction));

  function toggleContainer() {
    if (isGenericReaction) {
      api.showField(index_1.f_generic_reaction_container, parent); //api.enableField(f_generic_reaction_container, parent);

      toggleOnGenericReactionChanged(api, parent).enable();
    } else {
      api.hideField(index_1.f_generic_reaction_container, parent); //api.disableField(f_generic_reaction_container, parent);

      toggleOnGenericReactionChanged(api, parent).disable();
    }
  }
  /**
   * Combined function to handle state changes in generic reaction
   * 1 - copy the actual allergen for this injection
   * 2 - set the correct time for exponation
   * 3 - set default values for SNOMED-CT classification
   */


  function activateGenericReactionContainer() {
    copyAllergenValues();
    (0, checkForFirstExponationTimeForAllAllergens_1.checkForFirstExponationTimeForAllAllergens)(api);
    setDefaultValuesForGenericReaction();
    /**
     * For each injection the same allergen should be used for subtance and reaction.
     * This method will copy the allergen values from injection to the respective fields.
     */

    function copyAllergenValues() {
      var f_reactionAllergen = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/substans";
      var f_reactionSubstans = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/reaksjonshendelse/spesifikk_substans";
      var v_allergen = api.getFieldValue(index_1.f_allergen_selected, parent);
      console.log(">>> Active allergen is: ".concat(v_allergen));
      api.setFieldValue(f_reactionSubstans, v_allergen, parent);
      api.setFieldValue(f_reactionAllergen, v_allergen, parent);
    }
    /**
     * Set or clear the default SNOMED-CT codes for purpose and exponation method.
     * Overrides default values set with form designer.
     */


    function setDefaultValuesForGenericReaction() {
      var purpose_form_id = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/formål";
      var expo_method_form_id = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/sammendrag_av_overfølsomhetsreaksjon/eksponeringsvei";
      /**
       * Setter tidspunkt for monitorering til sammetidspunkt som injeksjonen
       * Tidspunkt for time settes til pluss 30 minutter (som er standard i OPT og ønsket fra klinikk)
       * 2023.10.20
       */

      var f_origin = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/history/origin";
      var f_time = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/time";
      api.setFieldValue(f_origin, injectionTime, parent);

      if (injectionTime != null || injectionTime != undefined) {
        var d1 = new Date(Date.parse(injectionTime.value));
        var d2 = new Date(d1.getTime());
        d2.setMinutes(d2.getMinutes() + 30);
        var v_1 = new DvDateTime(d2);
        api.setFieldValue(f_time, v_1, parent);
      } else {
        api.clearField(f_time, parent);
      }

      var v_purpose_coded_text = DvCodedText.Parse("local::182678001|Hyposensitization to allergens (procedure)|");
      var v_expo_coded_text = DvCodedText.Parse("local::32282008|Subcutaneous injection (procedure)|");
      api.setFieldValue(purpose_form_id, v_purpose_coded_text, parent);
      api.setFieldValue(expo_method_form_id, v_expo_coded_text, parent);
    }
  }
}

exports.handleStateChangeForGenericReaction = handleStateChangeForGenericReaction;
/**
 * Function to handle the toggling of generic reaction.
 * Based in if "Generell reaksjon" er "Ja" (enable) eller "Nei" (disable)
 * @param api
 * @param parent container for generic reaction
 * @returns
 */

function toggleOnGenericReactionChanged(api, parent) {
  return {
    enable: function () {
      toggle(true);
    },
    disable: function () {
      toggle(false);
    }
  };
  /**
   * Combined function to make the enable/disable function easier to read
   * @param enable Generisk reaksjon ja = true, nei = false
   */

  function toggle(enable) {
    bloodPressure(enable);
    pulse(enable);
    medication(enable);
    spirometry(enable);
    reactionEvent(enable);
  }
  /**
   * Will use the parent given as parameter to overall function to get correct container
   * @param enable true if field should be enabled, false to disable
   * @param f the form id to work on
   */


  function enableOrDisableField(enable, f) {
    if (enable) {
      api.enableField(f, parent);
    } else {
      api.disableField(f, parent);
    }
  }

  function bloodPressure(enable) {
    var container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/blodtrykk";
    enableOrDisableField(enable, container);
  }

  function pulse(enable) {
    var container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/puls@Puls";
    enableOrDisableField(enable, container);
  }

  function medication(enable) {
    var container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/legemiddelhåndtering";
    enableOrDisableField(enable, container);

    if (enable) {
      // trick to keep state of double check consistent - without this it might be mandatory after a toggle 
      (0, addListenerDoubleControl_1.reactivateDoubleControlCheck)(api);
    }
  }

  function spirometry(enable) {
    var container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/spirometriresultat";
    enableOrDisableField(enable, container);
  }

  function reactionEvent(enable) {
    var container = "allergen_immunterapi_konsultasjon/templat-overskrift@Templat-overskrift/templat-overskrift/generell_reaksjon@Generell reaksjon/monitorering_for_overfølsomhetsreaksjoner/monitoreringsintervall/reaksjonshendelse";
    enableOrDisableField(enable, container);
  }
}
},{"./addListenerDoubleControl":3,"./checkForFirstExponationTimeForAllAllergens":5,"./index":6,"./isGenericReactionValue":7}]},{},[6])