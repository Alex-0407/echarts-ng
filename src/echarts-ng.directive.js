(function (angular, echarts) {
  "use strict";

  angular.module('echarts-ng').directive('echarts', echartsDirective);

  /**
   * @ngdoc directive
   * @name echarts-ng.directive:echarts
   *
   * @require echarts-ng.service:$echarts
   *
   * @priority 5
   * @restrict A
   *
   * @param {string} echarts - the instance assigned
   * @param {object} config  - echarts adaptable options
   *
   * @description - simple angular directive wrap for echarts
   */
  echartsDirective.$inject = ['$echarts', '$waterfall'];
  function echartsDirective($echarts, $waterfall) {
    return {
      priority: 5,
      restrict: 'A',
      scope: {
        echarts: '=',
        config: '='
      },
      bindToController: true,
      controller: function ($scope, $element) {
        var vm = this;

        var GLOBAL_OPTION = $echarts.getEchartsGlobalOption()
          , identity = vm.echarts
          , config = vm.config
          , theme = GLOBAL_OPTION.theme
          , element = $element[0];

        if (!identity) {
          throw new Error('Echarts Instance Identity Required');
        }

        var instance = theme ? echarts.init(element, theme) : echarts.init(element);

        instance.setOption(GLOBAL_OPTION);

        $echarts.driftEchartsPalette(instance);
        $echarts.registerEchartsInstance(identity, instance);

        $waterfall.adaptWaterfallTooltip(instance, config.waterfall);
        $waterfall.wrapWaterfallSeries(config, config.waterfall);

        angular.isObject(config) && angular.isArray(config.series)
          ? instance.setOption(config)
          : instance.showLoading();

        $scope.$watchCollection('vm.config.title', function () {
          $waterfall.wrapWaterfallSeries(config, config.waterfall);
          $echarts.updateEchartsInstance(identity, config);
        });

        $scope.$watchCollection('vm.config.series', function () {
          $waterfall.wrapWaterfallSeries(config, config.waterfall);
          $echarts.updateEchartsInstance(identity, config);
        });

        $scope.$on('$destroy', function () {
          instance.clear();
          instance.dispose();
          $echarts.removeEchartsInstance(identity);
        });
      },
      controllerAs: 'chart'
    }
  }
})(angular, echarts);