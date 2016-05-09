var siteApp = angular.module('siteApp', ['ngAnimate']);
siteApp.controller('ctrl', ['$scope', function ($scope) {
    $scope.NavigationSelector = 'zadanie';
    $scope.GeneratorSelector = { name: 'Poissona', value: 'poisson' };
    $scope.ValidationSummary = { IsVisible: false, Text: "" };
    $scope.PoissonForm = { IsVisible: true }
    $scope.InnyForm = { IsVisible: false }
    $scope.Overlay = false;
    $scope.ResultHide = true;
    $scope.PoissonValues = { Lambda: 1, Odstep: 2, Rozmiar: 20000, MinValue: Math.pow(10, -12) };
    $scope.GaussianValues = { Srodek: 0, Odchylenie: 1, Rozmiar: 20000, Odstep: 2 };
    $scope.Temp = {};
    $scope.Result = {}

    $scope.DrawChart = function (results) {
        var barChartData = {
            labels: results.Labels,
            datasets: [{
                label: 'Ilość estymatorów korelacji',
                backgroundColor: "rgba(255,0,0,0.5)",
                data: results.Values
            }]
        };


        //new Chart(ctx).Doughnut([]);
        if (window.myBar != null) {
            $('#canvas').replaceWith('<canvas id="canvas"></canvas>');
        }

        var ctx = document.getElementById("canvas").getContext("2d");
        window.myBar = new Chart(ctx, {
            type: 'bar',
            data: barChartData,
            options: {
                elements: {
                    rectangle: {
                        borderWidth: 1,
                        borderColor: 'rgb(0, 0, 0)',
                        borderSkipped: 'bottom'
                    }
                },
                responsive: true,
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Histogram'
                }
            }
        });
    }

    $scope.BuildHistogramData = function (array) {
        var results = { Labels: [], Values: [] };
        var sortNumbers = function (a, b) {
            return a - b;
        }
        array.sort(sortNumbers);
        for (var key in array) {
            var value = (Math.round(array[key] * 1000) / 1000);
            var index = results.Labels.indexOf(value);
            if (index != -1) {
                results.Values[index]++;
            }
            else {
                results.Labels.push(value);
                results.Values.push(1);
            }
        }
        return results;
    }

    $scope.Start = function (rozklad) {

        if (rozklad == 'poisson') {
            if ($scope.ValidatePoissonValues()) {
                $scope.PrepareToOperation();

                setTimeout(function () {
                    var estimators = [];
                    var sumToAverage = 0;
                    for (var i = 0; i < 10000; i++) {
                        var randomValuesArray = $scope.GeneratePoissonRandomValues();
                        var estimator = $scope.ExploreEstimator(randomValuesArray, $scope.PoissonValues.Odstep);

                        sumToAverage = sumToAverage + estimator;

                        $scope.SetOrNotSetMinimumOrMaximum(estimator);

                        estimators.push(estimator);
                    }
                    var average = $scope.SetAverage(sumToAverage, 10000);
                    $scope.SetDeviation(estimators, average);
                    $scope.UpdateResults();
                    $scope.DrawChart($scope.BuildHistogramData(estimators));
                    $scope.$apply(function () {
                        $scope.Overlay = false;
                    });
                }, 100);

            }
            else
                $scope.ValidationSummary = { IsVisible: true, Text: "Lamda musi znajdować sie w zakresie od 0 do 20.\nRozmiar musi znajdować się w zakresie od 20000 do 2000000.\nOdstep musi znajdować sie w zakresie od 2 do 10." };
        }
        else if (rozklad == 'gaussian') {
            if ($scope.ValidateGaussianValues()) {
                $scope.PrepareToOperation();

                setTimeout(function () {
                    var estimators = [];
                    var sumToAverage = 0;
                    for (var i = 0; i < 10000; i++) {
                        var randomValuesArray = $scope.GenerateGaussianRandomValues();
                        var estimator = $scope.ExploreEstimator(randomValuesArray, $scope.GaussianValues.Odstep);
                        sumToAverage = sumToAverage + estimator;

                        $scope.SetOrNotSetMinimumOrMaximum(estimator);

                        estimators.push(estimator);
                    }
                    var average = $scope.SetAverage(sumToAverage, 10000);
                    $scope.SetDeviation(estimators, average);
                    $scope.UpdateResults();
                    $scope.DrawChart($scope.BuildHistogramData(estimators));

                    $scope.$apply(function () {
                        $scope.Overlay = false;
                        $scope.DrawChart();
                    });
                }, 100);
            }
            else
                $scope.ValidationSummary = { IsVisible: true, Text: "Rozmiar musi znajdować się w zakresie od 20000 do 2000000.\nOdstep musi znajdować sie w zakresie od 2 do 10." };
        }
    }

    $scope.PrepareToOperation = function () {
        $scope.ResultHide = true;
        $scope.ValidationSummary.IsVisible = false;
        $scope.Overlay = true;
        $scope.Tmp = {};
        $scope.Result = {};
    }

    $scope.UpdateResults = function () {
        $scope.Result.Minimum = $scope.Temp.Minimum;
        $scope.Result.Maximum = $scope.Temp.Maximum;
        $scope.Result.Average = $scope.Temp.Average;
        $scope.Result.Deviation = $scope.Temp.Deviation;
        $scope.ResultHide = false;
    }

    $scope.SetDeviation = function (estimators, average) {
        var sumToDeviation = 0;
        for (var i in estimators) {
            sumToDeviation += estimators[i] - average;
        }
        $scope.Temp.Deviation = Math.sqrt(sumToDeviation / 10000);
    }


    $scope.SetAverage = function (counter, denominator) {
        $scope.Temp.Average = counter / denominator;
        return $scope.Temp.Average;
    }

    $scope.SetOrNotSetMinimumOrMaximum = function (value) {
        if (!($scope.Temp.Minimum != null && $scope.Temp.Minimum <= value))
            $scope.Temp.Minimum = value;

        if (!($scope.Temp.Maximum != null && $scope.Temp.Maximum >= value))
            $scope.Temp.Maximum = value;
    }

    $scope.ValidatePoissonValues = function () {
        if ($scope.PoissonValues.Lambda == "")
            $scope.PoissonValues.Lambda = 0;
        if ($scope.PoissonValues.Rozmiar == "")
            $scope.PoissonValues.Rozmiar = 20000;
        if ($scope.PoissonValues.Odstep == "")
            $scope.PoissonValues.Odstep = 2;
        return ($scope.PoissonValues.Lambda >= 0 && $scope.PoissonValues.Lambda <= 20 &&
        $scope.PoissonValues.Odstep > 1 && $scope.PoissonValues.Odstep < 11 &&
        $scope.PoissonValues.Rozmiar >= 20000 && $scope.PoissonValues.Rozmiar <= 2000000);
    }

    $scope.ValidateGaussianValues = function () {
        if ($scope.GaussianValues.Srodek == "")
            $scope.GaussianValues.Srodek = 0;
        if ($scope.GaussianValues.Odchylenie == "")
            $scope.GaussianValues.Odchylenie = 1;
        if ($scope.GaussianValues.Rozmiar == "")
            $scope.GaussianValues.Rozmiar = 20000;
        if ($scope.GaussianValues.Odstep == "")
            $scope.GaussianValues.Odstep = 2;
        return ($scope.GaussianValues.Rozmiar >= 20000 && $scope.GaussianValues.Rozmiar <= 2000000 &&
        $scope.GaussianValues.Odstep > 1 && $scope.GaussianValues.Odstep < 11);
    }

    $scope.ExploreEstimator = function (randomValuesArray, odstep) {
        var i = 0;
        var j = odstep - 1;

        var r;
        var array = [];
        var xsum = 0;
        var ysum = 0;
        var xysum = 0;
        var xxsum = 0;
        var yysum = 0;

        while (j < randomValuesArray.length) {

            var x = randomValuesArray[i];
            var y = randomValuesArray[j];
            xsum += x;
            ysum += y;
            var xy = x * y;
            var xx = x * x;
            var yy = y * y;
            xysum += xy;
            xxsum += xx;
            yysum += yy;
            array.push([xy, xx, yy]);

            i++;
            j++;

        }
        return ((i * xysum) - (xsum * ysum)) / (Math.sqrt(((i * xxsum) - Math.pow(xsum, 2)) * ((i * yysum) - Math.pow(ysum, 2)), 2));
    }

    $scope.GeneratePoissonRandomValues = function () {
        var array = [];
        var k = 0;
        var result = 1;
        while (k < $scope.PoissonValues.Rozmiar) {
            array.push($scope.gen_poiss_knuth($scope.PoissonValues.Lambda));
            k++;
        }
        return array;
    }

    $scope.GenerateGaussianRandomValues = function () {
        var array = [];
        var k = 0;
        var result = 1;
        while (k < $scope.PoissonValues.Rozmiar) {
            array.push($scope.gen_gaussion_boxmuller($scope.GaussianValues.Srodek, $scope.GaussianValues.Odchylenie));
            k++;
        }
        return array;
    }

    $scope.SelectGenerator = function (name, value) {
        $scope.GeneratorSelector = { name: name, value: value };
        $scope.ValidationSummary.IsVisible = false;
    }

    $scope.Factorial = function (n) {
        var _p = 1;
        while (n > 0) { _p *= n--; }
        return _p;
    }

    $scope.gen_poiss_knuth = function (lbd) {
        var L, p, u;
        var k;

        L = Math.exp(-lbd);
        k = 0;
        p = 1;
        do {
            k = k + 1;
            u = Math.random();
            p = p * u;
        } while (p > L);

        return (k - 1);
    }

    $scope.gen_gaussion_boxmuller = function (mean, std) {
        return Math.sqrt(-2 * Math.log(Math.random())) * Math.sin(2 * Math.PI * Math.random()) * std + mean;
    }
} ]);