//линковка объектов
$LO.core.factories['binded'] = function (objectPart, parent, partName, self) {

    if(objectPart.values && objectPart.elements) {
        if(objectPart.elements.length == 1) {
            var _type =  self._getType(objectPart.values[0]);
            var link = self.factories[ (self.factories[_type]) ? _type : "default" ](objectPart.values[0], parent, partName);
            objectPart.eventConstructors[0](objectPart.elements[0], parent[partName], parent, partName);

            if(link instanceof Array) {
                var eventsConstructors = objectPart.setterConstructors[0](objectPart.elements[0]);
                for(var event in eventsConstructors) {
                    for(var i = 0; i < eventsConstructors[event].length; i++) {
                        link.addEventListener(event, eventsConstructors[event][i]);
                    }
                }
            } else {
                link.addEventListener("onSet", objectPart.setterConstructors[0](objectPart.elements[0]));
            }

        } else {
        }

    } else {
        setTimeout(function () {
            self.factories["binded"](objectPart, parent, partName, self);
        }, 1);
    }
};

$LO.core.defaultGetterDecorators['bind'] = {
    "types": ["all"],
    "decorate": function () {
        console.log("bind function...");
    },
    "configurable": true
};

$LO.bind = function (selector, factor, data, handlers, applyToSelector) {

    var _binded = function () {};
        _binded.type = "binded";
        _binded.handlers = handlers;

    /* переписать $LO.bind() через setTimeout. Как у фабрики дляя binded */

    if(document.querySelector(selector) == null) {
        window.addEventListener("load", function () {
            __process();
        });
    } else {
        __process();
    }

    var __process = function () {
        var _elements = document.querySelectorAll(selector);
        _binded.elements = [];
        _binded.values = [];
        _binded.eventConstructors = [];
        _binded.setterConstructors = [];
        for(var i = 0; i < _elements.length; i++) {
            _binded.elements[i] = _elements[i];
            var _type = $LO.getHtmlElementType(_elements[i]);
            if(factor.indexOf("@") == 0) {
                var __value = $LO._elementsCollection[_type].factors["@"](_elements[i], data, factor.replace("@", ""));
                _binded.values[i] = __value.value;
                _binded.eventConstructors[i] = __value.eventConstructor;
                _binded.setterConstructors[i] = __value.setterConstructor;
            } else {
                var __value = $LO._elementsCollection[_type].factors[factor](_elements[i], data);
                _binded.values[i] = __value.value;
                _binded.eventConstructors[i] = __value.eventConstructor;
                _binded.setterConstructors[i] = __value.setterConstructor;
            }
        }
    };

    return _binded;
};

$LO.getHtmlElementType = function (element) {

    for(var _type in $LO._elementsCollection) {
        if ($LO._elementsCollection[_type].itIs(element)) return _type;
    }
};


$LO._elementsCollection = {
    "checkbox": {
        "itIs": function (element) {
            if(element instanceof HTMLInputElement && element.getAttribute("type") === "checkbox") return true;
            else return false;
        },
        "factors": {
            "plainAttrFactory": function (element, data, attrName, needSetterConstructor, needEventConstructor, eventName) {
                var __eventConstructor = function () {};
                var __setterConstructor = function () {};
                if(data !== undefined) {
                    //проверять на bool или строку вида "true"/"false"
                    try {
                        element[attrName] = data;
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (needEventConstructor) {
                    __eventConstructor = function (element, objectPart, parent, part) {
                        element.addEventListener(eventName, function (event) {
                            parent[part] = this[attrName];
                        });
                    };
                }
                if (needSetterConstructor) {
                    __setterConstructor = function (element) {
                        return function (newValue, eventTarget, eventType, dataField) {
                            if(typeof newValue) {
                                element[attrName] = newValue;
                            }
                        };
                    };
                }
                return {
                    "value": element[attrName],
                    "eventConstructor": __eventConstructor,
                    "setterConstructor": __setterConstructor
                };
            },
            "checked": function (element, data) {
                return this.plainAttrFactory(element, data, "checked", true, true, "change");
            },
            "disabled": function (element, data) {
                return this.plainAttrFactory(element, data, "disabled", true);
            },
            "visible": function (element, data) {
                return this.plainAttrFactory(element, (data === undefined ? data : !data), "hidden", true);
            },
            "value": function (element, data) {
                return this.plainAttrFactory(element, data, "value", true);
            },
            "@": function (element, data, attrName) {
                if(data !== undefined) {
                    try {
                        element.setAttribute(attrName, data);
                    } catch (e) {
                        console.error(e);
                    }
                }
                var __setterConstructor = function (element) {
                    return function (newValue, eventTarget, eventType, dataField) {
                        if(typeof newValue) {
                            element.setAttribute(attrName, newValue);
                        }
                    };
                };
                return {
                    "value": element.getAttribute(attrName),
                    "eventConstructor": function () {},
                    "setterConstructor": __setterConstructor
                };
            },
            "class": function (element, data) {
                if(data !== undefined) {
                    if(data instanceof Array) {
                        for(var i = 0; i < data.length; i++) {
                            element.classList.add(data[i]);
                        }
                    } else {
                        try {
                            element.classList.add(data);
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
                var __setterConstructor = function (element) {
                    return {
                        "onPush": [function (value, eventType) { element.classList.add(value); }],
                        "onDelete": [function (number, eventType, dataField) { console.log(number); }]
                    };
                };
                var __value = [];
                for(var i = 0; i < element.classList.length; i++) {
                    __value.push(element.classList[i]);
                }
                return {
                    "value": __value,
                    "eventConstructor": function () {},
                    "setterConstructor": __setterConstructor
                };
            }
        }
    }
};

$LO.element = function (selector, widget, object) {
    return "widget_stab_";
};


/*   выборка элементов xpath'ом
var headings = document.evaluate("_your_xpath_", document, null, XPathResult.ANY_TYPE, null);
var thisHeading = headings.iterateNext();
var alertText = "Level 2 headings in this document are:\n";
while (thisHeading) {
  if(thisHeading instanceof HTMLElement) { console.log(thisHeading); }
  thisHeading = headings.iterateNext();
}
*/


/*
var start = new Date();
var elms = document.querySelectorAll("table.x tr");
console.log(elms);
var end = new Date();
console.log("time: " + (end - start));

var start2 = new Date();
var headings = document.evaluate("//table[@class='x']//tr", document, null, XPathResult.ANY_TYPE, null);
var elms2 = [];
var thisHeading = headings.iterateNext();
while (thisHeading) {
  if(thisHeading instanceof HTMLElement) {
      elms2.push(thisHeading);
  }
  thisHeading = headings.iterateNext();
}
console.log(elms2);
var end2 = new Date();
console.log("time2: " + (end2 - start2));*/
