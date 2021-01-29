# AngularJS Currency Input Mask

Module for AngularJS 1.3+ providing a input mask and filter for working with variable currency configurations. It allows the user to type only digits while formatting the currency in the pattern passed as a parameter to the directive. 

## Installation
```
npm install --save angularjs-currency-input-mask
```

## Configuration
Import the minified script from ```dist/angularjs-currency-input-mask.min.js``` to your page
```html
<script src="node_modules/angularjs-currency-input-mask/dist/angularjs-currency-input-mask.min.js"></script>
```
Add the module ```cur.$mask``` as dependency of your main application module 
```js
angular.module('myapp', ['cur.$mask'])
```

## Usage
- Basic usage example
```html
<input type="text" ng-model="value" mask-currency />
```
Adding the ```mask-currency``` directive to an input with ```ng-model``` associated will load settings from ```$locale``` provider.
It means that, if no configuration is provided, values will be masked in the same format 
of the [currency filter](https://docs.angularjs.org/api/ng/filter/currency).
- Setting up custom pattern
```html
<input type="text" ng-model="value" mask-currency="'R$'" config="{group:'.',decimal:',',indentation:' '}" />
``` 
Adding up custom settings will change the mask applied. The example above sets the format to brazilian reais currency.
- Making it dynamic
```html
<input type="text" ng-model="value" mask-currency="currency.symbol" config="currency.config" />
``` 
Making use of the controller scope enables dynamic settings for the mask, not locking on a single locale.
As shown on the demo file, a list of currencies with its given configurations is created to provide different filling options to the input,  and then is attached to the scope:
```js
var currencies = [
    {symbol:'\u20AC'},
    {symbol:'\u00A3',config:{indentation:' '}},
    {symbol:'\u00A5', config:{decimalSize:0}},
    {symbol:'R\u0024',config:{group:'.',decimal:',',indentation:' '}}
]
angular.module('demo',['cur.$mask'])
    .controller('ctrl', function($scope,$locale) {
        $scope.currencies = currencies;
        $scope.currency = currencies[0];
    })
```
> Be aware that modifying the floating point of the input will result in a different number. 
> If the number 123456 is typed on the input it will be shown as something like $1,234.56 depending on the config parameter, 
> but if `decimalSize` is changed to zero within the config parameter the number shown will be something like $123,456 != $1,234.56

## Filter
To format an output that matches the input mask pattern, the filter `printCurrency` is available
```
{{value | printCurrency : currency.symbol : currency.config}}
```

## Options
The options available to the config parameter object are:
- `indentation`: defines character(s) separation between currency sign and value
- `orientation`: `'l'` to show symbol at the left `'r'` to show on the right
- `decimal`: the character separator to the fraction
- `group`: the character separator to the groups of numbers
- `decimalSize`: number of digits after the decimal point
- `groupSize`: number of digits within a group of numbers

## Demo

A Demo page containing different usage scenarios is located in demo/index.html

## Build

If you are cloning the repository you must have gulp globally installed and run the following commands 
in order to have the dist folder generated:

```
npm install
npm run build
```

## Testing

Tests are coded using [Karma](http://karma-runner.github.io) + [Jasmine](http://jasmine.github.io/). The easiest way to run these checks is the following

```
npm install
npm test
```


