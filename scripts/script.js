$(function() {
    $('#rectangle').hide();
    Webcam.set({
        flip_horiz: true,
    });
    Webcam.attach('#my_camera');


    //DAAedit
    var audio = new Audio("music/anger.wav");

    function take_snapshot() {
        Webcam.snap(function(data_uri) {
            //document.getElementById('my_result').innerHTML = '<img src="' + data_uri + '"/>';
            $('#my_camera').show();
            $('#my_result').hide();
            getFaceInfo(dataURItoBlob(data_uri));
            $('table').hide();
            $('.result_div').show();
        });
    }

    var passedTimer;
    function startTimer()
    {
        var millisecondsPeriod = 2400;

        // Set the date we're counting down to
        var downDate = new Date().getTime();
        targetDistance = - millisecondsPeriod;

        // Update the count down every 1 second
        var x = setInterval(function() {

            // Get todays date and time
            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element with id="demo"
            document.getElementById("demo").innerHTML = days + "d " + hours + "h "
            + minutes + "m " + seconds + "s ";

            //If the count down is finished, reset timer and take photo 
            if (distance < targetDistance) {
                targetDistance -= millisecondsPeriod;
                take_snapshot();
            }
        }, 1000);

        passedTimer = x;

    }

    function stopTimer()
    {
        audio.pause();
        clearInterval(passedTimer);
    }

    $("#startTimerButton").click(startTimer)
    $("#stopTimerButton").click(stopTimer)

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
        else byteString = unescape(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {
            type: mimeString
        });
    }

    var getFaceInfo = function(photo) {
        var params = { };
        var subscriptionKey = "5a03eb1ee7dc4b8d999a0b219dd6f143";
        var imageUrl = photo;
        var APIUrl = "https://westus.api.cognitive.microsoft.com/emotion/v1.0";
        var resultDiv = $(".result_div");
        var articleDiv = $(".article");
        resultDiv.text("Analyzing...");
        $.ajax({
            type: "POST",
            url: "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?" + $.param(params),
            processData: false,
            headers: {
                "Ocp-Apim-Subscription-Key": subscriptionKey
            },
            contentType: "application/octet-stream",
            data: photo
        }).done(function(data) {
            if (data.length > 0) {
                function floatFormat(number) {
                    return Math.round(number * Math.pow(10, 6)) / Math.pow(10, 6);
                }
                var faceScore = data[0].scores;
                var faceAnger = floatFormat(faceScore.anger);
                var faceContempt = floatFormat(faceScore.contempt);
                var faceDisgust = floatFormat(faceScore.disgust);
                var faceFear = floatFormat(faceScore.fear);
                var faceHappiness = floatFormat(faceScore.happiness);
                var faceNeutral = floatFormat(faceScore.neutral);
                var faceSadness = floatFormat(faceScore.sadness);
                var faceSurprise = floatFormat(faceScore.surprise);
                var outputs = {
                    "anger": faceAnger,
                    "contempt": faceContempt,
                    "disgust": faceDisgust,
                    "fear": faceFear,
                    "happiness": faceHappiness,
                    "neutral": faceNeutral,
                    "sadness": faceSadness,
                    "surprise": faceSurprise
                };
                // console.log(outputs);
                var newOutputs = [];
                for (var prop in outputs) {
                    newOutputs.push(outputs[prop])
                }
                console.log(newOutputs);
                var maxOutput = Math.max.apply(Math, newOutputs);
                var outputText = "";

                //DAAedit
                var foundOutput;

                // if (maxOutput == faceNeutral) {
                //     if (faceNeutral > 0.85 && faceHappiness < 0.25) {
                //         outputText = "<h3>" + "We've detected " + "<i>" + "a resting bitch face" + "</i>" + "</h3><h4><i>(hint: smile)</i></h4>";
                //     } else if (faceNeutral > 0.6 && faceSadness > 0.15) {
                //         outputText = "<h3>" + "We've detected " + "<i>" + "a resting bitch face" + "</i>" + "</h3><h4><i>(hint: smile)</i></h4>";
                //     }
                // } else {
                    for (var prop in outputs) {
                        if (outputs[prop] == maxOutput) {
                            outputText = "<h3>" + "We've detected " + "<i>" + prop + "</i>" + "</h3>"
                            foundOutput = prop;
                        }
                    }
                // }

                audio.pause();
                audio = new Audio("music/"+foundOutput+".wav");  
                    audio.addEventListener('ended', function() {
                    this.currentTime = 0;
                    this.play();
                }, false);
                audio.play();

                console.log(outputText);
                resultDiv.html(outputText);
            } else {
                resultDiv.text("Detection Failed");
            }
        })
    };
});
