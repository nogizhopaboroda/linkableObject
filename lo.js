var $LO = function (object, events) {
	var liveObject = function (obj) {
        this._id = 0;
        this.__evolvent = [];

        this._buildingMode = true;
        var self = this;

        this._buildLiveObject = function (object, parent) {
            if(typeof object == "object") {
                for(var part in object) {
                    var _type =  this._getType(object[part]);
                    this.factories[ (this.factories[_type]) ? _type : "default" ](object[part], parent, part, this._id);
                }
            } else {
                throw new Error("can't be a string");
            }
        };

		this._getType = function (variable) {
            if(typeof variable === "object") {
                if(variable == null) return "null";
                if(variable instanceof Array) return "array";
                return typeof variable;
            }
            if(typeof variable === "number") {
                if(variable.toString().indexOf('.') != -1) return "float";
                return typeof variable;
            }
            if(typeof variable === "boolean") return "bool";
            if(typeof variable === "function") {
                if(variable.computed === true) return "computed";
                if(variable.eventable === true) return "eventable";
                if(variable.binded === true) return "binded";
                return "funtion";
            }
            return typeof variable;
		};

        this.pushToEvolvent = function (data, type, id) {
            self.__evolvent[id] = {};
            self.__evolvent[id].value = data;
            self.__evolvent[id].type  = type;

            self._id++;
        };

        this.factories = {
            "default": function (objectPart, parent, partName, id) {

                self.pushToEvolvent(objectPart, self._getType(objectPart), id);

                Object.defineProperty(parent, partName, {
                    set: function (newValue) {

                        if(self.__evolvent[id].handlers && self.__evolvent[id].handlers['onSet']) {
                            self.__evolvent[id].handlers['onSet'].call(parent, newValue, parent, "set", self.__evolvent[id]);
                        } else if (self.__commonHandlers && self.__commonHandlers['onSet']) {
                            self.__commonHandlers['onSet'].call(parent, newValue, parent, "set", self.__evolvent[id]);
                        }

                        self.__evolvent[id].value = newValue;
                    },
                    get: function () {

                        if(self.__evolvent[id].handlers && self.__evolvent[id].handlers['onGet']) {
                            self.__evolvent[id].handlers['onGet'].call(parent, self.__evolvent[id].value, "get", self.__evolvent[id]);
                        } else if (self.__commonHandlers && self.__commonHandlers['onGet']) {
                            self.__commonHandlers['onGet'].call(parent, self.__evolvent[id].value, "get", self.__evolvent[id]);
                        }

                        var _value = new Object(self.__evolvent[id].value);
                        self.decorate.defaultGetter(_value, id, parent, partName);
                        if(self.decorate[self._getType(self.__evolvent[id].value)]) {
                            self.decorate[self._getType(self.__evolvent[id].value)](_value, id, parent, partName);
                        }
                        return _value;
                    },
                    "configurable": true
                });
            },
            "computed": function (objectPart, parent, partName, id) {

                self.pushToEvolvent(objectPart, "computed", id);

                Object.defineProperty(parent, partName, {
                    set: function (newValue) {
                        self.__evolvent[id].value = newValue;
                    },
                    get: function () {
                        return self.__evolvent[id].value.call(parent, self, self.__evolvent[id]);
                    }
                });
            },
            "array": function (objectPart, parent, partName, id) {
                parent[partName] = objectPart;
                self._buildLiveObject(objectPart, parent[partName]);
                self.decorate['array'](parent[partName]);
            },
            "object": function (objectPart, parent, partName, id) {
                parent[partName] = objectPart;
                self._buildLiveObject(objectPart, parent[partName]);
                self.decorate['object'](parent[partName], parent);
            },
            "eventable": function (objectPart, parent, partName, id) {
                var _type =  self._getType(objectPart.value);
                self.factories[ (self.factories[_type]) ? _type : "default" ](objectPart.value, parent, partName, id);
                self.__evolvent[id].handlers = objectPart.handlers;
            },
            "binded": function (objectPart, parent, partName, id) {
                if(objectPart.values && objectPart.elements) {
                    console.log(objectPart.values);
                    console.log(objectPart.elements);
                    console.log(objectPart.eventsNames);
                } else {
                    setTimeout(function () {
                        self.factories["binded"](objectPart, parent, partName, id);
                    }, 1);
                }
            }

            /* не используемые на данный момент фабрики
            "null": function () {
                console.log('null');
            },
            "bool": function () {
                console.log('bool');
            },
            "date": function () {
                console.log('bool');
            },
            "string": function () {
                console.log('string');
            },
            "int": function () {
                console.log('int');
            },
            "float": function () {
                console.log('float');
            },
            "function": function () {
                console.log('array');
            },*/
        };

        this.decorate = {
            "object": function (object, parent) {
                object.extends = function (obj) {

                    if (self.__commonHandlers && self.__commonHandlers['onExtends']) {
                        self.__commonHandlers['onExtends'].call(object, obj, "extends");
                    }

                    self._buildLiveObject(obj, object);
                };

                object.parent = function () {
                    return parent;
                };

                Object.defineProperty(object, "extends", { enumerable: false });
                Object.defineProperty(object, "parent", { enumerable: false });

            },
            "array": function (array) {
                array.push = function (value) {

                    if (self.__commonHandlers && self.__commonHandlers['onPush']) {
                        self.__commonHandlers['onPush'].call(array, value, "push");
                    }

                    var _type =  self._getType(value);
                    self.factories[ (self.factories[_type]) ? _type : "default" ](value, array, (array.length), self._id);

                };

                array.delete = function (index) {

                    var _fieldIndex = array[index].__id;

                    if (self.__commonHandlers && self.__commonHandlers['onDelete']) {
                        self.__commonHandlers['onDelete'].call(array, index, "delete", (self.__evolvent[ _fieldIndex ] ? self.__evolvent[ _fieldIndex ] : undefined) );
                    }

                    array.splice(index, 1);

                    self.__evolvent[ _fieldIndex ] = null;
                    /* or
                    *  delete that[index];
                    *  that.length--;
                    *  if need should redefine splice();
                    * */
                };

                Object.defineProperty(array, "push", { enumerable: false });
                Object.defineProperty(array, "delete", { enumerable: false });
            },
            "defaultGetter": function (value, id, parent, ptN) {
                Object.defineProperty(value, "__id", { value: id});
                Object.defineProperty(value, "parent", { value: function () { return parent; } });
                Object.defineProperty(value, "addEventListener", {
                    value: function (eventType, handler) {
                        if(!self.__evolvent[id].handlers) self.__evolvent[id].handlers = {};
                        self.__evolvent[id].handlers[eventType] = handler;
                    }
                });
                Object.defineProperty(value, "remove", {
                    value: function () {
                        //+ eventHandling
                        self.__evolvent[id] = null;
                        delete parent[ptN];
                    }
                });
            }
        };

        this._buildLiveObject(obj, this);
        this._buildingMode = false;
	};

    var __lo = new liveObject(object);

    if(events !== undefined) {
        for(var event in events)
        __lo.__commonHandlers = events;
    }
	return __lo;
};

