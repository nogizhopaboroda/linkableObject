//линковка объектов
$LO.core.factories['binded'] = function (objectPart, parent, partName, id, self) {
    if(objectPart.values && objectPart.elements) {

        if(objectPart.elements.length == 1) {
            var _type =  self._getType(objectPart.values[0]);
            self.factories[ (self.factories[_type]) ? _type : "default" ](objectPart.values[0], parent, partName, id, self);
            objectPart.eventConstructors[0](objectPart.elements[0], parent[partName], parent, partName);
        } else {

        }

    } else {
        setTimeout(function () {
            self.factories["binded"](objectPart, parent, partName, id, self);
        }, 1);
    }
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
        for(var i = 0; i < _elements.length; i++) {
            _binded.elements[i] = _elements[i];
            var _type = $LO.getHtmlElementType(_elements[i]);
            if(factor.indexOf("@") == 0) {
                _binded.values[i] = $LO._elementsCollection[_type].factors["@"](factors.replace("@", ""), _elements[i], data).value;
            } else {
                var __value = $LO._elementsCollection[_type].factors[factor](_elements[i], data);
                _binded.values[i] = __value.value;
                _binded.eventConstructors[i] = __value.eventConstructor;
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
            "checked": function (element, data) {
                if(data) {
                    //if()
                } else {
                    var __eventConstructor = function (element, objectPart, parent, part) {

                        element.addEventListener("change", function (event) {
                            console.log('change evewnt');

                            parent[part] = this.checked;
                        });
                    };

                    return {
                        "value": element.checked,
                        "eventConstructor": __eventConstructor
                    };
                }
            },
            "disabled": function () {

            },
            "visible": function () {

            },
            "value": function () {

            },
            "@": function (element, data, attrName) {

            }
        }
    }
};