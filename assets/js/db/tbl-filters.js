/*-------------------- Unique Values Column Filter -----------------------*/
/**
 * Class function: 
 * This filter presents all unique values of column to potentially filter on.
 */
export function UniqueValues() {}
UniqueValues.prototype.init = function (params) {                               //console.log("UniqueValues.prototype.init. params = %O", params)
    this.model = new UnqValsColumnFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
    this.filterModifiedCallback = params.filterModifiedCallback;
    this.valueGetter = params.valueGetter;
    this.colDef = params.colDef;
    this.filterActive = true;
    this.filterChangedCallback = params.filterChangedCallback; 
    this.rowsInBodyContainer = {};
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<div>' +
        '<div class="ag-filter-header-container">' +
        '<label>' +
        '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' +
        ' ( Select All )' +
        '</label>' +
        '</div>' +
        '<div class="ag-filter-list-viewport">' +
        '<div class="ag-filter-list-container">' +
        '<div id="itemForRepeat" class="ag-filter-item">' +
        '<label>' +
        '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>' +
        '<span class="ag-filter-value"></span>' +
        '</label>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    this.createGui();
    this.createApi();
}
UniqueValues.prototype.getGui = function () {
    return this.eGui;
}
UniqueValues.prototype.isFilterActive = function() {
    return this.model.isFilterActive();
}
UniqueValues.prototype.doesFilterPass = function (node) {
    if (this.model.isEverythingSelected()) { return true; }  // if no filter, always pass
    if (this.model.isNothingSelected()) { return false; }    // if nothing selected in filter, always fail
    var value = this.valueGetter(node);
    value = makeNull(value);
    if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            if (this.model.isValueSelected(value[i])) { return true; }
        }
        return false;
    } else { return this.model.isValueSelected(value); }
    
    return true;
}
UniqueValues.prototype.getApi = function () { // Not Working??
    return this.api;
};
UniqueValues.prototype.createApi = function () {
    var model = this.model;
    var that = this;
    this.api = {
        isFilterActive: function () {
            return model.isFilterActive();
        },
        selectEverything: function () { 
            that.eSelectAll.checked = true;
        },
        selectNothing: function () {
            that.eSelectAll.checked = false;
        },
        unselectValue: function (value) {
            model.unselectValue(value);
            that.refreshVirtualRows();
        },
        selectValue: function (value) {
            model.selectValue(value);
            that.refreshVirtualRows();
            expandTree();
        },
        isValueSelected: function (value) {
            return model.isValueSelected(value);
        },
        isEverythingSelected: function () {
            return model.isEverythingSelected();
        },
        isNothingSelected: function () {
            return model.isNothingSelected();
        },
        getUniqueValueCount: function () {
            return model.getUniqueValueCount();
        },
        getUniqueValue: function (index) {
            return model.getUniqueValue(index);
        },
        getModel: function () {
            return model.getModel();
        },
        setModel: function (dataModel) {
            if (dataModel === null) { that.eSelectAll.checked = true; } 
            model.setModel(dataModel);
            // that.refreshVirtualRows();
            that.filterChangedCallback();
        }, 
        refreshHeader: function() {
            tblOpts.api.refreshHeader();
        }
    };  
}  
// optional methods
UniqueValues.prototype.afterGuiAttached = function(params) {
    this.refreshVirtualRows();
};
UniqueValues.prototype.onNewRowsLoaded = function () {}
UniqueValues.prototype.onAnyFilterChanged = function () {
    var colFilterModel = this.model.getModel();                             
    if ( colFilterModel === null ) { return; }
    var col = Object.keys(colFilterModel)[0];
    var colFilterIconName = col + 'ColFilterIcon';                              //console.log("colFilterIconName = %O", colFilterIconName)
    var selectedStr = colFilterModel[col].length > 0 ? colFilterModel[col].join(', ') : "None";

    $('a[name=' + colFilterIconName + ']').attr("title", "Showing:\n" + selectedStr);
}
UniqueValues.prototype.destroy = function () {}
// Support methods
UniqueValues.prototype.createGui = function () {
    var _this = this;
    this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
    this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
    this.eSelectAll = this.eGui.querySelector("#selectAll");
    this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
    this.eListContainer.style.height = (this.model.getUniqueValueCount() * 20) + "px";
    removeAllChildren(this.eListContainer);
    this.eSelectAll.onclick = this.onSelectAll.bind(this);
    if (this.model.isEverythingSelected()) { this.eSelectAll.checked = true; 
    } else if (this.model.isNothingSelected()) { this.eSelectAll.checked = false; }
};
UniqueValues.prototype.onSelectAll = function () {
    var checked = this.eSelectAll.checked;
    if (checked) { this.model.selectEverything(); }
    else { this.model.selectNothing(); }

    this.updateAllCheckboxes(checked);
    this.filterChangedCallback();
};
UniqueValues.prototype.updateAllCheckboxes = function (checked) {
    var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
    for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
        currentlyDisplayedCheckboxes[i].checked = checked;
    }
};
UniqueValues.prototype.refreshVirtualRows = function () {
    this.clearVirtualRows();
    this.drawVirtualRows();
};
UniqueValues.prototype.clearVirtualRows = function () {
    var rowsToRemove = Object.keys(this.rowsInBodyContainer);
    this.removeVirtualRows(rowsToRemove);
};
//takes array of row id's
UniqueValues.prototype.removeVirtualRows = function (rowsToRemove) {      //console.log("removeVirtualRows called. rows = %O", rowsToRemove)
    var _this = this;
    rowsToRemove.forEach(function (indexToRemove) {
        var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
        _this.eListContainer.removeChild(eRowToRemove);
        delete _this.rowsInBodyContainer[indexToRemove];
    });
};
UniqueValues.prototype.drawVirtualRows = function () {
    var topPixel = this.eListViewport.scrollTop;
    var firstRow = Math.floor(topPixel / 20);
    this.renderRows(firstRow);
};
UniqueValues.prototype.renderRows = function (start) {
    var _this = this;
    for (var rowIndex = start; rowIndex <= this.model.getDisplayedValueCount(); rowIndex++) {
        //check this row actually exists (in case overflow buffer window exceeds real data)
        if (this.model.getDisplayedValueCount() > rowIndex) {
            var value = this.model.getDisplayedValue(rowIndex);
            _this.insertRow(value, rowIndex);
        }
    }
};
UniqueValues.prototype.insertRow = function (value, rowIndex) {
    var _this = this;
    var eFilterValue = this.eFilterValueTemplate.cloneNode(true);
    var valueElement = eFilterValue.querySelector(".ag-filter-value");
    var blanksText = '( Blanks )';
    var displayNameOfValue = value === null || value === "" ? blanksText : value;
    valueElement.innerHTML = displayNameOfValue;
    var eCheckbox = eFilterValue.querySelector("input");
    eCheckbox.checked = this.model.isValueSelected(value);
    eCheckbox.onclick = function () {
        _this.onCheckboxClicked(eCheckbox, value);
    };
    eFilterValue.style.top = (20 * rowIndex) + "px";
    this.eListContainer.appendChild(eFilterValue);
    this.rowsInBodyContainer[rowIndex] = eFilterValue;
};
UniqueValues.prototype.onCheckboxClicked = function (eCheckbox, value) {
    var checked = eCheckbox.checked;
    if (checked) {
        this.model.selectValue(value);
        if (this.model.isEverythingSelected()) {
            this.eSelectAll.checked = true;
        }
    }
    else {
        this.model.unselectValue(value);
        this.eSelectAll.checked = false;
        //if set is empty, nothing is selected
        if (this.model.isNothingSelected()) {
            this.eSelectAll.checked = false;
        }
    }
    this.filterChangedCallback();
};
/*------------------------UnqValsColumnFilterModel----------------------------------*/
/** Class Function */
function UnqValsColumnFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters) { //console.log("UnqValsColumnFilterModel.prototype.init. arguments = %O", arguments);
    this.colDef = colDef;                                                       
    this.rowModel = rowModel;                                                   
    this.valueGetter = valueGetter; 
    this.doesRowPassOtherFilters = doesRowPassOtherFilters; 
    this.filterParams = this.colDef.filterParams;  
    this.usingProvidedSet = this.filterParams && this.filterParams.values;
    this.createAllUniqueValues();
    this.createAvailableUniqueValues();
    this.displayedValues = this.availableUniqueValues;
    this.selectedValuesMap = {};
    this.selectEverything();
}
UnqValsColumnFilterModel.prototype.createAllUniqueValues = function () {
    if (this.usingProvidedSet) {
        let uniqueValues = toStrings(this.filterParams.values);
        this.allUniqueValues = getUniqueValuesPresent.bind(this)(uniqueValues);
    } else { 
        this.allUniqueValues = toStrings(this.getUniqueValues()); 
        this.allUniqueValues.sort();
    }
     
    function getUniqueValuesPresent(allValues) {
        const tableValues = this.getUniqueValues();  
        return allValues.filter(v => {  
            return tableValues.find(tV => tV ? tV.includes(v) : !v ? true : false)
        });
    }
};
UnqValsColumnFilterModel.prototype.getUniqueValues = function () {
    var _this = this;
    var uniqueCheck = {};
    var result = [];
    this.rowModel.forEachNode(function (node) {
        if (!node.group) {
            var value = _this.valueGetter(node);
            if (value === "" || value === undefined) { value = null; }
            addUniqueValueIfMissing(value);
        }
    });
    function addUniqueValueIfMissing(value) {
        if (!uniqueCheck.hasOwnProperty(value)) {
            result.push(value);
            uniqueCheck[value] = 1; }
    }
    return result;
};
UnqValsColumnFilterModel.prototype.createAvailableUniqueValues = function () {
    this.availableUniqueValues = this.allUniqueValues;
};
UnqValsColumnFilterModel.prototype.getUniqueValueCount = function () {
    return this.allUniqueValues.length;
};
UnqValsColumnFilterModel.prototype.selectEverything = function () {
    var count = this.allUniqueValues.length;
    for (var i = 0; i < count; i++) {
        var value = this.allUniqueValues[i];
        this.selectedValuesMap[value] = null;
    }
    this.selectedValuesCount = count;
    // this.
};
UnqValsColumnFilterModel.prototype.selectNothing = function () {
    this.selectedValuesMap = {};
    this.selectedValuesCount = 0;
};
UnqValsColumnFilterModel.prototype.unselectValue = function (value) {
    if (this.selectedValuesMap[value] !== undefined) {
        delete this.selectedValuesMap[value];
        this.selectedValuesCount--;
    }
};
UnqValsColumnFilterModel.prototype.selectValue = function (value) {
    if (this.selectedValuesMap[value] === undefined) {
        this.selectedValuesMap[value] = null;
        this.selectedValuesCount++;
    }
};
UnqValsColumnFilterModel.prototype.isEverythingSelected = function () {
    return this.allUniqueValues.length === this.selectedValuesCount;
};
UnqValsColumnFilterModel.prototype.isNothingSelected = function () {
    return this.allUniqueValues.length === 0;
};
/* Returns true if a selected value is present in row node. */
UnqValsColumnFilterModel.prototype.isValueSelected = function (value) {  
    if (this.selectedValuesMap[value] !== undefined) { return true; }  
    const selectedValues = Object.keys(this.selectedValuesMap); 
    for (let i = selectedValues.length - 1; i >= 0; i--) { 
        if (!value && !selectedValues[i]) { return true; }
        if (value && value.includes(selectedValues[i])) { return true; }
    }
    return false;
};
UnqValsColumnFilterModel.prototype.getDisplayedValueCount = function () {
    return this.displayedValues.length;
};
UnqValsColumnFilterModel.prototype.getDisplayedValue = function (index) {
    return this.displayedValues[index];
};
UnqValsColumnFilterModel.prototype.isFilterActive = function () {
    return this.allUniqueValues.length !== this.selectedValuesCount;
};
UnqValsColumnFilterModel.prototype.getModel = function () {
    var model = {};
    var column = this.colDef.field;
    model[column] = [];
    if (!this.isFilterActive()) { return null; }
    var selectedValues = [];
    iterateObject(this.selectedValuesMap, function (key) {
        model[column].push(key);
    });
    return model;
};
UnqValsColumnFilterModel.prototype.setModel = function (model, isSelectAll) {
    if (model && !isSelectAll) {
        this.selectNothing();
        for (var i = 0; i < model.length; i++) {
            var newValue = model[i];
            if (this.allUniqueValues.indexOf(newValue) >= 0) {
                this.selectValue(model[i]);
            } else {
                tblOpts.api.showNoRowsOverlay(); 
                console.warn('Value ' + newValue + ' is not a valid value for filter'); 
            }
        }
    } else { this.selectEverything(); }
};
/*---------Unique Values Filter Utils--------------------------------------*/
function loadTemplate(template) {
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;
    return tempDiv.firstChild;
}
function toStrings(array) {
    return array.map(function (item) {
        if (item === undefined || item === null || !item.toString) {
            return null;
        } else { return item.toString(); }
    });
}
function removeAllChildren(node) {
    if (node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild); }
    }
}
function makeNull(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    } else { return value; }
}
function iterateObject(object, callback) {
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = object[key];
        callback(key, value);
    }
};