recMap.directive("myMedia", function ($window, dataService, $http) {
    return {
        restrict: "A",
        scope: {},
        link: function (scope) {
            scope.countryName = '';
            scope.countryCode = '';
            scope.mediaJSON = null;


            scope.$watch(
                function () {
                    if (dataService.isLoaded() && dataService.getCurCountryCode() != scope.countryCode) {
                        scope.countryName = dataService.getCurCountry();
                        scope.countryCode = dataService.getCurCountryCode();
                        if (scope.mediaJSON == null) {
                            $http.get("data/media.json")
                                .then(function (response) {
                                    scope.mediaJSON = response['data'];
                                })
                        }
                        return true;
                    }
                    return false;
                },
                function (newValue, oldValue, scope) {
                    if (newValue && scope.mediaJSON != null) {
                        updateMedia();
                    }
                });

            scope.$watch(
                function () {
                    return scope.mediaJSON;
                },
                function (newValue) {
                    if (newValue != null) {
                        updateMedia();
                    }
                }
            );

            function updateMedia() {
                var mediaDiv = $('#media');

                if (scope.countryCode in scope.mediaJSON) {
                    mediaDiv.empty();
                    var media = scope.mediaJSON[scope.countryCode];
                    var mediaContainerLeft = document.createElement('div');
                    var mediaContainerRight = document.createElement('div');
                    mediaContainerLeft.setAttribute('class', 'col-md-6');
                    mediaContainerRight.setAttribute('class', 'col-md-6');


                    if (media['videos'].length > 0) {
                        var videoContainer = document.createElement('div');
                        videoContainer.setAttribute('class', 'embed-responsive embed-responsive-4by3');
                        var iframe = document.createElement('iframe');
                        iframe.setAttribute('class', 'embed-responsive-item');
                        iframe.setAttribute('src', media['videos'][0]['url']);
                        iframe.setAttribute('allowfullscreen', '');
                        videoContainer.appendChild(iframe);
                        mediaContainerLeft.appendChild(videoContainer);
                        mediaDiv.append(mediaContainerLeft);
                    }

                    if (media['text'].length > 0) {
                        for (var i = 0; i < media['text'].length; i++) {

                            var rowDiv = document.createElement('div');
                            var colDiv  = document.createElement('div');

                            rowDiv.setAttribute('class', 'row');
                            rowDiv.setAttribute('style', 'padding-top: 10%; padding-bottom:5%');
                            colDiv.setAttribute('class', 'col-md-12');

                            var textButton = document.createElement('a');
                            textButton.setAttribute('id', 'pdf');
                            textButton.setAttribute('class', 'btn btn-primary btn-lg');
                            textButton.setAttribute('role', 'button');
                            textButton.setAttribute('href', media['text'][i]['url']);
                            textButton.setAttribute('target', '_blank');
                            textButton.innerHTML = media['text'][i]['title'];

                            colDiv.appendChild(textButton);
                            rowDiv.appendChild(colDiv);
                            mediaContainerRight.appendChild(rowDiv);
                        }
                        mediaDiv.append(mediaContainerRight);
                    }

                } else {
                    mediaDiv.empty();
                    var div = document.createElement('div');
                    div.setAttribute('class', 'col-mg-12');
                    var h2 = document.createElement('h2');
                    h2.innerHTML = 'No media found for ' + scope.countryName;
                    div.appendChild(h2);
                    mediaDiv.append(div);
                }
            }
        }
    }
});