
(function(angular) {
    "use strict";
    angular.module('cur.$mask',[])
        .factory('support',support())
        .directive('maskCurrency',maskCurrency())
        .filter('printCurrency', printCurrency())

    function removeNotNumericCharacters(value){
        //Allow to use negative character on first position of value
        return value.replace(/[^\d-]/g, '').replace(/(?!^-)-/g, '');
    }

    function mask(config) {
        function pad(value,size) {
            return new Array(size).concat([value]).join('0');
        }
        function escape(value) {
            return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        function print(value) {
            return value.replace(/(\$)/g, '$$$1');
        }
        return {
            value: function(str) {
                this._value = str;
                return this;
            },
            clear: function() {
                this._value = removeNotNumericCharacters(this._value)
                return this;
            },
            minimum: function() {
                if (config.decimalSize > 0) {
                    var regex = RegExp('^(\\d{1,'+config.decimalSize+'})$','g'),
                        replace = pad("$1",config.decimalSize)
                    this._value = this._value.replace(regex,replace)
                }
                return this;
            },
            fraction: function() {
                if (config.decimalSize > 0) {
                    var regex = RegExp('(\\d)(?=\\d{' + config.decimalSize + '}$)', 'g'),
                        replace = "$1"+config.decimal
                    this._value = this._value.replace(regex, replace)
                }
                return this;
            },
            ltrim: function() {
                var regex = RegExp('(?=^)(0)(?!'+escape(config.decimal)+')','g'),
                    replace = "";
                this._value = this._value.replace(regex,replace)
                return this;
            },
            group: function() {
                var limit = config.decimalSize>0?escape(config.decimal):'$',
                    regex = RegExp('(\\d)(?=(\\d{'+config.groupSize+'})+'+limit+')','g'),
                    replace = "$1"+config.group;
                this._value = this._value.replace(regex, replace)
                return this;
            },
            currency: function(symbol) {
                if (config.orientation == 'r') {
                    var currency = this.getRightOrientedCurrency(symbol),
                        regex = RegExp('(.)$','g'),
                        replace = "$1"+print(currency)
                    this._value = this._value.replace(regex,replace)
                } else {
                    var currency = this.getLeftOrientedCurrency(symbol),
                        regex = RegExp('(^-?)(.)','g'),
                        replace = "$1"+print(currency)+"$2"
                    this._value = this._value.replace(regex,replace)
                }
                return this;
            },
            getLeftOrientedCurrency: function(symbol) {
                return (symbol||'')+(config.indentation||'');
            },
            getRightOrientedCurrency: function(symbol) {
                return (config.indentation||'')+(symbol||'');
            },
            format: function(value,currency) {
                return this
                        .value(value)
                        .clear()
                        .minimum()
                        .fraction()
                        .ltrim()
                        .group()
                        .currency(currency)
                        .toString();
            },
            toString: function() {
                return this._value;
            }
        }
    }

    function round(num,decimalSize) {
        //first part rounds correctly in case of more then 2 digits, otherwise toFixed will add up the digits
        return (+(Math.round(num + ("e+" + decimalSize))  + ("e-" + decimalSize))).toFixed(decimalSize);
    }

    function support() {
        return ['$locale','$q','$timeout',function($locale,$q,$timeout) {
            return {
                config: function(param) {
                    var config = param || {},
                        paramDefault = $locale.NUMBER_FORMATS || {},
                        currencyDefault = $locale.NUMBER_FORMATS.PATTERNS || {},
                        defaults = {
                            indentation: '',
                            orientation:'l',
                            decimal: paramDefault.DECIMAL_SEP || '.',
                            group: paramDefault.GROUP_SEP || ',',
                            decimalSize: currencyDefault.minFrac || 2,
                            groupSize: currencyDefault.gSize || 3
                        }
                    return angular.extend({}, defaults, config);
                },
                currency: function(symbol) {
                    return symbol != undefined ? symbol : $locale.NUMBER_FORMATS.CURRENCY_SYM || '$'
                },
                getCaretPosition: function(input) {
                    return $q(function(resolve,reject) {
                        // timeout being used as compatibility to older angularjs versions,
                        // otherwise the internal angular $digest process will fail
                        $timeout(function() {
                            // IE < 9 Support
                            if (document.selection) {
                                input.focus();
                                var range = document.selection.createRange();
                                var rangelen = range.text.length;
                                range.moveStart('character', -input.value.length);
                                var start = range.text.length - rangelen;
                                resolve({
                                    'start': start,
                                    'end': start + rangelen
                                });
                            } // IE >=9 and other browsers
                            else if (input.selectionStart || input.selectionStart == '0') {
                                resolve({
                                    'start': input.selectionStart,
                                    'end': input.selectionEnd
                                });
                            } else {
                                resolve({
                                    'start': 0,
                                    'end': 0
                                });
                            }
                        })
                    })
                },
                setCaretPosition: function(input, pos) {
                    return $q(function(resolve, reject) {
                        $timeout(function() {
                            if (input.setSelectionRange) {
                                input.focus();
                                input.setSelectionRange(pos, pos);
                                resolve(true);
                            } else if (input.createTextRange) {
                                var range = input.createTextRange();
                                range.collapse(true);
                                range.moveEnd('character', pos);
                                range.moveStart('character', pos);
                                range.select();
                                resolve(true);
                            }
                            reject(false)
                        })
                    })
                },
                canMoveCaret: function(input) {
                    return input.setSelectionRange || input.createTextRange;
                }
            }
        }]
    }

    function maskCurrency() {
        return ['$locale','support',function($locale,support) {
            return {
                require: "ngModel",
                scope: {
                    currency: '=maskCurrency',
                    config: '='
                },
                link: function (scope, elem, attrs, ctrl) {
                    if (!ctrl) return;
                    var last,
                        config = support.config(scope.config);

                    function view(value,currency) {
                        return mask(config).format(value,currency);
                    }

                    function model(value) {
                        value = removeNotNumericCharacters(value);
                        if (config.decimalSize > 0) {
                            var regex = RegExp('(\\d)(?=\\d{'+config.decimalSize+'}$)','g');
                            value = value.replace(regex, "$1.");
                        }
                        return value;
                    }

                    function parser(inputValue,currency) {
                        var modelValue = null;
                        if (inputValue) {
                            var value = view(inputValue,currency);
                            modelValue = model(value);
                            if (value == inputValue) {
                                value = undefined;
                            } else if (value == last && value.replace(/[^\d]/g,'') == '000') {
                                value = '';
                                modelValue = null;
                            }

                            if (value !== undefined) {
                                last = value;
                                ctrl.$setViewValue(value);
                                ctrl.$render();
                                if (config.orientation == 'r') {
                                    var index = value.indexOf(mask(config).getRightOrientedCurrency(currency));
                                    support.getCaretPosition(elem[0]).then(function(caret) {
                                        if (caret.start == caret.end && caret.start > index) {
                                            support.setCaretPosition(elem[0],index)
                                        }
                                    })

                                }
                            }
                        }
                        return modelValue;
                    }

                    scope.$watch('currency',function() {
                        parser(ctrl.$viewValue, support.currency(scope.currency));
                    })

                    scope.$watch('config', function(value) {
                        config = support.config(value);
                        //if browser doesn't support the caret move, force orientation to left
                        if (!support.canMoveCaret(elem[0])) {
                            config.orientation = 'l';
                        }
                        if (ctrl.$viewValue) {
                            parser(ctrl.$viewValue);
                        }
                    })

                    ctrl.$parsers.push(function(inputValue) {
                        return parser(inputValue, support.currency(scope.currency));
                    })

                    ctrl.$formatters.push(function(value) {
                        return value?view(round(value,config.decimalSize), support.currency(scope.currency)) : null;
                    })
                }
            }
        }]
    }

    function printCurrency() {
        return ['support',function(support) {
            return function(number,currency,config) {
                var config = support.config(config);
                return number?mask(config).format(round(number,config.decimalSize), currency) : null;
            }
        }]
    }

})(angular)