$LO.computed = function (f) {
    f.computed = true;
    return f;
};

$LO.eventable = function (value, handlers) {
    var _eventable = function () {};
        _eventable.eventable = true;
        _eventable.value = value;
        _eventable.handlers = handlers;
    return _eventable;
};

//линковка объектов
//вынести в отдельный проект
//+ сделать возможность подключать фабрики как плагины !!

$LO.bind = function (selector, factor, data, handlers, applyToSelector) {

    var _binded = function () {};
        _binded.binded = true;
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
        _binded.eventsNames = [];
        for(var i = 0; i < _elements.length; i++) {
            _binded.elements[i] = _elements[i];
            var _type = $LO.getHtmlElementType(_elements[i]);
            if(factor.indexOf("@") == 0) {
                _binded.values[i] = $LO._elementsCollection[_type].factors["@"](factors.replace("@", ""), _elements[i], data);
            } else {
                var __value = $LO._elementsCollection[_type].factors[factor](_elements[i], data);
                _binded.values[i] = __value;
                _binded.eventsNames[i] = __value.eventName;
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
                    /*var _listener = function (element) {
                        return element.addEventListener("change", function () {

                        });
                    };*/
                    /*element.setAttribute("___id", "");
                    element.addEventListener("change", function (event) {
                        var __id = event.target.getAttribute("___id");

                    });*/
                    var _elm = new Object(element.checked);
                    Object.defineProperty(_elm, "eventName", { value: "change" });
                    return _elm;
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
