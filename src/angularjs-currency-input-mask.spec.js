describe('Formatting numbers',function() {
    beforeEach(module('cur.$mask'));

    var $compile, $rootScope, $filter;

    beforeEach(inject(function(_$compile_, _$rootScope_, _$filter_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $filter = _$filter_;
    }));

    describe('Testing directive', function() {

        it('typing 1 with standard config and hard-coded $ should return $0.01',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('1').triggerHandler('input');
            expect(element.val()).toEqual('$0.01');
        })

        it ('typing 123456 with standard config without setting currency should return $1,234.56',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency />")($rootScope);
            $rootScope.$digest();
            element.val('123456').triggerHandler('input');
            expect(element.val()).toEqual('$1,234.56');
        })

        it ('typing 123456 with standard config and empty currency should return 1,234.56',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"''\" />")($rootScope);
            $rootScope.$digest();
            element.val('123456').triggerHandler('input');
            expect(element.val()).toEqual('1,234.56');
        })

        it('typing 1 and erase it with indentation and hard-coded $ should return $ 0.00', function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" config=\"{indentation:' '}\" />")($rootScope);
            $rootScope.$digest();
            element.val('1').triggerHandler('input');
            element.val(element.val().slice(0, -1)).triggerHandler('input');
            expect(element.val()).toEqual('$ 0.00');
        })

        it('typing 1 and erase it twice with indentation and hard-coded $ should return empty', function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" config=\"{indentation:' '}\" />")($rootScope);
            $rootScope.$digest();
            element.val('1').triggerHandler('input');
            var empty = element.val().slice(0, -1);
            element.val(empty).triggerHandler('input');
            element.val(empty).triggerHandler('input');
            expect(element.val()).toEqual('');
        })

        it('typing 1 with 8 zeros using BRL config should return 1.000.000,00', function() {
            var configStr = "{indentation: ' ', group:'.' ,decimal:','}"
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'R$'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            element.val('100000000').triggerHandler('input');
            expect(element.val()).toEqual('R$ 1.000.000,00');
        })

        it('typing random number using BRL config and then update ng-model to 100 should return R$ 100,00', function() {
            var configStr = "{indentation: ' ', group:'.' ,decimal:','}"
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'R$'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            element.val('100000000').triggerHandler('input');
            $rootScope.currency = 100;
            $rootScope.$digest();

            expect(element.val()).toBe('R$ 100,00')
        })

        it('setting up 12.34 on scope with custom config should return 12.34 p.', function() {
            $rootScope.currency = 12.34;
            var configStr = "{orientation:'r',indentation:' '}"
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'p.'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            expect(element.val()).toBe('12.34 p.')
        })

    })

    describe('Testing filter', function() {

        it('filter applied to 5000 should return format in YEN',function() {
            var value = $filter('printCurrency')(5000.00,'¥',{decimalSize:0})
            expect(value).toBe('¥5,000');
        })

        it('filter applied to 5000 should return format in YEN with no group',function() {
            var value = $filter('printCurrency')(5500000.00,'¥',{decimalSize:0,group:''})
            expect(value).toBe('¥5500000');
        })

        it('comparing value with currency filter should show the same result', function() {
            var value = 5000.556;
            expect($filter('currency')(value,'$',2)).toBe($filter('printCurrency')(value,'$',{decimalSize:2}))
        })

    })

})
